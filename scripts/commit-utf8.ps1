# Script para fazer commits com encoding UTF-8 correto
# Uso: .\scripts\commit-utf8.ps1 "mensagem do commit"

param(
    [Parameter(Mandatory=$true)]
    [string]$Message
)

# Configurar encoding UTF-8
$OutputEncoding = [System.Text.Encoding]::UTF8
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
[Console]::InputEncoding = [System.Text.Encoding]::UTF8
chcp 65001 | Out-Null

# Fazer o commit
git commit -m $Message

# Verificar o último commit
Write-Host "`nÚltimo commit:" -ForegroundColor Green
git log --oneline -1

