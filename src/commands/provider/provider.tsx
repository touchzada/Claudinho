import * as React from 'react'

import type { LocalJSXCommandCall, LocalJSXCommandOnDone } from '../../types/command.js'
import { COMMON_HELP_ARGS, COMMON_INFO_ARGS } from '../../constants/xml.js'
import TextInput from '../../components/TextInput.js'
import {
  Select,
  type OptionWithDescription,
} from '../../components/CustomSelect/index.js'
import { Dialog } from '../../components/design-system/Dialog.js'
import { LoadingState } from '../../components/design-system/LoadingState.js'
import { useTerminalSize } from '../../hooks/useTerminalSize.js'
import { Box, Text } from '../../ink.js'
import {
  DEFAULT_CODEX_BASE_URL,
  DEFAULT_OPENAI_BASE_URL,
  parseChatgptAccountId,
  resolveCodexApiCredentials,
  resolveProviderRequest,
} from '../../services/api/providerConfig.js'
import {
  buildCodexProfileEnv,
  buildGeminiProfileEnv,
  buildOllamaProfileEnv,
  buildOpenAIProfileEnv,
  createProfileFile,
  DEFAULT_GEMINI_BASE_URL,
  DEFAULT_GEMINI_MODEL,
  deleteProfileFile,
  loadProfileFile,
  maskSecretForDisplay,
  redactSecretValueForDisplay,
  sanitizeApiKey,
  sanitizeProviderConfigValue,
  saveProfileFile,
  type ProfileEnv,
  type ProfileFile,
  type ProviderProfile,
} from '../../utils/providerProfile.js'
import {
  getGoalDefaultOpenAIModel,
  normalizeRecommendationGoal,
  rankOllamaModels,
  recommendOllamaModel,
  type RecommendationGoal,
} from '../../utils/providerRecommendation.js'
import { hasLocalOllama, listOllamaModels } from '../../utils/providerDiscovery.js'

type ProviderChoice = 'auto' | ProviderProfile | 'openrouter' | 'clear'

type Step =
  | { name: 'choose' }
  | { name: 'auto-goal' }
  | { name: 'auto-detect'; goal: RecommendationGoal }
  | { name: 'ollama-detect' }
  | {
      name: 'openai-key'
      defaultModel: string
      defaultBaseUrl?: string | null
      skipBaseStep?: boolean
      providerLabel?: string
    }
  | {
      name: 'openai-base'
      apiKey: string
      defaultModel: string
      defaultBaseUrl?: string | null
      skipBaseStep?: boolean
      providerLabel?: string
    }
  | {
      name: 'openai-model'
      apiKey: string
      baseUrl: string | null
      defaultModel: string
      skipBaseStep?: boolean
      providerLabel?: string
    }
  | { name: 'gemini-key' }
  | { name: 'gemini-model'; apiKey: string }
  | { name: 'codex-check' }
  | { name: 'codex-manual-key' }
  | { name: 'codex-manual-account'; apiKey: string }
  | {
      name: 'codex-model'
      source: 'detected' | 'manual'
      apiKey?: string
      accountId?: string
    }

type CurrentProviderSummary = {
  providerLabel: string
  modelLabel: string
  endpointLabel: string
  savedProfileLabel: string
}

type SavedProfileSummary = {
  providerLabel: string
  modelLabel: string
  endpointLabel: string
  credentialLabel?: string
}

type TextEntryDialogProps = {
  title: string
  subtitle?: string
  resetStateKey?: string
  description: React.ReactNode
  initialValue: string
  placeholder?: string
  mask?: string
  allowEmpty?: boolean
  validate?: (value: string) => string | null
  onSubmit: (value: string) => void
  onCancel: () => void
}

type ProviderWizardDefaults = {
  openAIModel: string
  openAIBaseUrl: string
  openRouterModel: string
  geminiModel: string
}

type ProviderDoctorTarget =
  | 'all'
  | 'openrouter'
  | 'openai'
  | 'ollama'
  | 'gemini'
  | 'codex'

const QUICK_PROVIDER_ARGS: ReadonlyArray<ProviderChoice> = [
  'auto',
  'openrouter',
  'ollama',
  'openai',
  'gemini',
  'codex',
  'clear',
]

const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1'
const OPENROUTER_DEFAULT_MODEL = 'qwen/qwen3.6-plus:free'

function isOpenRouterBaseUrl(value: string | null | undefined): boolean {
  if (!value) return false
  return value.toLowerCase().includes('openrouter.ai')
}

function resolvePersistedEnv(
  persisted?: ProfileFile | null,
): ProfileEnv | undefined {
  if (!persisted || !persisted.env) return undefined
  return persisted.env
}

function isEnvTruthy(value: string | undefined): boolean {
  if (!value) return false
  const normalized = value.trim().toLowerCase()
  return normalized !== '' && normalized !== '0' && normalized !== 'false' && normalized !== 'no'
}

function getSafeDisplayValue(
  value: string | undefined,
  processEnv: NodeJS.ProcessEnv,
  profileEnv?: ProfileEnv,
  fallback = '(not set)',
): string {
  return (
    redactSecretValueForDisplay(value, processEnv, profileEnv) ?? fallback
  )
}

export function getProviderWizardDefaults(
  processEnv: NodeJS.ProcessEnv = process.env,
  persisted?: ProfileFile | null,
): ProviderWizardDefaults {
  const persistedEnv = resolvePersistedEnv(persisted)
  const safeOpenAIModel =
    sanitizeProviderConfigValue(processEnv.OPENAI_MODEL, processEnv) ||
    sanitizeProviderConfigValue(
      persistedEnv?.OPENAI_MODEL,
      persistedEnv,
    ) ||
    'gpt-4o'
  const safeOpenAIBaseUrl =
    sanitizeProviderConfigValue(processEnv.OPENAI_BASE_URL, processEnv) ||
    sanitizeProviderConfigValue(
      persistedEnv?.OPENAI_BASE_URL,
      persistedEnv,
    ) ||
    DEFAULT_OPENAI_BASE_URL
  const safeOpenRouterModel =
    isOpenRouterBaseUrl(safeOpenAIBaseUrl)
      ? safeOpenAIModel
      : isOpenRouterBaseUrl(persistedEnv?.OPENAI_BASE_URL)
        ? sanitizeProviderConfigValue(
            persistedEnv?.OPENAI_MODEL,
            persistedEnv,
          ) || OPENROUTER_DEFAULT_MODEL
        : OPENROUTER_DEFAULT_MODEL
  const safeGeminiModel =
    sanitizeProviderConfigValue(processEnv.GEMINI_MODEL, processEnv) ||
    sanitizeProviderConfigValue(
      persistedEnv?.GEMINI_MODEL,
      persistedEnv,
    ) ||
    DEFAULT_GEMINI_MODEL

  return {
    openAIModel: safeOpenAIModel,
    openAIBaseUrl: safeOpenAIBaseUrl,
    openRouterModel: safeOpenRouterModel,
    geminiModel: safeGeminiModel,
  }
}

