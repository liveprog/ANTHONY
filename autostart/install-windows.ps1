# Lance Claude Code automatiquement à l'ouverture de session Windows.
# Usage (PowerShell) :  powershell -ExecutionPolicy Bypass -File install-windows.ps1
# Désinstaller :        powershell -ExecutionPolicy Bypass -File install-windows.ps1 -Uninstall
param(
    [string]$WorkDir = $env:USERPROFILE,
    [switch]$Uninstall
)

$startup  = [Environment]::GetFolderPath('Startup')
$shortcut = Join-Path $startup 'Claude Code.lnk'

if ($Uninstall) {
    Remove-Item $shortcut -ErrorAction SilentlyContinue
    Write-Host "Démarrage automatique de Claude désactivé."
    exit 0
}

if (-not (Get-Command claude -ErrorAction SilentlyContinue)) {
    Write-Warning "La commande 'claude' est introuvable. Installe Claude Code d'abord : https://claude.ai/code"
}

# Windows Terminal si disponible, sinon PowerShell classique.
if (Get-Command wt.exe -ErrorAction SilentlyContinue) {
    $target = (Get-Command wt.exe).Source
    $arguments   = "-d `"$WorkDir`" powershell -NoExit -Command claude"
} else {
    $target = (Get-Command powershell.exe).Source
    $arguments   = "-NoExit -Command `"Set-Location '$WorkDir'; claude`""
}

$shell = New-Object -ComObject WScript.Shell
$lnk = $shell.CreateShortcut($shortcut)
$lnk.TargetPath       = $target
$lnk.Arguments        = $arguments
$lnk.WorkingDirectory = $WorkDir
$lnk.Save()

Write-Host "OK : Claude Code se lancera à chaque démarrage ($shortcut)."
