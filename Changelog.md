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

