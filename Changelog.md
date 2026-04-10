# Changelog - Claudinho

## [Unreleased]

### Fase 42: Substituição Massiva de "Claude" por "Claudinho" em Mensagens (08/04/2026)
- Substituídas todas as referências a "Claude" por "Claudinho" em mensagens de erro, atribuição e dicas
- Traduzidas mensagens de status de tarefas em background e ações de UI
- **Símbolos de modos de permissão atualizados:**
  - ▲ (triângulo) para "Modo Planejamento" (antes: ⏸)
  - ✓ (check) para "Aceitar edições" (antes: ⏵⏵)
  - ☠ (caveira) para "Pular Permissões" (antes: ⏵⏵)
  - Removido texto " on" quando modo está ativo - agora mostra apenas o símbolo
- Arquivos traduzidos:
  - `src/utils/teleport/api.ts` - Mensagens de erro de autenticação web
  - `src/utils/teleport.tsx` - Mensagens de erro de sessão não encontrada e autenticação
  - `src/utils/teleport/environments.ts` - Mensagens de erro de autenticação
  - `src/utils/attribution.ts` - Comentários sobre atribuição de código gerado
  - `src/utils/undercover.ts` - Exemplos de mensagens ruins no modo camuflagem
  - `src/i18n/pt-BR.ts` - Dicas e mensagens de ajuda (6 strings)
  - `src/commands/plugin/index.tsx` - Descrição do comando plugin
  - `src/main.tsx` - Descrição do comando plugin
  - `src/hooks/notifs/useCanSwitchToExistingSubscription.tsx` - Notificação de plano existente
  - `src/components/PromptInput/PromptInputFooterLeftSide.tsx` - Mensagens de interrupção e ações de tasks
  - `src/components/messages/SystemTextMessage.tsx` - Mensagem de tarefas em background
  - `src/tasks/pillLabel.ts` - Labels de tarefas locais
  - `src/utils/permissions/PermissionMode.ts` - Símbolos de modos de permissão
  - `src/components/PromptInput/PromptInputFooterLeftSide.tsx` - Remoção do texto " on"
- Strings traduzidas:
  - "Claude Code web sessions require authentication..." → "Sessões web do Claudinho requerem autenticação..."
  - "Run /status in Claude Code to check your account" → "Execute /status no Claudinho pra verificar sua conta"
  - "Generated with Claude Code" → "Gerado com o Claudinho"
  - "Use git worktrees pra rodar múltiplas sessões do Claude" → "...do Claudinho"
  - "Rodando várias sessões do Claude?" → "...do Claudinho?"
  - "enquanto o Claude tá trabalhando" → "...o Claudinho tá trabalhando"
  - "Mande mensagens pro Claude" → "...pro Claudinho"
  - "Peça pro Claude criar" → "...pro Claudinho criar"
  - "memória do Claude" → "...do Claudinho"
  - "Gerenciar plugins do Claude Code" → "...do Claudinho"
  - "/login to activate" → "/login pra ativar"
  - "interrupt" → "interromper"
  - "still running" → "ainda rodando"
  - "1 local agent" / "N local agents" → "1 agent local" / "N agents locais"
  - "hide tasks" / "show tasks" → "esconder tasks" / "mostrar tasks"
  - "show teammates" → "mostrar teammates"
  - "hide" → "esconder"
- Total: 12 arquivos com 21+ strings traduzidas
- Compilado com sucesso ✓

### Fase 41: Substituição de "Claude" por "Claudinho" em Permissões (07/04/2026)
- Substituídas todas as referências a "Claude" por "Claudinho" em mensagens de permissão
- Arquivos traduzidos:
  - `src/tools/WebFetchTool/WebFetchTool.ts` - "Claude quer buscar conteúdo" → "Claudinho quer buscar conteúdo"
  - `src/tools/WebSearchTool/WebSearchTool.ts` - "Claude quer buscar na web" → "Claudinho quer buscar na web"
  - `src/components/permissions/EnterPlanModePermissionRequest/EnterPlanModePermissionRequest.tsx` - "Claude wants to enter plan mode" → "Claudinho quer entrar no modo plan"
  - `src/components/permissions/ExitPlanModePermissionRequest/ExitPlanModePermissionRequest.tsx` - "Claude wants to exit plan mode" → "Claudinho quer sair do modo plan"
