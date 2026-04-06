# Changelog - Claudinho

## [v0.1.11] - 2026-04-06
### Provider UX + Startup CLI (`/provider` e `--provider`)

Melhorias grandes no fluxo de troca de provedor para reduzir friccao na pratica, especialmente em PowerShell e em alternancia entre OpenRouter, Codex, OpenAI, Gemini e Ollama.

#### Novidades principais

- Novo comando de diagnostico:
  - `/provider doctor`
  - `/provider doctor openrouter|openai|ollama|gemini|codex`
- Novo atalho de startup por CLI:
  - `claudinho --provider openrouter|codex|openai|gemini|ollama`
- Atalho rapido de provider dentro do app:
  - `/provider openrouter`, `/provider codex`, `/provider openai`, `/provider gemini`, `/provider ollama`, `/provider auto`, `/provider clear`

#### Melhorias de comportamento

- Reuso de credenciais salvas no proprio fluxo `/provider`:
  - reaproveita credenciais de `env`, perfil salvo e `auth.json` (Codex) quando disponivel.
- `OpenRouter` agora tem fluxo direto e intuitivo:
  - endpoint fixo `https://openrouter.ai/api/v1`
  - modelo inicial padrao `qwen/qwen3.6-plus:free`
- Correcao de exibicao do caminho do perfil salvo no Windows:
  - agora mostra corretamente `...\\Claudinho\\.openclaude-profile.json` na mensagem de sucesso.
- Correcao de UX do comando `/provider`:
  - comando deixou de rodar como `immediate`, evitando retorno `(no content)` em alguns contextos.

#### Persistencia de chaves entre trocas (fix critico)

- Ao trocar entre provedores, as chaves dos outros provedores nao sao mais perdidas.
- O salvamento do perfil agora faz merge de credenciais ja conhecidas:
  - mantem `OPENAI_API_KEY`, `GEMINI_API_KEY`, `CODEX_API_KEY` e `CHATGPT_ACCOUNT_ID` quando nao forem substituidas por valores novos.
- Resultado: usuario configura uma vez cada provedor e consegue alternar sem redigitar API key toda hora.

#### Validacao e testes

- Testes adicionados para:
  - parse e validacao de `--provider`
  - startup env com override de provider
  - doctor output
  - reuso de config salva
  - preservacao de credenciais entre trocas
- Build e testes de provider executados com sucesso.

### ðŸŒ TraduÃ§Ã£o Completa para PortuguÃªs Brasileiro

Esta versÃ£o marca a conclusÃ£o da traduÃ§Ã£o massiva do Claudinho para portuguÃªs brasileiro, tornando a experiÃªncia completamente localizada para usuÃ¡rios brasileiros.

#### âœ¨ Novidades

- **TraduÃ§Ã£o de 406+ strings** em toda a aplicaÃ§Ã£o (Fases 1-15)
- **322+ arquivos modificados** com traduÃ§Ãµes
- **Cobertura de ~96%** da interface traduzida
- **TÃ­tulos automÃ¡ticos em portuguÃªs** - O modelo Haiku agora gera tÃ­tulos de sessÃ£o em portuguÃªs

#### ðŸ“ Ãreas Traduzidas (Atualizado - Fase 14)

##### Interface do UsuÃ¡rio (UI)
- Tela de inicializaÃ§Ã£o e boas-vindas
- Mensagens de status e spinner de carregamento
- DiÃ¡logos de permissÃ£o e confirmaÃ§Ã£o (incluindo PowerShell, Bash, Web)
- Sistema de ajuda e dicas
- Mensagens de erro e avisos
- Comandos e suas descriÃ§Ãµes
- OpÃ§Ãµes de configuraÃ§Ã£o
- HistÃ³rico de sessÃµes
- **NOVO (Fase 11)**: OpÃ§Ãµes de permissÃ£o PowerShell traduzidas
- **NOVO (Fase 11)**: DescriÃ§Ãµes de ferramentas Web traduzidas
- **NOVO (Fase 11)**: TÃ­tulos de diÃ¡logos Bash traduzidos
- **NOVO (Fase 12)**: Mensagens de status de agentes traduzidas
- **NOVO (Fase 12)**: EstatÃ­sticas de diff traduzidas
- **NOVO (Fase 13)**: Mensagens de seguranÃ§a e progresso traduzidas
- **NOVO (Fase 14)**: Mensagens de interrupÃ§Ã£o e navegaÃ§Ã£o traduzidas (Esc, Enter, Tab)
- **NOVO (Fase 15)**: OpÃ§Ãµes de permissÃ£o Yes/No completamente traduzidas

