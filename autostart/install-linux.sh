#!/bin/bash
# Lance Claude Code automatiquement à l'ouverture de session (bureau Linux : GNOME, KDE, XFCE...).
# Usage :        bash install-linux.sh [dossier_de_travail]
# Désinstaller : bash install-linux.sh --uninstall
set -euo pipefail

DESKTOP="${XDG_CONFIG_HOME:-$HOME/.config}/autostart/claude-code.desktop"

if [[ "${1:-}" == "--uninstall" ]]; then
  rm -f "$DESKTOP"
  echo "Démarrage automatique de Claude désactivé."
  exit 0
fi

WORKDIR="${1:-$HOME}"
command -v claude >/dev/null || echo "Attention : 'claude' introuvable. Installe Claude Code d'abord : https://claude.ai/code"

mkdir -p "$(dirname "$DESKTOP")"
cat > "$DESKTOP" <<ENTRY
[Desktop Entry]
Type=Application
Name=Claude Code
Comment=Lance Claude Code au démarrage
Path=$WORKDIR
Exec=bash -lc "cd '$WORKDIR' && claude; exec bash"
Terminal=true
X-GNOME-Autostart-enabled=true
ENTRY

echo "OK : Claude Code se lancera à chaque démarrage ($DESKTOP)."
