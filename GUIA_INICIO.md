# Guia Completo do Claudinho

> **Qualquer provedor. Qualquer modelo. De graça, PRA SEMPRE.**

**Pra quem é esse guia:** Pra qualquer pessoa que nunca viu um terminal na vida. Se você não sabe programar, não sabe o que é API, nunca ouviu falar de variável de ambiente — **relaxa, tá tudo explicado aqui, bem passo a passo, como se eu explicasse pra um amigo no zap**.

---

## O que é o Claudinho?

O Claudinho é um assistente de programação que roda direto no seu terminal. Ele é baseado no **Claude Code** da Anthropic (a melhor IA de programação que existe hoje), mas com uma diferença **GIGANTE**: essa versão funciona com **QUALQUER** modelo de inteligência artificial — não só com o Claude.

Isso significa que você pode usar:
- **GPT-4o** da OpenAI (a mesma tecnologia do ChatGPT)
- **Gemini** do Google
- **DeepSeek** (o modelo chinês que tá bombando)
- **Llama** da Meta (rodando direto no seu PC, de graça)
- **Qualquer modelo** que fale a API da OpenAI (são 200+)

E tudo que funcionava no Claude Code original continua funcionando aqui: bash, leitura e edição de arquivos, busca de código, agentes, tarefas, MCP — tudo do mesmo jeito, só que com a IA que VOCÊ escolher.

---

## Sumário

