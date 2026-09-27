#!/bin/bash
# Lance Claude Code automatiquement à l'ouverture de session macOS.
# Usage :        bash install-macos.sh [dossier_de_travail]
# Désinstaller : bash install-macos.sh --uninstall
set -euo pipefail

LABEL="com.anthony.claude-autostart"
PLIST="$HOME/Library/LaunchAgents/$LABEL.plist"
LAUNCHER="$HOME/.claude-autostart.command"

if [[ "${1:-}" == "--uninstall" ]]; then
  launchctl unload "$PLIST" 2>/dev/null || true
  rm -f "$PLIST" "$LAUNCHER"
  echo "Démarrage automatique de Claude désactivé."
  exit 0
fi

WORKDIR="${1:-$HOME}"
command -v claude >/dev/null || echo "Attention : 'claude' introuvable. Installe Claude Code d'abord : https://claude.ai/code"

cat > "$LAUNCHER" <<SCRIPT
#!/bin/zsh -l
cd "$WORKDIR"
exec claude
SCRIPT
chmod +x "$LAUNCHER"

mkdir -p "$(dirname "$PLIST")"
cat > "$PLIST" <<PLISTEOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key><string>$LABEL</string>
  <key>ProgramArguments</key>
  <array>
    <string>/usr/bin/open</string>
    <string>-a</string>
    <string>Terminal</string>
    <string>$LAUNCHER</string>
  </array>
  <key>RunAtLoad</key><true/>
</dict>
</plist>
PLISTEOF

launchctl unload "$PLIST" 2>/dev/null || true
launchctl load "$PLIST"
echo "OK : Claude Code se lancera à chaque démarrage ($PLIST)."
