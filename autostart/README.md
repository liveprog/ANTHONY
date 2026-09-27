# Lancer Claude automatiquement au démarrage

Lance le script de ton système **une seule fois** sur ton ordinateur.
Ensuite, Claude Code s'ouvrira dans un terminal à chaque démarrage.

Prérequis : Claude Code installé (la commande `claude` doit marcher dans un terminal).

| Système | Installer | Désinstaller |
|---|---|---|
| Windows | `powershell -ExecutionPolicy Bypass -File autostart\install-windows.ps1` | ajoute `-Uninstall` |
| macOS | `bash autostart/install-macos.sh` | `bash autostart/install-macos.sh --uninstall` |
| Linux | `bash autostart/install-linux.sh` | `bash autostart/install-linux.sh --uninstall` |

Par défaut Claude démarre dans ton dossier personnel. Pour un autre dossier :
- Windows : `-WorkDir C:\chemin\vers\projet`
- macOS / Linux : passe le chemin en argument, ex. `bash autostart/install-linux.sh ~/projets/ANTHONY`

**Tu utilises l'application Claude (bureau) plutôt que Claude Code ?**
Pas besoin de script : ouvre Claude → Réglages → Général et active « Lancer au démarrage »
(ou ajoute Claude dans les éléments d'ouverture du système).
