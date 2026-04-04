# Configuração Avançada do OpenClaude

Este guia é para quem quer builds do código fonte, Bun, perfis locais, diagnósticos e mais controle sobre o comportamento do sistema.

## Opções de Instalação

### Opção A: npm

```bash
npm install -g @touchzada/claudinho
```

### Opção B: Do código fonte com Bun

Use Bun `1.3.11` ou mais novo para builds no Windows. Versões mais antigas do Bun podem falhar no `bun run build`.

```bash
git clone https://github.com/touchzada/Claudinho.git
cd Claudinho

bun install
bun run build
npm link
```

### Opção C: Rodar direto com Bun

```bash
git clone https://github.com/touchzada/Claudinho.git
cd Claudinho

bun install
bun run dev
```

---

## Exemplos de Provedores

### OpenAI

```bash
export CLAUDE_CODE_USE_OPENAI=1
export OPENAI_API_KEY=sk-sua-chave-aqui
export OPENAI_MODEL=gpt-4o
```

### Codex via ChatGPT auth

`codexplan` usa GPT-5.4 no backend Codex com alto raciocínio.
`codexspark` usa GPT-5.3 Codex Spark para voltas mais rápidas.

Se você já usa o Codex CLI, o OpenClaude lê `~/.codex/auth.json` automaticamente. Você também pode apontar outro caminho com `CODEX_AUTH_JSON_PATH` ou definir o token direto com `CODEX_API_KEY`.

```bash
export CLAUDE_CODE_USE_OPENAI=1
export OPENAI_MODEL=codexplan

# opcional se você já tem ~/.codex/auth.json
export CODEX_API_KEY=sua-chave-aqui

openclaude
```

### DeepSeek

```bash
export CLAUDE_CODE_USE_OPENAI=1
export OPENAI_API_KEY=sk-sua-chave-aqui
export OPENAI_BASE_URL=https://api.deepseek.com/v1
export OPENAI_MODEL=deepseek-chat
```

### Google Gemini via OpenRouter

```bash
export CLAUDE_CODE_USE_OPENAI=1
export OPENAI_API_KEY=sk-or-sua-chave-aqui
export OPENAI_BASE_URL=https://openrouter.ai/api/v1
export OPENAI_MODEL=google/gemini-2.0-flash-001
```

> Modelos disponíveis no OpenRouter mudam com o tempo. Se um modelo parar de funcionar, tente outro.

### Ollama

```bash
ollama pull llama3.3:70b

export CLAUDE_CODE_USE_OPENAI=1
export OPENAI_BASE_URL=http://localhost:11434/v1
export OPENAI_MODEL=llama3.3:70b
```

### Atomic Chat (local, Apple Silicon)

```bash
export CLAUDE_CODE_USE_OPENAI=1
export OPENAI_BASE_URL=http://127.0.0.1:1337/v1
export OPENAI_MODEL=nome-do-modelo
```

Sem necessidade de chave de API para modelos locais do Atomic Chat.

Ou use o lançador por perfil:

```bash
bun run dev:atomic-chat
```