- Total: 4 arquivos com mensagens de permissão traduzidas
- Compilado com sucesso ✓

### Fase 40: Tradução de Status de Agents (07/04/2026)
- Traduzidas mensagens de status de agents
- Arquivo: `src/tools/AgentTool/UI.tsx`
- Strings traduzidas:
  - "agents finished" → "agents finalizados"
  - "Running" → "Executando"
- Compilado com sucesso ✓

### Fase 39: Substituição de "Claude" por "Claudinho" em Mensagens (07/04/2026)
- Substituídas todas as referências a "Claude" por "Claudinho" em mensagens visíveis ao usuário
- Arquivos traduzidos:
  - `src/utils/computerUse/cleanup.ts` - "Claude is done using your computer" → "Claudinho terminou de usar seu computador"
  - `src/screens/REPL.tsx` - "Claude is waiting for your input" → "Claudinho está esperando sua resposta"
  - `src/tools/EnterPlanModeTool/UI.tsx` - "Claude is now exploring..." → "Claudinho está explorando..."
  - `src/components/Onboarding.tsx` - "Claude can make mistakes" → "Claudinho pode cometer erros"
  - `src/components/ClaudeInChromeOnboarding.tsx` - "which sites Claude can browse" → "quais sites o Claudinho pode navegar"
  - `src/components/permissions/EnterPlanModePermissionRequest/EnterPlanModePermissionRequest.tsx` - "In plan mode, Claude will:" → "No modo plan, Claudinho vai:"
  - `src/components/IdeOnboardingDialog.tsx` - "Claude has context of" → "Claudinho tem contexto de"
  - `src/components/agents/AgentsList.tsx` - "that Claude can delegate to" → "pros quais o Claudinho pode delegar"
- Total: 8 arquivos com mensagens traduzidas
- Compilado com sucesso ✓

### Fase 38: Traduções de Interface de Perguntas e Navegação (07/04/2026)
- Traduzidas strings de navegação e interação com perguntas
- Arquivos:
  - `src/components/agents/AgentNavigationFooter.tsx`
  - `src/components/permissions/AskUserQuestionPermissionRequest/PreviewQuestionView.tsx`
  - `src/tools/AskUserQuestionTool/AskUserQuestionTool.tsx`
- Strings traduzidas:
  - "Press ↑↓ to navigate · Enter to select · Esc to go back" → "Pressione ↑↓ pra navegar · Enter pra selecionar · Esc pra voltar"
  - "Press ${keyName} again to exit" → "Pressione ${keyName} novamente pra sair"
  - "press n to add notes" → "pressione n pra adicionar notes"
  - "User answered Claude's questions:" → "Usuário respondeu as perguntas do Claudinho:"
- Compilado com sucesso ✓

### Fase 37: Ajustes de Permissões de Skills (07/04/2026)
- Traduzido "Tab to amend" → "Tab pra complementar"
- Trocado "Claude pode usar" → "Claudinho pode usar" nas mensagens de skill
- Arquivos:
  - `src/components/permissions/PermissionPrompt.tsx`
  - `src/components/permissions/SkillPermissionRequest/SkillPermissionRequest.tsx`
- Compilado com sucesso ✓

### Fase 36: Correção de "Esc para interromper" (07/04/2026)
- Corrigida capitalização da mensagem de interrupção
- Arquivo: `src/i18n/pt-BR.ts`
- String corrigida: "esc pra interromper" → "Esc para interromper"
- Compilado com sucesso ✓

