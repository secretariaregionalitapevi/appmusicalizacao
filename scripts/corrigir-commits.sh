#!/bin/bash
# Script para corrigir mensagens de commit com encoding incorreto
# Execute no Git Bash

echo "⚠️  ATENÇÃO: Este script fará rebase interativo e force push!"
echo "Certifique-se de que ninguém mais está trabalhando na branch."
echo ""
read -p "Deseja continuar? (s/N): " confirm

if [ "$confirm" != "s" ] && [ "$confirm" != "S" ]; then
    echo "Operação cancelada."
    exit 1
fi

echo ""
echo "Iniciando rebase interativo dos últimos 5 commits..."
echo "No editor que abrir:"
echo "1. Mude 'pick' para 'reword' nos commits que quer corrigir"
echo "2. Salve e feche o editor"
echo "3. Para cada commit, edite a mensagem com os acentos corretos"
echo ""

git rebase -i HEAD~5

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Rebase concluído com sucesso!"
    echo ""
    read -p "Deseja fazer force push? (s/N): " pushConfirm
    
    if [ "$pushConfirm" = "s" ] || [ "$pushConfirm" = "S" ]; then
        git push origin main --force
        echo "✅ Push concluído!"
    else
        echo "Push cancelado. Execute manualmente quando estiver pronto:"
        echo "git push origin main --force"
    fi
else
    echo "❌ Erro no rebase. Execute 'git rebase --abort' para cancelar."
fi

