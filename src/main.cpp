#include <QGuiApplication>
#include <QQmlApplicationEngine>
#include <QQuickStyle>
#include <QQmlContext>
#include "hostmanager.h"
#include "processmanager.h"

int main(int argc, char *argv[])
{
    QGuiApplication app(argc, argv);
    app.setApplicationName("Chiaki PS5");
    app.setOrganizationName("chiaki-ps5");

    QQuickStyle::setStyle("Basic");

    QQmlApplicationEngine engine;

    HostManager hostManager;
    ProcessManager processManager;

    engine.rootContext()->setContextProperty("hostManager", &hostManager);
    engine.rootContext()->setContextProperty("processManager", &processManager);

    engine.loadFromModule("ChiakiPS5", "Main");

    if (engine.rootObjects().isEmpty())
        return -1;

    return app.exec();
}
