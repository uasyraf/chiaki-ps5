#ifndef PROCESSMANAGER_H
#define PROCESSMANAGER_H

#include <QObject>
#include <QProcess>

class ProcessManager : public QObject
{
    Q_OBJECT
    Q_PROPERTY(bool streaming READ isStreaming NOTIFY streamingChanged)
    Q_PROPERTY(QString currentHost READ currentHost NOTIFY streamingChanged)

public:
    explicit ProcessManager(QObject *parent = nullptr);

    bool isStreaming() const;
    QString currentHost() const;

    Q_INVOKABLE void startStream(const QString &nickname, const QString &host,
                                  bool fullscreen, bool dualsense, const QString &passcode);
    Q_INVOKABLE void wakeUp(const QString &host, const QString &registKey);
    Q_INVOKABLE void stopStream();

signals:
    void streamStarted();
    void streamEnded(int exitCode);
    void streamingChanged();

private:
    QString findChiakiBinary() const;
    void onProcessFinished(int exitCode, QProcess::ExitStatus exitStatus);

    QProcess *m_process = nullptr;
    QString m_currentHost;
};

#endif // PROCESSMANAGER_H