export function buildCurrentProviderSummary(options?: {
  processEnv?: NodeJS.ProcessEnv
  persisted?: ProfileFile | null
}): CurrentProviderSummary {
  const processEnv = options?.processEnv ?? process.env
  const persisted = options?.persisted ?? loadProfileFile()
  const savedProfileLabel = persisted?.profile ?? 'none'

  if (isEnvTruthy(processEnv.CLAUDE_CODE_USE_GEMINI)) {
    return {
      providerLabel: 'Google Gemini',
      modelLabel: getSafeDisplayValue(
        processEnv.GEMINI_MODEL ?? DEFAULT_GEMINI_MODEL,
        processEnv,
      ),
      endpointLabel: getSafeDisplayValue(
        processEnv.GEMINI_BASE_URL ?? DEFAULT_GEMINI_BASE_URL,
        processEnv,
      ),
      savedProfileLabel,
    }
  }

  if (isEnvTruthy(processEnv.CLAUDE_CODE_USE_OPENAI)) {
    const request = resolveProviderRequest({
      model: processEnv.OPENAI_MODEL,
      baseUrl: processEnv.OPENAI_BASE_URL,
    })

    let providerLabel = 'OpenAI-compatible'
    if (request.transport === 'codex_responses') {
      providerLabel = 'Codex'
    } else if (request.baseUrl.includes('localhost:11434')) {
      providerLabel = 'Ollama'
    } else if (request.baseUrl.includes('localhost:1234')) {
      providerLabel = 'LM Studio'
    }

    return {
      providerLabel,
      modelLabel: getSafeDisplayValue(request.requestedModel, processEnv),
      endpointLabel: getSafeDisplayValue(request.baseUrl, processEnv),
      savedProfileLabel,
    }
  }

  return {
    providerLabel: 'Anthropic',
    modelLabel: getSafeDisplayValue(
      processEnv.ANTHROPIC_MODEL ??
        processEnv.CLAUDE_MODEL ??
        'claude-sonnet-4-6',
      processEnv,
    ),
    endpointLabel: getSafeDisplayValue(
      processEnv.ANTHROPIC_BASE_URL ?? 'https://api.anthropic.com',
      processEnv,
    ),
    savedProfileLabel,
  }
}

function buildSavedProfileSummary(
  profile: ProviderProfile,
  env: ProfileEnv,
): SavedProfileSummary {
  switch (profile) {
    case 'gemini':
      return {
        providerLabel: 'Google Gemini',
        modelLabel: getSafeDisplayValue(
          env.GEMINI_MODEL ?? DEFAULT_GEMINI_MODEL,
          process.env,
          env,
        ),
        endpointLabel: getSafeDisplayValue(
          env.GEMINI_BASE_URL ?? DEFAULT_GEMINI_BASE_URL,
          process.env,
          env,
        ),
        credentialLabel:
          maskSecretForDisplay(env.GEMINI_API_KEY) !== undefined
            ? 'configured'
            : undefined,
      }
    case 'codex':
      return {
        providerLabel: 'Codex',
        modelLabel: getSafeDisplayValue(
          env.OPENAI_MODEL ?? 'codexplan',
          process.env,
          env,
        ),
        endpointLabel: getSafeDisplayValue(
          env.OPENAI_BASE_URL ?? DEFAULT_CODEX_BASE_URL,
          process.env,
          env,
        ),
        credentialLabel:
          maskSecretForDisplay(env.CODEX_API_KEY) !== undefined
            ? 'configured'
            : undefined,
      }
    case 'ollama':
      return {
        providerLabel: 'Ollama',
        modelLabel: getSafeDisplayValue(
          env.OPENAI_MODEL,
          process.env,
          env,
        ),
        endpointLabel: getSafeDisplayValue(
          env.OPENAI_BASE_URL,
          process.env,
          env,
        ),
      }
    case 'openai':
    default:
      return {
        providerLabel: 'OpenAI-compatible',
        modelLabel: getSafeDisplayValue(
          env.OPENAI_MODEL ?? 'gpt-4o',
          process.env,
          env,
        ),
        endpointLabel: getSafeDisplayValue(
          env.OPENAI_BASE_URL ?? DEFAULT_OPENAI_BASE_URL,
          process.env,
          env,
        ),
        credentialLabel:
          maskSecretForDisplay(env.OPENAI_API_KEY) !== undefined
            ? 'configured'
            : undefined,
      }
  }
}

export function buildProfileSaveMessage(
  profile: ProviderProfile,
  env: ProfileEnv,
  filePath: string,
): string {
  const summary = buildSavedProfileSummary(profile, env)
  const lines = [
    `Perfil ${summary.providerLabel} salvo.`,
    `Modelo: ${summary.modelLabel}`,
    `Endpoint: ${summary.endpointLabel}`,
  ]

  if (summary.credentialLabel) {
    lines.push(`Credenciais: ${summary.credentialLabel}`)
  }

  // Keep the Windows path inside code formatting so markdown rendering
  // does not swallow backslashes like "\." in ".openclaude-profile.json".
  lines.push(`Perfil: \`${filePath}\``)
  lines.push('Reinicia o claudinho pra usar.')

  return lines.join('\n')
}

function buildUsageText(): string {
  const summary = buildCurrentProviderSummary()
  return [
    'Uso: /provider',
    'Uso rápido: /provider <auto|openrouter|ollama|openai|gemini|codex|clear>',
    'Diagnóstico: /provider doctor [openrouter|openai|ollama|gemini|codex]',
    '',
    'Setup guiado pra perfis de provedor salvos.',
    '',
    `Provedor atual: ${summary.providerLabel}`,
    `Modelo atual: ${summary.modelLabel}`,
    `Endpoint atual: ${summary.endpointLabel}`,
    `Perfil salvo: ${summary.savedProfileLabel}`,
    '',
    'Escolhe Auto, OpenRouter, Ollama, OpenAI-compatível, Gemini ou Codex, e salva um perfil pro próximo restart do claudinho.',
    'Dica: pra troca rápida usa /provider codex ou /provider openrouter',
  ].join('\n')
}

export function mergeRememberedCredentials(
  nextEnv: ProfileEnv,
  existingEnv?: ProfileEnv,
): ProfileEnv {
  if (!existingEnv) return nextEnv

  const merged: ProfileEnv = { ...nextEnv }
  const existingOpenAIKey = sanitizeApiKey(existingEnv.OPENAI_API_KEY)
  const existingGeminiKey = sanitizeApiKey(existingEnv.GEMINI_API_KEY)
  const existingCodexKey = sanitizeApiKey(existingEnv.CODEX_API_KEY)
  const existingCodexAccount =
    existingEnv.CHATGPT_ACCOUNT_ID ?? existingEnv.CODEX_ACCOUNT_ID
  const nextCodexAccount =
    merged.CHATGPT_ACCOUNT_ID ?? merged.CODEX_ACCOUNT_ID

  if (!sanitizeApiKey(merged.OPENAI_API_KEY) && existingOpenAIKey) {
    merged.OPENAI_API_KEY = existingOpenAIKey
  }
  if (!sanitizeApiKey(merged.GEMINI_API_KEY) && existingGeminiKey) {
    merged.GEMINI_API_KEY = existingGeminiKey
  }
  if (!sanitizeApiKey(merged.CODEX_API_KEY) && existingCodexKey) {
    merged.CODEX_API_KEY = existingCodexKey
  }
  if (!nextCodexAccount && existingCodexAccount) {
    merged.CHATGPT_ACCOUNT_ID = existingCodexAccount
  }

  return merged
}

function getEnvWithPersistedFallback(
  processEnv: NodeJS.ProcessEnv,
  persisted?: ProfileEnv,
): NodeJS.ProcessEnv {
  if (!persisted) return processEnv

  const merged: NodeJS.ProcessEnv = { ...processEnv }

  if (!merged.OPENAI_API_KEY && persisted.OPENAI_API_KEY) {
    merged.OPENAI_API_KEY = persisted.OPENAI_API_KEY
  }
  if (!merged.GEMINI_API_KEY && !merged.GOOGLE_API_KEY && persisted.GEMINI_API_KEY) {
    merged.GEMINI_API_KEY = persisted.GEMINI_API_KEY
  }
  if (!merged.CODEX_API_KEY && persisted.CODEX_API_KEY) {
    merged.CODEX_API_KEY = persisted.CODEX_API_KEY
  }
  if (!merged.CHATGPT_ACCOUNT_ID && !merged.CODEX_ACCOUNT_ID) {
    merged.CHATGPT_ACCOUNT_ID =
      persisted.CHATGPT_ACCOUNT_ID ?? persisted.CODEX_ACCOUNT_ID
  }

  return merged
}

