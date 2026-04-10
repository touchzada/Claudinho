import assert from 'node:assert/strict'

import { afterEach, beforeEach, test } from 'bun:test'

import { getGlobalConfig, saveGlobalConfig } from './config.js'
import {
  addProviderProfile,
  applyActiveProviderProfileFromConfig,
  getProviderSummaryLine,
  setActiveProviderProfile,
} from './providerProfiles.js'

const ENV_KEYS = [
  'CLAUDE_CODE_USE_OPENAI',
  'CLAUDE_CODE_USE_GEMINI',
  'OPENAI_BASE_URL',
  'OPENAI_MODEL',
  'OPENAI_API_KEY',
  'GEMINI_BASE_URL',
  'GEMINI_MODEL',
  'GEMINI_API_KEY',
  'CODEX_API_KEY',
  'CHATGPT_ACCOUNT_ID',
  'CLAUDINHO_PROVIDER_PROFILE_ATIVO',
  'CLAUDINHO_PROVIDER_PROFILE_ATIVO_ID',
] as const

const originalEnv = Object.fromEntries(
  ENV_KEYS.map(key => [key, process.env[key]]),
) as Record<(typeof ENV_KEYS)[number], string | undefined>

function resetProviderProfilesInConfig(): void {
  saveGlobalConfig(current => ({
    ...current,
    providerProfiles: undefined,
    activeProviderProfileId: undefined,
  }))
}

beforeEach(() => {
  resetProviderProfilesInConfig()
  for (const key of ENV_KEYS) {
    delete process.env[key]
  }
})

afterEach(() => {
  resetProviderProfilesInConfig()
  for (const key of ENV_KEYS) {
    if (originalEnv[key] === undefined) {
      delete process.env[key]
    } else {
      process.env[key] = originalEnv[key]
    }
  }
})

test('addProviderProfile saves and activates a new OpenAI profile', () => {
  const profile = addProviderProfile({
    provider: 'openai',
    name: 'OpenRouter rapido',
    baseUrl: 'https://openrouter.ai/api/v1',
    model: 'qwen/qwen3.6-plus:free',
    apiKey: 'sk-openrouter',
  })

  assert.ok(profile)
  assert.equal(getGlobalConfig().providerProfiles?.length, 1)
  assert.equal(getGlobalConfig().activeProviderProfileId, profile.id)
  assert.equal(process.env.CLAUDE_CODE_USE_OPENAI, '1')
  assert.equal(process.env.OPENAI_BASE_URL, 'https://openrouter.ai/api/v1')
  assert.equal(process.env.OPENAI_MODEL, 'qwen/qwen3.6-plus:free')
  assert.equal(process.env.OPENAI_API_KEY, 'sk-openrouter')
  assert.equal(process.env.CLAUDINHO_PROVIDER_PROFILE_ATIVO_ID, profile.id)
})

test('setActiveProviderProfile switches env from Gemini to Codex', () => {
  saveGlobalConfig(current => ({
    ...current,
    providerProfiles: [
      {
        id: 'gemini_1',
        provider: 'gemini',
        name: 'Gemini',
        baseUrl: 'https://generativelanguage.googleapis.com/v1beta/openai',
        model: 'gemini-2.0-flash',
        apiKey: 'gem-key',
      },
      {
        id: 'codex_1',
        provider: 'codex',
        name: 'Codex',
        baseUrl: 'https://chatgpt.com/backend-api/codex',
        model: 'codexplan',
        accountId: 'acc_123',
      },
    ],
    activeProviderProfileId: 'gemini_1',
  }))

  applyActiveProviderProfileFromConfig(getGlobalConfig(), {
    processEnv: process.env,
    force: true,
  })

  assert.equal(process.env.CLAUDE_CODE_USE_GEMINI, '1')
  assert.equal(process.env.GEMINI_API_KEY, 'gem-key')

  const activeProfile = setActiveProviderProfile('codex_1')

  assert.ok(activeProfile)
  assert.equal(getGlobalConfig().activeProviderProfileId, 'codex_1')
  assert.equal(process.env.CLAUDE_CODE_USE_OPENAI, '1')
  assert.equal(process.env.CLAUDE_CODE_USE_GEMINI, undefined)
  assert.equal(process.env.GEMINI_API_KEY, undefined)
  assert.equal(process.env.OPENAI_BASE_URL, 'https://chatgpt.com/backend-api/codex')
  assert.equal(process.env.OPENAI_MODEL, 'codexplan')
  assert.equal(process.env.CHATGPT_ACCOUNT_ID, 'acc_123')
})

test('applyActiveProviderProfileFromConfig respects explicit shell provider flags', () => {
  const processEnv: NodeJS.ProcessEnv = {
    CLAUDE_CODE_USE_GEMINI: '1',
    GEMINI_MODEL: 'gemini-live',
    GEMINI_API_KEY: 'gem-live',
  }

  const activeProfile = applyActiveProviderProfileFromConfig(
    {
      ...getGlobalConfig(),
      providerProfiles: [
        {
          id: 'openai_1',
          provider: 'openai',
          name: 'OpenAI',
          baseUrl: 'https://api.openai.com/v1',
          model: 'gpt-4o',
          apiKey: 'sk-test',
        },
      ],
      activeProviderProfileId: 'openai_1',
    },
    { processEnv },
  )

  assert.equal(activeProfile, undefined)
  assert.equal(processEnv.CLAUDE_CODE_USE_GEMINI, '1')
  assert.equal(processEnv.GEMINI_MODEL, 'gemini-live')
  assert.equal(processEnv.OPENAI_MODEL, undefined)
})

test('getProviderSummaryLine uses clean PT-BR text', () => {
  const line = getProviderSummaryLine(
    {
      id: 'openai_1',
      provider: 'openai',
      name: 'OpenRouter',
      baseUrl: 'https://openrouter.ai/api/v1',
      model: 'qwen/qwen3.6-plus:free',
      apiKey: 'sk-test',
    },
    true,
  )

  assert.equal(
    line,
    'OpenAI compativel - https://openrouter.ai/api/v1 - qwen/qwen3.6-plus:free - chave ok (ativo)',
  )
})
