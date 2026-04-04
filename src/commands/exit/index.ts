import type { Command } from '../../commands.js'

const exit = {
  type: 'local-jsx',
  name: 'exit',
  aliases: ['quit'],
  description: 'Sair do REPL',
  immediate: true,
  load: () => import('./exit.js'),
} satisfies Command

export default exit
