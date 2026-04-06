import type { Command } from '../../commands.js'

const releaseNotes: Command = {
  description: 'visualizar release notes',
  name: 'release-notes',
  type: 'local',
  supportsNonInteractive: true,
  load: () => import('./release-notes.js'),
}

export default releaseNotes
