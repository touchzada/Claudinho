import { existsSync, readFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'

import { isEnvTruthy } from '../../utils/envUtils.js'

export const DEFAULT_OPENAI_BASE_URL = 'https://api.openai.com/v1'
export const DEFAULT_CODEX_BASE_URL = 'https://chatgpt.com/backend-api/codex'
/** Default GitHub Models API model when user selects copilot / github:copilot */
export const DEFAULT_GITHUB_MODELS_API_MODEL = 'openai/gpt-4.1'

const CODEX_ALIAS_MODELS: Record<
  string,
  {
    model: string
    reasoningEffort?: ReasoningEffort
  }
> = {
  codexplan: {
    model: 'gpt-5.4',
    reasoningEffort: 'medium',
  },
  'gpt-5.4': {
    model: 'gpt-5.4',
    reasoningEffort: 'medium',
  },
  'gpt-5.3-codex': {
    model: 'gpt-5.3-codex',
    reasoningEffort: 'high',
  },
  'gpt-5.3-codex-spark': {
    model: 'gpt-5.3-codex-spark',
  },
  codexspark: {
    model: 'gpt-5.3-codex-spark',
  },
  'gpt-5.2-codex': {
    model: 'gpt-5.2-codex',
    reasoningEffort: 'high',
  },
  'gpt-5.1-codex-max': {
    model: 'gpt-5.1-codex-max',
    reasoningEffort: 'high',
  },
  'gpt-5.1-codex-mini': {
    model: 'gpt-5.1-codex-mini',
  },
  'gpt-5.4-mini': {
    model: 'gpt-5.4-mini',
    reasoningEffort: 'medium',
  },
  'gpt-5.2': {
    model: 'gpt-5.2',
    reasoningEffort: 'medium',
  },
} as const

type CodexAlias = keyof typeof CODEX_ALIAS_MODELS
type ReasoningEffort = 'low' | 'medium' | 'high' | 'xhigh'

export type ProviderTransport = 'chat_completions' | 'codex_responses'

export type ResolvedProviderRequest = {
  transport: ProviderTransport
  requestedModel: string
  resolvedModel: string
  baseUrl: string
  reasoning?: {
    effort: ReasoningEffort
  }
}

export type ResolvedCodexCredentials = {
  apiKey: string
  accountId?: string
  authPath?: string
  source: 'env' | 'auth.json' | 'oauth' | 'none'
}

type ModelDescriptor = {
  raw: string
  baseModel: string
  reasoning?: {
    effort: ReasoningEffort
  }
}

const LOCALHOST_HOSTNAMES = new Set(['localhost', '127.0.0.1', '::1'])

function asTrimmedString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined
}

function readNestedString(
  value: unknown,
  paths: string[][],
): string | undefined {
  for (const path of paths) {
    let current = value
    let valid = true
    for (const key of path) {
      if (!current || typeof current !== 'object' || !(key in current)) {
        valid = false
        break
      }
      current = (current as Record<string, unknown>)[key]
    }
    if (!valid) continue
    const stringValue = asTrimmedString(current)
    if (stringValue) return stringValue
  }
  return undefined
}

function decodeJwtPayload(token: string): Record<string, unknown> | undefined {
  const parts = token.split('.')
  if (parts.length < 2) return undefined

  try {
    const normalized = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    const padded = normalized + '='.repeat((4 - (normalized.length % 4)) % 4)
    const json = Buffer.from(padded, 'base64').toString('utf8')
    const parsed = JSON.parse(json)
    return parsed && typeof parsed === 'object'
      ? (parsed as Record<string, unknown>)
      : undefined
  } catch {
    return undefined
  }
}

function parseReasoningEffort(value: string | undefined): ReasoningEffort | undefined {
  if (!value) return undefined
  const normalized = value.trim().toLowerCase()
  if (normalized === 'low' || normalized === 'medium' || normalized === 'high' || normalized === 'xhigh') {
    return normalized
  }
  return undefined
}

function stripReasoningSuffix(model: string): {
  modelWithoutSuffix: string
  suffixEffort?: ReasoningEffort
} {
  const match = model.match(/^(.+?)\s*\((low|medium|high|xhigh)\)\s*$/i)
  if (!match) {
    return { modelWithoutSuffix: model }
  }
  return {
    modelWithoutSuffix: match[1]!.trim(),
    suffixEffort: parseReasoningEffort(match[2]),
  }
}

