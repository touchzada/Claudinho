import type { Command } from '../../commands.js'
export default {
  type: 'local-jsx',
  name: 'provider',
  description: 'Configure e salve o perfil do seu provedor de IA',
  // /provider has interactive steps (wizard/dialogs) and should always render.
  // Running it as immediate can yield "(no content)" in some contexts.
  immediate: false,
  load: () => import('./provider.js'),
} satisfies Command
