# Claudinho

> **Qualquer provedor. Qualquer modelo. De graça, PRA SEMPRE.**

O Claudinho é um projeto open-source que permite usar um assistente de IA no terminal com **qualquer modelo de linguagem** — não só com um provedor específico.

Com o Claudinho você pode usar GPT-4o, DeepSeek, Gemini, Llama, Mistral, Codex e 200+ modelos que falam a API da OpenAI, tudo com a mesma experiência de terminal.

---

## Começando por aqui

Se você é novo em terminais ou quer o caminho mais fácil, comece pelo **Guia Completo em Português**:

- [Guia de Instalação e Configuração (PT-BR)](GUIA_INICIO.md)

Se você quer builds do código fonte, Bun, perfis locais, diagnósticos ou exemplos completos de provedores:

- [Configuração Avançada](docs/advanced-setup.md)

---

## Instalar

Para a maioria dos usuários, instale pelo npm:

```bash
npm install -g @touchzada/claudinho
```

Depois de instalar, rode:

```bash
claudinho
```

Se instalar via npm e depois ver `ripgrep not found`, instale o ripgrep no sistema e confirme que `rg --version` funciona no mesmo terminal antes de abrir o Claudinho.

---

## Configuração rápida

### Windows PowerShell

```powershell
npm install -g @touchzada/claudinho

$env:CLAUDE_CODE_USE_OPENAI="1"
$env:OPENAI_API_KEY="sk-sua-chave-aqui"
$env:OPENAI_MODEL="gpt-4o"

claudinho
```

### macOS / Linux

```bash
npm install -g @touchzada/claudinho

export CLAUDE_CODE_USE_OPENAI=1
export OPENAI_API_KEY=sk-sua-chave-aqui
export OPENAI_MODEL=gpt-4o

claudinho
```

Isso é suficiente para começar com a OpenAI.

---

## Escolha seu provedor

### OpenAI

