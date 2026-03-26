#ifndef HOSTMANAGER_H
#define HOSTMANAGER_H

#include <QAbstractListModel>
#include <QTimer>
#include <QUdpSocket>

struct HostInfo {
    QString nickname;
    QString hostAddress;
    int target = 0;
    bool isPS5 = false;
    bool isRegistered = false;
    QString state = "offline";
    QString consoleName;
    QString consolePin;
    QByteArray serverMac;
};

class HostManager : public QAbstractListModel
{
    Q_OBJECT
    Q_PROPERTY(int count READ count NOTIFY hostsChanged)

public:
    enum Roles {
        NicknameRole = Qt::UserRole + 1,
        HostAddressRole,
        TargetRole,
        IsPS5Role,
        IsRegisteredRole,
        StateRole,
        ConsoleNameRole,
        ConsolePinRole
    };

    explicit HostManager(QObject *parent = nullptr);

    int rowCount(const QModelIndex &parent = QModelIndex()) const override;
    QVariant data(const QModelIndex &index, int role) const override;
    QHash<int, QByteArray> roleNames() const override;

    Q_INVOKABLE void refresh();
    Q_INVOKABLE void discoverHosts();
    Q_INVOKABLE int count() const;

signals:
    void hostsChanged();

private:
    void loadConfig();
    void handleDiscoveryResponse();

    QVector<HostInfo> m_hosts;
    QUdpSocket m_discoverySocket;
    QTimer m_discoveryTimer;
};

#endif // HOSTMANAGER_H
