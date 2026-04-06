#!/bin/bash
# Script auxiliar para facilitar o processo de tradução

set -e

echo "🌐 Claudinho - Sistema de Tradução Automática"
echo "=============================================="
echo ""

# Função para mostrar ajuda
show_help() {
    echo "Uso: ./scripts/traduzir.sh [comando] [opções]"
    echo ""
    echo "Comandos:"
    echo "  gerar       Gera o arquivo de traduções (traducoes-geradas.json)"
    echo "  preview     Mostra preview das traduções sem aplicar"
    echo "  aplicar     Aplica as traduções nos arquivos"
    echo "  fase1       Aplica apenas prioridade máxima"
    echo "  fase2       Aplica apenas prioridade alta"
    echo "  fase3       Aplica apenas prioridade média"
    echo "  fase4       Aplica apenas prioridade baixa"
    echo "  testar      Testa a compilação"
    echo "  completo    Executa todo o processo (gerar + aplicar + testar)"
    echo ""
    echo "Opções:"
    echo "  --categoria=N   Filtra por categoria específica"
    echo "  --dry-run       Apenas mostra o que seria feito"
    echo ""
    echo "Exemplos:"
    echo "  ./scripts/traduzir.sh gerar"
    echo "  ./scripts/traduzir.sh preview"
    echo "  ./scripts/traduzir.sh fase1"
    echo "  ./scripts/traduzir.sh aplicar --prioridade=alta --dry-run"
    echo ""
}

# Verificar se bun está instalado
if ! command -v bun &> /dev/null; then
    echo "❌ Erro: Bun não está instalado"
    echo "   Instale com: curl -fsSL https://bun.sh/install | bash"
    exit 1
fi

# Parse comando
COMANDO=${1:-help}
shift || true

case "$COMANDO" in
    gerar)
        echo "📝 Gerando traduções..."
        bun run scripts/gerar-traducoes.ts
        echo ""
        echo "✅ Traduções geradas em: traducoes-geradas.json"
        echo "💡 Próximo passo: ./scripts/traduzir.sh preview"
        ;;
    
    preview)
        echo "🔍 Preview das traduções (dry-run)..."
        bun run scripts/aplicar-traducoes.ts --dry-run "$@" | head -n 100
        echo ""
        echo "💡 Para aplicar: ./scripts/traduzir.sh aplicar"
        ;;
    
    aplicar)
        echo "🚀 Aplicando traduções..."
        bun run scripts/aplicar-traducoes.ts "$@"
        echo ""
        echo "💡 Próximo passo: ./scripts/traduzir.sh testar"
        ;;
    
    fase1)
        echo "🎯 FASE 1: Prioridade Máxima (~90 strings)"
        echo "   - Títulos de diálogos"
        echo "   - Botões principais"
        echo "   - Labels críticos"
        echo ""
        read -p "Continuar? (s/N) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Ss]$ ]]; then
            bun run scripts/aplicar-traducoes.ts --prioridade=maxima "$@"
            echo ""
            echo "✅ Fase 1 concluída!"
            echo "💡 Teste a compilação: ./scripts/traduzir.sh testar"
        fi
        ;;
    
    fase2)
        echo "🎯 FASE 2: Prioridade Alta (~650 strings)"
        echo "   - Mensagens de erro"
        echo "   - Notificações"
        echo "   - Validações"
        echo ""
        read -p "Continuar? (s/N) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Ss]$ ]]; then
            bun run scripts/aplicar-traducoes.ts --prioridade=alta "$@"
            echo ""
            echo "✅ Fase 2 concluída!"
            echo "💡 Teste a compilação: ./scripts/traduzir.sh testar"
        fi
        ;;
    
    fase3)
        echo "🎯 FASE 3: Prioridade Média (~570 strings)"
        echo "   - Status do sistema"
        echo "   - Mensagens de progresso"
        echo "   - Descrições secundárias"
        echo ""
        read -p "Continuar? (s/N) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Ss]$ ]]; then
            bun run scripts/aplicar-traducoes.ts --prioridade=media "$@"
            echo ""
            echo "✅ Fase 3 concluída!"
            echo "💡 Teste a compilação: ./scripts/traduzir.sh testar"
        fi
        ;;
    
    fase4)
        echo "🎯 FASE 4: Prioridade Baixa (~10 strings)"
        echo "   - Logs de debug"
        echo "   - Comentários técnicos"
        echo ""
        read -p "Continuar? (s/N) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Ss]$ ]]; then
            bun run scripts/aplicar-traducoes.ts --prioridade=baixa "$@"
            echo ""
            echo "✅ Fase 4 concluída!"
            echo "💡 Teste a compilação: ./scripts/traduzir.sh testar"
        fi
        ;;
    
    testar)
        echo "🧪 Testando compilação..."
        bun run build
        echo ""
        if [ $? -eq 0 ]; then
            echo "✅ Compilação bem-sucedida!"
        else
            echo "❌ Erro na compilação"
            echo "   Reverta as últimas traduções e tente novamente"
            exit 1
        fi
        ;;
    
    completo)
        echo "🚀 Processo Completo de Tradução"
        echo "================================"
        echo ""
        echo "Este processo vai:"
        echo "  1. Gerar traduções"
        echo "  2. Aplicar todas as traduções"
        echo "  3. Testar compilação"
        echo ""
        read -p "Continuar? (s/N) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Ss]$ ]]; then
            # Backup
            echo "📦 Criando backup..."
            git add -A
            git commit -m "backup antes de traduções automáticas" || true
            
            # Gerar
            echo ""
            echo "📝 Gerando traduções..."
            bun run scripts/gerar-traducoes.ts
            
            # Aplicar por fases
            echo ""
            echo "🎯 Aplicando Fase 1 (Prioridade Máxima)..."
            bun run scripts/aplicar-traducoes.ts --prioridade=maxima
            
            echo ""
            echo "🧪 Testando..."
            bun run build || exit 1
            
            echo ""
            echo "🎯 Aplicando Fase 2 (Prioridade Alta)..."
            bun run scripts/aplicar-traducoes.ts --prioridade=alta
            
            echo ""
            echo "🧪 Testando..."
            bun run build || exit 1
            
            echo ""
            echo "🎯 Aplicando Fase 3 (Prioridade Média)..."
            bun run scripts/aplicar-traducoes.ts --prioridade=media
            
            echo ""
            echo "🧪 Testando..."
            bun run build || exit 1
            
            echo ""
            echo "✅ Processo completo concluído!"
            echo "📊 Estatísticas finais:"
            echo "   - ~1250+ strings traduzidas"
            echo "   - 92 categorias cobertas"
            echo "   - Build funcionando"
        fi
        ;;
    
    help|--help|-h)
        show_help
        ;;
    
    *)
        echo "❌ Comando desconhecido: $COMANDO"
        echo ""
        show_help
        exit 1
        ;;
esac
