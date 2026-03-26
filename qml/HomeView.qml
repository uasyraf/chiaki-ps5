import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import "."

Item {
    id: homeView

    property var settingsOverlayRef: null

    signal settingsRequested()

    focus: true

    // Background gradient
    Rectangle {
        anchors.fill: parent
        gradient: Gradient {
            GradientStop { position: 0.0; color: Theme.backgroundSecondary }
            GradientStop { position: 1.0; color: Theme.backgroundPrimary }
        }
    }

    // Ambient particles
    Item {
        anchors.fill: parent
        clip: true

        Repeater {
            model: 20

            Rectangle {
                id: particle
                readonly property real startX: Math.random() * homeView.width
                readonly property real size: 2 + Math.random() * 2
                readonly property real drift: -30 + Math.random() * 60
                readonly property int dur: 8000 + Math.random() * 12000

                width: size
                height: size
                radius: size / 2
                color: Theme.textSecondary
                opacity: 0.03 + Math.random() * 0.05
                x: startX + drift * (1 - yAnim.progress)
                y: homeView.height

                NumberAnimation on y {
                    id: yAnim
                    readonly property real progress: (homeView.height - particle.y) / homeView.height
                    from: homeView.height + 20
                    to: -20
                    duration: particle.dur
                    loops: Animation.Infinite
                    running: true
                }

                Component.onCompleted: {
                    yAnim.from = homeView.height * (0.2 + Math.random() * 0.8)
                }
            }
        }
    }

    // Status bar
    StatusBar {
        id: statusBar
        anchors.top: parent.top
        anchors.left: parent.left
        anchors.right: parent.right
        hostModel: hostManager
    }

    // Card carousel
    Item {
        anchors {
            top: statusBar.bottom
            bottom: controlBar.top
            left: parent.left
            right: parent.right
        }

        // Empty state
        Column {
            anchors.centerIn: parent
            spacing: 24
            visible: hostManager.count === 0

            Text {
                anchors.horizontalCenter: parent.horizontalCenter
                text: "No consoles found"
                font.family: Theme.fontFamily
                font.pixelSize: Theme.fontSizeTitle
                color: Theme.textSecondary
            }

            Rectangle {
                anchors.horizontalCenter: parent.horizontalCenter
                width: 180
                height: 48
                radius: Theme.borderRadius
                color: Theme.accentPrimary

                Text {
                    anchors.centerIn: parent
                    text: "Discover"
                    font.family: Theme.fontFamily
                    font.pixelSize: Theme.fontSizeMedium
                    font.weight: Font.DemiBold
                    color: Theme.textPrimary
                }

                MouseArea {
                    anchors.fill: parent
                    cursorShape: Qt.PointingHandCursor
                    onClicked: hostManager.discoverHosts()
                }
            }
        }

        // Carousel
        ListView {
            id: carousel
            anchors.centerIn: parent
            width: parent.width
            height: Theme.cardHeight + 40
            visible: hostManager.count > 0
            orientation: ListView.Horizontal
            snapMode: ListView.SnapOneItem
            highlightRangeMode: ListView.StrictlyEnforceRange
            preferredHighlightBegin: (width - Theme.cardWidth) / 2
            preferredHighlightEnd: preferredHighlightBegin + Theme.cardWidth
            highlightMoveDuration: Theme.animDuration
            model: hostManager
            focus: true
            clip: false

            delegate: Item {
                id: delegateRoot
                width: Theme.cardWidth + 40
                height: Theme.cardHeight + 40
                z: ListView.isCurrentItem ? 1 : 0

                readonly property bool isCurrent: ListView.isCurrentItem

                HostCard {
                    id: card
                    anchors.centerIn: parent
                    nickname: model.nickname
                    hostAddress: model.hostAddress
                    isPS5: model.isPS5
                    hostState: model.state
                    consolePin: model.consolePin ?? ""

                    scale: delegateRoot.isCurrent ? 1.0 : 0.85
                    opacity: delegateRoot.isCurrent ? 1.0 : 0.6

                    Behavior on scale {
                        NumberAnimation { duration: Theme.animDuration; easing.type: Easing.OutCubic }
                    }
                    Behavior on opacity {
                        NumberAnimation { duration: Theme.animDuration; easing.type: Easing.OutCubic }
                    }

                    onConnectRequested: {
                        const s = homeView.settingsOverlayRef
                        processManager.startStream(
                            nickname, hostAddress,
                            s ? s.fullscreen : false,
                            s ? s.dualsense : true,
                            s ? s.passcode : ""
                        )
                    }

                    onWakeUpRequested: {
                        processManager.wakeUp(hostAddress, "")
                    }
                }
            }
        }
    }

    // Control bar
    ControlBar {
        id: controlBar
        anchors.bottom: parent.bottom
        anchors.left: parent.left
        anchors.right: parent.right
        onSettingsRequested: homeView.settingsRequested()
    }

    // Keyboard navigation
    Keys.onLeftPressed: {
        if (carousel.currentIndex > 0)
            carousel.currentIndex -= 1
    }

    Keys.onRightPressed: {
        if (carousel.currentIndex < carousel.count - 1)
            carousel.currentIndex += 1
    }

    Keys.onReturnPressed: connectCurrent()
    Keys.onEnterPressed: connectCurrent()

    Keys.onPressed: function(event) {
        if (event.key === Qt.Key_W) {
            wakeCurrent()
            event.accepted = true
        }
    }

    function connectCurrent() {
        if (carousel.count === 0) return
        const item = carousel.currentItem
        if (!item) return
        const card = item.children[0]
        if (card.hostState === "online") {
            const s = homeView.settingsOverlayRef
            processManager.startStream(
                card.nickname, card.hostAddress,
                s ? s.fullscreen : false,
                s ? s.dualsense : true,
                s ? s.passcode : ""
            )
        }
    }

    function wakeCurrent() {
        if (carousel.count === 0) return
        const item = carousel.currentItem
        if (!item) return
        const card = item.children[0]
        if (card.hostState === "standby") {
            processManager.wakeUp(card.hostAddress, "")
        }
    }
}
