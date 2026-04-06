import type { Tools } from '../../Tool.js'
import { resolveAgentTools } from '../../tools/AgentTool/agentToolUtils.js'
import type {
  AgentDefinition,
  CustomAgentDefinition,
} from '../../tools/AgentTool/loadAgentsDir.js'
import { getAgentSourceDisplayName } from './utils.js'

export type AgentValidationResult = {
  isValid: boolean
  errors: string[]
  warnings: string[]
}

export function validateAgentType(agentType: string): string | null {
  if (!agentType) {
    return 'Tipo de agente é obrigatório'
  }

  if (!/^[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]$/.test(agentType)) {
    return 'Tipo de agente deve começar e terminar com caracteres alfanuméricos e conter apenas letras, números e hífens'
  }

  if (agentType.length < 3) {
    return 'Tipo de agente deve ter pelo menos 3 caracteres'
  }

  if (agentType.length > 50) {
    return 'Tipo de agente deve ter menos de 50 caracteres'
  }

  return null
}

export function validateAgent(
  agent: Omit<CustomAgentDefinition, 'location'>,
  availableTools: Tools,
  existingAgents: AgentDefinition[],
): AgentValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  // Validate agent type
  if (!agent.agentType) {
    errors.push('Tipo de agente é obrigatório')
  } else {
    const typeError = validateAgentType(agent.agentType)
    if (typeError) {
      errors.push(typeError)
    }

    // Check for duplicates (excluding self for editing)
    const duplicate = existingAgents.find(
      a => a.agentType === agent.agentType && a.source !== agent.source,
    )
    if (duplicate) {
      errors.push(
        `Agent type "${agent.agentType}" already exists in ${getAgentSourceDisplayName(duplicate.source)}`,
      )
    }
  }

  // Validate description
  if (!agent.whenToUse) {
    errors.push('Descrição (description) é obrigatória')
  } else if (agent.whenToUse.length < 10) {
    warnings.push(
      'Descrição deve ser mais descritiva (pelo menos 10 caracteres)',
    )
  } else if (agent.whenToUse.length > 5000) {
    warnings.push('Descrição é muito longa (mais de 5000 caracteres)')
  }

  // Validate tools
  if (agent.tools !== undefined && !Array.isArray(agent.tools)) {
    errors.push('Tools devem ser um array')
  } else {
    if (agent.tools === undefined) {
      warnings.push('Agente tem acesso a todas as ferramentas')
    } else if (agent.tools.length === 0) {
      warnings.push(
        'Nenhuma ferramenta selecionada - agente terá capacidades muito limitadas',
      )
    }

    // Check for invalid tools
    const resolvedTools = resolveAgentTools(agent, availableTools, false)

    if (resolvedTools.invalidTools.length > 0) {
      errors.push(`Ferramentas inválidas: ${resolvedTools.invalidTools.join(', ')}`)
    }
  }

  // Validate system prompt
  const systemPrompt = agent.getSystemPrompt()
  if (!systemPrompt) {
    errors.push('Prompt do sistema é obrigatório')
  } else if (systemPrompt.length < 20) {
    errors.push('Prompt do sistema é muito curto (mínimo 20 caracteres)')
  } else if (systemPrompt.length > 10000) {
    warnings.push('Prompt do sistema é muito longo (mais de 10.000 caracteres)')
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  }
}