Melhor opção se você já tem uma chave de API da OpenAI.
Guia completo: [Guia PT-BR](GUIA_INICIO.md#opção-a-usando-openai-chatgpt)

### Ollama

Melhor opção para rodar modelos localmente no seu PC, grátis.
Guia completo: [Guia PT-BR](GUIA_INICIO.md#opção-d-usando-ollama-rodando-localmente-no-seu-pc--grátis)

### Codex

Melhor opção se você já usa o Codex CLI ou o backend ChatGPT Codex.
Detalhes: [Configuração Avançada](docs/advanced-setup.md)

### OpenRouter

Melhor opção para acessar 200+ modelos com uma única chave.
Detalhes: [Configuração Avançada](docs/advanced-setup.md)

### LM Studio

Para usar modelos locais servidos pelo LM Studio.
Detalhes: [Configuração Avançada](docs/advanced-setup.md)

### Groq, Together AI, Mistral, Azure OpenAI

Todos suportados via protocolo OpenAI. Veja exemplos na [Configuração Avançada](docs/advanced-setup.md).

---

## O que funciona

- **Todas as ferramentas**: Bash, FileRead, FileWrite, FileEdit, Glob, Grep, WebFetch, WebSearch, Agent, MCP, LSP, NotebookEdit, Tasks
- **Streaming**: Respostas em tempo real
- **Chamada de ferramentas**: Cadeias multi-etapa (o modelo chama ferramentas, recebe resultados e continua)
- **Imagens**: Suporte a modelos de visão (base64 e URL)
- **Comandos de barra**: /commit, /review, /compact, /diff, /doctor, etc.
- **Sub-agentes**: O AgentTool gera sub-agentes usando o mesmo provedor
- **Memória**: Sistema de memória persistente
- **Tradução PT-BR**: Interface completa em português brasileiro

## O que é diferente

- **Sem modo de raciocínio estendido**: A funcionalidade específica da Anthropic está desativada
- **Sem cache de prompt**: Headers de cache específicos da Anthropic são ignorados
- **Sem recursos beta**: Headers beta específicos da Anthropic são ignorados
- **Limite de tokens**: Padrão de 32K de saída máxima — alguns modelos podem ter limites menores, o que é tratado automaticamente

---

## Características especiais

- **Histórico de conversas**: Navegue por sessões anteriores
- 🛡️ **Guardrails removidos**: Modo bypass para execução sem confirmação de cada ação
- 🇧🇷 **Traduções para PT-BR**: Interface e mensagens completamente em português brasileiro
- **Assistente de provedor**: Configure seu provedor com um assistente interativo
- **Classificador automático**: IA analisa e aprova/neia ações automaticamente
- **Diagnósticos integrados**: Comandos de validação para detectar problemas cedo

---

## Como funciona

O Claudinho usa um adaptador compatível com a API da OpenAI (`src/services/api/openaiShim.ts`) que traduz a comunicação entre a IA e o terminal:

```
Sistema de Ferramentas do Claudinho
        |
        v
  Interface SDK (duck-typed)
        |
        v
  openaiShim.ts  <-- traduz os formatos
        |
        v
  API OpenAI Chat Completions
        |
        v
  Qualquer modelo compatível
```

O adaptador traduz:
- Blocos de mensagem Anthropic → Mensagens OpenAI
- Chamadas de ferramenta Anthropic → Chamadas de função OpenAI
- Streaming SSE OpenAI → Eventos de stream compatíveis
- Prompts de sistema → Mensagens de sistema OpenAI

O restante do sistema não sabe que está se comunicando com outro modelo.

---

## Qualidade dos modelos

Nem todos os modelos são iguais para uso com ferramentas. Aqui está um guia aproximado:

| Modelo | Chamada de Ferramentas | Qualidade de Código | Velocidade |
|--------|----------------------|-------------------|------------|
| GPT-4o | Excelente | Excelente | Rápido |
| DeepSeek-V3 | Ótimo | Ótimo | Rápido |
| Gemini 2.0 Flash | Ótimo | Bom | Muito Rápido |
| Llama 3.3 70B | Bom | Bom | Médio |
| Mistral Large | Bom | Bom | Rápido |
| GPT-4o-mini | Bom | Bom | Muito Rápido |
| Qwen 2.5 72B | Bom | Bom | Médio |
| Modelos menores (<7B) | Limitado | Limitado | Muito Rápido |

Para melhores resultados, use modelos com bom suporte a chamada de ferramentas.

---

## Arquitetura principal

```
src/services/api/openaiShim.ts   — Adaptador compatível com API OpenAI
src/services/api/client.ts       — Roteia para o adaptador quando CLAUDE_CODE_USE_OPENAI=1
src/utils/model/providers.ts     — Tipo de provedor 'openai'
src/utils/model/configs.ts       — Mapeamentos de modelos OpenAI
src/utils/model/model.ts         — Respeita OPENAI_MODEL para padrões
src/utils/auth.ts                — Reconhece OpenAI como provedor válido
```

---

## Links

- [Repositório](https://github.com/touchzada/Claudinho)
- [Reportar bugs](https://github.com/touchzada/Claudinho/issues)
- [Guia em Português](GUIA_INICIO.md)
- [Configuração Avançada](docs/advanced-setup.md)

---

## Licença

Este projeto é fornecido para fins educacionais e de pesquisa. As adições do adaptador OpenAI são de domínio público.

---

## Estrutura de diretórios e arquivos

Aqui está explicado cada arquivo importante do projeto, pra você entender o que é o quê:

### Executar o Claudinho

- **`bin/claudinho`** — É o script principal que roda o Claudinho. Ele é um arquivo JavaScript (`.mjs` compatível) que começa com `#!/usr/bin/env node` — isso diz pro sistema: "execute este arquivo com o Node.js". Quando você instala via npm, este arquivo fica registrado como o comando `claudinho` no seu PATH. Ele apenas verifica se o arquivo compilado `dist/cli.mjs` existe e o executa. Se o build não foi feito, ele mostra uma mensagem amigável pedindo para rodar `bun run build`.

- **`bin/claudinho.cmd`** — Este é um wrapper (um "embrulho") para o Windows. No Windows, o sistema não reconhece a shebang (`#!/usr/bin/env node`) dos scripts Unix, então o `npm` ignora o `bin/claudinho` ao publicar o pacote no Windows. O `.cmd` é um script do Windows (batch) que faz a mesma coisa: chama o `node` com o arquivo `bin/claudinho`. Por que ele existe? É uma correção de compatibilidade — o npm no Windows não detecta o permission bit Unix (755) que marca um arquivo como executável, então ele "corrige" automaticamente removendo o binário. O `.cmd` contorna isso porque o Windows sabe executar batch nativamente.

### Código fonte principal

- **`src/constants/prompts.ts`** — Aqui fica o **system prompt** — é o texto que diz pro Claudinho como ele deve se comportar, que personalidade ele tem, que regras seguir, como falar. É o "cérebro comportamental" dele. Quando a IA te diz "E aí, mano!", ela tá lendo o que tá escrito aqui.

- **`src/constants/personality.ts`** — O arquivo de **personalidade**. Contém o mapeamento de gírias por região brasileira, as regras de humor, as instruções de como o Claudinho deve brincar com o usuário, e o sistema de memória que guarda nome e cidade do usuário entre sessões.

- **`src/i18n/pt-BR.ts`** — O sistema de **tradução completo pro português brasileiro**. Traduz menus, mensagens de erro, atalhos, permissões, tooltips — basicamente toda a interface visual que aparece no terminal.

- **`src/services/api/openaiShim.ts`** — O **adaptador principal** que faz o Claudinho funcionar com qualquer modelo. Traduz o formato de mensagem da Anthropic para o formato OpenAI e vice-versa. Sem isso, só funcionaria com o Claude.

- **`src/entrypoints/cli.tsx`** — O **ponto de entrada** do Claudinho. É o primeiro arquivo que roda quando você digita o comando. Ele configura o ambiente, valida provedores, lê as configurações e inicia a interface.

### Build e scripts

- **`scripts/build.ts`** — O script que **compila** todo o Claudinho. Usa o Bun Bundle para juntar todos os arquivos TypeScript em um único `dist/cli.mjs`. Remove telemetria, injeta constantes de versão, e cria stubs para módulos nativos que não podem ser empacotados.

- **`scripts/no-telemetry-plugin.ts`** — Plugin do build que **remove toda a telemetria**. Substitui 14 módulos de coleta de dados da Anthropic por funções vazias — zero calls pra API da Anthropic, zero rastreamento. É como se o Claudinho fosse completamente silencioso em dados.

- **`scripts/provider-launch.ts`** — Script que **lança o Claudinho com um perfil de provedor**. Útil pra desenvolvimento — ex: `bun run dev:openai` começa direto com OpenAI configurada.

- **`scripts/provider-bootstrap.ts`** — O **assistente interativo de configuração** (`bun run profile:init`). Pergunta qual provedor quer, pede a chave, escolhe modelo e salva.

- **`scripts/provider-recommend.ts`** — O **recomendador de provedor**. Analisa os modelos Ollama instalados e sugere o melhor pro seu caso (velocidade, código, qualidade).

- **`scripts/system-check.ts`** — O **"doctor"**. Checa se o provedor tá configurado, se a API responde, se a internet funciona. Útil pra diagnosticar problemas.

- **`scripts/logo-edit.ts`** e **`scripts/logo-edit-v2.ts`** — Scripts que geram o **logo customizado** da tela de início com gradient RGB.

### Configuração e documentação

- **`package.json`** — O arquivo que diz pro npm: "isso é um pacote chamado `@touchzada/claudinho`, versão 0.1.8, que roda com Node.js 20+, e quando instalar globalmente, crie o comando `claudinho`".

- **`.env.example`** — Modelo de arquivo de configuração com **exemplos de cada provedor**. Mostra todas as variáveis de ambiente possíveis e como configurar cada um.

- **`README.md`** — Este arquivo. Documentação principal do projeto, com instruções de instalação, provedores, features e arquitetura.

- **`GUIA_INICIO.md`** — Guia completo em **português brasileiro**, detalhado passo a passo pra quem nunca viu um terminal.

- **`docs/advanced-setup.md`** — Documentação em português pra usuários avançados — builds do fonte, Bun, perfis de provedores, variáveis de ambiente completas.

- **`docs/non-technical-setup.md`** — Guia simplificado em português pra quem não é técnico.

- **`docs/quick-start-windows.md`** — Instalação rápida em português específica pro Windows.

- **`docs/quick-start-mac-linux.md`** — Instalação rápida em português específica pro macOS e Linux.

- **`LICENSE`** — Licença MIT. Diz que qualquer pessoa pode usar, modificar e distribuir este código sem restrições.

### Arquivos gerados pelo build

- **`dist/cli.mjs`** — O Claudinho **compilado**. Um único arquivo JavaScript com todo o código empacotado. É o que roda na instalação final do usuário.

- **`dist/cli.mjs.map`** — O **sourcemap**. Um arquivo que relaciona o código compilado de volta aos arquivos fonte originais. Útil quando dá erro — mostra a linha exata no código original em vez de apontar pro código compilado que é ilegível.

### Arquivos auxiliares do bin

- **`bin/import-specifier.mjs`** — Stub de importação pro Node.js resolver corretamente os módulos ESM. Necessário pro pacote funcionar sem erros em algumas configurações de Node.

- **`bin/import-specifier.test.mjs`** — Teste unitário do stub acima. Verifica que a importação funciona corretamente.
