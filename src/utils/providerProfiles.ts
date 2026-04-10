import { randomBytes } from 'crypto'

import {
  getGlobalConfig,
  saveGlobalConfig,
  type SavedProviderProfile,
} from './config.js'
import {
  DEFAULT_GEMINI_BASE_URL,
  DEFAULT_GEMINI_MODEL,
} from './providerProfile.js'
import { getOllamaChatBaseUrl } from './providerDiscovery.js'
import {
  DEFAULT_CODEX_BASE_URL,
  DEFAULT_OPENAI_BASE_URL,
  resolveCodexApiCredentials,
} from '../services/api/providerConfig.js'

export type ProviderPreset =
  | 'anthropic'
  | 'ollama'
  | 'openai'
  | 'openrouter'
  | 'deepseek'
  | 'groq'
  | 'mistral'
  | 'moonshotai'
  | 'together'
  | 'azure-openai'
  | 'lmstudio'
  | 'custom'
  | 'gemini'
  | 'codex'

export type SavedProviderProfileInput = Omit<SavedProviderProfile, 'id'>

export type ProviderPresetDefaults = SavedProviderProfileInput & {
  requiresApiKey: boolean
  requiresAccountId: boolean
  apiKeyHelp: string
}

const PROFILE_ENV_APPLIED_FLAG = 'CLAUDINHO_PROVIDER_PROFILE_ATIVO'
const PROFILE_ENV_APPLIED_ID = 'CLAUDINHO_PROVIDER_PROFILE_ATIVO_ID'
const DEFAULT_OLLAMA_MODEL = 'llama3.1:8b'

function trimValue(value: string | undefined): string {
  return value?.trim() ?? ''
}

function trimOrUndefined(value: string | undefined): string | undefined {
  const trimmed = trimValue(value)
  return trimmed.length > 0 ? trimmed : undefined
}

function normalizeBaseUrl(value: string): string {
  return trimValue(value).replace(/\/+$/, '')
}

function nextProfileId(): string {
  return `provedor_${randomBytes(6).toString('hex')}`
}

function sanitizeProfile(
  profile: SavedProviderProfile,
): SavedProviderProfile | null {
  const id = trimValue(profile.id)
  const name = trimValue(profile.name)
  const provider = profile.provider
  const baseUrl = normalizeBaseUrl(profile.baseUrl)
  const model = trimValue(profile.model)
  const apiKey = trimOrUndefined(profile.apiKey)
  const accountId = trimOrUndefined(profile.accountId)

  if (!id || !name || !baseUrl || !model) {
    return null
  }

  if (
    provider !== 'openai' &&
    provider !== 'anthropic' &&
    provider !== 'gemini' &&
    provider !== 'codex'
  ) {
    return null
  }

  return {
    id,
    name,
    provider,
    baseUrl,
    model,
    apiKey,
    accountId,
  }
}

function sanitizeProfiles(
  profiles: SavedProviderProfile[] | undefined,
): SavedProviderProfile[] {
  const seen = new Set<string>()
  const clean: SavedProviderProfile[] = []

  for (const profile of profiles ?? []) {
    const normalized = sanitizeProfile(profile)
    if (!normalized || seen.has(normalized.id)) {
      continue
    }

    seen.add(normalized.id)
    clean.push(normalized)
  }

  return clean
}

function toProfile(
  input: SavedProviderProfileInput,
  id: string = nextProfileId(),
): SavedProviderProfile | null {
  return sanitizeProfile({
    id,
    ...input,
  })
}

function isLocalBaseUrl(baseUrl: string): boolean {
  const normalized = baseUrl.toLowerCase()
  return (
    normalized.includes('localhost') ||
    normalized.includes('127.0.0.1') ||
    normalized.includes('0.0.0.0')
  )
}