### Fase 35: Mensagens de Erro de Modelo (07/04/2026)
- Traduzidas mensagens de erro quando o modelo selecionado não está disponível
- Arquivo: `src/services/api/errors.ts`
- Strings traduzidas:
  - "There's an issue with the selected model (${model}). It may not exist or you may not have access to it. Run ${switchCmd} to pick a different model." → "Tem um problema com o modelo selecionado (${model}). Ele pode não existir ou você pode não ter acesso a ele. Execute ${switchCmd} pra escolher um modelo diferente."
  - "The model ${model} is not available on your ${getAPIProvider()} deployment. Try ${switchCmd} to switch to ${fallbackSuggestion}, or ask your admin to enable this model." → "O modelo ${model} não está disponível no seu deployment ${getAPIProvider()}. Tente ${switchCmd} pra mudar pra ${fallbackSuggestion}, ou peça pro seu admin habilitar este modelo."
- Compilado com sucesso ✓

### Fase 34: Tradução em Massa de Skills (07/04/2026)
- Traduzidas automaticamente 446 skills em massa usando script PowerShell
- Script criado: `scripts/traduzir-skills.ps1`
- Tradução automática de termos comuns:
  - "Expert in" → "Expert em"
  - "Use for" → "Use pra"
  - "Triggers on" → "Ativa com:"
  - "best practices" → "melhores práticas"
  - "automation" → "automação"
  - "testing" → "testes"
  - E mais 20+ substituições automáticas
- Total processado: 763 skills
- Traduzidas: 446 skills
- Já traduzidas/puladas: 315 skills
- Erros: 2 (arquivos em uso)
- **IMPORTANTE**: Traduções aplicadas diretamente nos arquivos SKILL.md
- Não requer recompilação (são arquivos de configuração externos)

### Fase 33: Tradução de Descrições de Skills e Agents (07/04/2026)
- Traduzidas descrições (campo `description:`) de 20 agents e 8 skills
- Apenas o campo de descrição foi traduzido (o que aparece pro usuário)
- Conteúdo interno (instruções) permanece em inglês pra melhor performance da IA
- **Agents traduzidos (20)**:
  - backend-specialist, frontend-specialist, debugger, security-auditor
  - devops-engineer, performance-optimizer, database-architect, test-engineer
  - code-archaeologist, documentation-writer, mobile-developer, game-developer
  - seo-specialist, product-manager, explorer-agent, orchestrator
  - penetration-tester, product-owner, project-planner, qa-automation-engineer
- **Skills traduzidas (8)**:
  - clean-code, lint-and-validate, api-patterns, database-design
  - frontend-design, mcp-builder, mobile-design, i18n-localization
- Arquivos: `C:\Users\Bruno\.claude\agents\*.md` e `C:\Users\Bruno\.claude\skills\**\SKILL.md`
- **IMPORTANTE**: Traduções aplicadas diretamente nos arquivos de configuração dos agents/skills
- Não requer recompilação do Claudinho (são arquivos de configuração externos)

---

## [v0.1.13] - 2026-04-07
### Ajustes recentes de UX, provider e traducao

#### Provider e startup
- Corrigido `--provider openrouter` quando existe perfil salvo de outro provider (ex.: `codex`)
- OpenRouter agora aceita fallback de `OPENROUTER_API_KEY` para `OPENAI_API_KEY` no startup/validacao
- Mensagem de warning no bootstrap ficou mais precisa, indicando se o erro veio de `--provider` ou do perfil salvo

#### Barra inferior e sessao
- Ajustada persistencia de tempo ativo/ocioso entre remounts da UI, evitando reset inesperado
- Melhorada exibicao da barra com separadores mais claros
- Frases de pensamento/analise atualizadas para estilo mais informal
- Removidos enfeites extras da HUD e mantida leitura mais limpa

#### Compactacao e historico visivel
- Corrigido comportamento visual do `/compact`: ao receber `compact_boundary`, a transcricao exibida passa a mostrar o segmento pos-compactacao
- Mensagens de compactacao padronizadas em PT-BR (`Compactando conversa`, `Conversa compactada`, etc.)

