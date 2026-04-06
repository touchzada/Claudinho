import {
  buildLaunchEnv,
  type ProfileFile,
  type ProviderProfile,
} from './providerProfile.js'

export const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1'
export const OPENROUTER_DEFAULT_MODEL = 'qwen/qwen3.6-plus:free'

export const CLI_PROVIDER_VALUES = [
  'openrouter',
  'openai',
  'ollama',
  'gemini',
  'codex',
] as const

export type CliProviderOverride = (typeof CLI_PROVIDER_VALUES)[number]

function normalizeProviderValue(value: string): CliProviderOverride | null {
  const normalized = value.trim().toLowerCase()
  if (
    normalized === 'openrouter' ||
    normalized === 'openai' ||
    normalized === 'ollama' ||
    normalized === 'gemini' ||
    normalized === 'codex'
  ) {
    return normalized
  }
  return null
}

export function parseProviderOverrideFromArgv(
  args: string[],
): CliProviderOverride | null {
  for (let i = 0; i < args.length; i++) {
    const token = args[i]
    if (!token) continue

    if (token === '--provider') {
      const next = args[i + 1]
      if (!next || next.startsWith('-')) {
        throw new Error(
          'Missing value for --provider. Use one of: openrouter, codex, openai, gemini, ollama.',
        )
      }
      const parsed = normalizeProviderValue(next)
      if (!parsed) {
        throw new Error(
          `Invalid --provider value "${next}". Use one of: openrouter, codex, openai, gemini, ollama.`,
        )
      }
      return parsed
    }

    if (token.startsWith('--provider=')) {
      const raw = token.slice('--provider='.length)
      if (!raw) {
        throw new Error(
          'Missing value for --provider. Use one of: openrouter, codex, openai, gemini, ollama.',
        )
      }
      const parsed = normalizeProviderValue(raw)
      if (!parsed) {
        throw new Error(
          `Invalid --provider value "${raw}". Use one of: openrouter, codex, openai, gemini, ollama.`,
        )
      }
      return parsed
    }
  }

  return null
}

function isOpenRouterBaseUrl(value: string | undefined): boolean {
  return (value ?? '').toLowerCase().includes('openrouter.ai')
}

function resolveOpenRouterModel(persisted?: ProfileFile | null): string {
  if (!persisted || persisted.profile !== 'openai') {
    return OPENROUTER_DEFAULT_MODEL
  }

  if (isOpenRouterBaseUrl(persisted.env.OPENAI_BASE_URL)) {
    return persisted.env.OPENAI_MODEL?.trim() || OPENROUTER_DEFAULT_MODEL
  }

  return OPENROUTER_DEFAULT_MODEL
}

export async function buildStartupEnvWithProviderOverride(options: {
  provider: CliProviderOverride
  processEnv?: NodeJS.ProcessEnv
  persisted?: ProfileFile | null
}): Promise<NodeJS.ProcessEnv> {
  const processEnv = options.processEnv ?? process.env
  const persisted = options.persisted ?? null

  if (options.provider === 'openrouter') {
    const env = await buildLaunchEnv({
      profile: 'openai',
      persisted,
      goal: 'balanced',
      processEnv,
    })

    env.CLAUDE_CODE_USE_OPENAI = '1'
    delete env.CLAUDE_CODE_USE_GEMINI
    delete env.CLAUDE_CODE_USE_GITHUB
    env.OPENAI_BASE_URL = OPENROUTER_BASE_URL
    env.OPENAI_MODEL = resolveOpenRouterModel(persisted)

    return env
  }

  return buildLaunchEnv({
    profile: options.provider as ProviderProfile,
    persisted,
    goal: 'balanced',
    processEnv,
  })
}

