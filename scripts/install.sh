#!/usr/bin/env bash
set -euo pipefail

BINARY="build/chiaki-ps5"
INSTALL_DIR="$HOME/.local/bin"
DESKTOP_DIR="$HOME/.local/share/applications"

if [[ ! -f "$BINARY" ]]; then
    echo "Error: Binary not found at $BINARY"
    echo "Please build the project first (cmake --build build)"
    exit 1
fi

mkdir -p "$INSTALL_DIR"
mkdir -p "$DESKTOP_DIR"

cp "$BINARY" "$INSTALL_DIR/chiaki-ps5"
chmod +x "$INSTALL_DIR/chiaki-ps5"

cat > "$DESKTOP_DIR/chiaki-ps5.desktop" << 'EOF'
[Desktop Entry]
Name=Chiaki PS5
Comment=PS5-inspired Remote Play Launcher
Exec=chiaki-ps5
Icon=chiaki-ps5
Type=Application
Categories=Game;
EOF

echo "Installed chiaki-ps5 to $INSTALL_DIR/chiaki-ps5"
echo "Desktop entry created at $DESKTOP_DIR/chiaki-ps5.desktop"
