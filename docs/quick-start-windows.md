# Início Rápido do OpenClaude no Windows

Este guia usa o PowerShell do Windows.

## 1. Instale o Node.js

Instale o Node.js 20 ou mais novo em:

- `https://nodejs.org/`

Então verifique:

```powershell
node --version
npm --version
```

Se aparecer um número como `v20.x` ou maior, tá pronto. Se não, reinstale e reinicie o terminal.

## 2. Instale o OpenClaude

```powershell
npm install -g @gitlawb/openclaude
```

## 3. Escolha um Provedor

### Opção A: OpenAI

Troque `sk-your-key-here` pela sua chave real.

```powershell
$env:CLAUDE_CODE_USE_OPENAI="1"
$env:OPENAI_API_KEY="sk-your-key-here"
$env:OPENAI_MODEL="gpt-4o"

openclaude
```

### Opção B: DeepSeek

```powershell
$env:CLAUDE_CODE_USE_OPENAI="1"
$env:OPENAI_API_KEY="sk-your-key-here"
$env:OPENAI_BASE_URL="https://api.deepseek.com/v1"
$env:OPENAI_MODEL="deepseek-chat"

openclaude
```

### Opção C: Ollama

Instale o Ollama primeiro em `https://ollama.com/download/windows`.

Então execute:

```powershell
ollama pull llama3.1:8b

$env:CLAUDE_CODE_USE_OPENAI="1"
$env:OPENAI_BASE_URL="http://localhost:11434/v1"
$env:OPENAI_MODEL="llama3.1:8b"

openclaude
```

Sem necessidade de chave de API para modelos locais do Ollama.

## 4. Se `openclaude` Não For Encontrado

Feche o PowerShell, abra um novo e tente de novo:

```powershell
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

```powershell
npm install -g @gitlawb/openclaude@latest
```

## 7. Desinstalando o OpenClaude

```powershell
npm uninstall -g @gitlawb/openclaude
```

## Quer Mais Controle?

Veja: [Configuração Avançada](advanced-setup.md)
