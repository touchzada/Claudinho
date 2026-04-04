import type { Command } from '../../commands.js'

const command = {
  name: 'vim',
  description: 'Alternar entre modos de edição Vim e Normal',
  supportsNonInteractive: false,
  type: 'local',
  load: () => import('./vim.js'),
} satisfies Command

export default command
