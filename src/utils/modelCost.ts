import type { BetaUsage as Usage } from '@anthropic-ai/sdk/resources/beta/messages/messages.mjs'
import type { AnalyticsMetadata_I_VERIFIED_THIS_IS_NOT_CODE_OR_FILEPATHS } from 'src/services/analytics/index.js'
import { logEvent } from 'src/services/analytics/index.js'
import {
  clearHasUnknownModelCost,
  setHasUnknownModelCost,
} from '../bootstrap/state.js'
import { isFastModeEnabled } from './fastMode.js'
import {
  CLAUDE_3_5_HAIKU_CONFIG,
  CLAUDE_3_5_V2_SONNET_CONFIG,
  CLAUDE_3_7_SONNET_CONFIG,
  CLAUDE_HAIKU_4_5_CONFIG,
  CLAUDE_OPUS_4_1_CONFIG,
  CLAUDE_OPUS_4_5_CONFIG,
  CLAUDE_OPUS_4_6_CONFIG,
  CLAUDE_OPUS_4_CONFIG,
  CLAUDE_SONNET_4_5_CONFIG,
  CLAUDE_SONNET_4_6_CONFIG,
  CLAUDE_SONNET_4_CONFIG,
} from './model/configs.js'
import {
  firstPartyNameToCanonical,
  getCanonicalName,
  getDefaultMainLoopModelSetting,
  type ModelShortName,
} from './model/model.js'

// @see https://platform.claude.com/docs/en/about-claude/pricing
export type ModelCosts = {
  inputTokens: number
  outputTokens: number
  promptCacheWriteTokens: number
  promptCacheReadTokens: number
  webSearchRequests: number
}

// Standard pricing tier for Sonnet models: $3 input / $15 output per Mtok
export const COST_TIER_3_15 = {
  inputTokens: 3,
  outputTokens: 15,
  promptCacheWriteTokens: 3.75,
  promptCacheReadTokens: 0.3,
  webSearchRequests: 0.01,
} as const satisfies ModelCosts

// Pricing tier for Opus 4/4.1: $15 input / $75 output per Mtok
export const COST_TIER_15_75 = {
  inputTokens: 15,
  outputTokens: 75,
  promptCacheWriteTokens: 18.75,
  promptCacheReadTokens: 1.5,
  webSearchRequests: 0.01,
} as const satisfies ModelCosts

// Pricing tier for Opus 4.5: $5 input / $25 output per Mtok
export const COST_TIER_5_25 = {
  inputTokens: 5,
  outputTokens: 25,
  promptCacheWriteTokens: 6.25,
  promptCacheReadTokens: 0.5,
  webSearchRequests: 0.01,
} as const satisfies ModelCosts

// Fast mode pricing for Opus 4.6: $30 input / $150 output per Mtok
export const COST_TIER_30_150 = {
  inputTokens: 30,
  outputTokens: 150,
  promptCacheWriteTokens: 37.5,
  promptCacheReadTokens: 3,
  webSearchRequests: 0.01,
} as const satisfies ModelCosts

// Pricing for Haiku 3.5: $0.80 input / $4 output per Mtok
export const COST_HAIKU_35 = {
  inputTokens: 0.8,
  outputTokens: 4,
  promptCacheWriteTokens: 1,
  promptCacheReadTokens: 0.08,
  webSearchRequests: 0.01,
} as const satisfies ModelCosts

// Pricing for Haiku 4.5: $1 input / $5 output per Mtok
export const COST_HAIKU_45 = {
  inputTokens: 1,
  outputTokens: 5,
  promptCacheWriteTokens: 1.25,
  promptCacheReadTokens: 0.1,
  webSearchRequests: 0.01,
} as const satisfies ModelCosts

const DEFAULT_UNKNOWN_MODEL_COST = COST_TIER_5_25

/**
 * Get the cost tier for Opus 4.6 based on fast mode.
 */
export function getOpus46CostTier(fastMode: boolean): ModelCosts {
  if (isFastModeEnabled() && fastMode) {
    return COST_TIER_30_150
  }
  return COST_TIER_5_25
}

