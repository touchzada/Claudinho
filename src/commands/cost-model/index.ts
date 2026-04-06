import type { Command } from '../../commands.js'

const costModel = {
  type: 'local',
  name: 'cost-model',
  description: 'Configurar custo customizado pra modelo nao mapeado',
  argumentHint: '<model> <input $> <output $>',
  supportsNonInteractive: true,
  load: () => import('./cost-model.js'),
} satisfies Command

export default costModel
