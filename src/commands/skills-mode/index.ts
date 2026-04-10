import type { Command } from '../../commands.js'

const skillsMode = {
  type: 'local-jsx',
  name: 'skills-mode',
  aliases: ['skillmode', 'skillsmode'],
  description:
    'Alterna o comportamento de skills na sessao: natural (opcional) ou turbo (proativo)',
  argumentHint: '[natural|turbo|on|off|toggle|status]',
  immediate: true,
  load: () => import('./skills-mode.js'),
} satisfies Command

export default skillsMode
