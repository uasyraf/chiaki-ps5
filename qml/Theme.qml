pragma Singleton
import QtQuick

QtObject {
    // Background
    readonly property color backgroundPrimary:   "#0e1117"
    readonly property color backgroundSecondary: "#1a1d2e"
    readonly property color backgroundCard:      "#1e2235"
    readonly property color backgroundCardHover: "#252a40"
    readonly property color backgroundOverlay:   Qt.rgba(0.05, 0.06, 0.09, 0.85)

    // Accent
    readonly property color accentPrimary: "#0070d1"
    readonly property color accentGlow:    "#0090ff"
    readonly property color accentHover:   "#0080e0"

    // Text
    readonly property color textPrimary:   "#ffffff"
    readonly property color textSecondary: "#8e95a9"
    readonly property color textMuted:     "#4a5068"

    // State indicators
    readonly property color stateOnline:  "#00d26a"
    readonly property color stateStandby: "#ff9f1a"
    readonly property color stateOffline: "#4a5068"

    // Layout
    readonly property int borderRadius: 16
    readonly property int cardWidth: 280
    readonly property int cardHeight: 360
    readonly property int controlBarHeight: 64
    readonly property int statusBarHeight: 40

    // Animation
    readonly property int animDuration: 300
    readonly property int animDurationFast: 150
    readonly property int animDurationSlow: 500

    // Typography
    readonly property string fontFamily: "Inter"
    readonly property int fontSizeSmall: 12
    readonly property int fontSizeMedium: 14
    readonly property int fontSizeLarge: 18
    readonly property int fontSizeTitle: 24
    readonly property int fontSizeHero: 32

    function stateColor(state: string): color {
        switch (state) {
        case "online":  return stateOnline
        case "standby": return stateStandby
        default:        return stateOffline
        }
    }

    function stateLabel(state: string): string {
        switch (state) {
        case "online":  return "Online"
        case "standby": return "Standby"
        default:        return "Offline"
        }
    }
}
