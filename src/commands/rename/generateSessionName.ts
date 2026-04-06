import { queryHaiku } from '../../services/api/claude.js'
import type { Message } from '../../types/message.js'
import { logForDebugging } from '../../utils/debug.js'
import { errorMessage } from '../../utils/errors.js'
import { safeParseJSON } from '../../utils/json.js'
import { extractTextContent } from '../../utils/messages.js'
import { extractConversationText } from '../../utils/sessionTitle.js'
import { asSystemPrompt } from '../../utils/systemPromptType.js'

export async function generateSessionName(
  messages: Message[],
  signal: AbortSignal,
): Promise<string | null> {
  const conversationText = extractConversationText(messages)
  if (!conversationText) {
    return null
  }

  try {
    const result = await queryHaiku({
      systemPrompt: asSystemPrompt([
        'Gere um nome curto em kebab-case (2-4 palavras) que capture o tópico principal desta conversa. Use palavras em minúsculas separadas por hífens. Exemplos: "corrigir-bug-login", "adicionar-recurso-auth", "refatorar-cliente-api", "debugar-falhas-teste". Retorne JSON com um campo "name".',
      ]),
      userPrompt: conversationText,
      outputFormat: {
        type: 'json_schema',
        schema: {
          type: 'object',
          properties: {
            name: { type: 'string' },
          },
          required: ['name'],
          additionalProperties: false,
        },
      },
      signal,
      options: {
        querySource: 'rename_generate_name',
        agents: [],
        isNonInteractiveSession: false,
        hasAppendSystemPrompt: false,
        mcpTools: [],
      },
    })

    const content = extractTextContent(result.message.content)

    const response = safeParseJSON(content)
    if (
      response &&
      typeof response === 'object' &&
      'name' in response &&
      typeof (response as { name: unknown }).name === 'string'
    ) {
      return (response as { name: string }).name
    }
    return null
  } catch (error) {
    // Haiku timeout/rate-limit/network are expected operational failures —
    // logForDebugging, not logError. Called automatically on every 3rd bridge
    // message (initReplBridge.ts), so errors here would flood the error file.
    logForDebugging(`generateSessionName failed: ${errorMessage(error)}`, {
      level: 'error',
    })
    return null
  }
}
