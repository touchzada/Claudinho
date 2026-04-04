# Início Rápido do OpenClaude no macOS e Linux

Este guia usa um terminal padrão como iTerm, Terminal, bash ou zsh.

## 1. Instale o Node.js

Instale o Node.js 20 ou mais novo em:

- `https://nodejs.org/`

No Mac, se usa Homebrew:

```bash
brew install node
```

Então verifique:

```bash
node --version
npm --version
```

## 2. Instale o OpenClaude

```bash
npm install -g @gitlawb/openclaude
```

## 3. Escolha um Provedor

### Opção A: OpenAI

Troque `sk-your-key-here` pela sua chave real.

```bash
export CLAUDE_CODE_USE_OPENAI=1
export OPENAI_API_KEY=sk-your-key-here
export OPENAI_MODEL=gpt-4o

openclaude
```

### Opção B: DeepSeek

```bash
export CLAUDE_CODE_USE_OPENAI=1
export OPENAI_API_KEY=sk-your-key-here
export OPENAI_BASE_URL=https://api.deepseek.com/v1
export OPENAI_MODEL=deepseek-chat

openclaude
```

### Opção C: Ollama

Instale o Ollama primeiro em `https://ollama.com/download`.

Então execute:

```bash
ollama pull llama3.1:8b

export CLAUDE_CODE_USE_OPENAI=1
export OPENAI_BASE_URL=http://localhost:11434/v1
export OPENAI_MODEL=llama3.1:8b

openclaude
```

Sem necessidade de chave de API para modelos locais do Ollama.

## 4. Se `openclaude` Não For Encontrado

Feche o terminal, abra um novo e tente de novo:

```bash
openclaude
```

## 5. Se o Provedor Falhar

Verifique o básico:

### Para OpenAI ou DeepSeek

- certifique-se que a chave é real
- certifique-se que copiou ela inteira

### Para Ollama

- certifique-se que o Ollama tá instalado
- certifique-se que o Ollama tá rodando
- certifique-se que o modelo foi baixado com `ollama pull`

## 6. Atualizando o OpenClaude

```bash
npm install -g @gitlawb/openclaude@latest
```

## 7. Desinstalando o OpenClaude

```bash
npm uninstall -g @gitlawb/openclaude
```

## Quer Mais Controle?

Veja: [Configuração Avançada](advanced-setup.md)