function hasProviderSelectionFlags(
  processEnv: NodeJS.ProcessEnv = process.env,
): boolean {
  return (
    processEnv.CLAUDE_CODE_USE_OPENAI !== undefined ||
    processEnv.CLAUDE_CODE_USE_GEMINI !== undefined ||
    processEnv.CLAUDE_CODE_USE_GITHUB !== undefined ||
    processEnv.CLAUDE_CODE_USE_BEDROCK !== undefined ||
    processEnv.CLAUDE_CODE_USE_VERTEX !== undefined ||
    processEnv.CLAUDE_CODE_USE_FOUNDRY !== undefined
  )
}

function sameOptionalEnvValue(
  left: string | undefined,
  right: string | undefined,
): boolean {
  return trimOrUndefined(left) === trimOrUndefined(right)
}

function isProcessEnvAlignedWithProfile(
  processEnv: NodeJS.ProcessEnv,
  profile: SavedProviderProfile,
): boolean {
  if (processEnv[PROFILE_ENV_APPLIED_FLAG] !== '1') {
    return false
  }

  if (trimOrUndefined(processEnv[PROFILE_ENV_APPLIED_ID]) !== profile.id) {
    return false
  }

  if (profile.provider === 'anthropic') {
    return (
      !hasProviderSelectionFlags(processEnv) &&
      sameOptionalEnvValue(processEnv.ANTHROPIC_BASE_URL, profile.baseUrl) &&
      sameOptionalEnvValue(processEnv.ANTHROPIC_MODEL, profile.model) &&
      sameOptionalEnvValue(processEnv.ANTHROPIC_API_KEY, profile.apiKey)
    )
  }

  if (profile.provider === 'gemini') {
    return (
      processEnv.CLAUDE_CODE_USE_GEMINI !== undefined &&
      processEnv.CLAUDE_CODE_USE_OPENAI === undefined &&
      sameOptionalEnvValue(processEnv.GEMINI_BASE_URL, profile.baseUrl) &&
      sameOptionalEnvValue(processEnv.GEMINI_MODEL, profile.model) &&
      sameOptionalEnvValue(processEnv.GEMINI_API_KEY, profile.apiKey)
    )
  }

  if (profile.provider === 'codex') {
    return (
      processEnv.CLAUDE_CODE_USE_OPENAI !== undefined &&
      processEnv.CLAUDE_CODE_USE_GEMINI === undefined &&
      sameOptionalEnvValue(processEnv.OPENAI_BASE_URL, profile.baseUrl) &&
      sameOptionalEnvValue(processEnv.OPENAI_MODEL, profile.model) &&
      sameOptionalEnvValue(processEnv.CODEX_API_KEY, profile.apiKey) &&
      sameOptionalEnvValue(
        processEnv.CHATGPT_ACCOUNT_ID ?? processEnv.CODEX_ACCOUNT_ID,
        profile.accountId,
      )
    )
  }

  return (
    processEnv.CLAUDE_CODE_USE_OPENAI !== undefined &&
    processEnv.CLAUDE_CODE_USE_GEMINI === undefined &&
    sameOptionalEnvValue(processEnv.OPENAI_BASE_URL, profile.baseUrl) &&
    sameOptionalEnvValue(processEnv.OPENAI_MODEL, profile.model) &&
    sameOptionalEnvValue(processEnv.OPENAI_API_KEY, profile.apiKey)
  )
}

