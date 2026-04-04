import type { Command } from '../../commands.js'

const memory: Command = {
  type: 'local-jsx',
  name: 'memory',
  description: 'Editar arquivos de memória do Claudinho',
  load: () => import('./memory.js'),
}

export default memory
