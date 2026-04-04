import type { Command } from '../../commands.js'

export default {
  type: 'local-jsx',
  name: 'diff',
  description: 'Ver mudanças não commitadas e diffs por turno',
  load: () => import('./diff.js'),
} satisfies Command
