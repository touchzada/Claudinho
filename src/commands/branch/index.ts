import { feature } from 'bun:bundle'
import type { Command } from '../../commands.js'

const branch = {
  type: 'local-jsx',
  name: 'branch',
  // 'fork' alias only when /fork doesn't exist as its own command
  aliases: feature('FORK_SUBAGENT') ? [] : ['fork'],
  description: 'Criar um branch da conversa atual neste ponto',
  argumentHint: '[name]',
  load: () => import('./branch.js'),
} satisfies Command

export default branch