export function getProviderPresetDefaults(
  preset: ProviderPreset,
  processEnv: NodeJS.ProcessEnv = process.env,
): ProviderPresetDefaults {
  const codexCredentials = resolveCodexApiCredentials(processEnv)

  switch (preset) {
    case 'anthropic':
      return {
        provider: 'anthropic',
        name: 'Claude oficial',
        baseUrl: processEnv.ANTHROPIC_BASE_URL ?? 'https://api.anthropic.com',
        model: processEnv.ANTHROPIC_MODEL ?? 'claude-sonnet-4-6',
        apiKey: processEnv.ANTHROPIC_API_KEY ?? '',
        accountId: undefined,
        requiresApiKey: true,
        requiresAccountId: false,
        apiKeyHelp: 'Cole a chave da Anthropic.',
      }
    case 'ollama':
      return {
        provider: 'openai',
        name: 'Ollama local',
        baseUrl: getOllamaChatBaseUrl(),
        model: processEnv.OPENAI_MODEL ?? DEFAULT_OLLAMA_MODEL,
        apiKey: '',
        accountId: undefined,
        requiresApiKey: false,
        requiresAccountId: false,
        apiKeyHelp: 'Pode deixar vazio.',
      }
    case 'openai':
      return {
        provider: 'openai',
        name: 'OpenAI',
        baseUrl: DEFAULT_OPENAI_BASE_URL,
        model: processEnv.OPENAI_MODEL ?? 'gpt-4o',
        apiKey: processEnv.OPENAI_API_KEY ?? '',
        accountId: undefined,
        requiresApiKey: true,
        requiresAccountId: false,
        apiKeyHelp: 'Cole a chave da OpenAI.',
      }
    case 'openrouter':
      return {
        provider: 'openai',
        name: 'OpenRouter',
        baseUrl: 'https://openrouter.ai/api/v1',
        model: 'qwen/qwen3.6-plus:free',
        apiKey: processEnv.OPENROUTER_API_KEY ?? processEnv.OPENAI_API_KEY ?? '',
        accountId: undefined,
        requiresApiKey: true,
        requiresAccountId: false,
        apiKeyHelp: 'Cole a chave do OpenRouter.',
      }
    case 'deepseek':
      return {
        provider: 'openai',
        name: 'DeepSeek',
        baseUrl: 'https://api.deepseek.com/v1',
        model: 'deepseek-chat',
        apiKey: processEnv.OPENAI_API_KEY ?? '',
        accountId: undefined,
        requiresApiKey: true,
        requiresAccountId: false,
        apiKeyHelp: 'Cole a chave desse provedor.',
      }
    case 'groq':
      return {
        provider: 'openai',
        name: 'Groq',
        baseUrl: 'https://api.groq.com/openai/v1',
        model: 'llama-3.3-70b-versatile',
        apiKey: processEnv.OPENAI_API_KEY ?? '',
        accountId: undefined,
        requiresApiKey: true,
        requiresAccountId: false,
        apiKeyHelp: 'Cole a chave desse provedor.',
      }
    case 'mistral':
      return {
        provider: 'openai',
        name: 'Mistral',
        baseUrl: 'https://api.mistral.ai/v1',
        model: 'mistral-large-latest',
        apiKey: processEnv.OPENAI_API_KEY ?? '',
        accountId: undefined,
        requiresApiKey: true,
        requiresAccountId: false,
        apiKeyHelp: 'Cole a chave desse provedor.',
      }
    case 'moonshotai':
      return {
        provider: 'openai',
        name: 'Moonshot AI',
        baseUrl: 'https://api.moonshot.ai/v1',
        model: 'kimi-k2.5',
        apiKey: processEnv.OPENAI_API_KEY ?? '',
        accountId: undefined,
        requiresApiKey: true,
        requiresAccountId: false,
        apiKeyHelp: 'Cole a chave desse provedor.',
      }
    case 'together':
      return {
        provider: 'openai',
        name: 'Together AI',
        baseUrl: 'https://api.together.xyz/v1',
        model: 'Qwen/Qwen3.5-9B',
        apiKey: processEnv.OPENAI_API_KEY ?? '',
        accountId: undefined,
        requiresApiKey: true,
        requiresAccountId: false,
        apiKeyHelp: 'Cole a chave desse provedor.',
      }
    case 'azure-openai':
      return {
        provider: 'openai',
        name: 'Azure OpenAI',
        baseUrl: 'https://SEU-RECURSO.openai.azure.com/openai/v1',
        model: 'SEU-DEPLOYMENT',
        apiKey: processEnv.OPENAI_API_KEY ?? '',
        accountId: undefined,
        requiresApiKey: true,
        requiresAccountId: false,
        apiKeyHelp: 'Cole a chave do Azure OpenAI.',
      }
    case 'lmstudio':
      return {
        provider: 'openai',
        name: 'LM Studio',
        baseUrl: 'http://localhost:1234/v1',
        model: 'local-model',
        apiKey: '',
        accountId: undefined,
        requiresApiKey: false,
        requiresAccountId: false,
        apiKeyHelp: 'Pode deixar vazio.',
      }
    case 'gemini':
      return {
        provider: 'gemini',
        name: 'Google Gemini',
        baseUrl: processEnv.GEMINI_BASE_URL ?? DEFAULT_GEMINI_BASE_URL,
        model: processEnv.GEMINI_MODEL ?? DEFAULT_GEMINI_MODEL,
        apiKey: processEnv.GEMINI_API_KEY ?? processEnv.GOOGLE_API_KEY ?? '',
        accountId: undefined,
        requiresApiKey: true,
        requiresAccountId: false,
        apiKeyHelp: 'Cole a chave do Gemini.',
      }
    case 'codex':
      return {
        provider: 'codex',
        name: 'Codex',
        baseUrl: processEnv.OPENAI_BASE_URL ?? DEFAULT_CODEX_BASE_URL,
        model: processEnv.OPENAI_MODEL ?? 'codexplan',
        apiKey: processEnv.CODEX_API_KEY ?? codexCredentials.apiKey ?? '',
        accountId:
          processEnv.CHATGPT_ACCOUNT_ID ??
          processEnv.CODEX_ACCOUNT_ID ??
          codexCredentials.accountId ??
          '',
        requiresApiKey: false,
        requiresAccountId: false,
        apiKeyHelp:
          'Pode deixar vazio se o login do Codex ja funciona nesse PC.',
      }
    case 'custom':
      return {
        provider: 'openai',
        name: 'Provedor customizado',
        baseUrl:
          processEnv.OPENAI_BASE_URL ??
          processEnv.OPENAI_API_BASE ??
          DEFAULT_OPENAI_BASE_URL,
        model: processEnv.OPENAI_MODEL ?? 'gpt-4o',
        apiKey: processEnv.OPENAI_API_KEY ?? '',
        accountId: undefined,
        requiresApiKey: false,
        requiresAccountId: false,
        apiKeyHelp: 'Se nao precisar de chave, pode deixar vazio.',
      }
  }
}