1. [Requisitos](#1-requisitos)
2. [Instalação](#2-instalação)
3. [Primeiro uso](#3-primeiro-uso)
4. [Configurando sua chave de API](#4-configurando-sua-chave-de-api)
5. [Features especiais do Claudinho](#5-features-especiais-do-claudinho)
6. [Usando no dia a dia](#6-usando-no-dia-a-dia)
7. [Configuração avançada](#7-configuração-avançada)
8. [Solução de problemas](#8-solução-de-problemas)
9. [Dicas de segurança](#9-dicas-de-segurança)

---

## 1. Requisitos

### O que você PRECISA ter

| Coisa | Por quê | Como verificar |
|-------|---------|----------------|
| **Node.js 20 ou mais novo** | É o "motor" que faz o Claudinho funcionar | `node --version` no terminal |
| **Terminal** | É onde o Claudinho roda | Todo computador tem um |

### Como instalar o Node.js (se não tiver)

1. Entra em <https://nodejs.org>
2. Clica no botão de download que aparece pro seu sistema operacional
3. Instala do jeitinho que o instalador manda (é "Next, Next, Install")
4. Reinicia o terminal (fecha e abre de novo)
5. Confirma: digita `node --version` — se aparecer `v20.x` ou maior, tá pronto!

### O que é recomendado (mas não obrigatório)

- **Git** — pra versionar seu código. Baixa em <https://git-scm.com>
- **VS Code** — um editor de código muito popular. Baixa em <https://code.visualstudio.com>

---

## 2. Instalação

### Método 1: Instalando pelo npm (o mais fácil — recomendado)

Abre o terminal e digita:

```bash
npm install -g @gitlawb/claudinho
```

**O que esse comando faz?**

| Parte do comando | O que significa |
|------------------|-----------------|
| `npm install` | "npm, instala isso pra mim" |
| `-g` | **Global** — instala em qualquer pasta, não só no projeto atual |
| `@gitlawb/claudinho` | É o nome do pacote do Claudinho |

Depois da instalação, confirma que funcionou:

```bash
claudinho --version
```

Se aparecer um número (tipo `0.1.7`), **tá instalado e pronto**.

> **Atenção:** O nome do pacote é `@gitlawb/claudinho`, mas o comando que você roda é `claudinho`. É normal! É como se o pacote se chamasse "Maria" mas todo mundo chamasse de "Mari".

### Método 2: Usando sem instalar (npx)

Se você não quer instalar nada permanente no computador:

```bash
npx @gitlawb/claudinho
```

| Vantagem | Desvantagem |
|----------|-------------|
| Não ocupa espaço permanente | Demora toda vez (baixa de novo) |
| Bom pra testar uma vez | Ruim pra uso diário |

### Método 3: Pelo código fonte (avançado)

Se você quer mexer no código, contribuir pro projeto ou rodar a versão mais recente:

```bash
# 1. Baixa o código do repositório
git clone https://github.com/Gitlawb/claudinho.git
cd claudinho

# 2. Instala as dependências (precisa ter o Bun)
bun install

# 3. Constrói o projeto
bun run build

# 4. Roda
bun run dev
```

**Pra instalar o Bun no Windows:**
```powershell
powershell -c "irm bun.sh/install.ps1 | iex"
```

**Pra instalar o Bun no Mac/Linux:**
```bash
curl -fsSL https://bun.sh/install | bash
```

---

## 3. Primeiro uso

### 3.1. O que acontece quando você roda pela primeira vez

Quando você digita `claudinho` no terminal, vai aparecer uma **tela de boas-vindas**. O Claudinho te guia por umas etapas rapidinhas:

#### Etapa 1 — Escolha do tema

O Claudinho te pergunta: **claro ou escuro?**

- **Tema escuro:** fundo preto, letras claras. **Recomendado** — cansa menos a vista, especialmente se você programa à noite
- **Tema claro:** fundo branco, letras escuras. Bom se você tá num ambiente muito iluminado ou prefere tela clara

Use as **setas do teclado** (↑ ↓) pra navegar e **Enter** pra confirmar.

#### Etapa 2 — Aprovação da chave de API

Se você já configurou uma chave no ambiente, o Claudinho mostra e pergunta se aprova usar essa chave. É só confirmar.

#### Etapa 3 — Notas de segurança

Dicas importantes que o Claudinho te dá:
- A IA pode cometer erros — **sempre revise**
- Cuidado com comandos suspeitos
- Você tem controle total sobre o que é executado

#### Etapa 4 — Atalhos de teclado (opcional)

O Claudinho pode instalar atalhos recomendados pro seu terminal. Por exemplo:
- **Shift+Enter** = cria nova linha sem enviar a mensagem
- **Tab** = autocomplete

### 3.2. Navegando pela interface

Depois do setup, você vê a interface principal:

| Ação | Tecla |
|------|-------|
| Enviar mensagem | `Enter` |
| Nova linha (pular linha) | `Shift + Enter` |
| Navegar histórico | `↑` `↓` |
| Expandir resposta | `Ctrl + O` |
| Compactar conversa | `/compact` |

---

## 4. Configurando sua chave de API

### 4.1. O que é uma chave de API?

Pensa numa chave de API como uma **senha** que permite o Claudinho conversar com serviços de IA. Sem ela, ele não consegue falar com nenhum modelo.

Cada serviço tem sua própria chave:
- **Anthropic** = `ANTHROPIC_API_KEY` (começa com `sk-ant-`)
- **OpenAI** = `OPENAI_API_KEY` (começa com `sk-proj-` ou `sk-`)
- **Google** = `GEMINI_API_KEY`
- **OpenRouter** = `OPENAI_API_KEY` (começa com `sk-or-v1-`)

> **IMPORTANTE:** Trate sua chave como uma senha de banco. **NUNCA compartilhe publicamente.** Nunca coloque em repositórios públicos do GitHub. Se suspeitar que vazou, revoga na hora e cria outra.

### 4.2. Onde colocar a chave?

Tem 3 jeitos:

#### Jeito A: Direto no terminal (rápido, mas temporário)

Só funciona naquela janela do terminal:

**Windows (PowerShell):**
```powershell
$env:OPENAI_API_KEY="sk-sua-chave-aqui"
$env:CLAUDE_CODE_USE_OPENAI="1"
$env:OPENAI_MODEL="gpt-4o"
claudinho
```

**Linux/Mac:**
```bash
export OPENAI_API_KEY=sk-sua-chave-aqui
export CLAUDE_CODE_USE_OPENAI=1
export OPENAI_MODEL=gpt-4o
claudinho
```

#### Jeito B: Arquivo `.env` (recomendado)

Cria um arquivo chamado `.env` na pasta do seu projeto e coloca as variáveis lá:

```env
CLAUDE_CODE_USE_OPENAI=1
OPENAI_API_KEY=sk-sua-chave-aqui
OPENAI_MODEL=gpt-4o
```

Pronto! Toda vez que rodar o Claudinho daquela pasta, ele lê o `.env`.

> **Dica:** Adicione `.env` no seu `.gitignore` pra nunca subir esse arquivo pro GitHub sem querer.

#### Jeito C: Configuração global (pra sempre)

O Claudinho salva config em `%USERPROFILE%\.claude.json` (Windows) ou `~/.claude.json` (Mac/Linux). Você pode editar esse arquivo e adicionar:

```json
{
  "primaryApiKey": "sua-chave-aqui"
}
```

---

### 4.3. Escolhendo seu provedor

#### Opção A: OpenAI (mais fácil — recomendado)

Onde pegar a chave:
1. Entra em <https://platform.openai.com>
2. Cria conta ou faz login
3. Vai em **API Keys** → **Create new secret key**
4. Copia a chave

Configura:
```env
CLAUDE_CODE_USE_OPENAI=1
OPENAI_API_KEY=sk-sua-chave-aqui
OPENAI_MODEL=gpt-4o
```

| Modelo | Pra quê | Preço |
|--------|---------|-------|
| **gpt-4o** | Melhor geral | Médio |
| **gpt-4o-mini** | Rápido e barato | Baixo |
| **o1** | Problemas complexos | Alto |

#### Opção B: Ollama (100% grátis e local!)

Pra quem quer rodar a IA no próprio PC, sem depender de nuvem e sem custo.

1. **Instala o Ollama**: <https://ollama.com>
2. **Baixa um modelo**:
```bash
ollama pull llama3.2:3b
```

Configura:
```env
CLAUDE_CODE_USE_OPENAI=1
OPENAI_BASE_URL=http://localhost:11434/v1
OPENAI_API_KEY=ollama
OPENAI_MODEL=llama3.2:3b
```

> **Nota:** Não precisa de chave de API pro Ollama — põe `ollama` como valor (é só pra preencher).

| Modelo | RAM necessária | Velocidade | Inteligência |
|--------|---------------|------------|--------------|
| **llama3.2:3b** | ~4GB | Muito rápido | Básico, bom pra testar |
| **qwen2.5-coder:7b** | ~8GB | Rápido | **Excelente pra código** |
| **llama3.2** | ~8GB | Rápido | Bom pra uso geral |
| **mistral-small:24b** | ~16GB | Médio | Bom |
| **llama3.3:70b** | ~40GB | Lento | Muito bom |

#### Opção C: Google Gemini (tem plano grátis!)

Onde pegar a chave:
1. Entra em <https://aistudio.google.com>
2. Faz login com conta Google
3. Clica em **Get API Key**
4. Copia a chave

Configura:
```env
CLAUDE_CODE_USE_GEMINI=1
GEMINI_API_KEY=sua-chave-aqui
GEMINI_MODEL=gemini-2.0-flash
```

| Modelo | Pra quê | Custo |
|--------|---------|-------|
| **gemini-2.0-flash** | Melhor geral | Grátis com limites |
| **gemini-2.0-flash-lite** | Mais rápido | Grátis com limites |

#### Opção D: DeepSeek

Onde pegar a chave:
1. Entra em <https://platform.deepseek.com>
2. Cria conta e gera API Key

Configura:
```env
CLAUDE_CODE_USE_OPENAI=1
OPENAI_API_KEY=sk-sua-chave-aqui
OPENAI_BASE_URL=https://api.deepseek.com/v1
OPENAI_MODEL=deepseek-chat
```

#### Opção E: OpenRouter (acesso a 200+ modelos)

OpenRouter é tipo um "shopping" de modelos — uma única chave te dá acesso a dezenas de IAs diferentes. Tem modelos grátis também!

Onde pegar a chave:
1. Entra em <https://openrouter.ai>
2. Cria conta
3. Vai em **Keys** → cria uma nova
4. Copia a chave (começa com `sk-or-v1-`)

Configura:
```env
CLAUDE_CODE_USE_OPENAI=1
OPENAI_API_KEY=sk-or-v1-sua-chave-aqui
OPENAI_MODEL=qwen/qwen3.6-plus:free
OPENAI_BASE_URL=https://openrouter.ai/api/v1
```

> **Dica:** O modelo `qwen/qwen3.6-plus:free` é **grátis** — bom demais pra testar! A lista de modelos todos tá em <https://openrouter.ai/models>

#### Opção F: Codex (via ChatGPT)

Se você já usa o Codex CLI ou o ChatGPT, o Claudinho lê sua autenticação automaticamente.

```env
CLAUDE_CODE_USE_OPENAI=1
OPENAI_MODEL=codexplan
```

> `codexplan` = GPT-5.4 no backend Codex com alto raciocínio
> `codexspark` = GPT-5.3 Codex Spark para voltas mais rápidas

Se não tiver `~/.codex/auth.json`, pode passar a chave direto:
```env
CODEX_API_KEY=sua-chave-aqui
```

#### Opção G: Anthropic Claude (padrão)

Onde pegar a chave:
1. Entra em <https://console.anthropic.com>
2. Cria conta
3. Vai em **API Keys** → cria uma
4. Copia a chave (começa com `sk-ant-`)

Configura (é o padrão, só precisa da chave):
```env
ANTHROPIC_API_KEY=sk-ant-sua-chave-aqui
```

#### Opção H: Outros provedores

Todos usam o protocolo OpenAI, só muda a URL:

**Groq:**
```env
CLAUDE_CODE_USE_OPENAI=1
OPENAI_API_KEY=gsk_sua-chave
OPENAI_BASE_URL=https://api.groq.com/openai/v1
OPENAI_MODEL=llama-3.3-70b-versatile
```

**Together AI:**
```env
CLAUDE_CODE_USE_OPENAI=1
OPENAI_API_KEY=sua-chave
OPENAI_BASE_URL=https://api.together.xyz/v1
OPENAI_MODEL=meta-llama/Llama-3.3-70B-Instruct-Turbo
```

**Mistral:**
```env
CLAUDE_CODE_USE_OPENAI=1
OPENAI_API_KEY=sua-chave
OPENAI_BASE_URL=https://api.mistral.ai/v1
OPENAI_MODEL=mistral-large-latest
```

**LM Studio (local):**
```env
CLAUDE_CODE_USE_OPENAI=1
OPENAI_BASE_URL=http://localhost:1234/v1
OPENAI_MODEL=model-name
# Sem chave necessária!
```

**Azure OpenAI:**
```env
CLAUDE_CODE_USE_OPENAI=1
OPENAI_API_KEY=sua-chave-azure
OPENAI_BASE_URL=https://seu-recurso.openai.azure.com/openai/deployments/seu-deploy/v1
OPENAI_MODEL=gpt-4o
```

**Atomic Chat (Apple Silicon):**
```env
CLAUDE_CODE_USE_OPENAI=1
OPENAI_BASE_URL=http://127.0.0.1:1337/v1
OPENAI_MODEL=nome-do-modelo
# Sem chave necessária!
```

---

## 5. Features especiais do Claudinho

Essas são as coisas que o Claudinho tem **além** do Claude Code original:

### 5.1. Histórico de conversas

O Claudinho salva suas sessões e você pode **ver e navegar** suas conversas anteriores. Assim você não perde o contexto de trabalho entre sessões.

- Até **20 sessões recentes** ficam salvas
- Ordenadas por data de modificação
- Navegação por setas do teclado com Enter pra abrir e Esc pra sair
- Sessões laterais (sidechains) são filtradas automaticamente

### 5.2. Remoção de guardrails (Modo "Sem Permissão")

Normalmente, o Claudinho **pede permissão** antes de executar cada comando ou editar arquivos. Isso é ótimo pra segurança, mas às vezes você quer que a IA rode solta.

Com o **Modo de Bypass de Permissões** ("Dangerous Mode"):
- A IA executa comandos e edita arquivos **sem pedir permissão**
- Tudo fica mais rápido e fluido
- Mas vem com um aviso: **use só em ambientes isolados (sandbox)** — em projetos reais, a IA pode fazer alterações que você não quer

> **IMPORTANTE:** As verificações de segurança mais críticas continuam ativas mesmo nesse modo. O Claudinho ainda protege arquivos sensíveis como `.git/` e `.claude/`.

### 5.3. Tradução completa pro Português (PT-BR)

O Claudinho tem **suporte nativo a português brasileiro**:

- **Interface traduzida:** menus, mensagens de erro, dicas de teclado, textos de permissão — tudo em português
- **Prompts de permissão traduzidos:** quando o Claudinho pergunta "Você quer fazer essa edição em...", aparece em bom português de verdade
- **Mensagens de despedida cariocas:** quando você sai do Claudinho, as mensagens de adeus são em português com gírias cariocas ("Tamo junto!", "Fui!", "Beleza, até mais!")
- **Descrições de comandos traduzidas**

Para configurar o idioma das respostas da IA:
- Use o **Language Picker** nas configurações pra definir seu idioma preferido
- Exemplo: configure "Portuguese" e a IA vai sempre responder em português

### 5.4. Assistente de provedor interativo (`/provider`)

Comando interativo que te ajuda a configurar provedores sem precisar mexer em variáveis de ambiente manualmente:

1. Você digita `/provider` no Claudinho
2. Um **assistente passo a passo** aparece
3. Você escolhe o provedor (OpenAI, Gemini, Ollama, Codex)
4. Coloca a chave, escolhe o modelo
5. Pode salvar o perfil pra usar depois

Também tem:
- **Recomendação automática de provedor** — o Claudinho te sugere o melhor modelo pro seu caso (velocidade, qualidade, código)
- **Descoberta de modelos** — mostra quais modelos estão instalados/disponíveis
- **Seleção inteligente pro Ollama** — analisa os modelos locais e sugere o melhor

### 5.5. Logo e tela de início customizadas

A tela de início do Claudinho tem:
- **Logo em gradient RGB** feito com blocos customizáveis
- **Tagline:** "Qualquer provedor. Qualquer modelo. De graça, PRA SEMPRE."
- Configuração editável via `logoConfig.json`

### 5.6. Classificador de permissão automático (Auto-Mode)

Um sistema de **classificação com IA** que decide automaticamente se permite ou nega a execução de ferramentas, sem te interromper com prompts. É como se uma segunda IA analisasse o que a primeira quer fazer e decidisse se é seguro.

### 5.7. Tudo que funciona do Claude Code original

| Feature | Funciona? |
|----------|-----------|
| **Bash** (executar comandos) | ✅ |
| **FileRead** (ler arquivos) | ✅ |
| **FileWrite** (criar/editar arquivos) | ✅ |
| **FileEdit** (editar partes de arquivos) | ✅ |
| **Glob** (buscar arquivos por nome) | ✅ |
| **Grep** (buscar texto em arquivos) | ✅ |
| **WebFetch** (buscar URLs) | ✅ |
| **WebSearch** (pesquisar na web) | ✅ |
| **Agent** (sub-agentes) | ✅ |
| **MCP** (protocolos externos) | ✅ |
| **LSP** (language server) | ✅ |
| **NotebookEdit** | ✅ |
| **Tasks** | ✅ |
| **Memória persistente** | ✅ |
| **Streaming** (respostas em tempo real) | ✅ |
| **Comandos de barra** (`/commit`, `/diff`, etc) | ✅ |
| **Imagens** (anexar pro modelo "enxergar") | ✅ |

---

## 6. Usando no dia a dia

### 6.1. Rodando o Claudinho

```bash
claudinho
```

Ou indo direto numa pasta de projeto:

```bash
cd minha-pasta-do-projeto
claudinho
```

### 6.2. Fazendo perguntas e pedidos

Você conversa com o Claudinho como se fosse uma pessoa. Ele consegue:

| Tipo de comando | Exemplo |
|-----------------|---------|
| **Entender código** | "me explica o que esse arquivo faz?" |
| **Criar código** | "cria uma função que soma dois números em Python" |
| **Resolver bugs** | "por que esse erro tá acontecendo: [cola o erro]" |
| **Criar arquivos** | "cria um index.html com uma tabela bonita" |
| **Refatorar** | "melhora esse código, deixa mais limpo" |
| **Pesquisar** | "como faço um loop em JavaScript?" |
| **Explicar projetos** | "me explica o que esse projeto faz e lista os arquivos principais" |

### 6.3. Atalhos úteis

| Comando | O que faz |
|---------|-----------|
| `/compact` | Compacta a conversa pra economizar tokens |
| `/diff` | Mostra mudanças recentes no código |
| `/commit` | Cria commit automático dos arquivos mudados |
| `/model` | Mostra ou muda o modelo de IA atual |
| `/status` | Mostra o status atual da sessão |
| `/clear` | Limpa o histórico da conversa |
| `/help` | Mostra ajuda |
| `/exit` | Sai do Claudinho |

### 6.4. Configuração rápida de provedores com Bun (avançado)

Se você usa Bun e quer gerenciar provedores com perfis:

```bash
# Cria perfil inicial (detecta Ollama local ou usa OpenAI)
bun run profile:init

# Vê qual é o melhor provedor pro seu objetivo
bun run profile:recommend -- --goal coding --benchmark

# Aplica automaticamente o melhor provedor
bun run profile:auto -- --goal latency

# Lança com perfil salvo
bun run dev:profile

# Perfis específicos
bun run dev:openai     # OpenAI
bun run dev:ollama     # Ollama
bun run dev:codex      # Codex
bun run dev:gemini     # Gemini
bun run dev:atomic-chat # Atomic Chat (Apple Silicon)

# Modo rápido e leve (sem plugins/LSP/hooks)
bun run dev:profile:fast -- --bare
```

---

## 7. Configuração avançada

### 7.1. Variáveis de ambiente completas

| Variável | Descrição | Valor exemplo |
|----------|-----------|---------------|
| `CLAUDE_CODE_USE_OPENAI` | Liga o provedor OpenAI | `1` |
| `CLAUDE_CODE_USE_GEMINI` | Liga o provedor Gemini | `1` |
| `CLAUDE_CODE_USE_GITHUB` | Liga modelos do GitHub | `1` |
| `CLAUDE_CODE_USE_BEDROCK` | Liga AWS Bedrock | `1` |
| `CLAUDE_CODE_USE_VERTEX` | Liga Google Vertex AI | `1` |
| `OPENAI_API_KEY` | Chave OpenAI | `sk-...` |
| `OPENAI_MODEL` | Modelo desejado | `gpt-4o` |
| `OPENAI_BASE_URL` | URL customizada | `https://api.openai.com/v1` |
| `GEMINI_API_KEY` | Chave Gemini | `sua-chave` |
| `GEMINI_MODEL` | Modelo Gemini | `gemini-2.0-flash` |
| `GITHUB_TOKEN` | Token do GitHub | `ghp_...` |
| `ANTHROPIC_API_KEY` | Chave Anthropic | `sk-ant-...` |
| `ANTHROPIC_MODEL` | Modelo Anthropic | `claude-sonnet-4-5` |
| `ANTHROPIC_BASE_URL` | URL customizada Anthropic | `https://api.anthropic.com` |
| `AWS_REGION` | Região AWS | `us-east-1` |
| `AWS_BEARER_TOKEN_BEDROCK` | Token Bedrock | `seu-token` |
| `CODEX_API_KEY` | Chave Codex | `sua-chave` |
| `ANTHROPIC_VERTEX_PROJECT_ID` | Projeto GCP Vertex | `seu-project` |

### 7.2. Outras variáveis úteis

| Variável | O que faz |
|----------|-----------|
| `CLAUDE_CONFIG_DIR` | Muda a pasta de configurações |
| `CLAUDE_CODE_MAX_RETRIES` | Máximo de tentativas se a API falhar (padrão: 10) |
| `CLAUDE_CODE_UNATTENDED_RETRY` | Reconecta infinitamente (útil pra rodar sem supervisão) |
| `CLAUDE_DEBUG` | Liga modo debug — mostra tudo que acontece por trás |
| `CLAUDE_CODE_DEV` | Informa que tá em modo de desenvolvimento |
| `CLAUDE_CODE_SIMPLE` | Modo mínimo — sem hooks, LSP ou plugins |
| `CI` | Modo CI — mais rigoroso com autenticação |
| `OPENCLAUDE_DISABLE_CO_AUTHORED_BY` | Remove o "Co-Authored-By" nos commits git |
| `CLAUDE_CODE_REMOTE` | Habilita o Controle Remoto |

### 7.3. Diagnóstico e validação (para quem rodou do código fonte)

```bash
# Checagem rápida de startup
bun run smoke

# Valida provedor e conectividade
bun run doctor:runtime

# Relatório em formato JSON (máquina)
bun run doctor:runtime:json

# Salva relatório em reports/doctor-runtime.json
bun run doctor:report

# Checagem completa de hardening
bun run hardening:check

# Hardening estrito (inclui typecheck do projeto)
bun run hardening:strict

# Typecheck (sem gerar código)
bun run typecheck
```

### 7.4. Configurações da sessão

O Claudinho salva configurações em:
- **Windows:** `%USERPROFILE%\.claude.json`
- **Mac/Linux:** `~/.claude.json`
- **Custom:** via variável `CLAUDE_CONFIG_DIR`

O arquivo de config é JSON e inclui:
- **Tema** (dark/light)
- **Compactação automática** (auto-compact)
- **Checkpoint de arquivos**
- **Barra de progresso no terminal**
- **Respeito ao .gitignore**
- **ID único** de usuário (gerado aleatoriamente, pra privacidade)
- **Histórico de dicas** já mostradas

Se o arquivo de config corromper, o Claudinho reseta pra padrão e faz backup do arquivo corrompido.

---

## 8. Solução de problemas

### `claudinho: command not found` ou `dist/cli.mjs not found`

**O que tá acontecendo:** Ou o Claudinho não foi instalado, ou o terminal não reconheceu o comando ainda.

**Como resolver:**
1. **Se instalou pelo npm:** fecha o terminal, abre outro e tenta de novo
2. **Se rodou do código fonte:** roda `bun run build` primeiro:
```bash
cd claudinho
bun run build
```

### `No API key configured` ou erro 401

**O que tá acontecendo:** O Claudinho não encontrou sua chave de API, ou ela tá errada.

**Como resolver:**
1. Confirma que configurou as variáveis:
```bash
# Windows PowerShell
$env:CLAUDE_CODE_USE_OPENAI
$env:OPENAI_API_KEY

# Linux/Mac
echo $CLAUDE_CODE_USE_OPENAI
echo $OPENAI_API_KEY
```
2. Se não aparecer nada, configura de novo (vê a seção de provedores acima)
3. Se aparecer mas der erro, **copia de novo** a chave lá no site do provedor

### `ripgrep not found`

**O que tá acontecendo:** O Claudinho precisa do `ripgrep` (um buscador de texto super-rápido) instalado no sistema.

**Como resolver:**
- **Windows:** `winget install BurntSushi.ripgrep.MSVC` ou `choco install ripgrep`
- **Mac:** `brew install ripgrep`
- **Linux:** `sudo apt install ripgrep` ou equivalente

Depois confirma: `rg --version`

### "Invalid API key"

**Causa:** A chave tá errada, expirada, ou foi copiada incompleta.

**Como resolver:**
1. Gera uma chave nova no painel do provedor
2. Copia **inteira** (seleciona direitinho, sem espaço extra)
3. Cola de novo e roda o Claudinho

### Ollama não conecta

**Causa:** O Ollama não tá instalado, não tá rodando, ou o modelo não foi baixado.

**Como resolver:**
1. Verifica se o Ollama tá instalado: `ollama --version`
2. Verifica se tá rodando (deveria ter um ícone na barra de tarefas)
3. Lista modelos: `ollama list`
4. Se não tiver o modelo: `ollama pull nome-do-modelo`
5. Testa o modelo manualmente: `ollama run nome-do-modelo`

### "Permission denied" no Mac/Linux

**Como resolver:**
```bash
chmod +x $(which claudinho)
```

### O Claudinho tá muito lento

**Possíveis causas:**
- Modelo muito grande pro seu PC (Ollama)
- API com fila (uso grátis)
- Internet lenta

**Como resolver:**
- Usa modelo mais leve (`llama3.2:3b`, `gpt-4o-mini`)
- Troca pra outro provedor
- Roda `bun run doctor:runtime` pra diagnosticar

### O Claudinho não acha meus arquivos

**Causa:** Tá na pasta errada.

**Como resolver:** Navega até a pasta do projeto ANTES de rodar o `claudinho`:
```bash
cd /caminho/correto/do/projeto
claudinho
```

---

## 9. Dicas de segurança

### Proteja suas chaves

- **NUNCA** coloque sua chave em repositórios públicos (GitHub, GitLab, etc.)
- **NUNCA** compartilhe em fóruns, chats, ou prints de tela
- Use arquivo `.env` com `.gitignore` — nunca suba o `.env` pro repo
- Se desconfiar que vazou: **revoga AGORA e cria outra**

### Revise o que a IA faz

O Claudinho pode editar, criar e deletar arquivos no seu projeto. Ele geralmente pede permissão, mas:

- **Sempre leia** o que ele vai mudar antes de aprovar
- A IA pode ser "enganada" por código malicioso (isso se chama "injeção de prompt")
- Se algo parecer esquisito, **não aprove** e investiga

### Cuidado com o Modo Bypass (no guardrails)

O Modo Bypass faz a IA executar comandos sem pedir permissão. É conveniente mas **só use em ambientes isolados**:
- Projetos que não são de produção
- Ambientes sandboxados
- Containers Docker
- Máquinas virtuais que podem ser recriadas

### Verificações de segurança que NUNCA são desligadas

Mesmo no Modo Bypass, o Claudinho protege:
- Pastas `.git/` (onde ficam seus commits)
- Pastas `.claude/` (onde ficam suas configurações)
- Arquivos sensíveis do sistema

### Mantenha atualizado

Novas versões corrigem bugs e melhoram segurança. Atualize regularmente:

```bash
npm update -g @gitlawb/claudinho
```

### Como desinstalar

Se não quiser mais usar:

```bash
npm uninstall -g @gitlawb/claudinho
```

---

## Atualizando o Claudinho

```bash
npm install -g @gitlawb/claudinho@latest
```

---

## Links úteis

- **Repositório:** <https://github.com/Gitlawb/claudinho>
- **Reportar bugs:** <https://github.com/Gitlawb/claudinho/issues>
- **Documentação original (em inglês):** <https://github.com/Gitlawb/claudinho/blob/main/README.md>

---

*Feito com carinho pro dev brasileiro. Claudinho — qualquer provedor, qualquer modelo, de graça pra sempre.*
