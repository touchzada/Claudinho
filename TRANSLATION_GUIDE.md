# Guia de Tradução PT-BR - Claudinho

## Status da Tradução

### ✅ COMPLETO

1. **Tips do Spinner** - `src/services/tips/tipRegistry.ts`
   - Todas as 50+ tips traduzidas e integradas
   - Sistema de tradução via `t()` do `src/i18n/pt-BR.ts`

2. **Logo e Startup** - `src/components/logoConfig.json`
   - Logo mudada de "OPEN CLAUDE" para "CLAUDINHO"
   - Tagline traduzida

3. **Sistema de Tradução** - `src/i18n/pt-BR.ts`
   - Arquivo central com todas as traduções
   - Funções helper: `t()`, `translateCommand()`, `translateUI()`, `translateError()`, `translateKeyboardAction()`, `translatePermission()`

4. **Labels "Tip:" e "Next:"** - Todos traduzidos para "Dica:" e "Próximo:"
   - ✅ `src/components/Spinner.tsx` - linha 296
   - ✅ `src/main.tsx` - linha 1016
   - ✅ `src/utils/model/contextWindowUpgradeCheck.ts` - linha 43
   - ✅ `src/components/PromptInput/PromptInput.tsx` - linha 821
   - ✅ `src/commands/ide/ide.tsx` - linha 161
   - ✅ `src/commands/insights.ts` - linha 3126
   - ✅ `scripts/provider-recommend.ts` - linha 120

### 🚧 PARCIALMENTE COMPLETO

5. **Atalhos de Teclado** - Traduções criadas mas não aplicadas
   - ✅ Traduções adicionadas em `src/i18n/pt-BR.ts` → `keyboardActions`
   - ✅ Componente wrapper criado: `src/components/design-system/TranslatedKeyboardShortcutHint.tsx`
   - ❌ Não aplicado nos componentes (arquivos compilados)
   
   **Ações traduzidas:**
   - expand → expandir
   - manage → gerenciar
   - navigate → navegar
   - select → selecionar
   - cancel → cancelar
   - confirm → confirmar
   - continue → continuar
   - run in background → rodar em background
   - copy → copiar
   - enter text → digitar
   - toggle → alternar
   - view → visualizar
   - foreground → trazer pra frente
   - go back → voltar
   - exit → sair
   - open in editor → abrir no editor
   - tabs → abas
   - clear → limpar
   - native select → seleção nativa
   - submit → enviar
   - search history → buscar histórico

5. **Prompts de Permissão** - Traduções criadas mas não aplicadas
   - ✅ Traduções adicionadas em `src/i18n/pt-BR.ts` → `permissions`
   - ✅ Componente wrapper criado: `src/components/permissions/TranslatedPermissionPrompt.tsx`
   - ✅ Opções traduzidas criadas: `src/components/permissions/FilePermissionDialog/translatedPermissionOptions.tsx`
   - ❌ Não aplicado nos componentes (arquivos compilados)
   
   **Textos traduzidos:**
   - "Do you want to make this edit to" → "Você quer fazer essa edição em"
   - "Do you want to proceed?" → "Você quer prosseguir?"
   - "Yes" → "Sim"
   - "No" → "Não"
   - "Yes, allow all edits during this session" → "Sim, permitir todas as edições durante esta sessão"
   - "Yes, and allow Claude to edit its own settings" → "Sim, e permitir que o Claudinho edite suas próprias configurações"
   - "and tell Claude what to do next" → "e diga o que fazer depois"
   - "and tell Claude what to do differently" → "e diga o que fazer diferente"
   - "Esc to cancel" → "Esc pra cancelar"
   - "Tab to amend" → "Tab pra emendar"

### ❌ NÃO INICIADO

6. **Descrições de Comandos** - `/help` e typeahead do `/`
   - Traduções existem em `src/i18n/pt-BR.ts` → `commands`
   - Precisa aplicar em `src/commands.ts` ou arquivos individuais de comando
   - Arquivos principais:
     - `src/components/HelpV2/HelpV2.tsx` - Interface do `/help`
     - Comandos individuais em `src/commands/*/index.ts`

7. **Interface do /help**
   - Título "Claude Code v99.0.0" → "Claudinho v99.0.0"
   - Tabs: "general", "commands", "custom-commands"
   - Link: "For more help: https://..."
   - Footer: "esc to cancel"

8. **Mensagens de Erro**
   - Traduções existem em `src/i18n/pt-BR.ts` → `errors`
   - Precisa aplicar nos arquivos de erro handling

## Problema: Arquivos Compilados

Muitos arquivos estão compilados pelo React Compiler, o que dificulta a edição direta:
- `src/components/design-system/KeyboardShortcutHint.tsx` - compilado
- `src/components/permissions/PermissionPrompt.tsx` - compilado
- `src/components/HelpV2/HelpV2.tsx` - compilado
- Vários outros componentes

**Soluções possíveis:**
1. Criar wrappers traduzidos (já feito para alguns)
2. Descompilar e recompilar após edições
3. Modificar o build process para aplicar traduções
4. Editar arquivos fonte antes da compilação (se existirem)

## Próximos Passos

1. Verificar se existem arquivos fonte não compilados
2. Se não existirem, criar sistema de build que aplica traduções
3. Ou usar os wrappers criados e substituir imports nos arquivos que os usam
4. Traduzir interface do `/help`
5. Aplicar traduções de comandos
6. Testar tudo com `bun run build` e `claudinho`

## Arquivos Criados

- `src/i18n/pt-BR.ts` - Sistema central de traduções
- `src/components/design-system/TranslatedKeyboardShortcutHint.tsx` - Wrapper traduzido
- `src/components/permissions/TranslatedPermissionPrompt.tsx` - Wrapper traduzido
- `src/components/permissions/FilePermissionDialog/translatedPermissionOptions.tsx` - Opções traduzidas
- `TRANSLATION_GUIDE.md` - Este guia
