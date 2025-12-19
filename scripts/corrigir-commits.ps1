# Script para corrigir mensagens de commit com encoding incorreto
# ATENÇÃO: Este script fará force push. Use com cuidado!

Write-Host "Este script irá corrigir as mensagens de commit anteriores." -ForegroundColor Yellow
Write-Host "Você precisará editar as mensagens manualmente." -ForegroundColor Yellow
Write-Host ""
$confirm = Read-Host "Deseja continuar? (s/N)"

if ($confirm -ne "s" -and $confirm -ne "S") {
    Write-Host "Operação cancelada." -ForegroundColor Red
    exit
}

# Lista de commits para corrigir (do mais antigo para o mais recente)
$commits = @(
    @{hash="f6c5853"; msg="feat: Implementação inicial do Sistema de Musicalização Infantil CCB - Tela de login completa com padrão Regional Itapevi"},
    @{hash="b6eff22"; msg="merge: Resolvendo conflito no README.md mantendo versão local"},
    @{hash="761a838"; msg="chore: Adiciona configuração do Vercel para deploy"},
    @{hash="c228dc9"; msg="docs: Adiciona .env.example e guia de configuração de variáveis"},
    @{hash="c99e33a"; msg="feat: Configura favicon e título da página como 'CCB | Login'"}
)

Write-Host "`nPara corrigir os commits, execute no Git Bash:" -ForegroundColor Green
Write-Host "git rebase -i HEAD~5" -ForegroundColor Cyan
Write-Host "`nNo editor, mude 'pick' para 'reword' nos commits que quer corrigir." -ForegroundColor Yellow
Write-Host "Depois, edite cada mensagem com os acentos corretos." -ForegroundColor Yellow
Write-Host "`nOu use o script automático abaixo (requer Git Bash):" -ForegroundColor Green

$script = @"
#!/bin/bash
# Execute no Git Bash

git rebase -i HEAD~5

# No editor que abrir:
# 1. Mude 'pick' para 'reword' nos commits que quer corrigir
# 2. Salve e feche
# 3. Para cada commit, edite a mensagem:
#    - feat: Implementação inicial do Sistema de Musicalização Infantil CCB - Tela de login completa com padrão Regional Itapevi
#    - merge: Resolvendo conflito no README.md mantendo versão local
#    - chore: Adiciona configuração do Vercel para deploy
#    - docs: Adiciona .env.example e guia de configuração de variáveis
#    - feat: Configura favicon e título da página como 'CCB | Login'

# Depois do rebase:
git push origin main --force
"@

Write-Host $script