// @[MODEL LAUNCH]: Add a pricing entry for the new model below.
// Costs from https://platform.claude.com/docs/en/about-claude/pricing
// Web search cost: $10 per 1000 requests = $0.01 per request
export const MODEL_COSTS: Record<ModelShortName, ModelCosts> = {
  [firstPartyNameToCanonical(CLAUDE_3_5_HAIKU_CONFIG.firstParty)]:
    COST_HAIKU_35,
  [firstPartyNameToCanonical(CLAUDE_HAIKU_4_5_CONFIG.firstParty)]:
    COST_HAIKU_45,
  [firstPartyNameToCanonical(CLAUDE_3_5_V2_SONNET_CONFIG.firstParty)]:
    COST_TIER_3_15,
  [firstPartyNameToCanonical(CLAUDE_3_7_SONNET_CONFIG.firstParty)]:
    COST_TIER_3_15,
  [firstPartyNameToCanonical(CLAUDE_SONNET_4_CONFIG.firstParty)]:
    COST_TIER_3_15,
  [firstPartyNameToCanonical(CLAUDE_SONNET_4_5_CONFIG.firstParty)]:
    COST_TIER_3_15,
  [firstPartyNameToCanonical(CLAUDE_SONNET_4_6_CONFIG.firstParty)]:
    COST_TIER_3_15,
  [firstPartyNameToCanonical(CLAUDE_OPUS_4_CONFIG.firstParty)]: COST_TIER_15_75,
  [firstPartyNameToCanonical(CLAUDE_OPUS_4_1_CONFIG.firstParty)]:
    COST_TIER_15_75,
  [firstPartyNameToCanonical(CLAUDE_OPUS_4_5_CONFIG.firstParty)]:
    COST_TIER_5_25,
  [firstPartyNameToCanonical(CLAUDE_OPUS_4_6_CONFIG.firstParty)]:
    COST_TIER_5_25,
}

/**
 * Calculates the USD cost based on token usage and model cost configuration
 */
function tokensToUSDCost(modelCosts: ModelCosts, usage: Usage): number {
  return (
    (usage.input_tokens / 1_000_000) * modelCosts.inputTokens +
    (usage.output_tokens / 1_000_000) * modelCosts.outputTokens +
    ((usage.cache_read_input_tokens ?? 0) / 1_000_000) *
      modelCosts.promptCacheReadTokens +
    ((usage.cache_creation_input_tokens ?? 0) / 1_000_000) *
      modelCosts.promptCacheWriteTokens +
    (usage.server_tool_use?.web_search_requests ?? 0) *
      modelCosts.webSearchRequests
  )
}

// ---------- USER-DEFINED MODEL COSTS ----------

type UserCustomCost = Omit<ModelCosts, 'promptCacheWriteTokens' | 'promptCacheReadTokens' | 'webSearchRequests'>

/**
 * In-memory cache: lowercase model name -> custom cost (session-only).
 * Cache write/read are derived from input cost (1.25x / 10%).
 */
const USER_MODEL_COSTS: Record<string, UserCustomCost> = {}

export function registerCustomModelCost(
  model: string,
  inputTokens: number,
  outputTokens: number,
): void {
  const key = model.toLowerCase()
  USER_MODEL_COSTS[key] = { inputTokens, outputTokens }
  // Clear the unknown-model-cost flag so the warning goes away
  clearHasUnknownModelCost()
}

export function removeUserModelCost(model: string): boolean {
  const key = model.toLowerCase()
  if (key in USER_MODEL_COSTS) {
    delete USER_MODEL_COSTS[key]
    return true
  }
  return false
}

export function listUserModelCosts(): Array<{ model: string; costs: UserCustomCost }> {
  return Object.entries(USER_MODEL_COSTS).map(([model, costs]) => ({
    model,
    costs,
  }))
}

