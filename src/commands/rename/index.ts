import type { Command } from '../../commands.js'

const rename = {
  type: 'local-jsx',
  name: 'rename',
  description: 'Rename the atual conversation',
  immediate: true,
  argumentHint: '[name]',
  load: () => import('./rename.js'),
} satisfies Command

export default rename