export function getProviderProfiles(
  config = getGlobalConfig(),
): SavedProviderProfile[] {
  return sanitizeProfiles(config.providerProfiles)
}

export function getActiveProviderProfile(
  config = getGlobalConfig(),
): SavedProviderProfile | undefined {
  const profiles = getProviderProfiles(config)
  if (profiles.length === 0) {
    return undefined
  }

  const activeId = trimOrUndefined(config.activeProviderProfileId)
  return profiles.find(profile => profile.id === activeId) ?? profiles[0]
}

export function clearProviderProfileEnvFromProcessEnv(
  processEnv: NodeJS.ProcessEnv = process.env,
): void {
  delete processEnv.CLAUDE_CODE_USE_OPENAI
  delete processEnv.CLAUDE_CODE_USE_GEMINI
  delete processEnv.CLAUDE_CODE_USE_GITHUB
  delete processEnv.CLAUDE_CODE_USE_BEDROCK
  delete processEnv.CLAUDE_CODE_USE_VERTEX
  delete processEnv.CLAUDE_CODE_USE_FOUNDRY

  delete processEnv.OPENAI_BASE_URL
  delete processEnv.OPENAI_API_BASE
  delete processEnv.OPENAI_MODEL
  delete processEnv.OPENAI_API_KEY
  delete processEnv.ANTHROPIC_BASE_URL
  delete processEnv.ANTHROPIC_MODEL
  delete processEnv.ANTHROPIC_API_KEY
  delete processEnv.GEMINI_BASE_URL
  delete processEnv.GEMINI_MODEL
  delete processEnv.GEMINI_API_KEY
  delete processEnv.GOOGLE_API_KEY
  delete processEnv.CODEX_API_KEY
  delete processEnv.CHATGPT_ACCOUNT_ID
  delete processEnv.CODEX_ACCOUNT_ID
  delete processEnv[PROFILE_ENV_APPLIED_FLAG]
  delete processEnv[PROFILE_ENV_APPLIED_ID]
}