function getUserModelCost(name: string): ModelCosts | null {
  const entry = USER_MODEL_COSTS[name.toLowerCase()]
  if (!entry) return null
  return {
    inputTokens: entry.inputTokens,
    outputTokens: entry.outputTokens,
    promptCacheWriteTokens: entry.inputTokens * 1.25,
    promptCacheReadTokens: entry.inputTokens * 0.10,
    webSearchRequests: 0.01,
  }
}

const FREE_MODEL_COST = {
  inputTokens: 0,
  outputTokens: 0,
  promptCacheWriteTokens: 0,
  promptCacheReadTokens: 0,
  webSearchRequests: 0,
} as const satisfies ModelCosts

// OpenAI models: https://openai.com/api/pricing/
const COST_GPT4O: ModelCosts = {
  inputTokens: 2.5,
  outputTokens: 10,
  promptCacheWriteTokens: 1.25,
  promptCacheReadTokens: 0,
  webSearchRequests: 0.01,
}
const COST_GPT4O_MINI: ModelCosts = {
  inputTokens: 0.15,
  outputTokens: 0.6,
  promptCacheWriteTokens: 0.075,
  promptCacheReadTokens: 0,
  webSearchRequests: 0.01,
}
const COST_GPT4: ModelCosts = {
  inputTokens: 10,
  outputTokens: 30,
  promptCacheWriteTokens: 5,
  promptCacheReadTokens: 0,
  webSearchRequests: 0.01,
}
const COST_O1: ModelCosts = {
  inputTokens: 15,
  outputTokens: 60,
  promptCacheWriteTokens: 7.5,
  promptCacheReadTokens: 0,
  webSearchRequests: 0.01,
}
const COST_O3_MINI: ModelCosts = {
  inputTokens: 1.1,
  outputTokens: 4.4,
  promptCacheWriteTokens: 0.55,
  promptCacheReadTokens: 0,
  webSearchRequests: 0.01,
}

// Gemini models: https://ai.google.dev/pricing
const COST_GEMINI_FLASH_2_0: ModelCosts = {
  inputTokens: 0.1,
  outputTokens: 0.4,
  promptCacheWriteTokens: 0,
  promptCacheReadTokens: 0,
  webSearchRequests: 0.01,
}
const COST_GEMINI_PRO_2_5: ModelCosts = {
  inputTokens: 1.25,
  outputTokens: 10,
  promptCacheWriteTokens: 0,
  promptCacheReadTokens: 0,
  webSearchRequests: 0.01,
}
const COST_GEMINI_FLASH_2_5: ModelCosts = {
  inputTokens: 0.3,
  outputTokens: 2.5,
  promptCacheWriteTokens: 0,
  promptCacheReadTokens: 0,
  webSearchRequests: 0.01,
}

// Qwen via OpenRouter (non-free): https://openrouter.ai/qwen
const COST_QWEN_DEFAULT: ModelCosts = {
  inputTokens: 0.35,
  outputTokens: 1.2,
  promptCacheWriteTokens: 0,
  promptCacheReadTokens: 0,
  webSearchRequests: 0.01,
}

// DeepSeek: https://platform.deepseek.com/api-docs/pricing/
const COST_DEEPSEEK_CHAT: ModelCosts = {
  inputTokens: 0.14,
  outputTokens: 0.28,
  promptCacheWriteTokens: 0.014,
  promptCacheReadTokens: 0.014,
  webSearchRequests: 0.01,
}

/**
 * Look up cost for a non-Claude model by name prefix matching.
 * Handles OpenAI, Gemini, Qwen, DeepSeek, etc.
 */
function getModelCostByName(model: string): ModelCosts | null {
  const lower = model.toLowerCase()

  // Free tier models (e.g. OpenRouter :free) — always zero cost
  if (lower.endsWith(':free') || lower.endsWith('/free')) {
    return FREE_MODEL_COST
  }

  // OpenAI
  if (lower.startsWith('gpt-4o-mini')) return COST_GPT4O_MINI
  if (lower.startsWith('gpt-4o')) return COST_GPT4O
  if (lower.startsWith('gpt-4')) return COST_GPT4
  if (lower.startsWith('o1')) return COST_O1
  if (lower.startsWith('o3-mini')) return COST_O3_MINI

  // Gemini
  if (lower.startsWith('gemini-2.0-flash')) return COST_GEMINI_FLASH_2_0
  if (lower.startsWith('gemini-2.5-pro')) return COST_GEMINI_PRO_2_5
  if (lower.startsWith('gemini-2.5-flash')) return COST_GEMINI_FLASH_2_5
  if (lower.startsWith('gemini')) return COST_GEMINI_FLASH_2_5

  // Qwen
  if (lower.includes('qwen')) return COST_QWEN_DEFAULT

  // DeepSeek
  if (lower.includes('deepseek')) return COST_DEEPSEEK_CHAT

  return null
}

