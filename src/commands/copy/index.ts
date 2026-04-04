/**
 * Copy command - minimal metadata only.
 * Implementation is lazy-loaded from copy.tsx to reduce startup time.
 */
import type { Command } from '../../commands.js'

const copy = {
  type: 'local-jsx',
  name: 'copy',
  description:
    "Copiar última resposta do Claudinho pro clipboard (ou /copy N pra N-ésima mais recente)",
  load: () => import('./copy.js'),
} satisfies Command

export default copy
