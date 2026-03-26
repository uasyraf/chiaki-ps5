#include "processmanager.h"
#include <QStandardPaths>

ProcessManager::ProcessManager(QObject *parent)
    : QObject(parent)
{
}

bool ProcessManager::isStreaming() const
{
    return m_process && m_process->state() == QProcess::Running;
}

QString ProcessManager::currentHost() const
{
    return m_currentHost;
}

QString ProcessManager::findChiakiBinary() const
{
    const QString path = QStandardPaths::findExecutable("chiaki");
    if (!path.isEmpty())
        return path;

    const QString ngPath = QStandardPaths::findExecutable("chiaki-ng");
    if (!ngPath.isEmpty())
        return ngPath;

    return QStringLiteral("chiaki");
}

void ProcessManager::startStream(const QString &nickname, const QString &host,
                                  bool fullscreen, bool dualsense, const QString &passcode)
{
    if (isStreaming())
        return;

    const QString binary = findChiakiBinary();

    QStringList args;
    args << "stream" << nickname << host;

    if (fullscreen)
        args << "--fullscreen";

    if (dualsense)
        args << "--dualsense";

    if (!passcode.isEmpty())
        args << "--passcode" << passcode;

    m_currentHost = host;
    m_process = new QProcess(this);

    connect(m_process, &QProcess::finished, this, &ProcessManager::onProcessFinished);

    m_process->start(binary, args);
    emit streamStarted();
    emit streamingChanged();
}

void ProcessManager::wakeUp(const QString &host, const QString &registKey)
{
    const QString binary = findChiakiBinary();

    QStringList args;
    args << "wakeup" << "--host" << host;

    if (!registKey.isEmpty())
        args << "--registkey" << registKey;

    auto *proc = new QProcess(this);
    connect(proc, &QProcess::finished, proc, &QProcess::deleteLater);
    proc->start(binary, args);
}

void ProcessManager::stopStream()
{
    if (!m_process)
        return;

    m_process->terminate();
}

void ProcessManager::onProcessFinished(int exitCode, QProcess::ExitStatus exitStatus)
{
    Q_UNUSED(exitStatus)

    m_process->deleteLater();
    m_process = nullptr;
    m_currentHost.clear();

    emit streamEnded(exitCode);
    emit streamingChanged();
}
