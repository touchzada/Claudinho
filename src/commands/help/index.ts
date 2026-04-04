import type { Command } from '../../commands.js'

const help = {
  type: 'local-jsx',
  name: 'help',
  description: 'Mostrar ajuda e comandos disponíveis',
  load: () => import('./help.js'),
} satisfies Command

export default help
