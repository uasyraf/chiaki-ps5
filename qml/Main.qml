import QtQuick
import QtQuick.Controls
import QtQuick.Window
import "."

ApplicationWindow {
    id: root
    width: 1280
    height: 720
    visible: true
    title: "Chiaki PS5"
    color: Theme.backgroundPrimary

    StackView {
        id: stackView
        anchors.fill: parent
        initialItem: homeViewComponent
    }

    Component {
        id: homeViewComponent
        HomeView {
            settingsOverlayRef: settingsOverlay
            onSettingsRequested: settingsOverlay.open()
        }
    }

    SettingsOverlay {
        id: settingsOverlay
        anchors.fill: parent
    }

    Connections {
        target: processManager

        function onStreamingChanged() {
            if (processManager.streaming) {
                root.visibility = Window.Hidden
            }
        }

        function onStreamEnded(exitCode) {
            root.visibility = Window.Windowed
            stackView.clear()
            stackView.push(homeViewComponent)
        }
    }

    Shortcut {
        sequence: "Escape"
        onActivated: {
            if (settingsOverlay.visible) {
                settingsOverlay.close()
            } else if (stackView.depth > 1) {
                stackView.pop()
            }
        }
    }

    Shortcut {
        sequence: "F11"
        onActivated: {
            root.visibility = root.visibility === Window.FullScreen
                ? Window.Windowed
                : Window.FullScreen
        }
    }
}