export function getModelCosts(model: string, usage: Usage): ModelCosts {
  // Check if this is an Opus 4.6 model with fast mode active.
  if (
    model === firstPartyNameToCanonical(CLAUDE_OPUS_4_6_CONFIG.firstParty)
  ) {
    const isFastMode = usage.speed === 'fast'
    return getOpus46CostTier(isFastMode)
  }

  const shortName = getCanonicalName(model)
  const costs = MODEL_COSTS[shortName]
  if (costs) return costs

  // Try non-Claude model lookup
  const nonClaudeCost = getModelCostByName(model)
  if (nonClaudeCost) return nonClaudeCost

  // Check user-defined custom cost
  const userCost = getUserModelCost(model)
  if (userCost) {
    clearHasUnknownModelCost()
    return userCost
  }

  // Unknown model — use default
  trackUnknownModelCost(model, shortName)
  return (
    MODEL_COSTS[getCanonicalName(getDefaultMainLoopModelSetting())] ??
    DEFAULT_UNKNOWN_MODEL_COST
  )
}

function trackUnknownModelCost(model: string, shortName: ModelShortName): void {
  logEvent('tengu_unknown_model_cost', {
    model: model as AnalyticsMetadata_I_VERIFIED_THIS_IS_NOT_CODE_OR_FILEPATHS,
    shortName:
      shortName as AnalyticsMetadata_I_VERIFIED_THIS_IS_NOT_CODE_OR_FILEPATHS,
  })
  setHasUnknownModelCost()
}

// Calculate the cost of a query in US dollars.
// If the model's costs are not found, use the default model's costs.
export function calculateUSDCost(resolvedModel: string, usage: Usage): number {
  const modelCosts = getModelCosts(resolvedModel, usage)
  return tokensToUSDCost(modelCosts, usage)
}

/**
 * Calculate cost from raw token counts without requiring a full BetaUsage object.
 * Useful for side queries (e.g. classifier) that track token counts independently.
 */
export function calculateCostFromTokens(
  model: string,
  tokens: {
    inputTokens: number
    outputTokens: number
    cacheReadInputTokens: number
    cacheCreationInputTokens: number
  },
): number {
  const usage: Usage = {
    input_tokens: tokens.inputTokens,
    output_tokens: tokens.outputTokens,
    cache_read_input_tokens: tokens.cacheReadInputTokens,
    cache_creation_input_tokens: tokens.cacheCreationInputTokens,
  } as Usage
  return calculateUSDCost(model, usage)
}

function formatPrice(price: number): string {
  // Format price: integers without decimals, others with 2 decimal places
  // e.g., 3 -> "$3", 0.8 -> "$0.80", 22.5 -> "$22.50"
  if (Number.isInteger(price)) {
    return `$${price}`
  }
  return `$${price.toFixed(2)}`
}

/**
 * Format model costs as a pricing string for display
 * e.g., "$3/$15 per Mtok"
 */
export function formatModelPricing(costs: ModelCosts): string {
  return `${formatPrice(costs.inputTokens)}/${formatPrice(costs.outputTokens)} per Mtok`
}

/**
 * Get formatted pricing string for a model
 * Accepts either a short name or full model name
 * Returns undefined if model is not found
 */
export function getModelPricingString(model: string): string | undefined {
  const shortName = getCanonicalName(model)
  const costs = MODEL_COSTS[shortName]
  if (!costs) return undefined
  return formatModelPricing(costs)
}
