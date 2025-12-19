#!/bin/bash
# Script para fazer commits com UTF-8 garantido
# Configura todo o ambiente antes de fazer commit

# Configurar encoding UTF-8
export LANG=pt_BR.UTF-8
export LC_ALL=pt_BR.UTF-8
export GIT_EDITOR="nano"

# Configurar Git para UTF-8
git config --local core.quotepath false
git config --local i18n.commitencoding utf-8
git config --local i18n.logoutputencoding utf-8

# Se uma mensagem foi passada como argumento
if [ -n "$1" ]; then
    # Criar arquivo temporário com UTF-8
    TEMP_FILE=$(mktemp)
    echo -n "$1" > "$TEMP_FILE"
    
    # Fazer commit usando o arquivo
    git commit -F "$TEMP_FILE"
    
    # Limpar
    rm "$TEMP_FILE"
else
    # Abrir editor interativo
    git commit
fi

# Verificar o commit
echo ""
echo "✅ Último commit:"
git log --oneline -1 --encoding=UTF-8

