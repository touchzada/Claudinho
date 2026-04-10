import { afterEach, expect, test } from 'bun:test'
import {
  getDefaultMaxRetries,
  isOpenRouterFreeModelRequest,
} from './withRetry.ts'

const originalEnv = {
  CLAUDE_CODE_MAX_RETRIES: process.env.CLAUDE_CODE_MAX_RETRIES,
  CLAUDE_CODE_USE_OPENAI: process.env.CLAUDE_CODE_USE_OPENAI,
  OPENAI_BASE_URL: process.env.OPENAI_BASE_URL,
  OPENAI_MODEL: process.env.OPENAI_MODEL,
}

afterEach(() => {
  process.env.CLAUDE_CODE_MAX_RETRIES = originalEnv.CLAUDE_CODE_MAX_RETRIES
  process.env.CLAUDE_CODE_USE_OPENAI = originalEnv.CLAUDE_CODE_USE_OPENAI
  process.env.OPENAI_BASE_URL = originalEnv.OPENAI_BASE_URL
  process.env.OPENAI_MODEL = originalEnv.OPENAI_MODEL
})

function clearRetryEnv(): void {
  delete process.env.CLAUDE_CODE_MAX_RETRIES
  delete process.env.CLAUDE_CODE_USE_OPENAI
  delete process.env.OPENAI_BASE_URL
  delete process.env.OPENAI_MODEL
}

test('detects OpenRouter free-tier model requests', () => {
  clearRetryEnv()
  process.env.CLAUDE_CODE_USE_OPENAI = '1'
  process.env.OPENAI_BASE_URL = 'https://openrouter.ai/api/v1'

  expect(isOpenRouterFreeModelRequest('minimax/minimax-m2.5:free')).toBe(true)
  expect(isOpenRouterFreeModelRequest('openai/gpt-4o')).toBe(false)
})

test('default retries are reduced for OpenRouter free-tier models', () => {
  clearRetryEnv()
  process.env.CLAUDE_CODE_USE_OPENAI = '1'
  process.env.OPENAI_BASE_URL = 'https://openrouter.ai/api/v1'
  process.env.OPENAI_MODEL = 'google/gemma-4-31b-it:free'

  expect(getDefaultMaxRetries()).toBe(2)
})

test('explicit CLAUDE_CODE_MAX_RETRIES overrides OpenRouter defaults', () => {
  clearRetryEnv()
  process.env.CLAUDE_CODE_USE_OPENAI = '1'
  process.env.OPENAI_BASE_URL = 'https://openrouter.ai/api/v1'
  process.env.OPENAI_MODEL = 'google/gemma-4-31b-it:free'
  process.env.CLAUDE_CODE_MAX_RETRIES = '7'

  expect(getDefaultMaxRetries()).toBe(7)
})