#### Tema customizado
- Adicionados temas `nerd`, `nerd-v2` e `nerd-v3`
- Theme Picker atualizado com as novas opcoes

#### Plugins, mensagens e ferramentas (PT-BR)
- Traducoes e ajustes de UX nos comandos de plugin (`/plugin`, marketplace, notificacoes, reload)
- Traducoes em mensagens de memoria/recall e resumos colapsados
- Traducoes em mensagens de hooks e status
- Traducoes em Bash/WebFetch (`rodar em segundo plano`, `Buscando...`, etc.)
- Textos de validacao de caminho no Bash ficaram mais claros para pedido de aprovacao manual

#### Plan mode e ultraplan local
- `/plan` agora usa o fluxo nativo de plan mode do projeto e mostra o plano atual da sessao quando existir
- Adicionado `/plan deep <prompt>` para disparar um planejamento local mais profundo, com foco em arquitetura, seguranca, performance, testes e manutenibilidade
- Adicionado `/plan list` para listar os arquivos de plano salvos
- Adicionado `/plan open` para abrir o plano atual no editor
- Adicionado `/plan open <slug>` para abrir um plano especifico por nome de arquivo/slug
- Adicionado `/plan off` (tambem aceita `disable` e `exit`) para sair explicitamente do plan mode
- Mensagens do comando foram ajustadas para deixar mais claro quando o plan mode foi ligado, desligado ou quando ainda nao existe plano salvo na sessao

---

## [v0.1.12] - 2026-04-07
### Fase 25: Verificação e Recompilação de Traduções

#### Correção Aplicada
- Recompilação e reinstalação do projeto para aplicar traduções já existentes
- String "esc to interrupt" → "esc pra interromper" (já estava traduzida no código)

#### Arquivos Verificados
- `src/components/Spinner/SpinnerAnimationRow.tsx` (tradução confirmada)
- `src/remote/sdkMessageAdapter.ts` (tradução confirmada)

#### Instruções para Usuários
- Após atualizar o código, sempre executar:
  1. `bun run build` (compilar)
  2. `npm link` (reinstalar)
  3. Reiniciar o Claudinho para ver as mudanças

---

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

### Ajustes Pos `/provider` (UX de sessao, custo e historico)

Refinos feitos com base no uso real no terminal, focando em comportamento consistente e leitura mais limpa durante a sessao.

#### `/provider` + perfil Codex

- Correcoes no perfil Codex para evitar herdar modelo indevido de shell/perfil anterior.
- Ao selecionar `codex`, o modelo padrao volta para `codexplan` quando o valor salvo nao for um modelo Codex valido.
- Melhor consistencia entre provider salvo e modelo efetivamente aplicado no proximo boot.

#### `/cost-model` e sinalizacao de custo

- Correcao da assinatura do comando `/cost-model` para evitar cair em mensagem de uso em chamadas validas.
- `list` e `remove` com ajuda de uso mais clara.
- Ao registrar custo customizado, o aviso de "modelo desconhecido / custo estimado" e limpo corretamente.

#### Barra inferior (sessao inteira)

- Rework visual da barra de tokens para foco em contexto + estado da sessao.
- Indicadores de `ativo` e `ocioso` com formato progressivo em portugues (`s`, `min`, `h`, `d`, `sem`, `mes`), sem abreviacoes em ingles.
- Estado de contexto textual (`contexto estavel`, `contexto atento`, `contexto critico`) para leitura rapida.
- Integracao do input digitado no sinal de atividade da sessao (nao apenas durante resposta do modelo).

#### Historico de conversas no boot

- Seletor inicial expandido para carregar ate `100` conversas.
- Paginacao adicionada em blocos de `10` itens por pagina.
- Navegacao por teclado:
  - `setas cima/baixo` para mover selecao
  - `setas esquerda/direita` para trocar pagina
  - `1-9` para retomar rapido dentro da pagina atual
  - `Enter` para abrir a conversa selecionada