function parseModelDescriptor(model: string): ModelDescriptor {
  const trimmed = model.trim()
  const { modelWithoutSuffix, suffixEffort } = stripReasoningSuffix(trimmed)
  const queryIndex = modelWithoutSuffix.indexOf('?')
  if (queryIndex === -1) {
    const alias = modelWithoutSuffix.toLowerCase() as CodexAlias
    const aliasConfig = CODEX_ALIAS_MODELS[alias]
    const reasoningEffort = suffixEffort ?? aliasConfig?.reasoningEffort
    if (aliasConfig) {
      return {
        raw: trimmed,
        baseModel: aliasConfig.model,
        reasoning: reasoningEffort ? { effort: reasoningEffort } : undefined,
      }
    }
    return {
      raw: trimmed,
      baseModel: modelWithoutSuffix,
      reasoning: reasoningEffort ? { effort: reasoningEffort } : undefined,
    }
  }

  const baseModel = modelWithoutSuffix.slice(0, queryIndex).trim()
  const params = new URLSearchParams(modelWithoutSuffix.slice(queryIndex + 1))
  const alias = baseModel.toLowerCase() as CodexAlias
  const aliasConfig = CODEX_ALIAS_MODELS[alias]
  const resolvedBaseModel = aliasConfig?.model ?? baseModel
  const reasoning =
    parseReasoningEffort(params.get('reasoning') ?? undefined) ??
    suffixEffort ??
    (aliasConfig?.reasoningEffort
      ? { effort: aliasConfig.reasoningEffort }
      : undefined)

  return {
    raw: trimmed,
    baseModel: resolvedBaseModel,
    reasoning: typeof reasoning === 'string' ? { effort: reasoning } : reasoning,
  }
}

function isCodexAlias(model: string): boolean {
  const normalized = model.trim().toLowerCase()
  const baseWithQueryRemoved = normalized.split('?', 1)[0] ?? normalized
  const base = stripReasoningSuffix(baseWithQueryRemoved).modelWithoutSuffix
  return base in CODEX_ALIAS_MODELS
}

export function isLocalProviderUrl(baseUrl: string | undefined): boolean {
  if (!baseUrl) return false
  try {
    return LOCALHOST_HOSTNAMES.has(new URL(baseUrl).hostname)
  } catch {
    return false
  }
}

export function isCodexBaseUrl(baseUrl: string | undefined): boolean {
  if (!baseUrl) return false
  try {
    const parsed = new URL(baseUrl)
    return (
      parsed.hostname === 'chatgpt.com' &&
      parsed.pathname.replace(/\/+$/, '') === '/backend-api/codex'
    )
  } catch {
    return false
  }
}

/**
 * Normalize user model string for GitHub Models inference (models.github.ai).
 * Mirrors runtime devsper `github._normalize_model_id`.
 */
export function normalizeGithubModelsApiModel(requestedModel: string): string {
  const noQuery = requestedModel.split('?', 1)[0] ?? requestedModel
  const segment =
    noQuery.includes(':') ? noQuery.split(':', 2)[1]!.trim() : noQuery.trim()
  if (!segment || segment.toLowerCase() === 'copilot') {
    return DEFAULT_GITHUB_MODELS_API_MODEL
  }
  return segment
}

export function resolveProviderRequest(options?: {
  model?: string
  baseUrl?: string
  fallbackModel?: string
  reasoningEffortOverride?: ReasoningEffort
}): ResolvedProviderRequest {
  const isGithubMode = isEnvTruthy(process.env.CLAUDE_CODE_USE_GITHUB)
  const requestedModel =
    options?.model?.trim() ||
    process.env.OPENAI_MODEL?.trim() ||
    options?.fallbackModel?.trim() ||
    (isGithubMode ? 'github:copilot' : 'gpt-4o')
  const descriptor = parseModelDescriptor(requestedModel)
  const rawBaseUrl =
    options?.baseUrl ??
    process.env.OPENAI_BASE_URL ??
    process.env.OPENAI_API_BASE ??
    undefined
  const transport: ProviderTransport =
    isCodexAlias(requestedModel) || isCodexBaseUrl(rawBaseUrl)
      ? 'codex_responses'
      : 'chat_completions'

  const resolvedModel =
    transport === 'chat_completions' &&
    isEnvTruthy(process.env.CLAUDE_CODE_USE_GITHUB)
      ? normalizeGithubModelsApiModel(requestedModel)
      : descriptor.baseModel

  const reasoning = options?.reasoningEffortOverride
    ? { effort: options.reasoningEffortOverride }
    : descriptor.reasoning


  return {
    transport,
    requestedModel,
    resolvedModel,
    baseUrl:
      (rawBaseUrl ??
        (transport === 'codex_responses'
          ? DEFAULT_CODEX_BASE_URL
          : DEFAULT_OPENAI_BASE_URL)
      ).replace(/\/+$/, ''),
    reasoning,
  }
}

