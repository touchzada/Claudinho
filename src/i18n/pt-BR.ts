/**
 * Traduções PT-BR para Claudinho
 * 
 * Sistema de internacionalização simples para traduzir
 * comandos, mensagens e interface do usuário.
 */

export const translations = {
  // Comandos principais
  commands: {
    help: {
      name: 'help',
      description: 'Mostrar ajuda e comandos disponíveis',
    },
    add: {
      name: 'add',
      description: 'Adicionar um novo diretório de trabalho',
    },
    'add-dir': {
      name: 'add-dir',
      description: 'Adicionar um novo diretório de trabalho',
    },
    branch: {
      name: 'branch',
      description: 'Criar uma branch da conversa atual neste ponto',
    },
    clear: {
      name: 'clear',
      description: 'Limpar a conversa ou caches',
    },
    commit: {
      name: 'commit',
      description: 'Fazer commit das mudanças atuais',
    },
    config: {
      name: 'config',
      description: 'Abrir editor de configurações',
    },
    model: {
      name: 'model',
      description: 'Trocar o modelo de IA',
    },
    status: {
      name: 'status',
      description: 'Mostrar status da sessão atual',
    },
    exit: {
      name: 'exit',
      description: 'Sair do Claudinho',
    },
    quit: {
      name: 'quit',
      description: 'Sair do Claudinho',
    },
  },

  // Mensagens da UI
  ui: {
    'claude-code': 'Claudinho',
    'version': 'versão',
    'ready': 'Pronto',
    'type-help': 'digite /help para começar',
    'loading': 'Carregando',
    'error': 'Erro',
    'success': 'Sucesso',
    'warning': 'Aviso',
    'for-shortcuts': '? pra atalhos',
    'esc-to-interrupt': 'esc pra interromper',
    'esc-to-cancel': 'Esc pra cancelar',
    'esc-to-exit': 'Esc pra sair',
    'esc-to-close': 'Esc pra fechar',
    'esc-to-go-back': 'Esc pra voltar',
    'enter-to-confirm': 'Enter pra confirmar',
    'enter-to-select': 'Enter pra selecionar',
    'enter-to-continue': 'Enter pra continuar',
    'enter-to-submit': 'Enter pra enviar',
    'tab-to-amend': 'Tab pra complementar sua resposta',
    'tab-to-switch': 'Tab pra trocar',
    'double-tap-esc-to-clear': 'aperte esc duas vezes pra limpar entrada',
    'press-again-to-exit': 'Pressione {{key}} novamente pra sair',
    'up-down-to-navigate': '↑/↓ pra navegar',
  },

  // Mensagens de erro
  errors: {
    'update-required': 'Parece que sua versão do Claudinho ({{version}}) precisa de atualização.',
    'newer-version-required': 'Uma versão mais nova ({{minVersion}} ou superior) é necessária para continuar.',
    'git-bash-not-found': 'Claudinho no Windows requer git-bash (https://git-scm.com/downloads/win)',
    'auth-required': 'Sessões web do Claudinho requerem autenticação com uma conta Claude.ai',
    'run-status': 'Execute /status no Claudinho para verificar sua conta',
  },

  // Configurações (/config)
  config: {
    // Seções
    'title': 'Configurações',
    'search-placeholder': 'Buscar configurações...',
    
    // Labels das configurações
    'auto-compact': 'Auto-compactar',
    'show-tips': 'Mostrar dicas',
    'reduce-motion': 'Reduzir movimento',
    'thinking-mode': 'Modo pensamento',
    'fast-mode': 'Modo rápido',
    'prompt-suggestions': 'Sugestões de prompt',
    'speculative-execution': 'Execução especulativa',
    'rewind-code': 'Rebobinar código (checkpoints)',
    'verbose-output': 'Saída detalhada',
    'terminal-progress-bar': 'Barra de progresso no terminal',
    'show-status-in-terminal-tab': 'Mostrar status na aba do terminal',
    'show-turn-duration': 'Mostrar duração do turno',
    'default-permission-mode': 'Modo de permissão padrão',
    'use-auto-mode-during-plan': 'Usar modo automático durante planejamento',
    'respect-gitignore': 'Respeitar .gitignore no seletor de arquivos',
    'always-copy-full-response': 'Sempre copiar resposta completa (pular seletor /copy)',
    'copy-on-select': 'Copiar ao selecionar',
    'auto-update-channel': 'Canal de atualização automática',
    'theme': 'Tema',
    'local-notifications': 'Notificações locais',
    'notifications': 'Notificações',
    'push-when-idle': 'Notificar quando ocioso',
    'push-when-input-needed': 'Notificar quando precisar de entrada',
    'push-when-claude-decides': 'Notificar quando o Claudinho decidir',
    'output-style': 'Estilo de saída',
    'default-view': 'O que você vê por padrão',
    'language': 'Idioma',
    'model': 'Modelo',
    'teammate-model': 'Modelo do colega de equipe',
    'external-includes': 'Inclusões externas',
    
    // Valores de opções
    'enabled': 'Ativado',
    'disabled': 'Desativado',
    'on': 'Ligado',
    'off': 'Desligado',
    'auto': 'Automático',
    'default': 'Padrão',
    'transcript': 'Transcrição',
    'chat': 'Chat',
    'latest': 'Mais recente',
    'stable': 'Estável',
    'beta': 'Beta',
    
    // Canais de notificação
    'iterm2': 'iTerm2',
    'terminal_bell': 'Sino do terminal',
    'iterm2_with_bell': 'iTerm2 com sino',
    'kitty': 'Kitty',
    'ghostty': 'Ghostty',
    'notifications_disabled': 'Notificações desativadas',
  },

  // Provedor (/provider)
  provider: {
    'title': 'Configurar Provedor',
    'choose-provider': 'Escolha um provedor',
    'auto-detect': 'Detectar automaticamente',
    'openai': 'OpenAI',
    'gemini': 'Google Gemini',
    'ollama': 'Ollama (local)',
    'codex': 'Codex',
    'anthropic': 'Anthropic',
    'clear-config': 'Limpar configuração',
    
    // Passos do wizard
    'enter-api-key': 'Digite sua chave de API',
    'enter-base-url': 'Digite a URL base (opcional)',
    'choose-model': 'Escolha um modelo',
    'detecting': 'Detectando...',
    'checking': 'Verificando...',
    
    // Mensagens
    'api-key-required': 'Chave de API é obrigatória',
    'invalid-url': 'URL inválida',
    'detection-failed': 'Falha na detecção',
    'no-models-found': 'Nenhum modelo encontrado',
    'saved-successfully': 'Configuração salva com sucesso',
    'cleared-successfully': 'Configuração limpa com sucesso',
    
    // Labels de resumo
    'current-provider': 'Provedor atual',
    'current-model': 'Modelo atual',
    'current-endpoint': 'Endpoint atual',
    'saved-profile': 'Perfil salvo',
    'not-set': '(não configurado)',
    'none': 'nenhum',
  },

  // Ações de atalhos de teclado
  keyboardActions: {
    'expand': 'expandir',
    'manage': 'gerenciar',
    'navigate': 'navegar',
    'select': 'selecionar',
    'cancel': 'cancelar',
    'confirm': 'confirmar',
    'continue': 'continuar',
    'run in background': 'rodar em background',
    'copy': 'copiar',
    'enter text': 'digitar',
    'toggle': 'alternar',
    'view': 'visualizar',
    'foreground': 'trazer pra frente',
    'go back': 'voltar',
    'exit': 'sair',
    'open in editor': 'abrir no editor',
    'tabs': 'abas',
    'clear': 'limpar',
    'native select': 'seleção nativa',
    'submit': 'enviar',
    'search history': 'buscar histórico',
  },

  // Prompts de permissão
  permissions: {
    'do-you-want-to-make-edit': 'Você quer fazer essa edição em',
    'do-you-want-to-proceed': 'Você quer prosseguir?',
    'yes': 'Sim',
    'no': 'Não',
    'yes-allow-all-edits-session': 'Sim, permitir todas as edições durante esta sessão',
    'yes-allow-claude-edit-settings': 'Sim, e permitir que o Claudinho edite suas próprias configurações nesta sessão',
    'yes-during-session': 'Sim, durante esta sessão',
    'yes-allow-reading-from': 'Sim, permitir leitura de',
    'during-this-session': 'durante esta sessão',
    'yes-allow-all-edits-in': 'Sim, permitir todas as edições em',
    'esc-to-cancel': 'Esc pra cancelar',
    'tab-to-amend': 'Tab pra complementar sua resposta',
    'and-tell-claude-what-next': 'e diga o que fazer depois',
    'and-tell-claude-what-differently': 'e diga o que fazer diferente',
    'press-again-to-exit': 'Pressione {{key}} novamente pra sair',
    'enter-to-confirm': 'Enter pra confirmar',
    'enter-to-select': 'Enter pra selecionar',
    'enter-to-continue': 'Enter pra continuar',
    'enter-to-submit': 'Enter pra enviar',
  },

  // Help text
  help: {
    'general-commands': 'Comandos Gerais',
    'file-operations': 'Operações de Arquivo',
    'git-operations': 'Operações Git',
    'configuration': 'Configuração',
    'advanced': 'Avançado',
  },

  // Spinner Tips (dicas que aparecem enquanto o Claudinho trabalha)
  tips: {
    'new-user-warmup': 'Comece com features pequenas ou correções de bugs, peça pra eu propor um plano, e verifique as edições sugeridas',
    'plan-mode-for-complex-tasks': 'Use o Modo Planejamento pra preparar uma solicitação complexa antes de fazer mudanças. Pressione {{shortcut}} duas vezes pra ativar.',
    'shift-tab-ant': 'Aperte {{shortcut}} pra alternar entre os modos',
    'shift-tab-external': 'Aperte {{shortcut}} pra alternar entre modo padrão, aceitar edições, planejamento e pular permissões (⚠️ perigoso)',
    'default-permission-mode-config': 'Use /config pra mudar seu modo de permissão padrão (incluindo Modo Planejamento)',
    'git-worktrees': 'Use git worktrees pra rodar múltiplas sessões do Claude em paralelo.',
    'color-when-multi-clauding': 'Rodando várias sessões do Claude? Use /color e /rename pra diferenciá-las rapidinho.',
    'terminal-setup-apple': 'Execute /terminal-setup pra ativar integração conveniente do terminal como Option + Enter pra nova linha e mais',
    'terminal-setup-other': 'Execute /terminal-setup pra ativar integração conveniente do terminal como Shift + Enter pra nova linha e mais',
    'shift-enter-apple': 'Pressione Option+Enter pra enviar uma mensagem multi-linha',
    'shift-enter-other': 'Pressione Shift+Enter pra enviar uma mensagem multi-linha',
    'shift-enter-setup-apple': 'Execute /terminal-setup pra ativar Option+Enter pra novas linhas',
    'shift-enter-setup-other': 'Execute /terminal-setup pra ativar Shift+Enter pra novas linhas',
    'memory-command': 'Use /memory pra ver e gerenciar a memória do Claude',
    'theme-command': 'Use /theme pra mudar o tema de cores',
    'colorterm-truecolor': 'Tenta definir a variável de ambiente COLORTERM=truecolor pra cores mais ricas',
    'powershell-tool-env': 'Defina CLAUDE_CODE_USE_POWERSHELL_TOOL=1 pra ativar a ferramenta PowerShell (preview)',
    'status-line': 'Use /statusline pra configurar uma linha de status customizada que vai aparecer abaixo da caixa de entrada',
    'prompt-queue': 'Aperte Enter pra enfileirar mensagens adicionais enquanto o Claude tá trabalhando.',
    'enter-to-steer-in-realtime': 'Mande mensagens pro Claude enquanto ele trabalha pra guiá-lo em tempo real',
    'todo-list': 'Peça pro Claude criar uma lista de tarefas quando trabalhar em tasks complexas pra acompanhar o progresso',
    'vscode-command-install': 'Abra a Paleta de Comandos (Cmd+Shift+P) e execute "Shell Command: Install \'{{terminal}}\' command in PATH" pra ativar integração com IDE',
    'ide-upsell-external-terminal': 'Conecte o Claudinho à sua IDE · /ide',
    'install-github-app': 'Execute /install-github-app pra marcar @claudinho direto das suas issues e PRs do Github',
    'install-slack-app': 'Execute /install-slack-app pra usar o Claudinho no Slack',
    'permissions': 'Use /permissions pra pré-aprovar e pré-negar ferramentas bash, edit e MCP',
    'drag-and-drop-images': 'Sabia que você pode arrastar e soltar arquivos de imagem no seu terminal?',
    'paste-images-mac': 'Cole imagens no Claudinho usando control+v (não cmd+v!)',
    'double-esc': 'Aperte esc duas vezes pra rebobinar a conversa pra um ponto anterior no tempo',
    'double-esc-code-restore': 'Aperte esc duas vezes pra rebobinar o código e/ou conversa pra um ponto anterior no tempo',
    'continue': 'Execute claudinho --continue ou claudinho --resume pra retomar uma conversa',
    'rename-conversation': 'Nomeie suas conversas com /rename pra encontrá-las facilmente no /resume depois',
    'custom-commands': 'Crie skills adicionando arquivos .md em .claude/skills/ no seu projeto ou ~/.claude/skills/ pra skills que funcionam em qualquer projeto',
    'shift-tab-ant': 'Aperte {{shortcut}} pra alternar entre os modos',
    'shift-tab-external': 'Aperte {{shortcut}} pra alternar entre modo padrão, aceitar edições, planejamento e pular permissões (⚠️ perigoso)',
    'image-paste': 'Use {{shortcut}} pra colar imagens da sua área de transferência',
    'custom-agents': 'Use /agents pra otimizar tarefas específicas. Ex: Arquiteto de Software, Escritor de Código, Revisor de Código',
    'agent-flag': 'Use --agent <nome_agente> pra iniciar diretamente uma conversa com um subagente',
    'desktop-app': 'Execute o Claudinho localmente ou remotamente usando o app desktop: clau.de/desktop',
    'desktop-shortcut': 'Continue sua sessão no Claudinho Desktop com {{command}}',
    'web-app': 'Execute tarefas na nuvem enquanto continua codando localmente · clau.de/web',
    'mobile-app': '/mobile pra usar o Claudinho do app no seu celular',
    'opusplan-mode-reminder': 'Sua configuração de modelo padrão é Opus Plan Mode. Pressione {{shortcut}} duas vezes pra ativar o Modo Planejamento.',
    'frontend-design-plugin': 'Trabalhando com HTML/CSS? Instale o plugin frontend-design:\n{{command}}',
    'vercel-plugin': 'Trabalhando com Vercel? Instale o plugin vercel:\n{{command}}',
    'effort-high-nudge-a': 'Trabalhando em algo complicado? {{command}} dá respostas melhores de primeira',
    'effort-high-nudge-b': 'Use {{command}} pra respostas melhores de uma tacada. Pensa primeiro.',
    'subagent-fanout-nudge-a': 'Diga {{command}} e mando um time. Cada um investiga a fundo pra nada passar batido.',
    'subagent-fanout-nudge-b': 'Pra tasks grandes, fala pra {{command}}. Eles trabalham em paralelo e mantêm sua thread principal limpa.',
    'loop-command-nudge-a': '{{command}} executa qualquer prompt numa agenda recorrente. Ótimo pra monitorar deploys, cuidar de PRs, ou checar status.',
    'loop-command-nudge-b': 'Use {{command}} pra executar qualquer prompt numa agenda. Configure e esqueça.',
    'guest-passes': 'Você tem passes de convidado grátis pra compartilhar · {{command}}',
    'guest-passes-with-reward': 'Compartilhe o Claudinho e ganhe {{reward}} de uso extra · {{command}}',
    'guest-passes-no-reward': 'Você tem passes de convidado grátis pra compartilhar · {{command}}',
    'overage-credit': '{{amount}} em uso extra, por nossa conta · apps de terceiros · {{command}}',
    'feedback-command': 'Use /feedback pra nos ajudar a melhorar!',
    'important-claudemd': '[ANT-ONLY] Use o prefixo "IMPORTANT:" pra regras obrigatórias do CLAUDE.md',
    'skillify': '[ANT-ONLY] Use /skillify no final de um workflow pra transformá-lo numa skill reutilizável',
  },
} as const

