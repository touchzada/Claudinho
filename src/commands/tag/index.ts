import type { Command } from '../../commands.js'

const tag = {
  type: 'local-jsx',
  name: 'tag',
  description: 'Toggle a searchable tag on the atual sessão',
  isEnabled: () => process.env.USER_TYPE === 'ant',
  argumentHint: '<tag-name>',
  load: () => import('./tag.js'),
} satisfies Command

export default tag