export function resolveCodexAuthPath(
  env: NodeJS.ProcessEnv = process.env,
): string {
  const explicit = asTrimmedString(env.CODEX_AUTH_JSON_PATH)
  if (explicit) return explicit

  const codexHome = asTrimmedString(env.CODEX_HOME)
  if (codexHome) return join(codexHome, 'auth.json')

  return join(homedir(), '.codex', 'auth.json')
}

export function parseChatgptAccountId(
  token: string | undefined,
): string | undefined {
  if (!token) return undefined
  const payload = decodeJwtPayload(token)
  const fromClaim = asTrimmedString(
    payload?.['https://api.openai.com/auth.chatgpt_account_id'],
  )
  if (fromClaim) return fromClaim
  return asTrimmedString(payload?.chatgpt_account_id)
}

function loadCodexAuthJson(
  authPath: string,
): Record<string, unknown> | undefined {
  if (!existsSync(authPath)) return undefined
  try {
    const raw = readFileSync(authPath, 'utf8')
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === 'object'
      ? (parsed as Record<string, unknown>)
      : undefined
  } catch {
    return undefined
  }
}

export function resolveCodexApiCredentials(
  env: NodeJS.ProcessEnv = process.env,
): ResolvedCodexCredentials {
  const envApiKey = asTrimmedString(env.CODEX_API_KEY)
  const envAccountId =
    asTrimmedString(env.CODEX_ACCOUNT_ID) ??
    asTrimmedString(env.CHATGPT_ACCOUNT_ID)

  if (envApiKey) {
    return {
      apiKey: envApiKey,
      accountId: envAccountId ?? parseChatgptAccountId(envApiKey),
      source: 'env',
    }
  }

  // Try OAuth tokens first (new priority)
  // Note: This is synchronous, so we can't do async refresh here.
  // The refresh will happen in ensureValidCodexToken() before requests.
  try {
    const { getCodexOAuthTokens } = require('../../utils/codex-auth.js')
    const oauthTokens = getCodexOAuthTokens()
    if (oauthTokens?.accessToken && oauthTokens?.accountId) {
      return {
        apiKey: oauthTokens.accessToken,
        accountId: oauthTokens.accountId,
        source: 'oauth',
      }
    }
  } catch {
    // OAuth module not available or tokens not found, continue to auth.json
  }

  const authPath = resolveCodexAuthPath(env)
  const authJson = loadCodexAuthJson(authPath)
  if (!authJson) {
    return {
      apiKey: '',
      authPath,
      source: 'none',
    }
  }

  const apiKey = readNestedString(authJson, [
    ['access_token'],
    ['accessToken'],
    ['tokens', 'access_token'],
    ['tokens', 'accessToken'],
    ['auth', 'access_token'],
    ['auth', 'accessToken'],
    ['token', 'access_token'],
    ['token', 'accessToken'],
    ['tokens', 'id_token'],
    ['tokens', 'idToken'],
  ])
  const accountId =
    envAccountId ??
    readNestedString(authJson, [
      ['account_id'],
      ['accountId'],
      ['tokens', 'account_id'],
      ['tokens', 'accountId'],
      ['auth', 'account_id'],
      ['auth', 'accountId'],
    ]) ??
    parseChatgptAccountId(apiKey)

  if (!apiKey) {
    return {
      apiKey: '',
      accountId,
      authPath,
      source: 'none',
    }
  }

  return {
    apiKey,
    accountId,
    authPath,
    source: 'auth.json',
  }
}

/**
 * Async version that ensures OAuth tokens are refreshed if needed.
 * Use this before making Codex API requests.
 */
export async function resolveCodexApiCredentialsAsync(
  env: NodeJS.ProcessEnv = process.env,
): Promise<ResolvedCodexCredentials> {
  // First try sync resolution (env vars, auth.json)
  const syncResult = resolveCodexApiCredentials(env)
  
  // If we got OAuth tokens, ensure they're valid (refresh if needed)
  if (syncResult.source === 'oauth') {
    try {
      const { ensureValidCodexToken } = require('../../utils/codex-auth.js')
      const validTokens = await ensureValidCodexToken()
      return {
        apiKey: validTokens.accessToken,
        accountId: validTokens.accountId,
        source: 'oauth',
      }
    } catch (err) {
      // If refresh fails, fall through to return the sync result
      // (which will likely fail the API call, but that's expected)
    }
  }
  
  return syncResult
}

export function getReasoningEffortForModel(model: string): ReasoningEffort | undefined {
  return parseModelDescriptor(model).reasoning?.effort
}
