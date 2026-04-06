import { PassThrough } from 'node:stream'

import { expect, test } from 'bun:test'
import React from 'react'
import stripAnsi from 'strip-ansi'

import { createRoot, render, useApp } from '../../ink.js'
import { AppStateProvider } from '../../state/AppState.js'
import {
  buildProviderDoctorReport,
  buildCurrentProviderSummary,
  buildProfileSaveMessage,
  call,
  getProviderWizardDefaults,
  mergeRememberedCredentials,
  TextEntryDialog,
} from './provider.js'

const SYNC_START = '\x1B[?2026h'
const SYNC_END = '\x1B[?2026l'

function extractLastFrame(output: string): string {
  let lastFrame: string | null = null
  let cursor = 0

  while (cursor < output.length) {
    const start = output.indexOf(SYNC_START, cursor)
    if (start === -1) {
      break
    }

    const contentStart = start + SYNC_START.length
    const end = output.indexOf(SYNC_END, contentStart)
    if (end === -1) {
      break
    }

    const frame = output.slice(contentStart, end)
    if (frame.trim().length > 0) {
      lastFrame = frame
    }
    cursor = end + SYNC_END.length
  }

  return lastFrame ?? output
}

async function renderFinalFrame(node: React.ReactNode): Promise<string> {
  let output = ''
  const { stdout, stdin, getOutput } = createTestStreams()

  const instance = await render(node, {
    stdout: stdout as unknown as NodeJS.WriteStream,
    stdin: stdin as unknown as NodeJS.ReadStream,
    patchConsole: false,
  })

  await instance.waitUntilExit()
  return stripAnsi(extractLastFrame(getOutput()))
}

function createTestStreams(): {
  stdout: PassThrough
  stdin: PassThrough & {
    isTTY: boolean
    setRawMode: (mode: boolean) => void
    ref: () => void
    unref: () => void
  }
  getOutput: () => string
} {
  let output = ''
  const stdout = new PassThrough()
  const stdin = new PassThrough() as PassThrough & {
    isTTY: boolean
    setRawMode: (mode: boolean) => void
    ref: () => void
    unref: () => void
  }
  stdin.isTTY = true
  stdin.setRawMode = () => {}
  stdin.ref = () => {}
  stdin.unref = () => {}
  ;(stdout as unknown as { columns: number }).columns = 120
  stdout.on('data', chunk => {
    output += chunk.toString()
  })

  return {
    stdout,
    stdin,
    getOutput: () => output,
  }
}

function StepChangeHarness(): React.ReactNode {
  const { exit } = useApp()
  const [step, setStep] = React.useState<'api' | 'model'>('api')

  React.useLayoutEffect(() => {
    if (step === 'api') {
      setStep('model')
      return
    }

    const timer = setTimeout(exit, 0)
    return () => clearTimeout(timer)
  }, [exit, step])

  return (
    <AppStateProvider>
      <TextEntryDialog
        title="Provider"
        subtitle={step === 'api' ? 'API key step' : 'Model step'}
        description="Enter the next value"
        initialValue={step === 'api' ? 'stale-secret-key' : 'fresh-model-name'}
        mask={step === 'api' ? '*' : undefined}
        onSubmit={() => {}}
        onCancel={() => {}}
      />
    </AppStateProvider>
  )
}

test('TextEntryDialog resets its input state when initialValue changes', async () => {
  const output = await renderFinalFrame(<StepChangeHarness />)

  expect(output).toContain('Model step')
  expect(output).toContain('fresh-model-name')
  expect(output).not.toContain('stale-secret-key')
})

test('wizard step remount prevents a typed API key from leaking into the next field', async () => {
  const { stdout, stdin, getOutput } = createTestStreams()
  const root = await createRoot({
    stdout: stdout as unknown as NodeJS.WriteStream,
    stdin: stdin as unknown as NodeJS.ReadStream,
    patchConsole: false,
  })

  root.render(
    <AppStateProvider>
      <TextEntryDialog
        resetStateKey="api"
        title="Provider"
        subtitle="API key step"
        description="Enter the API key"
        initialValue=""
        mask="*"
        onSubmit={() => {}}
        onCancel={() => {}}
      />
    </AppStateProvider>,
  )

  await Bun.sleep(25)
  stdin.write('sk-secret-12345678')
  await Bun.sleep(25)

  root.render(
    <AppStateProvider>
      <TextEntryDialog
        resetStateKey="model"
        title="Provider"
        subtitle="Model step"
        description="Enter the model"
        initialValue=""
        onSubmit={() => {}}
        onCancel={() => {}}
      />
    </AppStateProvider>,
  )

  await Bun.sleep(25)
  root.unmount()
  stdin.end()
  stdout.end()
  await Bun.sleep(25)

  const output = stripAnsi(extractLastFrame(getOutput()))
  expect(output).toContain('Model step')
  expect(output).not.toContain('sk-secret-12345678')
})

test('buildProfileSaveMessage maps provider fields without echoing secrets', () => {
  const message = buildProfileSaveMessage(
    'openai',
    {
      OPENAI_API_KEY: 'sk-secret-12345678',
      OPENAI_MODEL: 'gpt-4o',
      OPENAI_BASE_URL: 'https://api.openai.com/v1',
    },
    'D:/codings/Opensource/openclaude/.openclaude-profile.json',
  )

  expect(message).toContain('Perfil OpenAI-compatible salvo.')
  expect(message).toContain('Modelo: gpt-4o')
  expect(message).toContain('Endpoint: https://api.openai.com/v1')
  expect(message).toContain('Credenciais: configured')
  expect(message).not.toContain('sk-secret-12345678')
})

