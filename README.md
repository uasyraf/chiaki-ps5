# Chiaki PS5

A PS5-inspired launcher for [Chiaki-ng](https://github.com/streetpea/chiaki-ng) — the open-source PlayStation Remote Play client.

Chiaki PS5 wraps Chiaki-ng's CLI in a premium, console-style interface built with Qt6/QML. It reads your existing Chiaki-ng configuration, presents your registered consoles in a card-based carousel, and launches streaming sessions with a single click.

![Qt6](https://img.shields.io/badge/Qt6-QML-41cd52?logo=qt&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-blue)
![Platform](https://img.shields.io/badge/platform-Linux-lightgrey)

## Features

- **PS5-inspired dark UI** — deep navy gradients, frosted glass panels, ambient particle effects
- **Card carousel** — horizontal console cards with glow focus, scale animations, and state indicators
- **Auto-discovery** — detects online/standby consoles via UDP broadcast (port 987)
- **One-click streaming** — launches `chiaki stream` with your saved settings
- **Wake-on-LAN** — wake standby consoles directly from the launcher
- **Controller navigation** — keyboard and gamepad support (arrow keys, Enter, Escape)
- **Settings overlay** — configure fullscreen, DualSense haptics, display mode, and passcode
- **Zero overhead** — lightweight launcher (~900KB), all streaming handled natively by Chiaki-ng

## Screenshots

> *Coming soon — contributions welcome!*

## Prerequisites

- [Chiaki-ng](https://github.com/streetpea/chiaki-ng) installed and configured with at least one registered console
- Qt6 (Quick, QuickControls2, Network)
- CMake 3.20+
- A C++17 compiler

### Arch Linux

```bash
sudo pacman -S qt6-base qt6-declarative qt6-quickcontrols2 cmake
```

### Ubuntu/Debian

```bash
sudo apt install qt6-base-dev qt6-declarative-dev libqt6quickcontrols2-6 cmake g++
```

### Fedora

```bash
sudo dnf install qt6-qtbase-devel qt6-qtdeclarative-devel qt6-qtquickcontrols2-devel cmake gcc-c++
```

## Build

```bash
git clone https://github.com/uasyraf/chiaki-ps5.git
cd chiaki-ps5
cmake -B build -DCMAKE_BUILD_TYPE=Release
cmake --build build
```

## Run

```bash
./build/chiaki-ps5
```

The launcher reads your Chiaki-ng configuration from `~/.config/Chiaki/Chiaki.conf`. Make sure you have at least one console registered in Chiaki-ng before launching.

## Install

```bash
chmod +x scripts/install.sh
./scripts/install.sh
```

This copies the binary to `~/.local/bin/` and installs a `.desktop` entry for your application menu.

## Architecture

Chiaki PS5 is a **standalone application** — not a fork or plugin. It has zero coupling to Chiaki-ng's source code.

```
chiaki-ps5 (this project)          chiaki-ng (upstream)
┌─────────────────────┐            ┌──────────────────┐
│  Qt6/QML Frontend   │            │                  │
│  ┌───────────────┐  │  reads     │  Chiaki.conf     │
│  │ HostManager   │──┼───────────>│  (QSettings INI) │
│  └───────────────┘  │            │                  │
│  ┌───────────────┐  │  launches  │  chiaki stream   │
│  │ProcessManager │──┼───────────>│  (CLI binary)    │
│  └───────────────┘  │            │                  │
└─────────────────────┘            └──────────────────┘
```

- **HostManager** — reads `~/.config/Chiaki/Chiaki.conf`, parses registered/manual hosts, runs UDP discovery
- **ProcessManager** — launches `chiaki stream <nickname> <host>` with configured flags, monitors process lifecycle
- **Theme.qml** — centralized design tokens (colors, typography, spacing, animations)

## Controls

| Key | Action |
|-----|--------|
| Left / Right | Navigate console cards |
| Enter | Connect to selected console |
| W | Wake up standby console |
| Escape | Close settings / go back |
| F11 | Toggle fullscreen |

## Configuration

Launcher-specific settings (fullscreen, DualSense, display mode, passcode) are saved to `~/.config/chiaki-ps5/chiaki-ps5.conf` via Qt's Settings API. These are independent of Chiaki-ng's configuration.

## Project Structure

```
chiaki-ps5/
├── CMakeLists.txt              # Build configuration
├── src/
│   ├── main.cpp                # App entry point
│   ├── hostmanager.h/cpp       # Config parser + UDP discovery
│   └── processmanager.h/cpp    # CLI process launcher
├── qml/
│   ├── Main.qml                # Root window + navigation
│   ├── HomeView.qml            # Card carousel + particles
│   ├── HostCard.qml            # Console card component
│   ├── ControlBar.qml          # Bottom action bar
│   ├── SettingsOverlay.qml     # Settings slide-in panel
│   ├── StatusBar.qml           # Top bar with clock
│   └── Theme.qml               # Design tokens singleton
├── assets/
│   ├── ps5-console.svg         # PS5 console icon
│   ├── ps4-console.svg         # PS4 console icon
│   └── background-gradient.svg # Background gradient
└── scripts/
    ├── install.sh              # Install script
    └── chiaki-ps5.desktop      # Desktop entry
```

## Contributing

Contributions are welcome! Some ideas:

- [ ] Gamepad input (SDL2 integration)
- [ ] PS5 console wallpaper backgrounds per host
- [ ] Stream quality presets
- [ ] Multi-monitor support
- [ ] Flatpak/AppImage packaging
- [ ] macOS and Windows support

Please open an issue to discuss larger changes before submitting a PR.

## License

[MIT](LICENSE)

## Acknowledgments

- [Chiaki-ng](https://github.com/streetpea/chiaki-ng) by streetpea — the streaming engine that makes this possible
- [Chiaki](https://git.sr.ht/~thestr4ng3r/chiaki) by thestr4ng3r — the original open-source PS Remote Play client
- Sony PlayStation — for the UI design inspiration
