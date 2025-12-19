# Script seguro para fazer commits com encoding UTF-8 correto
# Uso: .\scripts\commit-utf8-safe.ps1 "mensagem do commit"

param(
    [Parameter(Mandatory=$true)]
    [string]$Message
)

# Criar arquivo temporário com a mensagem em UTF-8
$tempFile = [System.IO.Path]::GetTempFileName()
[System.IO.File]::WriteAllText($tempFile, $Message, [System.Text.Encoding]::UTF8)

try {
    # Fazer o commit usando o arquivo
    git commit -F $tempFile
    
    # Verificar o último commit
    Write-Host "`nÚltimo commit:" -ForegroundColor Green
    git log --oneline -1 --encoding=UTF-8
} finally {
    # Limpar arquivo temporário
    Remove-Item $tempFile -Force
}

