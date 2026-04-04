# 🌐 Traduções Realizadas - Claudinho PT-BR

> Documentação completa de todas as traduções implementadas para português brasileiro

---

## 📊 Resumo Executivo

| Métrica | Valor |
|---------|-------|
| **Arquivos Modificados** | 8 |
| **Strings Traduzidas** | 7 |
| **Categorias** | 3 (Segurança, UI, Reconhecimento) |
| **Status da Build** | ✅ Sucesso |

---

## 🔒 Mensagens de Segurança

### 1. Comandos Compostos com Git

**Contexto:** Mensagens de aviso quando comandos perigosos com `cd` e `git` são detectados

**Arquivos Modificados:**
- `src/tools/BashTool/bashPermissions.ts`
- `src/tools/BashTool/bashCommandHelpers.ts`
- `src/tools/PowerShellTool/powershellPermissions.ts`

**Tradução:**
```diff
- "Compound commands with cd and git require approval to prevent bare repository attacks"
+ "Comandos compostos com cd e git requerem aprovação pra prevenir ataques de repositório bare"
```

**Impacto:** Usuários agora veem avisos de segurança em português quando tentam executar comandos potencialmente perigosos envolvendo mudança de diretório e git.

---

### 2. Variáveis em Contextos Perigosos

**Contexto:** Alerta quando variáveis são usadas em redirecionamentos ou pipes

**Arquivo Modificado:**
- `src/tools/BashTool/bashSecurity.ts`

**Tradução:**
```diff
- "Command contains variables in dangerous contexts (redirections or pipes)"
+ "Comando contém variáveis em contextos perigosos (redirecionamentos ou pipes)"
```

**Exemplo de Uso:**
```bash
# Comando que dispara este aviso:
cat $FILE > output.txt
```

---

### 3. Flags Perigosas do JQ

**Contexto:** Aviso sobre flags do comando `jq` que podem executar código arbitrário

**Arquivos Modificados:**
- `src/tools/BashTool/bashSecurity.ts`
- `src/utils/bash/ast.ts`

**Tradução:**
```diff
- "jq command contains dangerous flags that could execute code or read arbitrary files"
+ "Comando jq contém flags perigosas que podem executar código ou ler arquivos arbitrários"
```

**Flags Detectadas:** `-f`, `--from-file`, `--rawfile`, `--slurpfile`, `-L`, `--library-path`

---

## 🎨 Mensagens de Interface

### 4. Contador de Usos de Ferramentas (AgentTool)

**Contexto:** Mensagem que mostra quantos usos de ferramentas estão ocultos

**Arquivo Modificado:**
- `src/tools/AgentTool/UI.tsx`

**Tradução:**
```diff
- +{hiddenToolUseCount} more tool use/uses
+ +{hiddenToolUseCount} uso/usos de ferramenta/ferramentas
```

**Implementação:**
```tsx
{hiddenToolUseCount > 0 && (
  <Text dimColor>
    +{hiddenToolUseCount} {hiddenToolUseCount === 1 ? 'uso' : 'usos'} de{' '}
    {hiddenToolUseCount === 1 ? 'ferramenta' : 'ferramentas'} <CtrlOToExpand />
  </Text>
)}
```

**Exemplos:**
- `+1 uso de ferramenta`
- `+5 usos de ferramentas`

---

### 5. Contador de Usos de Ferramentas (SkillTool)

**Contexto:** Similar ao AgentTool, mas para skills

**Arquivo Modificado:**
- `src/tools/SkillTool/UI.tsx`

**Tradução:**
```diff
- +{hiddenCount} more tool use
+ +{hiddenCount} uso/usos de ferramenta
```

**Implementação:**
```tsx
{hiddenCount > 0 && (
  <Text dimColor>
    +{hiddenCount} {hiddenCount === 1 ? 'uso' : 'usos'} de {plural(hiddenCount, 'ferramenta')}
  </Text>
)}
```

---

### 6. Atalho de Teclado - Background

**Contexto:** Tradução já existente no sistema de i18n

**Arquivo Verificado:**
- `src/i18n/pt-BR.ts`

**Tradução Existente:**
```typescript
'run in background': 'rodar em background'
```

**Uso:** O componente `KeyboardShortcutHint` automaticamente usa essa tradução quando exibe `ctrl+b`

**Nota:** ✅ Não foi necessário modificar - já estava implementado corretamente!

---

## 🔍 Reconhecimento de Padrões

### 7. Prompt Interativo - Sobrescrever

**Contexto:** Detecção de prompts interativos em comandos shell

**Arquivo Modificado:**
- `src/tasks/LocalShellTask/LocalShellTask.tsx`

**Modificação:**
```diff
const PROMPT_PATTERNS = [
  /\(y\/n\)/i,
  /\[y\/n\]/i,
  /\(yes\/no\)/i,
  /\b(?:Do you|Would you|Shall I|Are you sure|Ready to)\b.*\? *$/i,
  /Press (any key|Enter)/i,
  /Continue\?/i,
  /Overwrite\?/i,
+ /Sobrescrever\?/i
];
```

**Impacto:** O sistema agora reconhece tanto "Overwrite?" quanto "Sobrescrever?" como prompts que requerem interação do usuário.

**Exemplo de Uso:**
```bash
# Comandos que podem gerar este prompt:
cp arquivo.txt destino.txt
# Output: "Sobrescrever destino.txt? (s/n)"
```

---

## 📁 Arquivos Modificados

### Lista Completa

1. ✅ `src/tools/BashTool/bashPermissions.ts` - Segurança Bash
2. ✅ `src/tools/BashTool/bashCommandHelpers.ts` - Helpers Bash
3. ✅ `src/tools/PowerShellTool/powershellPermissions.ts` - Segurança PowerShell
4. ✅ `src/tools/BashTool/bashSecurity.ts` - Validações de segurança
5. ✅ `src/utils/bash/ast.ts` - Parser AST
6. ✅ `src/tools/AgentTool/UI.tsx` - Interface do AgentTool
7. ✅ `src/tools/SkillTool/UI.tsx` - Interface do SkillTool
8. ✅ `src/tasks/LocalShellTask/LocalShellTask.tsx` - Detecção de prompts

---

## 🧪 Validação

### Compilação
```bash
$ bun run build
  🔇 no-telemetry: stubbed 14 modules
✓ Built openclaude v0.1.7 → dist/cli.mjs

Exit Code: 0
```

**Status:** ✅ Todas as traduções compilam sem erros

---

## 📝 Notas Técnicas

### Padrões de Tradução Utilizados

1. **Tom Informal:** Uso de "pra" ao invés de "para" para manter consistência com o resto da interface
2. **Pluralização Dinâmica:** Implementação de lógica condicional para singular/plural correto
3. **Contexto Preservado:** Termos técnicos mantidos quando necessário (ex: "pipes", "background")
4. **Segurança:** Mensagens de segurança mantêm clareza sobre os riscos

### Decisões de Design

- **"Background"** mantido em inglês por ser termo técnico amplamente usado
- **"Ferramenta"** escolhido ao invés de "tool" para melhor compreensão
- **"Sobrescrever"** ao invés de "substituir" por ser mais preciso tecnicamente

---

## 🎯 Próximos Passos Sugeridos

- [ ] Validar traduções com usuários reais
- [ ] Adicionar testes automatizados para strings traduzidas
- [ ] Documentar processo de tradução para futuras contribuições
- [ ] Criar glossário de termos técnicos PT-BR

---

**Data:** 03/04/2026  
**Versão:** openclaude v0.1.7  
**Autor:** Claudinho (AI Assistant)  
**Status:** ✅ Concluído e Validado