test('buildProfileSaveMessage wraps Windows profile path to avoid markdown backslash escaping', () => {
  const filePath =
    'C:\\Users\\Bruno\\Documents\\Claudinho\\.openclaude-profile.json'
  const message = buildProfileSaveMessage(
    'openai',
    {
      OPENAI_API_KEY: 'sk-secret-12345678',
      OPENAI_MODEL: 'gpt-4o',
      OPENAI_BASE_URL: 'https://api.openai.com/v1',
    },
    filePath,
  )

  expect(message).toContain(`Perfil: \`${filePath}\``)
})

test('buildCurrentProviderSummary redacts poisoned model and endpoint values', () => {
  const summary = buildCurrentProviderSummary({
    processEnv: {
      CLAUDE_CODE_USE_OPENAI: '1',
      OPENAI_API_KEY: 'sk-secret-12345678',
      OPENAI_MODEL: 'sk-secret-12345678',
      OPENAI_BASE_URL: 'sk-secret-12345678',
    },
    persisted: null,
  })

  expect(summary.providerLabel).toBe('OpenAI-compatible')
  expect(summary.modelLabel).toBe('sk-...5678')
  expect(summary.endpointLabel).toBe('sk-...5678')
})

test('getProviderWizardDefaults ignores poisoned current provider values', () => {
  const defaults = getProviderWizardDefaults({
    OPENAI_API_KEY: 'sk-secret-12345678',
    OPENAI_MODEL: 'sk-secret-12345678',
    OPENAI_BASE_URL: 'sk-secret-12345678',
    GEMINI_API_KEY: 'AIzaSecret12345678',
    GEMINI_MODEL: 'AIzaSecret12345678',
  })

  expect(defaults.openAIModel).toBe('gpt-4o')
  expect(defaults.openAIBaseUrl).toBe('https://api.openai.com/v1')
  expect(defaults.openRouterModel).toBe('qwen/qwen3.6-plus:free')
  expect(defaults.geminiModel).toBe('gemini-2.0-flash')
})

test('getProviderWizardDefaults reuses persisted openrouter and gemini values', () => {
  const defaults = getProviderWizardDefaults(
    {},
    {
      profile: 'openai',
      createdAt: new Date().toISOString(),
      env: {
        OPENAI_BASE_URL: 'https://openrouter.ai/api/v1',
        OPENAI_MODEL: 'openrouter/auto',
        GEMINI_MODEL: 'gemini-2.5-flash',
      },
    },
  )

  expect(defaults.openAIBaseUrl).toBe('https://openrouter.ai/api/v1')
  expect(defaults.openAIModel).toBe('openrouter/auto')
  expect(defaults.openRouterModel).toBe('openrouter/auto')
  expect(defaults.geminiModel).toBe('gemini-2.5-flash')
})

test('buildProviderDoctorReport shows profile fallback for openrouter key', () => {
  const report = buildProviderDoctorReport({
    processEnv: {},
    target: 'openrouter',
    persisted: {
      profile: 'openai',
      createdAt: new Date().toISOString(),
      env: {
        OPENAI_API_KEY: 'sk-secret-12345678',
        OPENAI_BASE_URL: 'https://openrouter.ai/api/v1',
        OPENAI_MODEL: 'qwen/qwen3.6-plus:free',
      },
    },
  })

  expect(report).toContain('[OpenRouter]')
  expect(report).toContain('Status: pronto')
  expect(report).toContain('Chave: perfil salvo')
})

test('call supports /provider doctor openrouter', async () => {
  let message = ''
  const result = await call(
    next => {
      message = next ?? ''
    },
    {} as any,
    'doctor openrouter',
  )

  expect(result).toBeNull()
  expect(message).toContain('Provider Doctor')
  expect(message).toContain('[OpenRouter]')
})

test('mergeRememberedCredentials preserves keys from other providers', () => {
  const merged = mergeRememberedCredentials(
    {
      OPENAI_API_KEY: 'sk-openai-new',
      OPENAI_BASE_URL: 'https://openrouter.ai/api/v1',
      OPENAI_MODEL: 'qwen/qwen3.6-plus:free',
    },
    {
      GEMINI_API_KEY: 'AIzaGeminiOldKey123',
      CODEX_API_KEY: 'codex-old-key',
      CHATGPT_ACCOUNT_ID: 'acc_old',
    },
  )

  expect(merged.OPENAI_API_KEY).toBe('sk-openai-new')
  expect(merged.GEMINI_API_KEY).toBe('AIzaGeminiOldKey123')
  expect(merged.CODEX_API_KEY).toBe('codex-old-key')
  expect(merged.CHATGPT_ACCOUNT_ID).toBe('acc_old')
})

test('mergeRememberedCredentials does not overwrite fresh credentials', () => {
  const merged = mergeRememberedCredentials(
    {
      GEMINI_API_KEY: 'AIzaGeminiNewKey456',
      CHATGPT_ACCOUNT_ID: 'acc_new',
    },
    {
      GEMINI_API_KEY: 'AIzaGeminiOldKey123',
      CHATGPT_ACCOUNT_ID: 'acc_old',
      OPENAI_API_KEY: 'sk-openai-old',
    },
  )

  expect(merged.GEMINI_API_KEY).toBe('AIzaGeminiNewKey456')
  expect(merged.CHATGPT_ACCOUNT_ID).toBe('acc_new')
  expect(merged.OPENAI_API_KEY).toBe('sk-openai-old')
})
