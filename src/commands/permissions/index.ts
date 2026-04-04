import type { Command } from '../../commands.js'

const permissions = {
  type: 'local-jsx',
  name: 'permissions',
  aliases: ['allowed-tools'],
  description: 'Gerenciar regras de permissão de ferramentas (allow & deny)',
  load: () => import('./permissions.js'),
} satisfies Command

export default permissions