#### Mensagem de retomada na saida

- Texto atualizado para:
  - `Volte nessa conversa usando o comando:`
  - `claudinho --resume <id>`

### 🌍 Tradução Completa para Português Brasileiro

Esta versão marca a conclusão da tradução massiva do Claudinho para português brasileiro, tornando a experiência completamente localizada para usuários brasileiros.

#### ✨ Novidades

- **Tradução de 406+ strings** em toda a aplicação (Fases 1-15)
- **322+ arquivos modificados** com traduções
- **Cobertura de ~96%** da interface traduzida
- **Títulos automáticos em português** - O modelo Haiku agora gera títulos de sessão em português

#### 📝 Áreas Traduzidas (Atualizado - Fase 14)

##### Interface do Usuário (UI)
- Tela de inicialização e boas-vindas
- Mensagens de status e spinner de carregamento
- Diálogos de permissão e confirmação (incluindo PowerShell, Bash, Web)
- Sistema de ajuda e dicas
- Mensagens de erro e avisos
- Comandos e suas descrições
- Opções de configuração
- Histórico de sessões
- **NOVO (Fase 11)**: Opções de permissão PowerShell traduzidas
- **NOVO (Fase 11)**: Descrições de ferramentas Web traduzidas
- **NOVO (Fase 11)**: Títulos de diálogos Bash traduzidos
- **NOVO (Fase 12)**: Mensagens de status de agentes traduzidas
- **NOVO (Fase 12)**: Estatísticas de diff traduzidas
- **NOVO (Fase 13)**: Mensagens de segurança e progresso traduzidas
- **NOVO (Fase 14)**: Mensagens de interrupção e navegação traduzidas (Esc, Enter, Tab)
- **NOVO (Fase 15)**: Opções de permissão Yes/No completamente traduzidas

##### Comandos Traduzidos
- `/ajuda` - Sistema de ajuda completo
- `/renomear` - Renomear sessões
- `/tag` - Sistema de tags
- `/limpar` - Limpar conversa
- `/provider` - Gerenciar provedores
- E todos os outros comandos principais

##### Mensagens do Sistema
- Notificações de progresso
- Mensagens de conclusão de tarefas
- Avisos de segurança
- Mensagens de interrupção
- Status de ferramentas e operações

##### Prompts de Sistema (Novo!)
- Geração automática de títulos de sessão em português
- Geração de nomes kebab-case para comando `/rename`
- Geração de títulos e branches para sessões remotas
- Exemplos e instruções para o modelo em português

#### 🛠️ Ferramentas de Tradução

Criados scripts automatizados para facilitar futuras traduções:

- **`scripts/gerar-traducoes.ts`** - Extrai strings e gera traduções automáticas
- **`scripts/aplicar-traducoes.ts`** - Aplica traduções nos arquivos (suporta filtros)
- **`scripts/traduzir.sh`** - Script auxiliar bash
- **`scripts/README-TRADUCOES.md`** - Documentação completa do processo

#### 📊 Estatísticas

- **Fase 1 (Prioridade Máxima):** 7 strings
- **Fase 2 (Prioridade Alta):** 105 strings
- **Fase 3 (Prioridade Média):** 112 strings
- **Fase 4 (Sweep Final):** 51 strings
- **Fase 5 (Prompts de Sistema):** 3 prompts + exemplos
- **Fase 6 (Correções Mistas):** 12 strings
- **Fase 7 (Permissões Web):** 4 strings
- **Fase 8 (Diálogos e Instruções):** 21 strings
- **Fase 9 (Status e Ações):** 13 strings
- **Fase 10 (Traduções Manuais):** 7 strings
- **Fase 11 (Permissões e Ferramentas Web):** 13 strings
- **Fase 12 (Mensagens de Status e Diff):** 15 strings
- **Fase 13 (Segurança e Progresso):** 20+ strings
- **Fase 14 (Interrupção e Navegação):** 21 strings
- **Fase 15 (Opções Yes/No):** 16 strings
- **Total:** 406+ strings traduzidas

