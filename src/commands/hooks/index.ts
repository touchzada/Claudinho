import type { Command } from '../../commands.js'

const hooks = {
  type: 'local-jsx',
  name: 'hooks',
  description: 'Ver configurações de hooks pra eventos de ferramentas',
  immediate: true,
  load: () => import('./hooks.js'),
} satisfies Command

export default hooks