##### Comandos Traduzidos
- `/ajuda` - Sistema de ajuda completo
- `/renomear` - Renomear sessÃµes
- `/tag` - Sistema de tags
- `/limpar` - Limpar conversa
- `/provider` - Gerenciar provedores
- E todos os outros comandos principais

##### Mensagens do Sistema
- NotificaÃ§Ãµes de progresso
- Mensagens de conclusÃ£o de tarefas
- Avisos de seguranÃ§a
- Mensagens de interrupÃ§Ã£o
- Status de ferramentas e operaÃ§Ãµes

##### Prompts de Sistema (Novo!)
- GeraÃ§Ã£o automÃ¡tica de tÃ­tulos de sessÃ£o em portuguÃªs
- GeraÃ§Ã£o de nomes kebab-case para comando `/rename`
- GeraÃ§Ã£o de tÃ­tulos e branches para sessÃµes remotas
- Exemplos e instruÃ§Ãµes para o modelo em portuguÃªs

#### ðŸ› ï¸ Ferramentas de TraduÃ§Ã£o

Criados scripts automatizados para facilitar futuras traduÃ§Ãµes:

- **`scripts/gerar-traducoes.ts`** - Extrai strings e gera traduÃ§Ãµes automÃ¡ticas
- **`scripts/aplicar-traducoes.ts`** - Aplica traduÃ§Ãµes nos arquivos (suporta filtros)
- **`scripts/traduzir.sh`** - Script auxiliar bash
- **`scripts/README-TRADUCOES.md`** - DocumentaÃ§Ã£o completa do processo

#### ðŸ“Š EstatÃ­sticas

- **Fase 1 (Prioridade MÃ¡xima):** 7 strings
- **Fase 2 (Prioridade Alta):** 105 strings
- **Fase 3 (Prioridade MÃ©dia):** 112 strings
- **Fase 4 (Sweep Final):** 51 strings
- **Fase 5 (Prompts de Sistema):** 3 prompts + exemplos
- **Fase 6 (CorreÃ§Ãµes Mistas):** 12 strings
- **Fase 7 (PermissÃµes Web):** 4 strings
- **Fase 8 (DiÃ¡logos e InstruÃ§Ãµes):** 21 strings
- **Fase 9 (Status e AÃ§Ãµes):** 13 strings
- **Fase 10 (TraduÃ§Ãµes Manuais):** 7 strings
- **Fase 11 (PermissÃµes e Ferramentas Web):** 13 strings
- **Fase 12 (Mensagens de Status e Diff):** 15 strings
- **Fase 13 (SeguranÃ§a e Progresso):** 20+ strings
- **Fase 14 (InterrupÃ§Ã£o e NavegaÃ§Ã£o):** 21 strings
- **Fase 15 (OpÃ§Ãµes Yes/No):** 16 strings
- **Total:** 406+ strings traduzidas

#### ðŸŽ¯ Melhorias de ExperiÃªncia

- Tom informal e amigÃ¡vel nas traduÃ§Ãµes ("pra" ao invÃ©s de "para")
- Termos tÃ©cnicos mantidos em inglÃªs quando apropriado (API, URL, JSON, Git)
- Mensagens de erro mais claras e em portuguÃªs
- TÃ­tulos de janela gerados automaticamente em portuguÃªs
- Interface completamente localizada
- DiÃ¡logos de confirmaÃ§Ã£o 100% em portuguÃªs (Sim/NÃ£o ao invÃ©s de Yes/No)
- CorreÃ§Ã£o de strings mistas que misturavam portuguÃªs e inglÃªs

#### ðŸ“š DocumentaÃ§Ã£o

- **`INVENTARIO_STRINGS_TRADUCAO.md`** - InventÃ¡rio completo de 1250+ strings categorizadas
- **`LISTA_COMPLETA_TRADUCOES.md`** - Lista detalhada de todas as traduÃ§Ãµes realizadas
- **`TRADUCOES_REALIZADAS.md`** - HistÃ³rico detalhado do processo

#### ðŸ”§ TÃ©cnico

