import type { Command } from '../../commands.js'

const files = {
  type: 'local',
  name: 'files',
  description: 'Listar todos os arquivos atualmente no contexto',
  isEnabled: () => process.env.USER_TYPE === 'ant',
  supportsNonInteractive: true,
  load: () => import('./files.js'),
} satisfies Command

export default files
