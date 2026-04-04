import type { Command } from '../../commands.js'

const skills = {
  type: 'local-jsx',
  name: 'skills',
  description: 'Listar skills disponíveis',
  load: () => import('./skills.js'),
} satisfies Command

export default skills
