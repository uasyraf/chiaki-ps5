import QtQuick
import QtQuick.Layouts
import "."

Item {
    id: controlBar

    signal settingsRequested()

    height: Theme.controlBarHeight
    width: parent.width

    // Background
    Rectangle {
        anchors.fill: parent
        color: Theme.backgroundSecondary
        opacity: 0.8
    }

    // Top border
    Rectangle {
        anchors.top: parent.top
        anchors.left: parent.left
        anchors.right: parent.right
        height: 1
        color: Theme.textMuted
        opacity: 0.3
    }

    Row {
        anchors.centerIn: parent
        spacing: 48

        // Discover
        ControlBarButton {
            icon: "\u27F3"
            label: "Discover"
            onClicked: hostManager.discoverHosts()
        }

        // Settings
        ControlBarButton {
            icon: "\u2699"
            label: "Settings"
            onClicked: controlBar.settingsRequested()
        }

        // Quit
        ControlBarButton {
            icon: "\u23FB"
            label: "Quit"
            onClicked: Qt.quit()
        }
    }

    component ControlBarButton: Item {
        property alias icon: iconText.text
        property alias label: labelText.text
        signal clicked()

        width: col.width
        height: col.height

        Column {
            id: col
            spacing: 4

            Text {
                id: iconText
                anchors.horizontalCenter: parent.horizontalCenter
                font.pixelSize: 20
                color: buttonMouse.containsMouse ? Theme.textPrimary : Theme.textSecondary

                Behavior on color {
                    ColorAnimation { duration: Theme.animDurationFast }
                }
            }

            Text {
                id: labelText
                anchors.horizontalCenter: parent.horizontalCenter
                font.family: Theme.fontFamily
                font.pixelSize: Theme.fontSizeSmall
                color: buttonMouse.containsMouse ? Theme.textPrimary : Theme.textSecondary

                Behavior on color {
                    ColorAnimation { duration: Theme.animDurationFast }
                }
            }
        }

        MouseArea {
            id: buttonMouse
            anchors.fill: parent
            cursorShape: Qt.PointingHandCursor
            hoverEnabled: true
            onClicked: parent.clicked()
        }
    }
}
