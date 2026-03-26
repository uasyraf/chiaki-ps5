import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import Qt5Compat.GraphicalEffects
import "."

Item {
    id: card

    required property string nickname
    required property string hostAddress
    required property bool isPS5
    required property string hostState
    property string consolePin: ""

    signal connectRequested()
    signal wakeUpRequested()

    width: Theme.cardWidth
    height: Theme.cardHeight
    activeFocusOnTab: true

    // Glow border when focused
    RectangularGlow {
        anchors.fill: bg
        cornerRadius: Theme.borderRadius + glowRadius
        glowRadius: card.activeFocus ? 8 : 0
        spread: 0.1
        color: Theme.accentGlow
        opacity: card.activeFocus ? 0.5 : 0

        Behavior on glowRadius {
            NumberAnimation { duration: Theme.animDurationFast; easing.type: Easing.OutCubic }
        }
        Behavior on opacity {
            NumberAnimation { duration: Theme.animDurationFast }
        }
    }

    Rectangle {
        id: bg
        anchors.fill: parent
        radius: Theme.borderRadius
        color: hoverArea.containsMouse || card.activeFocus
            ? Theme.backgroundCardHover
            : Theme.backgroundCard
        border.width: card.activeFocus ? 2 : 0
        border.color: Theme.accentGlow

        Behavior on color {
            ColorAnimation { duration: Theme.animDurationFast }
        }
    }

    ColumnLayout {
        anchors.fill: parent
        anchors.margins: 24
        spacing: 12

        // Console icon
        Image {
            Layout.alignment: Qt.AlignHCenter
            Layout.preferredWidth: 120
            Layout.preferredHeight: 120
            source: card.isPS5 ? "../assets/ps5-console.svg" : "../assets/ps4-console.svg"
            sourceSize: Qt.size(120, 120)
            fillMode: Image.PreserveAspectFit
            antialiasing: true
        }

        // Nickname
        Text {
            Layout.alignment: Qt.AlignHCenter
            text: card.nickname
            font.family: Theme.fontFamily
            font.pixelSize: Theme.fontSizeTitle
            font.weight: Font.Bold
            color: Theme.textPrimary
            elide: Text.ElideRight
            Layout.maximumWidth: parent.width
            horizontalAlignment: Text.AlignHCenter
        }

        // IP address
        Text {
            Layout.alignment: Qt.AlignHCenter
            text: card.hostAddress
            font.family: Theme.fontFamily
            font.pixelSize: Theme.fontSizeMedium
            color: Theme.textSecondary
        }

        // State indicator
        Row {
            Layout.alignment: Qt.AlignHCenter
            spacing: 8

            Rectangle {
                width: 8
                height: 8
                radius: 4
                color: Theme.stateColor(card.hostState)
                anchors.verticalCenter: parent.verticalCenter
            }

            Text {
                text: Theme.stateLabel(card.hostState)
                font.family: Theme.fontFamily
                font.pixelSize: Theme.fontSizeSmall
                color: Theme.stateColor(card.hostState)
            }
        }

        Item { Layout.fillHeight: true }

        // Connect button
        Rectangle {
            Layout.alignment: Qt.AlignHCenter
            Layout.preferredWidth: 160
            Layout.preferredHeight: 40
            radius: 20
            color: connectMouse.containsMouse ? Theme.accentHover : Theme.accentPrimary
            visible: card.hostState === "online"

            Behavior on color {
                ColorAnimation { duration: Theme.animDurationFast }
            }

            Text {
                anchors.centerIn: parent
                text: "Connect"
                font.family: Theme.fontFamily
                font.pixelSize: Theme.fontSizeMedium
                font.weight: Font.DemiBold
                color: Theme.textPrimary
            }

            MouseArea {
                id: connectMouse
                anchors.fill: parent
                cursorShape: Qt.PointingHandCursor
                hoverEnabled: true
                onClicked: card.connectRequested()
            }
        }

        // Wake Up button
        Rectangle {
            Layout.alignment: Qt.AlignHCenter
            Layout.preferredWidth: 160
            Layout.preferredHeight: 40
            radius: 20
            color: "transparent"
            border.width: 2
            border.color: wakeMouse.containsMouse ? Qt.lighter(Theme.stateStandby, 1.2) : Theme.stateStandby
            visible: card.hostState === "standby"

            Behavior on border.color {
                ColorAnimation { duration: Theme.animDurationFast }
            }

            Text {
                anchors.centerIn: parent
                text: "Wake Up"
                font.family: Theme.fontFamily
                font.pixelSize: Theme.fontSizeMedium
                font.weight: Font.DemiBold
                color: Theme.stateStandby
            }

            MouseArea {
                id: wakeMouse
                anchors.fill: parent
                cursorShape: Qt.PointingHandCursor
                hoverEnabled: true
                onClicked: card.wakeUpRequested()
            }
        }
    }

    MouseArea {
        id: hoverArea
        anchors.fill: parent
        hoverEnabled: true
        acceptedButtons: Qt.NoButton
    }

    Keys.onReturnPressed: activateCard()
    Keys.onEnterPressed: activateCard()

    function activateCard() {
        if (card.hostState === "online")
            card.connectRequested()
        else if (card.hostState === "standby")
            card.wakeUpRequested()
    }
}