Baixe o Atomic Chat em [atomic.chat](https://atomic.chat/). O app precisa estar rodando com um modelo carregado antes de lançar o OpenClaude.

### LM Studio

```bash
export CLAUDE_CODE_USE_OPENAI=1
export OPENAI_BASE_URL=http://localhost:1234/v1
export OPENAI_MODEL=nome-do-modelo
```

### Together AI

```bash
export CLAUDE_CODE_USE_OPENAI=1
export OPENAI_API_KEY=sua-chave-aqui
export OPENAI_BASE_URL=https://api.together.xyz/v1
export OPENAI_MODEL=meta-llama/Llama-3.3-70B-Instruct-Turbo
```

### Groq

```bash
export CLAUDE_CODE_USE_OPENAI=1
export OPENAI_API_KEY=gsk_sua-chave-aqui
export OPENAI_BASE_URL=https://api.groq.com/openai/v1
export OPENAI_MODEL=llama-3.3-70b-versatile
```

### Mistral

```bash
export CLAUDE_CODE_USE_OPENAI=1
export OPENAI_API_KEY=sua-chave-aqui
export OPENAI_BASE_URL=https://api.mistral.ai/v1
export OPENAI_MODEL=mistral-large-latest
```

### Azure OpenAI

```bash
export CLAUDE_CODE_USE_OPENAI=1
export OPENAI_API_KEY=sua-chave-azure
export OPENAI_BASE_URL=https://seu-recurso.openai.azure.com/openai/deployments/seu-deploy/v1
export OPENAI_MODEL=gpt-4o
```

---

## Variáveis de Ambiente

| Variável | Obrigatória | Descrição |
|----------|------------|-----------|
| `CLAUDE_CODE_USE_OPENAI` | Sim | Defina como `1` para ativar o provedor OpenAI |
| `OPENAI_API_KEY` | Sim* | Sua chave API (*não precisa para modelos locais como Ollama e Atomic Chat) |
| `OPENAI_MODEL` | Sim | Nome do modelo, como `gpt-4o`, `deepseek-chat` ou `llama3.3:70b` |
| `OPENAI_BASE_URL` | Não | Endpoint da API. Padrão: `https://api.openai.com/v1` |
| `CODEX_API_KEY` | Só Codex | Token de acesso ao Codex ou ChatGPT |
| `CODEX_AUTH_JSON_PATH` | Só Codex | Caminho do arquivo `auth.json` do Codex CLI |
| `CODEX_HOME` | Só Codex | Pasta alternativa do Codex |
| `OPENCLAUDE_DISABLE_CO_AUTHORED_BY` | Não | Remove o rodapé `Co-Authored-By` nos commits git |

Você também pode usar `ANTHROPIC_MODEL` para trocar o modelo. `OPENAI_MODEL` tem prioridade.

---

## Endurecimento (Hardening)

Use esses comandos para validar sua configuração e pegar problemas cedo:

```bash
# Checagem rápida de startup
bun run smoke

# Valida provedor + conectividade
bun run doctor:runtime

# Diagnostics em formato JSON (pra máquina)
bun run doctor:runtime:json

# Salva relatório em reports/doctor-runtime.json
bun run doctor:report

# Checagem completa de hardening (smoke + runtime doctor)
bun run hardening:check

# Hardening estrito (inclui typecheck do projeto)
bun run hardening:strict
```

**Notas:**

- `doctor:runtime` falha rápido se `CLAUDE_CODE_USE_OPENAI=1` mas a chave é placeholder ou está faltando para provedores não-locais
- Provedores locais como `http://localhost:11434/v1` e `http://127.0.0.1:1337/v1` podem rodar sem `OPENAI_API_KEY`
- Perfis Codex validam `CODEX_API_KEY` ou o arquivo de auth do Codex CLI e testam `POST /responses` ao invés de `GET /models`

---

## Perfis de Provedor

Use os lançadores por perfil pra evitar configuração manual repetida:

```bash
# Bootstrap inicial (prefere Ollama local ou OpenAI)
bun run profile:init

# Vê qual o melhor provedor/modelo pro seu objetivo
bun run profile:recommend -- --goal coding --benchmark

# Aplica automaticamente o melhor provedor pro seu objetivo
bun run profile:auto -- --goal latency

# Bootstrap pro Codex (usa padrão codexplan e ~/.codex/auth.json)
bun run profile:codex

# Bootstrap OpenAI com chave explícita
bun run profile:init -- --provider openai --api-key sk-sua-chave

# Bootstrap Ollama com modelo customizado
bun run profile:init -- --provider ollama --model llama3.1:8b

# Bootstrap Ollama com seleção inteligente de modelo
bun run profile:init -- --provider ollama --goal coding

# Bootstrap Atomic Chat (detecta modelo rodando automaticamente)
bun run profile:init -- --provider atomic-chat

# Bootstrap Codex com modelo rápido
bun run profile:init -- --provider codex --model codexspark

# Lança com perfil salvo (.openclaude-profile.json)
bun run dev:profile

# Perfil Codex (usa CODEX_API_KEY ou ~/.codex/auth.json)
bun run dev:codex

# Perfil OpenAI (precisa de OPENAI_API_KEY no terminal)
bun run dev:openai

# Perfil Ollama (padrão: localhost:11434, llama3.1:8b)
bun run dev:ollama

# Perfil Atomic Chat (Apple Silicon em 127.0.0.1:1337)
bun run dev:atomic-chat
```

`profile:recommend` classifica modelos Ollama instalados por `latency`, `balanced` ou `coding`, e `profile:auto` pode salvar a recomendação automaticamente.

Se nenhum perfil existe ainda, `dev:profile` usa os mesmos padrões inteligentes para escolher o modelo inicial.

Use `--provider ollama` quando quiser rodar só local. O modo automático volta pro OpenAI quando não há modelo local viável.

Use `--provider atomic-chat` quando quiser Atomic Chat como provedor local pro Apple Silicon.

Use `profile:codex` ou `--provider codex` quando quiser o backend Codex do ChatGPT.

`dev:openai`, `dev:ollama`, `dev:atomic-chat` e `dev:codex` rodam `doctor:runtime` primeiro e só abrem o app se tudo passar.

- Pra `dev:ollama`, certifique-se que o Ollama tá rodando antes de lançar
- Pra `dev:atomic-chat`, certifique-se que o Atomic Chat tá rodando com modelo carregado

---

## Links

- [Repositório](https://github.com/touchzada/Claudinho)
- [Guia em Português](../GUIA_INICIO.md)