export function applyProviderProfileToProcessEnv(
  profile: SavedProviderProfile,
  processEnv: NodeJS.ProcessEnv = process.env,
): void {
  clearProviderProfileEnvFromProcessEnv(processEnv)
  processEnv[PROFILE_ENV_APPLIED_FLAG] = '1'
  processEnv[PROFILE_ENV_APPLIED_ID] = profile.id

  if (profile.provider === 'anthropic') {
    processEnv.ANTHROPIC_BASE_URL = profile.baseUrl
    processEnv.ANTHROPIC_MODEL = profile.model
    if (profile.apiKey) {
      processEnv.ANTHROPIC_API_KEY = profile.apiKey
    }
    return
  }

  if (profile.provider === 'gemini') {
    processEnv.CLAUDE_CODE_USE_GEMINI = '1'
    processEnv.GEMINI_BASE_URL = profile.baseUrl
    processEnv.GEMINI_MODEL = profile.model
    if (profile.apiKey) {
      processEnv.GEMINI_API_KEY = profile.apiKey
    }
    return
  }

  processEnv.CLAUDE_CODE_USE_OPENAI = '1'
  processEnv.OPENAI_BASE_URL = profile.baseUrl
  processEnv.OPENAI_MODEL = profile.model

  if (profile.provider === 'codex') {
    if (profile.apiKey) {
      processEnv.CODEX_API_KEY = profile.apiKey
    }
    if (profile.accountId) {
      processEnv.CHATGPT_ACCOUNT_ID = profile.accountId
    }
    return
  }

  if (profile.apiKey) {
    processEnv.OPENAI_API_KEY = profile.apiKey
  }
}

export function applyActiveProviderProfileFromConfig(
  config = getGlobalConfig(),
  options?: {
    processEnv?: NodeJS.ProcessEnv
    force?: boolean
  },
): SavedProviderProfile | undefined {
  const processEnv = options?.processEnv ?? process.env
  const activeProfile = getActiveProviderProfile(config)
  if (!activeProfile) {
    return undefined
  }

  const isCurrentEnvProfileManaged =
    processEnv[PROFILE_ENV_APPLIED_FLAG] === '1' &&
    trimOrUndefined(processEnv[PROFILE_ENV_APPLIED_ID]) === activeProfile.id

  if (!options?.force && hasProviderSelectionFlags(processEnv)) {
    if (!isCurrentEnvProfileManaged) {
      return undefined
    }

    if (isProcessEnvAlignedWithProfile(processEnv, activeProfile)) {
      return activeProfile
    }
  }

  applyProviderProfileToProcessEnv(activeProfile, processEnv)
  return activeProfile
}

export function addProviderProfile(
  input: SavedProviderProfileInput,
  options?: { makeActive?: boolean },
): SavedProviderProfile | null {
  const profile = toProfile(input)
  if (!profile) {
    return null
  }

  const makeActive = options?.makeActive ?? true

  saveGlobalConfig(current => {
    const currentProfiles = getProviderProfiles(current)
    const nextProfiles = [...currentProfiles, profile]
    const currentActive = trimOrUndefined(current.activeProviderProfileId)
    const nextActiveId =
      makeActive || !currentActive || !nextProfiles.some(p => p.id === currentActive)
        ? profile.id
        : currentActive

    return {
      ...current,
      providerProfiles: nextProfiles,
      activeProviderProfileId: nextActiveId,
    }
  })

  const activeProfile = getActiveProviderProfile()
  if (activeProfile?.id === profile.id) {
    applyProviderProfileToProcessEnv(profile)
  }

  return profile
}

