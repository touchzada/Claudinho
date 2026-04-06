# Claudinho para Usuários Não Técnicos

Este guia é para quem quer o caminho mais fácil de configuração.

Você não precisa compilar código. Não precisa usar Bun. Não precisa entender o código todo.

Se você sabe copiar e colar comandos num terminal, consegue configurar isso.

## O que o Claudinho Faz

O Claudinho permite usar um assistente de IA no terminal com diferentes provedores:

- OpenAI (ChatGPT)
- DeepSeek
- Gemini (Google)
- Ollama (rodando localmente)
- Codex

Para a maioria dos usuários, a OpenAI é a opção mais fácil.

## Antes de Começar

Você precisa de:

1. **Node.js 20 ou mais novo** instalado — baixa em <https://nodejs.org>
2. **Uma janela de terminal**
3. **Uma chave de API** do provedor que escolher (a menos que use Ollama local)

## Caminho Mais Rápido

1. Instale o Claudinho com npm
2. Defina 3 variáveis de ambiente
3. Rode `claudinho`

## Escolha seu Sistema Operacional

- Windows: [Início Rápido Windows](quick-start-windows.md)
- macOS / Linux: [Início Rápido macOS/Linux](quick-start-mac-linux.md)

## Qual Provedor Escolher?

### OpenAI

Escolha se:

- quer a configuração mais fácil
- já tem uma chave de API da OpenAI

### Ollama

Escolha se:

- quer rodar modelos localmente no seu computador
- não quer depender de um serviço na nuvem

### Codex

Escolha se:

- já usa o Codex CLI
- já tem autenticação do Codex ou ChatGPT configurada

## O que é Sucesso

Depois de rodar `claudinho`, o terminal deve iniciar e esperar sua mensagem.

A partir daí, você pode pedir para:

- explicar código
- editar arquivos
- rodar comandos
- revisar mudanças

## Problemas Comuns

### Comando `claudinho` não encontrado

**Causa:** O npm instalou, mas o terminal não reconheceu ainda.
**Solução:**
1. Feche o terminal
2. Abra um novo terminal
3. Rode `claudinho` de novo

### Chave de API inválida

**Causa:** A chave tá errada, expirada, ou foi copiada incompleta.
**Solução:**
1. Gere uma chave nova no site do provedor
2. Cole com cuidado
3. Rode `claudinho` de novo

### Ollama não funciona

**Causa:** O Ollama não tá instalado ou não tá rodando.
**Solução:**
1. Instale o Ollama em `https://ollama.com/download`
2. Inicie o Ollama
3. Baixe um modelo: `ollama pull llama3.1:8b`
4. Tente de novo

## Quer Mais Controle?

Se quer builds do código fonte, perfis de provedor avançados, diagnósticos ou Bun, veja:

- [Configuração Avançada](advanced-setup.md)
