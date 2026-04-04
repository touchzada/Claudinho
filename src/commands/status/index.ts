import type { Command } from '../../commands.js'

const status = {
  type: 'local-jsx',
  name: 'status',
  description:
    'Mostrar status do Claudinho incluindo versão, modelo, conta, conectividade da API e status das ferramentas',
  immediate: true,
  load: () => import('./status.js'),
} satisfies Command

export default status
