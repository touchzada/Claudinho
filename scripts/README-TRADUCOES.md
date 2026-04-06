# Scripts de Tradução - Claudinho PT-BR

Scripts automatizados para traduzir todas as strings do Claudinho para português brasileiro.

## 📋 Pré-requisitos

- Bun instalado (`curl -fsSL https://bun.sh/install | bash`)
- Inventário completo em `INVENTARIO_STRINGS_TRADUCAO.md`

## 🚀 Uso Rápido

### 1. Gerar Traduções

Primeiro, gere o arquivo JSON com todas as traduções:

```bash
bun run scripts/gerar-traducoes.ts
```

Isso vai criar `traducoes-geradas.json` com ~1250+ strings traduzidas.

### 2. Aplicar Traduções (Dry-Run)

Antes de modificar os arquivos, veja o que será traduzido:

```bash
bun run scripts/aplicar-traducoes.ts --dry-run
```

### 3. Aplicar Traduções (Real)

Aplique as traduções nos arquivos:

```bash
# Todas as prioridades
bun run scripts/aplicar-traducoes.ts

# Apenas prioridade máxima
bun run scripts/aplicar-traducoes.ts --prioridade=maxima

# Apenas prioridade alta
bun run scripts/aplicar-traducoes.ts --prioridade=alta

# Apenas uma categoria específica
bun run scripts/aplicar-traducoes.ts --categoria=1

# Combinado: categoria 1 em dry-run
bun run scripts/aplicar-traducoes.ts --categoria=1 --dry-run
```

### 4. Testar Compilação

Após aplicar traduções, sempre teste:

```bash
bun run build
```

## 📊 Estrutura do Arquivo de Traduções

O arquivo `traducoes-geradas.json` tem a seguinte estrutura:

```json
{
  "metadata": {
    "geradoEm": "2026-04-05T...",
    "totalCategorias": 92,
    "totalStrings": 1250,
    "versao": "1.0.0"
  },
  "categorias": {
    "1. UI-CRITICAL": {
      "prioridade": "maxima",
      "total": 70,
      "jaTradzidas": 5,
      "strings": [
        {
          "original": "Export Conversation",
          "traducao": "Exportar Conversa",
          "arquivo": "src/components/ExportDialog.tsx",
          "linha": "118",
          "categoria": "1. UI-CRITICAL",
          "prioridade": "maxima",
          "jaTradzido": false
        }
      ]
    }
  }
}
```

## 🎯 Estratégia de Tradução

### Fase 1: Prioridade Máxima (~90 strings)
```bash
bun run scripts/aplicar-traducoes.ts --prioridade=maxima
bun run build
```

Traduz:
- Títulos de diálogos
- Botões principais
- Labels críticos
- Placeholders de inputs

### Fase 2: Prioridade Alta (~650 strings)
```bash
bun run scripts/aplicar-traducoes.ts --prioridade=alta
bun run build
```

Traduz:
- Mensagens de erro
- Notificações
- Validações
- Confirmações
- Avisos

### Fase 3: Prioridade Média (~570 strings)
```bash
bun run scripts/aplicar-traducoes.ts --prioridade=media
bun run build
```

Traduz:
- Status do sistema
- Mensagens de progresso
- Descrições secundárias
- Comandos

### Fase 4: Prioridade Baixa (~10 strings)
```bash
bun run scripts/aplicar-traducoes.ts --prioridade=baixa
bun run build
```

Traduz:
- Logs de debug
- Comentários técnicos (se necessário)

## 🔧 Opções dos Scripts

### gerar-traducoes.ts

Gera o arquivo JSON com traduções automáticas.

**Saída:**
- `traducoes-geradas.json` - Arquivo com todas as traduções

**Características:**
- Extrai strings do inventário
- Aplica regras de tradução contextuais
- Preserva strings já traduzidas
- Mantém termos técnicos em inglês quando apropriado

### aplicar-traducoes.ts

Aplica as traduções nos arquivos do código.

**Opções:**

