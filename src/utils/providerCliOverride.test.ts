import assert from 'node:assert/strict'

import { describe, test } from 'bun:test'

import {
  buildStartupEnvWithProviderOverride,
  OPENROUTER_BASE_URL,
  OPENROUTER_DEFAULT_MODEL,
  parseProviderOverrideFromArgv,
} from './providerCliOverride.js'

describe('parseProviderOverrideFromArgv', () => {
  test('returns null when no flag is present', () => {
    assert.equal(parseProviderOverrideFromArgv(['-p', 'hi']), null)
  })

  test('parses split flag format', () => {
    assert.equal(
      parseProviderOverrideFromArgv(['--provider', 'openrouter']),
      'openrouter',
    )
  })

  test('parses equals flag format', () => {
    assert.equal(parseProviderOverrideFromArgv(['--provider=codex']), 'codex')
  })

  test('throws for missing provider value', () => {
    assert.throws(() => parseProviderOverrideFromArgv(['--provider']))
  })

  test('throws for invalid provider value', () => {
    assert.throws(() => parseProviderOverrideFromArgv(['--provider', 'foobar']))
  })
})

describe('buildStartupEnvWithProviderOverride', () => {
  test('openrouter override reuses saved openai key and model', async () => {
    const env = await buildStartupEnvWithProviderOverride({
      provider: 'openrouter',
      processEnv: {},
      persisted: {
        profile: 'openai',
        createdAt: new Date().toISOString(),
        env: {
          OPENAI_API_KEY: 'sk-test-12345678',
          OPENAI_BASE_URL: OPENROUTER_BASE_URL,
          OPENAI_MODEL: 'openrouter/auto',
        },
      },
    })

    assert.equal(env.CLAUDE_CODE_USE_OPENAI, '1')
    assert.equal(env.OPENAI_BASE_URL, OPENROUTER_BASE_URL)
    assert.equal(env.OPENAI_MODEL, 'openrouter/auto')
    assert.equal(env.OPENAI_API_KEY, 'sk-test-12345678')
  })

  test('openrouter override defaults model when saved profile is not openrouter', async () => {
    const env = await buildStartupEnvWithProviderOverride({
      provider: 'openrouter',
      processEnv: {},
      persisted: {
        profile: 'openai',
        createdAt: new Date().toISOString(),
        env: {
          OPENAI_API_KEY: 'sk-test-12345678',
          OPENAI_BASE_URL: 'https://api.openai.com/v1',
          OPENAI_MODEL: 'gpt-4o',
        },
      },
    })

    assert.equal(env.OPENAI_MODEL, OPENROUTER_DEFAULT_MODEL)
    assert.equal(env.OPENAI_BASE_URL, OPENROUTER_BASE_URL)
  })

  test('codex override configures codex transport env', async () => {
    const env = await buildStartupEnvWithProviderOverride({
      provider: 'codex',
      processEnv: {
        CODEX_API_KEY: 'codex-test-123',
        CHATGPT_ACCOUNT_ID: 'acc_test',
      },
      persisted: null,
    })

    assert.equal(env.CLAUDE_CODE_USE_OPENAI, '1')
    assert.equal(env.OPENAI_BASE_URL, 'https://chatgpt.com/backend-api/codex')
    assert.equal(env.OPENAI_MODEL, 'codexplan')
    assert.equal(env.CODEX_API_KEY, 'codex-test-123')
    assert.equal(env.CHATGPT_ACCOUNT_ID, 'acc_test')
  })
})

