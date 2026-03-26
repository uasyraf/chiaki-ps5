import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import Qt.labs.settings
import "."

Item {
    id: overlay

    visible: false

    property alias fullscreen: fullscreenSwitch.checked
    property alias dualsense: dualsenseSwitch.checked
    property string displayMode: displayModeCombo.currentText
    property alias passcode: passcodeField.text

    function open() {
        overlay.visible = true
    }

    function close() {
        overlay.visible = false
    }

    Settings {
        id: persistedSettings
        category: "StreamSettings"
        property alias fullscreen: fullscreenSwitch.checked
        property alias dualsense: dualsenseSwitch.checked
        property alias displayModeIndex: displayModeCombo.currentIndex
        property alias passcode: passcodeField.text
    }

    // Scrim
    Rectangle {
        anchors.fill: parent
        color: Qt.rgba(0, 0, 0, 0.5)
        opacity: overlay.visible ? 1 : 0

        Behavior on opacity {
            NumberAnimation { duration: Theme.animDurationFast }
        }

        MouseArea {
            anchors.fill: parent
            onClicked: overlay.close()
        }
    }

    // Panel
    Rectangle {
        id: panel
        width: 380
        height: parent.height
        anchors.top: parent.top
        anchors.bottom: parent.bottom
        x: overlay.visible ? parent.width - 380 : parent.width
        color: Theme.backgroundOverlay

        Behavior on x {
            NumberAnimation {
                duration: Theme.animDuration
                easing.type: Easing.OutCubic
            }
        }

        // Subtle left border
        Rectangle {
            anchors.left: parent.left
            anchors.top: parent.top
            anchors.bottom: parent.bottom
            width: 1
            color: Theme.textMuted
            opacity: 0.2
        }

        Flickable {
            anchors.fill: parent
            anchors.margins: 32
            contentHeight: content.height
            clip: true

            ColumnLayout {
                id: content
                width: parent.width
                spacing: 28

                // Title row
                RowLayout {
                    Layout.fillWidth: true

                    Text {
                        text: "Settings"
                        font.family: Theme.fontFamily
                        font.pixelSize: Theme.fontSizeTitle
                        font.weight: Font.Bold
                        color: Theme.textPrimary
                        Layout.fillWidth: true
                    }

                    Rectangle {
                        width: 32
                        height: 32
                        radius: 16
                        color: closeMouse.containsMouse ? Theme.backgroundCardHover : "transparent"

                        Text {
                            anchors.centerIn: parent
                            text: "\u2715"
                            font.pixelSize: 16
                            color: Theme.textSecondary
                        }

                        MouseArea {
                            id: closeMouse
                            anchors.fill: parent
                            cursorShape: Qt.PointingHandCursor
                            hoverEnabled: true
                            onClicked: overlay.close()
                        }
                    }
                }

                // Stream Options section
                Text {
                    text: "STREAM OPTIONS"
                    font.family: Theme.fontFamily
                    font.pixelSize: Theme.fontSizeSmall
                    font.weight: Font.DemiBold
                    font.letterSpacing: 2
                    color: Theme.textMuted
                }

                SettingsRow {
                    label: "Fullscreen"
                    Layout.fillWidth: true

                    Switch {
                        id: fullscreenSwitch
                        palette.highlight: Theme.accentPrimary
                    }
                }

                SettingsRow {
                    label: "DualSense"
                    Layout.fillWidth: true

                    Switch {
                        id: dualsenseSwitch
                        checked: true
                        palette.highlight: Theme.accentPrimary
                    }
                }

                SettingsRow {
                    label: "Display Mode"
                    Layout.fillWidth: true

                    ComboBox {
                        id: displayModeCombo
                        model: ["Fullscreen", "Zoom", "Stretch"]
                        implicitWidth: 140

                        background: Rectangle {
                            radius: 8
                            color: Theme.backgroundCard
                            border.width: 1
                            border.color: Theme.textMuted
                        }

                        contentItem: Text {
                            text: displayModeCombo.displayText
                            font.family: Theme.fontFamily
                            font.pixelSize: Theme.fontSizeMedium
                            color: Theme.textPrimary
                            verticalAlignment: Text.AlignVCenter
                            leftPadding: 12
                        }
                    }
                }

                // Connection section
                Rectangle {
                    Layout.fillWidth: true
                    height: 1
                    color: Theme.textMuted
                    opacity: 0.2
                }

                Text {
                    text: "CONNECTION"
                    font.family: Theme.fontFamily
                    font.pixelSize: Theme.fontSizeSmall
                    font.weight: Font.DemiBold
                    font.letterSpacing: 2
                    color: Theme.textMuted
                }

                Column {
                    Layout.fillWidth: true
                    spacing: 8

                    Text {
                        text: "Passcode"
                        font.family: Theme.fontFamily
                        font.pixelSize: Theme.fontSizeMedium
                        color: Theme.textSecondary
                    }

                    TextField {
                        id: passcodeField
                        width: parent.width
                        echoMode: TextInput.Password
                        placeholderText: "Enter passcode"
                        font.family: Theme.fontFamily
                        font.pixelSize: Theme.fontSizeMedium
                        color: Theme.textPrimary
                        placeholderTextColor: Theme.textMuted

                        background: Rectangle {
                            radius: 8
                            color: Theme.backgroundCard
                            border.width: passcodeField.activeFocus ? 2 : 1
                            border.color: passcodeField.activeFocus ? Theme.accentPrimary : Theme.textMuted
                        }
                    }
                }
            }
        }
    }

    // Inline component for settings rows
    component SettingsRow: RowLayout {
        property alias label: rowLabel.text
        spacing: 12

        Text {
            id: rowLabel
            font.family: Theme.fontFamily
            font.pixelSize: Theme.fontSizeMedium
            color: Theme.textSecondary
            Layout.fillWidth: true
        }
    }
}