export type TranslationKey = keyof typeof translations
export type CommandKey = keyof typeof translations.commands
export type UIKey = keyof typeof translations.ui
export type ErrorKey = keyof typeof translations.errors
export type HelpKey = keyof typeof translations.help
export type KeyboardActionKey = keyof typeof translations.keyboardActions
export type PermissionKey = keyof typeof translations.permissions

/**
 * Traduz uma chave para PT-BR
 */
export function t(key: string, params?: Record<string, string>): string {
  const keys = key.split('.')
  let value: any = translations
  
  for (const k of keys) {
    value = value?.[k]
    if (!value) return key // Fallback para a chave original
  }
  
  if (typeof value === 'object' && 'description' in value) {
    value = value.description
  }
  
  if (typeof value !== 'string') return key
  
  // Substituir parâmetros {{param}}
  if (params) {
    return value.replace(/\{\{(\w+)\}\}/g, (_, param) => params[param] || '')
  }
  
  return value
}

/**
 * Traduz descrição de comando
 */
export function translateCommand(commandName: string): string {
  return t(`commands.${commandName}`)
}

/**
 * Traduz mensagem de UI
 */
export function translateUI(key: UIKey): string {
  return t(`ui.${key}`)
}

/**
 * Traduz mensagem de erro
 */
export function translateError(key: ErrorKey, params?: Record<string, string>): string {
  return t(`errors.${key}`, params)
}

/**
 * Traduz ação de atalho de teclado
 */
export function translateKeyboardAction(action: string): string {
  const translated = t(`keyboardActions.${action}`)
  // Se não encontrar tradução, retorna o original
  return translated === `keyboardActions.${action}` ? action : translated
}

/**
 * Traduz texto de permissão
 */
export function translatePermission(key: string, params?: Record<string, string>): string {
  return t(`permissions.${key}`, params)
}
