import type { Command } from '../../commands.js'

const tasks = {
  type: 'local-jsx',
  name: 'tasks',
  aliases: ['bashes'],
  description: 'Listar e gerenciar tarefas em background',
  load: () => import('./tasks.js'),
} satisfies Command

export default tasks