function normalizeDoctorTargetArg(
  raw: string | undefined,
): ProviderDoctorTarget | null {
  if (!raw) return 'all'
  const cleaned = raw.replace(/[<>]/g, '').trim().toLowerCase()
  if (!cleaned) return 'all'

  if (
    cleaned === 'openrouter' ||
    cleaned === 'openai' ||
    cleaned === 'ollama' ||
    cleaned === 'gemini' ||
    cleaned === 'codex' ||
    cleaned === 'all'
  ) {
    return cleaned
  }

  return null
}

export function buildProviderDoctorReport(options?: {
  processEnv?: NodeJS.ProcessEnv
  persisted?: ProfileFile | null
  target?: ProviderDoctorTarget
}): string {
  const processEnv = options?.processEnv ?? process.env
  const persisted = options?.persisted ?? loadProfileFile()
  const persistedEnv = resolvePersistedEnv(persisted)
  const mergedEnv = getEnvWithPersistedFallback(processEnv, persistedEnv)
  const summary = buildCurrentProviderSummary({ processEnv, persisted })

  const explicitFlags = [
    'CLAUDE_CODE_USE_OPENAI',
    'CLAUDE_CODE_USE_GITHUB',
    'CLAUDE_CODE_USE_GEMINI',
    'CLAUDE_CODE_USE_BEDROCK',
    'CLAUDE_CODE_USE_VERTEX',
    'CLAUDE_CODE_USE_FOUNDRY',
  ].filter(key => processEnv[key] !== undefined)

  const openAIKeyFromEnv = sanitizeApiKey(processEnv.OPENAI_API_KEY)
  const openAIKeyFromProfile = sanitizeApiKey(persistedEnv?.OPENAI_API_KEY)
  const openAIKey = sanitizeApiKey(mergedEnv.OPENAI_API_KEY)
  const openAIBaseUrl =
    sanitizeProviderConfigValue(processEnv.OPENAI_BASE_URL, processEnv) ||
    sanitizeProviderConfigValue(persistedEnv?.OPENAI_BASE_URL, persistedEnv) ||
    DEFAULT_OPENAI_BASE_URL
  const openAIModel =
    sanitizeProviderConfigValue(processEnv.OPENAI_MODEL, processEnv) ||
    sanitizeProviderConfigValue(persistedEnv?.OPENAI_MODEL, persistedEnv) ||
    'gpt-4o'
  const openRouterModel =
    isOpenRouterBaseUrl(openAIBaseUrl)
      ? openAIModel
      : isOpenRouterBaseUrl(persistedEnv?.OPENAI_BASE_URL)
        ? sanitizeProviderConfigValue(persistedEnv?.OPENAI_MODEL, persistedEnv) ||
          OPENROUTER_DEFAULT_MODEL
        : OPENROUTER_DEFAULT_MODEL

  const geminiKeyFromEnv = sanitizeApiKey(
    processEnv.GEMINI_API_KEY ?? processEnv.GOOGLE_API_KEY,
  )
  const geminiKeyFromProfile = sanitizeApiKey(persistedEnv?.GEMINI_API_KEY)
  const geminiKey = sanitizeApiKey(
    mergedEnv.GEMINI_API_KEY ?? mergedEnv.GOOGLE_API_KEY,
  )
  const geminiModel =
    sanitizeProviderConfigValue(processEnv.GEMINI_MODEL, processEnv) ||
    sanitizeProviderConfigValue(persistedEnv?.GEMINI_MODEL, persistedEnv) ||
    DEFAULT_GEMINI_MODEL
  const geminiBaseUrl =
    sanitizeProviderConfigValue(processEnv.GEMINI_BASE_URL, processEnv) ||
    sanitizeProviderConfigValue(persistedEnv?.GEMINI_BASE_URL, persistedEnv) ||
    DEFAULT_GEMINI_BASE_URL

  const liveCodex = resolveCodexApiCredentials(processEnv)
  const persistedCodexKey = sanitizeApiKey(persistedEnv?.CODEX_API_KEY)
  const persistedCodexAccount =
    persistedEnv?.CHATGPT_ACCOUNT_ID ?? persistedEnv?.CODEX_ACCOUNT_ID
  const codexKey =
    sanitizeApiKey(processEnv.CODEX_API_KEY) ||
    sanitizeApiKey(liveCodex.apiKey) ||
    persistedCodexKey
  const codexAccount =
    processEnv.CHATGPT_ACCOUNT_ID ||
    processEnv.CODEX_ACCOUNT_ID ||
    liveCodex.accountId ||
    persistedCodexAccount
  const codexModel =
    sanitizeProviderConfigValue(processEnv.OPENAI_MODEL, processEnv) ||
    sanitizeProviderConfigValue(persistedEnv?.OPENAI_MODEL, persistedEnv) ||
    'codexplan'

  const doctorTarget = options?.target ?? 'all'
  const sections: string[] = []

  const appendOpenRouterSection = () => {
    sections.push('[OpenRouter]')
    sections.push(`Status: ${openAIKey ? 'pronto' : 'faltando chave'}`)
    sections.push(
      `Chave: ${
        openAIKeyFromEnv
          ? 'ambiente'
          : openAIKeyFromProfile
            ? 'perfil salvo'
            : 'ausente'
      }`,
    )
    sections.push(`Modelo padrão: ${openRouterModel}`)
    sections.push(`Endpoint: ${OPENROUTER_BASE_URL}`)
  }

  const appendOpenAISection = () => {
    sections.push('[OpenAI-compatível]')
    sections.push(`Status: ${openAIKey ? 'pronto' : 'faltando chave'}`)
    sections.push(
      `Chave: ${
        openAIKeyFromEnv
          ? 'ambiente'
          : openAIKeyFromProfile
            ? 'perfil salvo'
            : 'ausente'
      }`,
    )
    sections.push(`Modelo: ${openAIModel}`)
    sections.push(`Endpoint: ${openAIBaseUrl}`)
  }

  const appendOllamaSection = () => {
    const ollamaBase =
      sanitizeProviderConfigValue(processEnv.OPENAI_BASE_URL, processEnv) ||
      sanitizeProviderConfigValue(persistedEnv?.OPENAI_BASE_URL, persistedEnv) ||
      'http://localhost:11434/v1'
    const ollamaModel =
      sanitizeProviderConfigValue(processEnv.OPENAI_MODEL, processEnv) ||
      sanitizeProviderConfigValue(persistedEnv?.OPENAI_MODEL, persistedEnv) ||
      'llama3.1:8b'

    sections.push('[Ollama]')
    sections.push('Status: depende do ollama estar rodando localmente')
    sections.push(`Modelo: ${ollamaModel}`)
    sections.push(`Endpoint: ${ollamaBase}`)
  }

  const appendGeminiSection = () => {
    sections.push('[Gemini]')
    sections.push(`Status: ${geminiKey ? 'pronto' : 'faltando chave'}`)
    sections.push(
      `Chave: ${
        geminiKeyFromEnv
          ? 'ambiente'
          : geminiKeyFromProfile
            ? 'perfil salvo'
            : 'ausente'
      }`,
    )
    sections.push(`Modelo: ${geminiModel}`)
    sections.push(`Endpoint: ${geminiBaseUrl}`)
  }

  const appendCodexSection = () => {
    let codexSource = 'ausente'
    if (liveCodex.apiKey && liveCodex.accountId) {
      codexSource = liveCodex.source === 'env' ? 'ambiente' : 'auth.json'
    } else if (persistedCodexKey && persistedCodexAccount) {
      codexSource = 'perfil salvo'
    }

    sections.push('[Codex]')
    sections.push(`Status: ${codexKey && codexAccount ? 'pronto' : 'faltando credenciais'}`)
    sections.push(`Credenciais: ${codexSource}`)
    sections.push(`Modelo: ${codexModel}`)
    sections.push(`Endpoint: ${DEFAULT_CODEX_BASE_URL}`)
  }

  const appendByTarget = (target: ProviderDoctorTarget) => {
    switch (target) {
      case 'openrouter':
        appendOpenRouterSection()
        return
      case 'openai':
        appendOpenAISection()
        return
      case 'ollama':
        appendOllamaSection()
        return
      case 'gemini':
        appendGeminiSection()
        return
      case 'codex':
        appendCodexSection()
        return
      case 'all':
      default:
        appendOpenRouterSection()
        sections.push('')
        appendOpenAISection()
        sections.push('')
        appendOllamaSection()
        sections.push('')
        appendGeminiSection()
        sections.push('')
        appendCodexSection()
    }
  }

  const lines = [
    'Provider Doctor',
    `Atual: ${summary.providerLabel}`,
    `Modelo atual: ${summary.modelLabel}`,
    `Endpoint atual: ${summary.endpointLabel}`,
    `Perfil salvo: ${persisted?.profile ?? 'none'}`,
    `Flags explícitas no shell: ${
      explicitFlags.length > 0 ? explicitFlags.join(', ') : 'nenhuma'
    }`,
    'Obs: flags explícitas do shell têm prioridade sobre perfil salvo.',
    '',
  ]

  appendByTarget(doctorTarget)
  return [...lines, ...sections].join('\n')
}

