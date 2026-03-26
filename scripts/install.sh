#!/usr/bin/env bash
set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
INSTALL_DIR="$HOME/.local/bin"
DESKTOP_DIR="$HOME/.local/share/applications"
ASSETS_DIR="$HOME/.local/share/chiaki-ps5"

mkdir -p "$INSTALL_DIR" "$DESKTOP_DIR" "$ASSETS_DIR"

# Copy project for electron runtime
cp -r "$PROJECT_DIR/out" "$ASSETS_DIR/"
cp -r "$PROJECT_DIR/node_modules" "$ASSETS_DIR/" 2>/dev/null || true
cp "$PROJECT_DIR/package.json" "$ASSETS_DIR/"

# Create launcher script
cat > "$INSTALL_DIR/chiaki-ps5" << 'LAUNCHER'
#!/usr/bin/env bash
exec electron39 "$HOME/.local/share/chiaki-ps5/out/main/index.js" "$@"
LAUNCHER
chmod +x "$INSTALL_DIR/chiaki-ps5"

# Desktop entry
cat > "$DESKTOP_DIR/chiaki-ps5.desktop" << 'DESKTOP'
[Desktop Entry]
Name=Chiaki PS5
Comment=PS5-inspired Remote Play Launcher
Exec=chiaki-ps5
Icon=applications-games
Type=Application
Categories=Game;Network;
Keywords=PlayStation;PS5;Remote Play;Chiaki;
DESKTOP

echo "Installed chiaki-ps5 to $INSTALL_DIR/chiaki-ps5"
echo "Desktop entry created at $DESKTOP_DIR/chiaki-ps5.desktop"
