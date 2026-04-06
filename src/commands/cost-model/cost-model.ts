import {
  registerCustomModelCost,
  removeUserModelCost,
  listUserModelCosts,
} from '../../utils/modelCost.js'
import { formatModelPricing } from '../../utils/modelCost.js'
import type { LocalCommandCall } from '../../types/command.js'

export const call: LocalCommandCall = async (_onDone, _context, args) => {
  const trimmed = args?.trim() || ''

  if (!trimmed || /^(--help|-h|help)$/i.test(trimmed)) {
    return {
      type: 'text',
      value:
        'Uso: /cost-model <model> <input $/Mtok> <output $/Mtok>\n' +
        '  /cost-model meu-modelo 2 10   -> Configura $2 input / $10 output por Mtok\n' +
        '  /cost-model list              -> Lista custos customizados\n' +
        '  /cost-model remove <model>    -> Remove custo customizado\n',
    }
  }

  const parts = trimmed.split(/\s+/)

  // /cost-model list
  if (parts[0] === 'list') {
    const entries = listUserModelCosts()
    if (entries.length === 0) {
      return { type: 'text', value: 'Nenhum custo customizado configurado.' }
    }
    const lines = ['Custos customizados configurados:', '']
    for (const { model, costs } of entries) {
      const pricing = formatModelPricing({
        ...costs,
        promptCacheWriteTokens: costs.inputTokens * 1.25,
        promptCacheReadTokens: costs.inputTokens * 0.10,
        webSearchRequests: 0.01,
      } as Parameters<typeof formatModelPricing>[0])
      lines.push(`  ${model} -> ${pricing}`)
    }
    return { type: 'text', value: lines.join('\n') }
  }

  // /cost-model remove <model>
  if (parts[0] === 'remove') {
    if (parts.length < 2) {
      return { type: 'text', value: 'Uso: /cost-model remove <model>' }
    }
    const removed = removeUserModelCost(parts.slice(1).join(' '))
    if (removed) {
      return { type: 'text', value: `Custo removido para "${parts.slice(1).join(' ')}".` }
    }
    return { type: 'text', value: `Nenhum custo customizado encontrado para "${parts.slice(1).join(' ')}".` }
  }

  // /cost-model <model> <input> <output>
  if (parts.length < 3) {
    return {
      type: 'text',
      value:
        'Precisa de 3 argumentos: modelo, custo input ($/Mtok), custo output ($/Mtok).\n' +
        'Exemplo: /cost-model meu-modelo 2 10',
    }
  }

  const modelName = parts[0]
  const inputCost = parseFloat(parts[1])
  const outputCost = parseFloat(parts[2])

  if (isNaN(inputCost) || isNaN(outputCost)) {
    return {
      type: 'text',
      value: 'Os custos precisam ser numeros validos (ex: 2.5 10).',
    }
  }

  if (inputCost < 0 || outputCost < 0) {
    return {
      type: 'text',
      value: 'Os custos nao podem ser negativos.',
    }
  }

  registerCustomModelCost(modelName, inputCost, outputCost)

  const pricing = `$${inputCost} input / $${outputCost} output por Mtok`
  return {
    type: 'text',
    value: `Custo configurado para "${modelName}": ${pricing}\nO aviso de modelo desconhecido foi removido.`,
  }
}
