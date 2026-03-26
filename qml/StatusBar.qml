import QtQuick
import QtQuick.Layouts
import "."

Item {
    id: statusBar

    property var hostModel

    height: Theme.statusBarHeight
    width: parent.width

    RowLayout {
        anchors.fill: parent
        anchors.leftMargin: 24
        anchors.rightMargin: 24

        // App title
        Text {
            text: "CHIAKI"
            font.family: Theme.fontFamily
            font.pixelSize: Theme.fontSizeLarge
            font.weight: Font.DemiBold
            font.letterSpacing: 4
            color: Theme.textMuted
        }

        Item { Layout.fillWidth: true }

        // Connection indicator
        Rectangle {
            width: 8
            height: 8
            radius: 4
            color: anyHostOnline() ? Theme.stateOnline : Theme.stateOffline
            Layout.alignment: Qt.AlignVCenter
        }

        // Clock
        Text {
            id: clockText
            font.family: Theme.fontFamily
            font.pixelSize: Theme.fontSizeMedium
            color: Theme.textMuted
            Layout.alignment: Qt.AlignVCenter
        }
    }

    Timer {
        interval: 60000
        running: true
        repeat: true
        triggeredOnStart: true
        onTriggered: {
            const now = new Date()
            clockText.text = now.toLocaleTimeString(Qt.locale(), "HH:mm")
        }
    }

    function anyHostOnline(): bool {
        if (!hostModel) return false
        for (let i = 0; i < hostModel.count(); i++) {
            const idx = hostModel.index(i, 0)
            if (hostModel.data(idx, Qt.UserRole + 6) === "online")
                return true
        }
        return false
    }
}
