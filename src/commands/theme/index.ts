import type { Command } from '../../commands.js'

const theme = {
  type: 'local-jsx',
  name: 'theme',
  description: 'Mudar o tema',
  load: () => import('./theme.js'),
} satisfies Command

export default theme