- 15 compilaÃ§Ãµes bem-sucedidas durante o processo
- Nenhuma quebra de funcionalidade
- Compatibilidade mantida com versÃµes anteriores
- Logs de debug mantidos em inglÃªs (para desenvolvedores)
- CorreÃ§Ã£o de bug: variÃ¡veis const sendo reatribuÃ­das em `commit-push-pr.ts`
- CorreÃ§Ã£o de strings mistas portuguÃªs/inglÃªs em componentes React
- Mensagens de interrupÃ§Ã£o (Esc, Ctrl+C) completamente traduzidas
- DiÃ¡logos de navegaÃ§Ã£o e cancelamento 100% em portuguÃªs

#### ðŸš€ PrÃ³ximos Passos

- TraduÃ§Ã£o dos 5% restantes (logs tÃ©cnicos e comentÃ¡rios de cÃ³digo)
- PossÃ­vel traduÃ§Ã£o de documentaÃ§Ã£o externa
- Melhorias contÃ­nuas baseadas em feedback

---

### ðŸŽ¨ UI â€” Token Status, Budget, Thinking Indicator e Custom Model Costs

Melhorias visuais na barra inferior com tracking de tokens, custo, indicador animado e configuraÃ§Ã£o manual de custos de modelo.

#### âœ¨ Novidades

- **TokenStatusBar** â€” Barra de uso de tokens com detecÃ§Ã£o automÃ¡tica de provider e contexto dinÃ¢mico
  - Detecta provider via `OPENAI_BASE_URL` (OpenRouter, Anthropic, Gemini, Ollama, OpenAI, Groq, Together, DeepInfra, Fireworks)
  - Usa `finalContextTokensFromLastResponse` + `roughTokenCountEstimationForMessages` para contagem em tempo real
  - Mostra sigla do provider e janela de contexto do modelo
  - Barra animada com easing suave

- **ThinkingBadge** â€” Indicador animado de modelo gerando resposta
  - Spinner Braille (â ‹â ™â ¹â ¸â ¼â ´â ¦â §â ‡â ) a cada 80ms
  - Timer elapsed + frases engraÃ§adas rotativas ("Claudiando...", "Cerebrando...", "Fritando neurÃ´nio...")
  - Fade-out 5s com âœ“ e tempo final apÃ³s resposta

- **BudgetStatusBar** â€” Progresso de custo vs orÃ§amento
  - LÃª `getTotalCostUSD()` do estado global (polling 500ms)
  - Formato: `$â–°â–°â–°â–°â–±â–±â–±â–±â–±â–± $0.12/$2.00`
  - Cores: verde <50%, amarelo 50-70%, laranja 70-85%, vermelho >85%
  - Mostra `âš ` quando excede budget (padrÃ£o: $2.00)

- **UnknownModelWarning** â€” Aviso quando modelo nÃ£o foi identificado
  - `âš  Modelo desconhecido â€” custo estimado. Configure com /cost-model`

- **`/cost-model`** â€” Comando pra configurar custos customizados
  - `/cost-model modelo 2 10` â†’ $2 input / $10 output por Mtok
  - `/cost-model list` e `/cost-model remove <modelo>`
  - Deriva cache write (1.25x) e cache read (10%) automaticamente
  - Remove o aviso de modelo desconhecido ao configurar

#### ðŸ“Š Custos de Modelos

Expandido `modelCost.ts` para mÃºltiplos provedores: OpenAI (GPT-4o, GPT-4o-mini, GPT-4, o1, o3-mini), Gemini (2.0 Flash, 2.5 Pro, 2.5 Flash), Qwen, DeepSeek, e modelos `:free`/`/free` â†’ custo zero.

#### ðŸ”§ TÃ©cnico

- `detectProviderFromBaseUrl()` â€” pattern matching no base URL
- `MODEL_COSTS` + fallback por prefixo (`getModelCostByName`)
- User-defined costs: `registerCustomModelCost`, `removeUserModelCost`, `listUserModelCosts`
- Arquivos novos: `src/commands/cost-model/`, `src/components/BudgetStatusBar.tsx`, `src/components/UnknownModelWarning.tsx`

---

### ðŸ¦Ž Modo CamaleÃ£o â€” Camuflagem de Origem IA em Commits