#### 🎯 Melhorias de Experiência

- Tom informal e amigável nas traduções ("pra" ao invés de "para")
- Termos técnicos mantidos em inglês quando apropriado (API, URL, JSON, Git)
- Mensagens de erro mais claras e em português
- Títulos de janela gerados automaticamente em português
- Interface completamente localizada
- Diálogos de confirmação 100% em português (Sim/Não ao invés de Yes/No)
- Correção de strings mistas que misturavam português e inglês

#### 📚 Documentação

- **`INVENTARIO_STRINGS_TRADUCAO.md`** - Inventário completo de 1250+ strings categorizadas
- **`LISTA_COMPLETA_TRADUCOES.md`** - Lista detalhada de todas as traduções realizadas
- **`TRADUCOES_REALIZADAS.md`** - Histórico detalhado do processo

#### 🔧 Técnico

- 15 compilações bem-sucedidas durante o processo
- Nenhuma quebra de funcionalidade
- Compatibilidade mantida com versões anteriores
- Logs de debug mantidos em inglês (para desenvolvedores)
- Correção de bug: variáveis const sendo reatribuídas em `commit-push-pr.ts`
- Correção de strings mistas português/inglês em componentes React
- Mensagens de interrupção (Esc, Ctrl+C) completamente traduzidas
- Diálogos de navegação e cancelamento 100% em português

#### 🚀 Próximos Passos

- Tradução dos 5% restantes (logs técnicos e comentários de código)
- Possível tradução de documentação externa
- Melhorias contínuas baseadas em feedback

---

### 🎨 UI — Token Status, Budget, Thinking Indicator e Custom Model Costs

Melhorias visuais na barra inferior com tracking de tokens, custo, indicador animado e configuração manual de custos de modelo.

#### ✨ Novidades

- **TokenStatusBar** — Barra de uso de tokens com detecção automática de provider e contexto dinâmico
  - Detecta provider via `OPENAI_BASE_URL` (OpenRouter, Anthropic, Gemini, Ollama, OpenAI, Groq, Together, DeepInfra, Fireworks)
  - Usa `finalContextTokensFromLastResponse` + `roughTokenCountEstimationForMessages` para contagem em tempo real
  - Mostra sigla do provider e janela de contexto do modelo
  - Barra animada com easing suave

- **ThinkingBadge** — Indicador animado de modelo gerando resposta
  - Spinner Braille (⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏) a cada 80ms
  - Timer elapsed + frases engraçadas rotativas ("Claudiando...", "Cerebrando...", "Fritando neurônio...")
  - Fade-out 5s com ✓ e tempo final após resposta

- **BudgetStatusBar** — Progresso de custo vs orçamento
  - Lê `getTotalCostUSD()` do estado global (polling 500ms)
  - Formato: `$▰▰▰▰▱▱▱▱▱▱ $0.12/$2.00`
  - Cores: verde <50%, amarelo 50-70%, laranja 70-85%, vermelho >85%
  - Mostra `⚠` quando excede budget (padrão: $2.00)

- **UnknownModelWarning** — Aviso quando modelo não foi identificado
  - `⚠ Modelo desconhecido — custo estimado. Configure com /cost-model`

- **`/cost-model`** — Comando pra configurar custos customizados
  - `/cost-model modelo 2 10` → $2 input / $10 output por Mtok
  - `/cost-model list` e `/cost-model remove <modelo>`
  - Deriva cache write (1.25x) e cache read (10%) automaticamente
  - Remove o aviso de modelo desconhecido ao configurar

#### 📊 Custos de Modelos

Expandido `modelCost.ts` para múltiplos provedores: OpenAI (GPT-4o, GPT-4o-mini, GPT-4, o1, o3-mini), Gemini (2.0 Flash, 2.5 Pro, 2.5 Flash), Qwen, DeepSeek, e modelos `:free`/`/free` → custo zero.