export function updateProviderProfile(
  profileId: string,
  input: SavedProviderProfileInput,
): SavedProviderProfile | null {
  const updated = toProfile(input, profileId)
  if (!updated) {
    return null
  }

  let wasUpdated = false
  let shouldApply = false

  saveGlobalConfig(current => {
    const currentProfiles = getProviderProfiles(current)
    const index = currentProfiles.findIndex(profile => profile.id === profileId)
    if (index < 0) {
      return current
    }

    wasUpdated = true
    const nextProfiles = [...currentProfiles]
    nextProfiles[index] = updated

    const currentActive = trimOrUndefined(current.activeProviderProfileId)
    const nextActiveId =
      currentActive && nextProfiles.some(profile => profile.id === currentActive)
        ? currentActive
        : nextProfiles[0]?.id

    shouldApply = nextActiveId === profileId

    return {
      ...current,
      providerProfiles: nextProfiles,
      activeProviderProfileId: nextActiveId,
    }
  })

  if (!wasUpdated) {
    return null
  }

  if (shouldApply) {
    applyProviderProfileToProcessEnv(updated)
  }

  return updated
}

export function setActiveProviderProfile(
  profileId: string,
): SavedProviderProfile | null {
  const current = getGlobalConfig()
  const profiles = getProviderProfiles(current)
  const activeProfile = profiles.find(profile => profile.id === profileId)
  if (!activeProfile) {
    return null
  }

  saveGlobalConfig(config => ({
    ...config,
    activeProviderProfileId: profileId,
  }))

  applyProviderProfileToProcessEnv(activeProfile)
  return activeProfile
}

export function deleteProviderProfile(profileId: string): {
  removed: boolean
  activeProfileId?: string
} {
  let removed = false
  let deletedProfile: SavedProviderProfile | undefined
  let nextActiveProfile: SavedProviderProfile | undefined

  saveGlobalConfig(current => {
    const currentProfiles = getProviderProfiles(current)
    const existing = currentProfiles.find(profile => profile.id === profileId)
    if (!existing) {
      return current
    }

    removed = true
    deletedProfile = existing

    const nextProfiles = currentProfiles.filter(profile => profile.id !== profileId)
    const currentActive = trimOrUndefined(current.activeProviderProfileId)
    const activeWasDeleted =
      !currentActive ||
      currentActive === profileId ||
      !nextProfiles.some(profile => profile.id === currentActive)

    const nextActiveId = activeWasDeleted ? nextProfiles[0]?.id : currentActive
    if (nextActiveId) {
      nextActiveProfile =
        nextProfiles.find(profile => profile.id === nextActiveId) ?? nextProfiles[0]
    }

    return {
      ...current,
      providerProfiles: nextProfiles,
      activeProviderProfileId: nextActiveId,
    }
  })

  if (nextActiveProfile) {
    applyProviderProfileToProcessEnv(nextActiveProfile)
  } else if (
    deletedProfile &&
    isProcessEnvAlignedWithProfile(process.env, deletedProfile)
  ) {
    clearProviderProfileEnvFromProcessEnv()
  }

  return {
    removed,
    activeProfileId: nextActiveProfile?.id,
  }
}

export function getProviderTypeLabel(
  provider: SavedProviderProfile['provider'],
): string {
  switch (provider) {
    case 'anthropic':
      return 'Claude oficial'
    case 'gemini':
      return 'Gemini'
    case 'codex':
      return 'Codex'
    default:
      return 'OpenAI compativel'
  }
}

export function getProviderSummaryLine(
  profile: SavedProviderProfile,
  isActive: boolean,
): string {
  const keyLabel =
    profile.provider === 'codex'
      ? profile.accountId
        ? 'conta pronta'
        : 'sem conta'
      : profile.apiKey
        ? 'chave ok'
        : isLocalBaseUrl(profile.baseUrl)
          ? 'sem chave'
          : 'chave vazia'
  const activeLabel = isActive ? ' (ativo)' : ''
  return `${getProviderTypeLabel(profile.provider)} - ${profile.baseUrl} - ${profile.model} - ${keyLabel}${activeLabel}`
}