function buildQuickProfileFromChoice(
  choice: ProviderChoice,
  processEnv: NodeJS.ProcessEnv,
  persisted?: ProfileFile | null,
): { profile: ProviderProfile; env: ProfileEnv } | null {
  const persistedEnv = resolvePersistedEnv(persisted)
  const mergedEnv = getEnvWithPersistedFallback(processEnv, persistedEnv)
  const defaults = getProviderWizardDefaults(processEnv, persisted)

  if (choice === 'openrouter') {
    const key = sanitizeApiKey(mergedEnv.OPENAI_API_KEY)
    if (!key) return null

    const env = buildOpenAIProfileEnv({
      goal: normalizeRecommendationGoal(null),
      apiKey: key,
      baseUrl: OPENROUTER_BASE_URL,
      model: defaults.openRouterModel,
      processEnv: {},
    })
    return env ? { profile: 'openai', env } : null
  }

  if (choice === 'openai') {
    const key = sanitizeApiKey(mergedEnv.OPENAI_API_KEY)
    if (!key) return null

    const env = buildOpenAIProfileEnv({
      goal: normalizeRecommendationGoal(null),
      apiKey: key,
      baseUrl: defaults.openAIBaseUrl,
      model: defaults.openAIModel,
      processEnv: {},
    })
    return env ? { profile: 'openai', env } : null
  }

  if (choice === 'gemini') {
    const key = sanitizeApiKey(
      mergedEnv.GEMINI_API_KEY ?? mergedEnv.GOOGLE_API_KEY,
    )
    if (!key) return null

    const geminiBaseUrl =
      sanitizeProviderConfigValue(processEnv.GEMINI_BASE_URL, processEnv) ||
      sanitizeProviderConfigValue(persistedEnv?.GEMINI_BASE_URL, persistedEnv) ||
      null
    const env = buildGeminiProfileEnv({
      apiKey: key,
      model: defaults.geminiModel,
      baseUrl: geminiBaseUrl,
      processEnv: {},
    })
    return env ? { profile: 'gemini', env } : null
  }

  if (choice === 'codex') {
    const shellOpenAIModel = sanitizeProviderConfigValue(
      processEnv.OPENAI_MODEL,
      processEnv,
    )
    const shellOpenAIBaseUrl = sanitizeProviderConfigValue(
      processEnv.OPENAI_BASE_URL,
      processEnv,
    )
    const shellRequest = resolveProviderRequest({
      model: shellOpenAIModel,
      baseUrl: shellOpenAIBaseUrl,
      fallbackModel: 'codexplan',
    })
    const persistedCodexModel =
      persisted?.profile === 'codex'
        ? sanitizeProviderConfigValue(persistedEnv?.OPENAI_MODEL, persistedEnv)
        : undefined
    const codexModel =
      shellRequest.transport === 'codex_responses' && shellOpenAIModel
        ? shellOpenAIModel
        : persistedCodexModel || 'codexplan'
    const env = buildCodexProfileEnv({
      model: codexModel,
      processEnv: mergedEnv,
    })
    return env ? { profile: 'codex', env } : null
  }

  return null
}