| Opção | Descrição | Exemplo |
|-------|-----------|---------|
| `--dry-run` | Mostra o que seria traduzido sem modificar arquivos | `--dry-run` |
| `--prioridade=X` | Filtra por prioridade (maxima, alta, media, baixa) | `--prioridade=alta` |
| `--categoria=N` | Filtra por número de categoria específica | `--categoria=1` |

**Exemplos:**

```bash
# Ver todas as traduções sem aplicar
bun run scripts/aplicar-traducoes.ts --dry-run

# Aplicar apenas UI crítico
bun run scripts/aplicar-traducoes.ts --prioridade=maxima

# Ver traduções da categoria 1 (UI-CRITICAL)
bun run scripts/aplicar-traducoes.ts --categoria=1 --dry-run

# Aplicar traduções da categoria 7 (NOTIFICATIONS)
bun run scripts/aplicar-traducoes.ts --categoria=7
```

## 📝 Regras de Tradução

O script aplica as seguintes regras:

### 1. Traduções Diretas
- `Cancel` → `Cancelar`
- `Continue` → `Continuar`
- `Loading` → `Carregando`
- `Error` → `Erro`
- etc.

### 2. Padrões Contextuais
- `Failed to X` → `Falha ao X`
- `Unable to X` → `Não foi possível X`
- `Are you sure you want to X?` → `Tem certeza que quer X?`
- `Loading X` → `Carregando X`

### 3. Termos Técnicos Preservados
- API, URL, JSON, SSH, Git, GitHub, OAuth
- token, plugin, MCP, LSP
- Nomes de comandos e ferramentas

### 4. Capitalização Preservada
- `Error` → `Erro`
- `error` → `erro`
- `ERROR` → `ERRO`

## ⚠️ Cuidados

1. **Sempre faça backup antes de aplicar traduções em massa**
   ```bash
   git add -A
   git commit -m "backup antes de traduções"
   ```

2. **Teste a compilação após cada fase**
   ```bash
   bun run build
   ```

3. **Use --dry-run primeiro para revisar**
   ```bash
   bun run scripts/aplicar-traducoes.ts --dry-run | less
   ```

4. **Aplique por prioridade, não tudo de uma vez**
   - Facilita identificar problemas
   - Permite testar incrementalmente

5. **Revise traduções automáticas**
   - Algumas podem precisar ajuste manual
   - Contexto pode exigir tradução diferente

## 🐛 Troubleshooting

### Erro: "String não encontrada na linha X"

**Causa:** A linha mudou desde que o inventário foi gerado.

**Solução:**
1. Regenere o inventário
2. Ou edite manualmente o arquivo

### Erro de compilação após tradução

**Causa:** String traduzida quebrou sintaxe (ex: dentro de regex).

**Solução:**
1. Identifique o arquivo com erro
2. Reverta a tradução problemática
3. Adicione à lista de exclusões

### Muitas falhas ao aplicar

**Causa:** Inventário desatualizado ou arquivos modificados.

**Solução:**
1. Regenere o inventário: `bun run scripts/vasculhar-strings.ts`
2. Regenere traduções: `bun run scripts/gerar-traducoes.ts`
3. Tente novamente

## 📈 Progresso

Acompanhe o progresso em `TRADUCOES_REALIZADAS.md`:

```bash
# Após cada fase, atualize o documento
echo "## Fase X - $(date)" >> TRADUCOES_REALIZADAS.md
echo "- Strings traduzidas: X" >> TRADUCOES_REALIZADAS.md
echo "- Status da build: ✅/❌" >> TRADUCOES_REALIZADAS.md
```

## 🎉 Resultado Final

Após completar todas as fases:

- ✅ ~1250+ strings traduzidas
- ✅ 92 categorias cobertas
- ✅ Interface 100% em português
- ✅ Build funcionando
- ✅ Testes passando

## 📚 Referências

- [INVENTARIO_STRINGS_TRADUCAO.md](../INVENTARIO_STRINGS_TRADUCAO.md) - Inventário completo
- [TRADUCOES_REALIZADAS.md](../TRADUCOES_REALIZADAS.md) - Histórico de traduções
- [PLAYBOOK.md](../PLAYBOOK.md) - Guia geral do projeto