#### 🔧 Técnico

- `detectProviderFromBaseUrl()` — pattern matching no base URL
- `MODEL_COSTS` + fallback por prefixo (`getModelCostByName`)
- User-defined costs: `registerCustomModelCost`, `removeUserModelCost`, `listUserModelCosts`
- Arquivos novos: `src/commands/cost-model/`, `src/components/BudgetStatusBar.tsx`, `src/components/UnknownModelWarning.tsx`

---

### 🦎 Modo Camaleão — Camuflagem de Origem IA em Commits

Inspiração no Undercover Mode do Claude Code interno, adaptado e recriado para o build externo do Claudinho. Protege commits em repositórios públicos removendo qualquer menção de origem automática de IA.

#### ✨ Novidades

- **Detecção automática de repo público** — compara o remote contra uma allowlist de repos privados. Se é público/opensource, ativa o Camaleão sozinho
- **Instruções injetadas nos comandos `/commit` e `/commit-push-pr`** — o modelo recebe instruções de camuflagem automaticamente
- **Remoção de atribuação automática** — Co-Authored-By e créditos de IA somem dos commits
- **Configurável via env var e config global** — `CLAUDINHO_CAMALEAO=1` pra forçar ON, `CLAUDINHO_CAMALEAO=0` pra forçar OFF, ou via `camaleaoMode` no config global

#### 🔧 Técnico

- **`src/utils/camaleao.ts`** — Novo arquivo com detecção de repo, cache e instruções
- **`src/commands/commit.ts`** — Injeção de instruções camaleão quando ativo
- **`src/commands/commit-push-pr.ts`** — Mesma lógica para PRs + versão sync do `getPromptContent`
- **`src/tools/BashTool/prompt.ts`** — Instruções camaleão na seção de operações Git
- **`src/utils/config.ts`** — Campo `camaleaoMode?: boolean` adicionado no tipo `GlobalConfig`

#### 📋 O que o modelo recebe quando ativo:
- Escreve mensagens de commit como dev humano
- Nunca menciona IA, modelos, ou ferramentas de automação
- Remove Co-Authored-By e atribuição automática
- Follows conventional commits (fix, feat, docs, etc.)
- Foca no "por que" ao invés do "como"

---

### 🧠 Injeção Proativa de Skills no System Prompt

Sistema de análise e invocação automática de skills relevantes antes de executar qualquer tarefa. Sem perguntar, sem anunciar — o modelo detecta o domínio e aciona a skill especializada por trás.

#### ✨ Novidades

- **Análise automática de domínio** — antes de cada tarefa, o modelo escaneia as skills disponíveis e seleciona a mais relevante
- **Invocação silenciosa** — skill é chamada via `Skill` tool sem diálogo, sem menu, sem `/skill-name`
- **23+ skills mapeadas** — UI → `frontend-design`, debug → `systematic-debugging`, testes → `testing-patterns`, React → `nextjs-react-expert`, performance → `performance-profiling`, etc.
- **Regra #8 nas Regras de Ouro** — reforça que skills devem ser analisadas antes de qualquer trabalho

#### 🔧 Técnico

- **`src/constants/personality.ts`** — nova seção "Análise Proativa de Skills" injetada em `getPersonalitySection()`, chamada em toda sessão
- **`~/.claude/CLAUDE.md`** — CLAUDE.md global com instruções equivalentes pra carregar em qualquer projeto, não só Claudinho
- **MEMORY.md index** — entrada `skill_injection_system.md` adicionada no index de memória do projeto

---
### Versão anterior

- Funcionalidades base do Claudinho
- Interface em inglês
- Sistema de comandos
- Integração com Claude API
- Suporte a múltiplos provedores

---

**Nota:** Este changelog documenta as mudanças de tradução. Para mudanças técnicas e de funcionalidade, consulte os commits do Git.