InspiraÃ§Ã£o no Undercover Mode do Claude Code interno, adaptado e recriado para o build externo do Claudinho. Protege commits em repositÃ³rios pÃºblicos removendo qualquer menÃ§Ã£o de origem automÃ¡tica de IA.

#### âœ¨ Novidades

- **DetecÃ§Ã£o automÃ¡tica de repo pÃºblico** â€” compara o remote contra uma allowlist de repos privados. Se Ã© pÃºblico/opensource, ativa o CamaleÃ£o sozinho
- **InstruÃ§Ãµes injetadas nos comandos `/commit` e `/commit-push-pr`** â€” o modelo recebe instruÃ§Ãµes de camuflagem automaticamente
- **RemoÃ§Ã£o de atribuaÃ§Ã£o automÃ¡tica** â€” Co-Authored-By e crÃ©ditos de IA somem dos commits
- **ConfigurÃ¡vel via env var e config global** â€” `CLAUDINHO_CAMALEAO=1` pra forÃ§ar ON, `CLAUDINHO_CAMALEAO=0` pra forÃ§ar OFF, ou via `camaleaoMode` no config global

#### ðŸ”§ TÃ©cnico

- **`src/utils/camaleao.ts`** â€” Novo arquivo com detecÃ§Ã£o de repo, cache e instruÃ§Ãµes
- **`src/commands/commit.ts`** â€” InjeÃ§Ã£o de instruÃ§Ãµes camaleÃ£o quando ativo
- **`src/commands/commit-push-pr.ts`** â€” Mesma lÃ³gica para PRs + versÃ£o sync do `getPromptContent`
- **`src/tools/BashTool/prompt.ts`** â€” InstruÃ§Ãµes camaleÃ£o na seÃ§Ã£o de operaÃ§Ãµes Git
- **`src/utils/config.ts`** â€” Campo `camaleaoMode?: boolean` adicionado no tipo `GlobalConfig`

#### ðŸ“‹ O que o modelo recebe quando ativo:
- Escreve mensagens de commit como dev humano
- Nunca menciona IA, modelos, ou ferramentas de automaÃ§Ã£o
- Remove Co-Authored-By e atribuiÃ§Ã£o automÃ¡tica
- Follows conventional commits (fix, feat, docs, etc.)
- Foca no "por que" ao invÃ©s do "como"

---

### ðŸ§  InjeÃ§Ã£o Proativa de Skills no System Prompt

Sistema de anÃ¡lise e invocaÃ§Ã£o automÃ¡tica de skills relevantes antes de executar qualquer tarefa. Sem perguntar, sem anunciar â€” o modelo detecta o domÃ­nio e aciona a skill especializada por trÃ¡s.

#### âœ¨ Novidades

- **AnÃ¡lise automÃ¡tica de domÃ­nio** â€” antes de cada tarefa, o modelo escaneia as skills disponÃ­veis e seleciona a mais relevante
- **InvocaÃ§Ã£o silenciosa** â€” skill Ã© chamada via `Skill` tool sem diÃ¡logo, sem menu, sem `/skill-name`
- **23+ skills mapeadas** â€” UI â†’ `frontend-design`, debug â†’ `systematic-debugging`, testes â†’ `testing-patterns`, React â†’ `nextjs-react-expert`, performance â†’ `performance-profiling`, etc.
- **Regra #8 nas Regras de Ouro** â€” reforÃ§a que skills devem ser analisadas antes de qualquer trabalho

#### ðŸ”§ TÃ©cnico

- **`src/constants/personality.ts`** â€” nova seÃ§Ã£o "AnÃ¡lise Proativa de Skills" injetada em `getPersonalitySection()`, chamada em toda sessÃ£o
- **`~/.claude/CLAUDE.md`** â€” CLAUDE.md global com instruÃ§Ãµes equivalentes pra carregar em qualquer projeto, nÃ£o sÃ³ Claudinho
- **MEMORY.md index** â€” entrada `skill_injection_system.md` adicionada no index de memÃ³ria do projeto

---
### VersÃ£o anterior

- Funcionalidades base do Claudinho
- Interface em inglÃªs
- Sistema de comandos
- IntegraÃ§Ã£o com Claude API
- Suporte a mÃºltiplos provedores

---

**Nota:** Este changelog documenta as mudanÃ§as de traduÃ§Ã£o. Para mudanÃ§as tÃ©cnicas e de funcionalidade, consulte os commits do Git.

