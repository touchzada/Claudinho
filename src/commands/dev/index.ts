import type { Command } from '../../commands.js'

const dev = {
  type: 'local-jsx',
  name: 'dev',
  aliases: ['debug'],
  description:
    'Atalho do modo dev (debug) para mostrar detalhes de request/resposta nesta sessao',
  argumentHint: '[on|off|status]',
  immediate: true,
  load: () => import('./dev.js'),
} satisfies Command

export default dev