function finishProfileSave(
  onDone: LocalJSXCommandOnDone,
  profile: ProviderProfile,
  env: ProfileEnv,
): void {
  try {
    const existingProfile = loadProfileFile()
    const mergedEnv = mergeRememberedCredentials(env, existingProfile?.env)
    const profileFile = createProfileFile(profile, mergedEnv)
    const filePath = saveProfileFile(profileFile)
    onDone(buildProfileSaveMessage(profile, mergedEnv, filePath), {
      display: 'system',
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    onDone(`Falha ao salvar perfil de provedor: ${message}`, {
      display: 'system',
    })
  }
}

export function TextEntryDialog({
  title,
  subtitle,
  resetStateKey,
  description,
  initialValue,
  placeholder,
  mask,
  allowEmpty = false,
  validate,
  onSubmit,
  onCancel,
}: TextEntryDialogProps): React.ReactNode {
  const { columns } = useTerminalSize()
  const [value, setValue] = React.useState(initialValue)
  const [cursorOffset, setCursorOffset] = React.useState(initialValue.length)
  const [error, setError] = React.useState<string | null>(null)

  React.useLayoutEffect(() => {
    setValue(initialValue)
    setCursorOffset(initialValue.length)
    setError(null)
  }, [initialValue, resetStateKey])

  const inputColumns = Math.max(30, columns - 6)

  const handleSubmit = React.useCallback(
    (nextValue: string) => {
      if (!allowEmpty && nextValue.trim().length === 0) {
        setError('Um valor é obrigatório pra esse passo.')
        return
      }

      const validationError = validate?.(nextValue)
      if (validationError) {
        setError(validationError)
        return
      }

      setError(null)
      onSubmit(nextValue)
    },
    [allowEmpty, onSubmit, validate],
  )

  return (
    <Dialog title={title} subtitle={subtitle} onCancel={onCancel}>
      <Box flexDirection="column" gap={1}>
        <Text>{description}</Text>
        <TextInput
          value={value}
          onChange={setValue}
          onSubmit={handleSubmit}
          placeholder={placeholder}
          mask={mask}
          columns={inputColumns}
          cursorOffset={cursorOffset}
          onChangeCursorOffset={setCursorOffset}
          focus
          showCursor
        />
        {error ? <Text color="error">{error}</Text> : null}
      </Box>
    </Dialog>
  )
}

function ProviderChooser({
  onChoose,
  onCancel,
}: {
  onChoose: (value: ProviderChoice) => void
  onCancel: () => void
}): React.ReactNode {
  const summary = buildCurrentProviderSummary()
  const options: OptionWithDescription<ProviderChoice>[] = [
    {
      label: 'Auto',
      value: 'auto',
      description:
        'Prefere Ollama local se tiver, senão te ajuda a configurar OpenAI',
    },
    {
      label: 'Ollama',
      value: 'ollama',
      description: 'Roda modelo local sem precisar de chave de API',
    },
    {
      label: 'OpenAI-compatível',
      value: 'openai',
      description:
        'GPT-4o, DeepSeek, OpenRouter, Groq, LM Studio e outras APIs',
    },
    {
      label: 'OpenRouter',
      value: 'openrouter',
      description:
        'Atalho pra OPENAI_BASE_URL=openrouter.ai com modelo inicial grátis',
    },
    {
      label: 'Gemini',
      value: 'gemini',
      description: 'Usa chave de API do Google Gemini',
    },
    {
      label: 'Codex',
      value: 'codex',
      description: 'Usa auth do ChatGPT Codex CLI ou credenciais do ambiente',
    },
  ]

  if (summary.savedProfileLabel !== 'none') {
    options.push({
      label: 'Limpar perfil salvo',
      value: 'clear',
      description: 'Remove perfil salvo e volta pro startup normal',
    })
  }

  return (
    <Dialog
      title="Configurar perfil de provedor"
      subtitle={`Provedor atual: ${summary.providerLabel}`}
      onCancel={onCancel}
    >
      <Box flexDirection="column" gap={1}>
        <Text>
          Salva um perfil de provedor pro próximo restart do claudinho sem
          precisar mexer nas variáveis de ambiente.
        </Text>
        <Box flexDirection="column">
          <Text dimColor>Modelo atual: {summary.modelLabel}</Text>
          <Text dimColor>Endpoint atual: {summary.endpointLabel}</Text>
          <Text dimColor>Perfil salvo: {summary.savedProfileLabel}</Text>
        </Box>
        <Select
          options={options}
          inlineDescriptions
          visibleOptionCount={options.length}
          onChange={onChoose}
          onCancel={onCancel}
        />
      </Box>
    </Dialog>
  )
}

function AutoGoalChooser({
  onChoose,
  onBack,
}: {
  onChoose: (goal: RecommendationGoal) => void
  onBack: () => void
}): React.ReactNode {
  const options: OptionWithDescription<RecommendationGoal>[] = [
    {
      label: 'Balanceado',
      value: 'balanced',
      description: 'Padrão bom pra maioria dos casos',
    },
    {
      label: 'Código',
      value: 'coding',
      description: 'Prefere modelos locais bons pra código ou GPT-4o',
    },
    {
      label: 'Velocidade',
      value: 'latency',
      description: 'Prefere modelos locais mais rápidos ou gpt-4o-mini',
    },
  ]

  return (
    <Dialog title="Objetivo do setup automático" onCancel={onBack}>
      <Box flexDirection="column" gap={1}>
        <Text>Escolhe o objetivo que o setup automático deve otimizar.</Text>
        <Select
          options={options}
          defaultValue="balanced"
          defaultFocusValue="balanced"
          inlineDescriptions
          visibleOptionCount={options.length}
          onChange={onChoose}
          onCancel={onBack}
        />
      </Box>
    </Dialog>
  )
}

function AutoRecommendationStep({
  goal,
  onBack,
  onSave,
  onNeedOpenAI,
  onCancel,
}: {
  goal: RecommendationGoal
  onBack: () => void
  onSave: (profile: ProviderProfile, env: ProfileEnv) => void
  onNeedOpenAI: (defaultModel: string) => void
  onCancel: () => void
}): React.ReactNode {
  const [status, setStatus] = React.useState<
    | {
        state: 'loading'
      }
    | {
        state: 'ollama'
        model: string
        summary: string
      }
    | {
        state: 'openai'
        defaultModel: string
      }
    | {
        state: 'error'
        message: string
      }
  >({ state: 'loading' })

  React.useEffect(() => {
    let cancelled = false

    void (async () => {
      const defaultModel = getGoalDefaultOpenAIModel(goal)
      try {
        const ollamaAvailable = await hasLocalOllama()
        if (!ollamaAvailable) {
          if (!cancelled) {
            setStatus({ state: 'openai', defaultModel })
          }
          return
        }

        const models = await listOllamaModels()
        const recommended = recommendOllamaModel(models, goal)
        if (!recommended) {
          if (!cancelled) {
            setStatus({ state: 'openai', defaultModel })
          }
          return
        }

        if (!cancelled) {
          setStatus({
            state: 'ollama',
            model: recommended.name,
            summary: recommended.summary,
          })
        }
      } catch (error) {
        if (!cancelled) {
          setStatus({
            state: 'error',
            message: error instanceof Error ? error.message : String(error),
          })
        }
      }
    })()

    return () => {
      cancelled = true
    }
  }, [goal])

  if (status.state === 'loading') {
    return <LoadingState message="Verificando provedores locais…" />
  }

  if (status.state === 'error') {
    return (
      <Dialog title="Setup automático falhou" onCancel={onCancel} color="warning">
        <Box flexDirection="column" gap={1}>
          <Text>{status.message}</Text>
          <Select
            options={[
              { label: 'Voltar', value: 'back' },
              { label: 'Cancelar', value: 'cancel' },
            ]}
            onChange={value => (value === 'back' ? onBack() : onCancel())}
            onCancel={onCancel}
          />
        </Box>
      </Dialog>
    )
  }

  if (status.state === 'openai') {
    return (
      <Dialog title="Fallback do setup automático" onCancel={onCancel}>
        <Box flexDirection="column" gap={1}>
          <Text>
            Nenhum modelo Ollama local viável foi detectado. O setup automático pode
            continuar pro setup OpenAI-compatível com modelo padrão{' '}
            {status.defaultModel}.
          </Text>
          <Select
            options={[
              { label: 'Continuar pro setup OpenAI-compatível', value: 'continue' },
              { label: 'Voltar', value: 'back' },
              { label: 'Cancelar', value: 'cancel' },
            ]}
            onChange={value => {
              if (value === 'continue') {
                onNeedOpenAI(status.defaultModel)
              } else if (value === 'back') {
                onBack()
              } else {
                onCancel()
              }
            }}
            onCancel={onCancel}
          />
        </Box>
      </Dialog>
    )
  }

  return (
    <Dialog title="Salvar perfil recomendado?" onCancel={onBack}>
      <Box flexDirection="column" gap={1}>
        <Text>
          O setup automático recomenda um perfil Ollama local pra {goal} baseado nos
          modelos disponíveis nessa máquina.
        </Text>
        <Text dimColor>
          Modelo recomendado: {status.model}
          {status.summary ? ` · ${status.summary}` : ''}
        </Text>
        <Select
          options={[
            { label: 'Salvar perfil Ollama recomendado', value: 'save' },
            { label: 'Voltar', value: 'back' },
            { label: 'Cancelar', value: 'cancel' },
          ]}
          onChange={value => {
            if (value === 'save') {
              onSave(
                'ollama',
                buildOllamaProfileEnv(status.model, {
                  getOllamaChatBaseUrl,
                }),
              )
            } else if (value === 'back') {
              onBack()
            } else {
              onCancel()
            }
          }}
          onCancel={onBack}
        />
      </Box>
    </Dialog>
  )
}

function OllamaModelStep({
  onSave,
  onBack,
  onCancel,
}: {
  onSave: (profile: ProviderProfile, env: ProfileEnv) => void
  onBack: () => void
  onCancel: () => void
}): React.ReactNode {
  const [status, setStatus] = React.useState<
    | { state: 'loading' }
    | {
        state: 'ready'
        options: OptionWithDescription<string>[]
        defaultValue?: string
      }
    | { state: 'unavailable'; message: string }
  >({ state: 'loading' })

  React.useEffect(() => {
    let cancelled = false

    void (async () => {
      const available = await hasLocalOllama()
      if (!available) {
        if (!cancelled) {
          setStatus({
            state: 'unavailable',
            message:
              'Could not reach Ollama at http://localhost:11434. Start Ollama first, then run /provider again.',
          })
        }
        return
      }

      const models = await listOllamaModels()
      if (models.length === 0) {
        if (!cancelled) {
          setStatus({
            state: 'unavailable',
            message:
              'Ollama is running, but no installed models were found. Pull a chat model such as qwen2.5-coder:7b or llama3.1:8b first.',
          })
        }
        return
      }

      const ranked = rankOllamaModels(models, 'balanced')
      const recommended = recommendOllamaModel(models, 'balanced')
      if (!cancelled) {
        setStatus({
          state: 'ready',
          defaultValue: recommended?.name ?? ranked[0]?.name,
          options: ranked.map(model => ({
            label: model.name,
            value: model.name,
            description: model.summary,
          })),
        })
      }
    })()

    return () => {
      cancelled = true
    }
  }, [])

  if (status.state === 'loading') {
    return <LoadingState message="Verificando modelos Ollama locais…" />
  }

  if (status.state === 'unavailable') {
    return (
      <Dialog title="Setup do Ollama" onCancel={onCancel} color="warning">
        <Box flexDirection="column" gap={1}>
          <Text>{status.message}</Text>
          <Select
            options={[
              { label: 'Voltar', value: 'back' },
              { label: 'Cancelar', value: 'cancel' },
            ]}
            onChange={value => (value === 'back' ? onBack() : onCancel())}
            onCancel={onCancel}
          />
        </Box>
      </Dialog>
    )
  }

  return (
    <Dialog title="Escolhe um modelo Ollama" onCancel={onBack}>
      <Box flexDirection="column" gap={1}>
        <Text>
          Escolhe um dos modelos Ollama instalados pra salvar num perfil local.
        </Text>
        <Select
          options={status.options}
          defaultValue={status.defaultValue}
          defaultFocusValue={status.defaultValue}
          inlineDescriptions
          visibleOptionCount={Math.min(8, status.options.length)}
          onChange={value => {
            onSave(
              'ollama',
              buildOllamaProfileEnv(value, {
                getOllamaChatBaseUrl,
              }),
            )
          }}
          onCancel={onBack}
        />
      </Box>
    </Dialog>
  )
}

function CodexCredentialStep({
  credentialsEnv,
  onUseDetected,
  onManual,
  onBack,
  onCancel,
}: {
  credentialsEnv?: NodeJS.ProcessEnv
  onUseDetected: () => void
  onManual: () => void
  onBack: () => void
  onCancel: () => void
}): React.ReactNode {
  const credentials = resolveCodexCredentials(credentialsEnv ?? process.env)

  if (!credentials.ok) {
    return (
      <Dialog title="Setup do Codex" onCancel={onCancel} color="warning">
        <Box flexDirection="column" gap={1}>
          <Text>{credentials.message}</Text>
          <Select
            options={[
              {
                label: 'Colar CODEX_API_KEY manualmente',
                value: 'manual',
                description:
                  'Você digita as credenciais aqui, sem depender do auth.json',
              },
              { label: 'Voltar', value: 'back' },
              { label: 'Cancelar', value: 'cancel' },
            ]}
            onChange={value => {
              if (value === 'manual') {
                onManual()
              } else if (value === 'back') {
                onBack()
              } else {
                onCancel()
              }
            }}
            onCancel={onCancel}
          />
        </Box>
      </Dialog>
    )
  }

  return (
    <Dialog title="Setup do Codex" onCancel={onBack}>
      <Box flexDirection="column" gap={1}>
        <Text>
          Reusa suas credenciais existentes do Codex de{' '}
          {credentials.sourceDescription}.
        </Text>
        <Select
          options={[
            {
              label: 'Usar credenciais detectadas',
              value: 'detected',
              description: 'Segue pro seletor de modelo do Codex',
            },
            {
              label: 'Trocar credenciais manualmente',
              value: 'manual',
              description:
                'Use essa opção se quiser mudar conta/token sem sair da sessão',
            },
            { label: 'Voltar', value: 'back' },
            { label: 'Cancelar', value: 'cancel' },
          ]}
          inlineDescriptions
          visibleOptionCount={4}
          onChange={value => {
            if (value === 'detected') {
              onUseDetected()
            } else if (value === 'manual') {
              onManual()
            } else if (value === 'back') {
              onBack()
            } else {
              onCancel()
            }
          }}
          onCancel={onBack}
        />
      </Box>
    </Dialog>
  )
}

function resolveCodexCredentials(processEnv: NodeJS.ProcessEnv):
  | { ok: true; sourceDescription: string }
  | { ok: false; message: string } {
  const credentials = resolveCodexApiCredentials(processEnv)

  if (!credentials.apiKey) {
    const authHint = credentials.authPath
      ? `Arquivo esperado: ${credentials.authPath}.`
      : 'Defina CODEX_API_KEY ou faça login de novo no Codex CLI.'
    return {
      ok: false,
      message: `Não achei credenciais do Codex. Você pode colar manualmente agora, ou fazer login no Codex CLI. ${authHint}`,
    }
  }

  if (!credentials.accountId) {
    return {
      ok: false,
      message:
        'As credenciais atuais do Codex não têm chatgpt_account_id. Você pode informar manualmente agora, ou definir CHATGPT_ACCOUNT_ID/CODEX_ACCOUNT_ID.',
    }
  }

  return {
    ok: true,
    sourceDescription:
      credentials.source === 'env'
        ? 'o ambiente atual do shell'
        : credentials.authPath ?? DEFAULT_CODEX_BASE_URL,
  }
}

function getCodexModelOptions(): OptionWithDescription<string>[] {
  return [
    {
      label: 'codexplan',
      value: 'codexplan',
      description: 'GPT-5.4 com raciocínio maior no backend do Codex',
    },
    {
      label: 'codexspark',
      value: 'codexspark',
      description: 'Perfil Codex Spark mais rápido pro loop de ferramentas',
    },
  ]
}

function getInitialStepFromChoice(
  choice: ProviderChoice | null | undefined,
  defaults: ProviderWizardDefaults,
): Step {
  switch (choice) {
    case 'auto':
      return { name: 'auto-goal' }
    case 'openrouter':
      return {
        name: 'openai-key',
        defaultModel: defaults.openRouterModel,
        defaultBaseUrl: OPENROUTER_BASE_URL,
        skipBaseStep: true,
        providerLabel: 'OpenRouter',
      }
    case 'ollama':
      return { name: 'ollama-detect' }
    case 'openai':
      return {
        name: 'openai-key',
        defaultModel: defaults.openAIModel,
        defaultBaseUrl: defaults.openAIBaseUrl,
        providerLabel: 'OpenAI-compatível',
      }
    case 'gemini':
      return { name: 'gemini-key' }
    case 'codex':
      return { name: 'codex-check' }
    default:
      return { name: 'choose' }
  }
}

function ProviderWizard({
  onDone,
  initialChoice,
  persisted,
}: {
  onDone: LocalJSXCommandOnDone
  initialChoice?: ProviderChoice | null
  persisted?: ProfileFile | null
}): React.ReactNode {
  const persistedProfile = React.useMemo(
    () => persisted ?? loadProfileFile(),
    [persisted],
  )
  const persistedEnv = resolvePersistedEnv(persistedProfile)
  const defaults = getProviderWizardDefaults(process.env, persistedProfile)
  const rememberedOpenAIKey = sanitizeApiKey(
    process.env.OPENAI_API_KEY ?? persistedEnv?.OPENAI_API_KEY,
  )
  const rememberedGeminiKey = sanitizeApiKey(
    process.env.GEMINI_API_KEY ??
      process.env.GOOGLE_API_KEY ??
      persistedEnv?.GEMINI_API_KEY,
  )
  const codexEnvWithFallback = React.useMemo(
    () => getEnvWithPersistedFallback(process.env, persistedEnv),
    [persistedEnv],
  )
  const [step, setStep] = React.useState<Step>(() =>
    getInitialStepFromChoice(initialChoice, defaults),
  )

  switch (step.name) {
    case 'choose':
      return (
        <ProviderChooser
          onChoose={value => {
            if (value === 'auto') {
              setStep({ name: 'auto-goal' })
            } else if (value === 'ollama') {
              setStep({ name: 'ollama-detect' })
            } else if (value === 'openai') {
              setStep({
                name: 'openai-key',
                defaultModel: defaults.openAIModel,
                defaultBaseUrl: defaults.openAIBaseUrl,
                providerLabel: 'OpenAI-compatível',
              })
            } else if (value === 'openrouter') {
              setStep({
                name: 'openai-key',
                defaultModel: defaults.openRouterModel,
                defaultBaseUrl: OPENROUTER_BASE_URL,
                skipBaseStep: true,
                providerLabel: 'OpenRouter',
              })
            } else if (value === 'gemini') {
              setStep({ name: 'gemini-key' })
            } else if (value === 'clear') {
              const filePath = deleteProfileFile()
              onDone(`Perfil de provedor removido de ${filePath}. Reinicia o claudinho pra voltar pro startup normal.`, {
                display: 'system',
              })
            } else {
              setStep({ name: 'codex-check' })
            }
          }}
          onCancel={() => onDone()}
        />
      )

    case 'auto-goal':
      return (
        <AutoGoalChooser
          onChoose={goal => setStep({ name: 'auto-detect', goal })}
          onBack={() => setStep({ name: 'choose' })}
        />
      )

    case 'auto-detect':
      return (
        <AutoRecommendationStep
          goal={step.goal}
          onBack={() => setStep({ name: 'auto-goal' })}
          onSave={(profile, env) => finishProfileSave(onDone, profile, env)}
          onNeedOpenAI={defaultModel =>
            setStep({ name: 'openai-key', defaultModel })
          }
          onCancel={() => onDone()}
        />
      )

    case 'ollama-detect':
      return (
        <OllamaModelStep
          onSave={(profile, env) => finishProfileSave(onDone, profile, env)}
          onBack={() => setStep({ name: 'choose' })}
          onCancel={() => onDone()}
        />
      )

    case 'openai-key':
      return (
        <TextEntryDialog
          resetStateKey={step.name}
          title={`Setup ${step.providerLabel ?? 'OpenAI-compatível'}`}
          subtitle={step.skipBaseStep ? 'Passo 1 de 2' : 'Passo 1 de 3'}
          description={
            rememberedOpenAIKey
              ? 'Digite uma chave de API, ou deixa em branco pra reusar a chave já encontrada (ambiente/perfil salvo).'
              : 'Digite a chave de API do seu provedor OpenAI-compatível.'
          }
          initialValue=""
          placeholder="sk-..."
          mask="*"
          allowEmpty={Boolean(rememberedOpenAIKey)}
          validate={value => {
            const candidate = value.trim() || rememberedOpenAIKey || ''
            return sanitizeApiKey(candidate)
              ? null
              : 'Digite uma chave de API real. Placeholders tipo SUA_CHAVE não são válidos.'
          }}
          onSubmit={value => {
            const apiKey = value.trim() || rememberedOpenAIKey || ''
            if (step.skipBaseStep) {
              setStep({
                name: 'openai-model',
                apiKey,
                baseUrl: step.defaultBaseUrl || OPENROUTER_BASE_URL,
                defaultModel: step.defaultModel,
                skipBaseStep: true,
                providerLabel: step.providerLabel,
              })
              return
            }

            setStep({
              name: 'openai-base',
              apiKey,
              defaultModel: step.defaultModel,
              defaultBaseUrl: step.defaultBaseUrl,
              skipBaseStep: step.skipBaseStep,
              providerLabel: step.providerLabel,
            })
          }}
          onCancel={() => setStep({ name: 'choose' })}
        />
      )

    case 'openai-base':
      return (
        <TextEntryDialog
          resetStateKey={step.name}
          title={`Setup ${step.providerLabel ?? 'OpenAI-compatível'}`}
          subtitle="Passo 2 de 3"
          description={`Opcionalmente digite uma URL base. Deixa em branco pra ${DEFAULT_OPENAI_BASE_URL}.`}
          initialValue={
            (step.defaultBaseUrl && step.defaultBaseUrl !== DEFAULT_OPENAI_BASE_URL)
              ? step.defaultBaseUrl
              : defaults.openAIBaseUrl === DEFAULT_OPENAI_BASE_URL
                ? ''
                : defaults.openAIBaseUrl
          }
          placeholder={DEFAULT_OPENAI_BASE_URL}
          allowEmpty
          onSubmit={value => {
            setStep({
              name: 'openai-model',
              apiKey: step.apiKey,
              baseUrl: value.trim() || null,
              defaultModel: step.defaultModel,
              skipBaseStep: false,
              providerLabel: step.providerLabel,
            })
          }}
          onCancel={() =>
            setStep({
              name: 'openai-key',
              defaultModel: step.defaultModel,
              defaultBaseUrl: step.defaultBaseUrl,
              skipBaseStep: step.skipBaseStep,
              providerLabel: step.providerLabel,
            })
          }
        />
      )

    case 'openai-model':
      return (
        <TextEntryDialog
          resetStateKey={step.name}
          title={`Setup ${step.providerLabel ?? 'OpenAI-compatível'}`}
          subtitle={step.skipBaseStep ? 'Passo 2 de 2' : 'Passo 3 de 3'}
          description={`Digite um nome de modelo. Deixa em branco pra ${step.defaultModel}.`}
          initialValue={
            step.skipBaseStep ? step.defaultModel : defaults.openAIModel ?? step.defaultModel
          }
          placeholder={step.defaultModel}
          allowEmpty
          onSubmit={value => {
            const env = buildOpenAIProfileEnv({
              goal: normalizeRecommendationGoal(null),
              apiKey: step.apiKey,
              baseUrl: step.baseUrl,
              model: value.trim() || step.defaultModel,
              processEnv: {},
            })
            if (env) {
              finishProfileSave(onDone, 'openai', env)
            }
          }}
          onCancel={() =>
            step.skipBaseStep
              ? setStep({
                  name: 'openai-key',
                  defaultModel: step.defaultModel,
                  defaultBaseUrl: step.baseUrl,
                  skipBaseStep: true,
                  providerLabel: step.providerLabel,
                })
              : setStep({
                  name: 'openai-base',
                  apiKey: step.apiKey,
                  defaultModel: step.defaultModel,
                  defaultBaseUrl: step.baseUrl,
                  providerLabel: step.providerLabel,
                })
          }
        />
      )

    case 'gemini-key':
      return (
        <TextEntryDialog
          resetStateKey={step.name}
          title="Setup do Gemini"
          subtitle="Passo 1 de 2"
          description={
            rememberedGeminiKey
              ? 'Digite uma chave de API do Gemini, ou deixa em branco pra reusar a chave já encontrada (ambiente/perfil salvo).'
              : 'Digite uma chave de API do Gemini. Você pode criar uma em https://aistudio.google.com/apikey.'
          }
          initialValue=""
          placeholder="AIza..."
          mask="*"
          allowEmpty={Boolean(rememberedGeminiKey)}
          onSubmit={value => {
            const apiKey = value.trim() || rememberedGeminiKey || ''
            setStep({ name: 'gemini-model', apiKey })
          }}
          onCancel={() => setStep({ name: 'choose' })}
        />
      )

    case 'gemini-model':
      return (
        <TextEntryDialog
          resetStateKey={step.name}
          title="Setup do Gemini"
          subtitle="Passo 2 de 2"
          description={`Digite um nome de modelo do Gemini. Deixa em branco pra ${DEFAULT_GEMINI_MODEL}.`}
          initialValue={defaults.geminiModel}
          placeholder={DEFAULT_GEMINI_MODEL}
          allowEmpty
          onSubmit={value => {
            const env = buildGeminiProfileEnv({
              apiKey: step.apiKey,
              model: value.trim() || DEFAULT_GEMINI_MODEL,
              processEnv: {},
            })
            if (env) {
              finishProfileSave(onDone, 'gemini', env)
            }
          }}
          onCancel={() => setStep({ name: 'gemini-key' })}
        />
      )

    case 'codex-check':
      return (
        <CodexCredentialStep
          credentialsEnv={codexEnvWithFallback}
          onUseDetected={() => setStep({ name: 'codex-model', source: 'detected' })}
          onManual={() => setStep({ name: 'codex-manual-key' })}
          onBack={() => setStep({ name: 'choose' })}
          onCancel={() => onDone()}
        />
      )

    case 'codex-manual-key':
      return (
        <TextEntryDialog
          resetStateKey={step.name}
          title="Setup do Codex"
          subtitle="Passo 1 de 2"
          description="Cole sua CODEX_API_KEY. Se a chave tiver chatgpt_account_id embutido, o próximo passo pode ser pulado."
          initialValue=""
          placeholder="sk-..."
          mask="*"
          validate={value =>
            sanitizeApiKey(value.trim())
              ? null
              : 'Digite uma CODEX_API_KEY real. Placeholders não são válidos.'
          }
          onSubmit={value => {
            const apiKey = value.trim()
            const parsedAccountId = parseChatgptAccountId(apiKey)
            if (parsedAccountId) {
              setStep({
                name: 'codex-model',
                source: 'manual',
                apiKey,
                accountId: parsedAccountId,
              })
              return
            }

            setStep({
              name: 'codex-manual-account',
              apiKey,
            })
          }}
          onCancel={() => setStep({ name: 'codex-check' })}
        />
      )

    case 'codex-manual-account':
      return (
        <TextEntryDialog
          resetStateKey={step.name}
          title="Setup do Codex"
          subtitle="Passo 2 de 2"
          description="Informe seu CHATGPT_ACCOUNT_ID (ou CODEX_ACCOUNT_ID)."
          initialValue={
            process.env.CHATGPT_ACCOUNT_ID || process.env.CODEX_ACCOUNT_ID || ''
          }
          placeholder="acc_..."
          validate={value =>
            value.trim().length > 0
              ? null
              : 'CHATGPT_ACCOUNT_ID é obrigatório pra usar Codex.'
          }
          onSubmit={value => {
            setStep({
              name: 'codex-model',
              source: 'manual',
              apiKey: step.apiKey,
              accountId: value.trim(),
            })
          }}
          onCancel={() => setStep({ name: 'codex-manual-key' })}
        />
      )

    case 'codex-model':
      return (
        <Dialog title="Escolhe um perfil do Codex" onCancel={() => setStep({ name: 'codex-check' })}>
          <Box flexDirection="column" gap={1}>
            <Text>
              {step.source === 'detected'
                ? 'Credenciais detectadas com sucesso. Agora escolhe o modo do Codex.'
                : 'Credenciais manuais salvas. Agora escolhe o modo do Codex.'}
            </Text>
            <Select
              options={getCodexModelOptions()}
              defaultValue="codexplan"
              defaultFocusValue="codexplan"
              inlineDescriptions
              visibleOptionCount={2}
              onChange={value => {
                const env =
                  step.source === 'detected'
                    ? buildCodexProfileEnv({
                        model: value,
                        processEnv: codexEnvWithFallback,
                      })
                    : buildCodexProfileEnv({
                        model: value,
                        apiKey: step.apiKey ?? null,
                        processEnv: {
                          ...process.env,
                          CODEX_API_KEY: step.apiKey ?? process.env.CODEX_API_KEY,
                          CHATGPT_ACCOUNT_ID:
                            step.accountId ?? process.env.CHATGPT_ACCOUNT_ID,
                          CODEX_ACCOUNT_ID:
                            step.accountId ?? process.env.CODEX_ACCOUNT_ID,
                        },
                      })

                if (!env) {
                  onDone(
                    'Não consegui montar o perfil Codex com essas credenciais. Tenta /provider codex e escolhe o modo manual novamente.',
                    { display: 'system' },
                  )
                  return
                }

                finishProfileSave(onDone, 'codex', env)
              }}
              onCancel={() => setStep({ name: 'codex-check' })}
            />
          </Box>
        </Dialog>
      )
  }
}

export const call: LocalJSXCommandCall = async (onDone, _context, args) => {
  const normalizedArgs = args?.trim().toLowerCase() || ''
  const persisted = loadProfileFile()

  if (COMMON_INFO_ARGS.includes(normalizedArgs)) {
    onDone(buildUsageText(), { display: 'system' })
    return null
  }

  if (COMMON_HELP_ARGS.includes(normalizedArgs)) {
    onDone(buildUsageText(), { display: 'system' })
    return null
  }

  const tokens = normalizedArgs.split(/\s+/).filter(Boolean)
  if (tokens[0] === 'doctor') {
    const target = normalizeDoctorTargetArg(tokens[1])
    if (!target) {
      onDone(
        'Uso: /provider doctor [openrouter|openai|ollama|gemini|codex]',
        { display: 'system' },
      )
      return null
    }

    onDone(
      buildProviderDoctorReport({
        processEnv: process.env,
        persisted,
        target,
      }),
      { display: 'system' },
    )
    return null
  }

  if (!normalizedArgs) {
    return <ProviderWizard onDone={onDone} persisted={persisted} />
  }

  const quickChoice = QUICK_PROVIDER_ARGS.find(value => value === normalizedArgs)
  if (quickChoice) {
    if (quickChoice === 'clear') {
      const filePath = deleteProfileFile()
      onDone(
        `Perfil de provedor removido de ${filePath}. Reinicia o claudinho pra voltar pro startup normal.`,
        { display: 'system' },
      )
      return null
    }

    const quickProfile = buildQuickProfileFromChoice(
      quickChoice,
      process.env,
      persisted,
    )
    if (quickProfile) {
      finishProfileSave(onDone, quickProfile.profile, quickProfile.env)
      return null
    }

    return (
      <ProviderWizard
        onDone={onDone}
        initialChoice={quickChoice}
        persisted={persisted}
      />
    )
  }

  onDone(
    'Uso: /provider\nUso rápido: /provider <auto|openrouter|ollama|openai|gemini|codex|clear>\nDiagnóstico: /provider doctor [openrouter|openai|ollama|gemini|codex]',
    { display: 'system' },
  )
  return null
}
