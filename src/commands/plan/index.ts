import type { Command } from '../../commands.js'

const plan: Command = {
  type: 'local-jsx',
  name: 'plan',
  description: 'Ativar ou desativar plan mode, inspecionar o plano atual ou iniciar planejamento profundo',
  argumentHint: '[deep <prompt>|list|open [slug]|off]',
  load: () => import('./plan.js'),
}

export default plan
