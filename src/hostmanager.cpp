#include "hostmanager.h"
#include <QSettings>
#include <QDir>
#include <QNetworkDatagram>
#include <QStandardPaths>

static constexpr int DISCOVERY_PORT = 987;
static constexpr int DISCOVERY_INTERVAL_MS = 5000;
static constexpr int PS5_TARGET = 1000100;

HostManager::HostManager(QObject *parent)
    : QAbstractListModel(parent)
{
    loadConfig();

    m_discoverySocket.bind(QHostAddress::AnyIPv4, 0, QUdpSocket::ShareAddress);
    connect(&m_discoverySocket, &QUdpSocket::readyRead, this, &HostManager::handleDiscoveryResponse);

    connect(&m_discoveryTimer, &QTimer::timeout, this, &HostManager::discoverHosts);
    m_discoveryTimer.start(DISCOVERY_INTERVAL_MS);

    discoverHosts();
}

int HostManager::rowCount(const QModelIndex &parent) const
{
    if (parent.isValid())
        return 0;
    return m_hosts.size();
}

QVariant HostManager::data(const QModelIndex &index, int role) const
{
    if (!index.isValid() || index.row() < 0 || index.row() >= m_hosts.size())
        return {};

    const auto &host = m_hosts.at(index.row());

    switch (role) {
    case NicknameRole:      return host.nickname;
    case HostAddressRole:   return host.hostAddress;
    case TargetRole:        return host.target;
    case IsPS5Role:         return host.isPS5;
    case IsRegisteredRole:  return host.isRegistered;
    case StateRole:         return host.state;
    case ConsoleNameRole:   return host.consoleName;
    case ConsolePinRole:    return host.consolePin;
    default:                return {};
    }
}

QHash<int, QByteArray> HostManager::roleNames() const
{
    return {
        {NicknameRole,     "nickname"},
        {HostAddressRole,  "hostAddress"},
        {TargetRole,       "target"},
        {IsPS5Role,        "isPS5"},
        {IsRegisteredRole, "isRegistered"},
        {StateRole,        "state"},
        {ConsoleNameRole,  "consoleName"},
        {ConsolePinRole,   "consolePin"}
    };
}

int HostManager::count() const
{
    return m_hosts.size();
}

void HostManager::refresh()
{
    beginResetModel();
    m_hosts.clear();
    loadConfig();
    endResetModel();
    emit hostsChanged();
    discoverHosts();
}

void HostManager::loadConfig()
{
    const QString configPath = QDir::homePath() + "/.config/Chiaki/Chiaki.conf";

    if (!QFile::exists(configPath))
        return;

    QSettings settings(configPath, QSettings::IniFormat);

    struct RegisteredHost {
        QString nickname;
        QByteArray mac;
        int target = 0;
        bool hasRpKey = false;
        QString consolePin;
    };

    QHash<QByteArray, RegisteredHost> registeredByMac;

    settings.beginGroup("registered_hosts");
    const int regSize = settings.value("size", 0).toInt();
    for (int i = 1; i <= regSize; ++i) {
        const QString prefix = QString::number(i) + "/";
        RegisteredHost reg;
        reg.nickname = settings.value(prefix + "server_nickname").toString();
        reg.mac = settings.value(prefix + "server_mac").toByteArray();
        reg.target = settings.value(prefix + "target", 0).toInt();
        reg.hasRpKey = !settings.value(prefix + "rp_key").toByteArray().isEmpty();
        reg.consolePin = settings.value(prefix + "console_pin").toString();
        registeredByMac.insert(reg.mac, reg);
    }
    settings.endGroup();

    settings.beginGroup("manual_hosts");
    const int manSize = settings.value("size", 0).toInt();
    for (int i = 1; i <= manSize; ++i) {
        const QString prefix = QString::number(i) + "/";
        const QString hostAddr = settings.value(prefix + "host").toString();
        const bool registered = settings.value(prefix + "registered", false).toBool();
        const QByteArray regMac = settings.value(prefix + "registered_mac").toByteArray();

        HostInfo info;
        info.hostAddress = hostAddr;

        if (registered && registeredByMac.contains(regMac)) {
            const auto &reg = registeredByMac.value(regMac);
            info.nickname = reg.nickname;
            info.target = reg.target;
            info.isPS5 = (reg.target == PS5_TARGET);
            info.isRegistered = reg.hasRpKey;
            info.consoleName = reg.nickname;
            info.consolePin = reg.consolePin;
            info.serverMac = reg.mac;
        } else {
            info.nickname = hostAddr;
            info.isRegistered = false;
        }

        info.state = "offline";
        m_hosts.append(info);
    }
    settings.endGroup();
}

void HostManager::discoverHosts()
{
    const QByteArray packet("SRCH");
    m_discoverySocket.writeDatagram(packet, QHostAddress::Broadcast, DISCOVERY_PORT);
}

void HostManager::handleDiscoveryResponse()
{
    while (m_discoverySocket.hasPendingDatagrams()) {
        QNetworkDatagram datagram = m_discoverySocket.receiveDatagram();
        const QString senderIp = datagram.senderAddress().toString();

        for (int i = 0; i < m_hosts.size(); ++i) {
            if (m_hosts[i].hostAddress == senderIp && m_hosts[i].state != "online") {
                m_hosts[i].state = "online";
                emit dataChanged(index(i), index(i), {StateRole});
            }
        }
    }
}
