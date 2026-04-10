import type { Command } from '../../commands.js'

const promax = {
  type: 'local-jsx',
  name: 'promax',
  aliases: ['pmx'],
  description:
    'Alterna o modo ProMax da sessao: prompt agressivo, mais zoeira e skills proativas',
  argumentHint: '[on|off|toggle|status]',
  immediate: true,
  load: () => import('./promax.js'),
} satisfies Command

export default promax
