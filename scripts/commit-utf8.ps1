# Script para fazer commit com encoding UTF-8 correto no Windows
# Uso: .\scripts\commit-utf8.ps1 "mensagem do commit"

param(
    [Parameter(Mandatory=$true)]
    [string]$Mensagem
)

# Configurar encoding UTF-8
$OutputEncoding = [System.Text.Encoding]::UTF8
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$env:LC_ALL = "pt_BR.UTF-8"
$env:LANG = "pt_BR.UTF-8"

# Configurar Git para UTF-8
git config --local core.quotepath false
git config --local i18n.commitencoding utf-8
git config --local i18n.logoutputencoding utf-8

# Converter mensagem para bytes UTF-8 e depois para string
$bytes = [System.Text.Encoding]::UTF8.GetBytes($Mensagem)
$mensagemUtf8 = [System.Text.Encoding]::UTF8.GetString($bytes)

# Fazer commit usando arquivo temporário para garantir UTF-8
$tempFile = [System.IO.Path]::GetTempFileName()
[System.IO.File]::WriteAllText($tempFile, $mensagemUtf8, [System.Text.Encoding]::UTF8)

try {
    git commit -F $tempFile
    Write-Host "✅ Commit criado com sucesso em UTF-8!" -ForegroundColor Green
} finally {
    Remove-Item $tempFile -Force
}
