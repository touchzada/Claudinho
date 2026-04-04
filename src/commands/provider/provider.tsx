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

type ProviderChoice = 'auto' | ProviderProfile | 'clear'

type Step =
  | { name: 'choose' }
  | { name: 'auto-goal' }
  | { name: 'auto-detect'; goal: RecommendationGoal }
  | { name: 'ollama-detect' }
  | { name: 'openai-key'; defaultModel: string }
  | { name: 'openai-base'; apiKey: string; defaultModel: string }
  | {
      name: 'openai-model'
      apiKey: string
      baseUrl: string | null
      defaultModel: string
    }
  | { name: 'gemini-key' }
  | { name: 'gemini-model'; apiKey: string }
  | { name: 'codex-check' }

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
  geminiModel: string
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
): ProviderWizardDefaults {
  const safeOpenAIModel =
    sanitizeProviderConfigValue(processEnv.OPENAI_MODEL, processEnv) ||
    'gpt-4o'
  const safeOpenAIBaseUrl =
    sanitizeProviderConfigValue(processEnv.OPENAI_BASE_URL, processEnv) ||
    DEFAULT_OPENAI_BASE_URL
  const safeGeminiModel =
    sanitizeProviderConfigValue(processEnv.GEMINI_MODEL, processEnv) ||
    DEFAULT_GEMINI_MODEL

  return {
    openAIModel: safeOpenAIModel,
    openAIBaseUrl: safeOpenAIBaseUrl,
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

  lines.push(`Perfil: ${filePath}`)
  lines.push('Reinicia o claudinho pra usar.')

  return lines.join('\n')
}

function buildUsageText(): string {
  const summary = buildCurrentProviderSummary()
  return [
    'Uso: /provider',
    '',
    'Setup guiado pra perfis de provedor salvos.',
    '',
    `Provedor atual: ${summary.providerLabel}`,
    `Modelo atual: ${summary.modelLabel}`,
    `Endpoint atual: ${summary.endpointLabel}`,
    `Perfil salvo: ${summary.savedProfileLabel}`,
    '',
    'Escolhe Auto, Ollama, OpenAI-compatível, Gemini ou Codex, e salva um perfil pro próximo restart do claudinho.',
  ].join('\n')
}

function finishProfileSave(
  onDone: LocalJSXCommandOnDone,
  profile: ProviderProfile,
  env: ProfileEnv,
): void {
  try {
    const profileFile = createProfileFile(profile, env)
    const filePath = saveProfileFile(profileFile)
    onDone(buildProfileSaveMessage(profile, env, filePath), {
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
  onSave,
  onBack,
  onCancel,
}: {
  onSave: (profile: ProviderProfile, env: ProfileEnv) => void
  onBack: () => void
  onCancel: () => void
}): React.ReactNode {
  const credentials = resolveCodexCredentials(process.env)

  if (!credentials.ok) {
    return (
      <Dialog title="Setup do Codex" onCancel={onCancel} color="warning">
        <Box flexDirection="column" gap={1}>
          <Text>{credentials.message}</Text>
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

  const options: OptionWithDescription<string>[] = [
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

  return (
    <Dialog title="Escolhe um perfil do Codex" onCancel={onBack}>
      <Box flexDirection="column" gap={1}>
        <Text>
          Reusa suas credenciais existentes do Codex de{' '}
          {credentials.sourceDescription} e salva um perfil de alias de modelo.
        </Text>
        <Select
          options={options}
          defaultValue="codexplan"
          defaultFocusValue="codexplan"
          inlineDescriptions
          visibleOptionCount={options.length}
          onChange={value => {
            const env = buildCodexProfileEnv({
              model: value,
              processEnv: process.env,
            })
            if (env) {
              onSave('codex', env)
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
      ? `Expected auth file: ${credentials.authPath}.`
      : 'Set CODEX_API_KEY or re-login with the Codex CLI.'
    return {
      ok: false,
      message: `Codex setup needs existing credentials. Re-login with the Codex CLI or set CODEX_API_KEY. ${authHint}`,
    }
  }

  if (!credentials.accountId) {
    return {
      ok: false,
      message:
        'Codex auth is missing chatgpt_account_id. Re-login with the Codex CLI or set CHATGPT_ACCOUNT_ID/CODEX_ACCOUNT_ID first.',
    }
  }

  return {
    ok: true,
    sourceDescription:
      credentials.source === 'env'
        ? 'the current shell environment'
        : credentials.authPath ?? DEFAULT_CODEX_BASE_URL,
  }
}

function ProviderWizard({ onDone }: { onDone: LocalJSXCommandOnDone }): React.ReactNode {
  const defaults = getProviderWizardDefaults()
  const [step, setStep] = React.useState<Step>({ name: 'choose' })

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
          title="Setup OpenAI-compatível"
          subtitle="Passo 1 de 3"
          description={
            process.env.OPENAI_API_KEY
              ? 'Digite uma chave de API, ou deixa em branco pra reusar a OPENAI_API_KEY atual dessa sessão.'
              : 'Digite a chave de API do seu provedor OpenAI-compatível.'
          }
          initialValue=""
          placeholder="sk-..."
          mask="*"
          allowEmpty={Boolean(process.env.OPENAI_API_KEY)}
          validate={value => {
            const candidate = value.trim() || process.env.OPENAI_API_KEY || ''
            return sanitizeApiKey(candidate)
              ? null
              : 'Digite uma chave de API real. Placeholders tipo SUA_CHAVE não são válidos.'
          }}
          onSubmit={value => {
            const apiKey = value.trim() || process.env.OPENAI_API_KEY || ''
            setStep({
              name: 'openai-base',
              apiKey,
              defaultModel: step.defaultModel,
            })
          }}
          onCancel={() => setStep({ name: 'choose' })}
        />
      )

    case 'openai-base':
      return (
        <TextEntryDialog
          resetStateKey={step.name}
          title="Setup OpenAI-compatível"
          subtitle="Passo 2 de 3"
          description={`Opcionalmente digite uma URL base. Deixa em branco pra ${DEFAULT_OPENAI_BASE_URL}.`}
          initialValue={
            defaults.openAIBaseUrl === DEFAULT_OPENAI_BASE_URL
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
            })
          }}
          onCancel={() =>
            setStep({
              name: 'openai-key',
              defaultModel: step.defaultModel,
            })
          }
        />
      )

    case 'openai-model':
      return (
        <TextEntryDialog
          resetStateKey={step.name}
          title="Setup OpenAI-compatível"
          subtitle="Passo 3 de 3"
          description={`Digite um nome de modelo. Deixa em branco pra ${step.defaultModel}.`}
          initialValue={defaults.openAIModel ?? step.defaultModel}
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
            setStep({
              name: 'openai-base',
              apiKey: step.apiKey,
              defaultModel: step.defaultModel,
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
            process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY
              ? 'Digite uma chave de API do Gemini, ou deixa em branco pra reusar a GEMINI_API_KEY/GOOGLE_API_KEY atual dessa sessão.'
              : 'Digite uma chave de API do Gemini. Você pode criar uma em https://aistudio.google.com/apikey.'
          }
          initialValue=""
          placeholder="AIza..."
          mask="*"
          allowEmpty={Boolean(
            process.env.GEMINI_API_KEY ?? process.env.GOOGLE_API_KEY,
          )}
          onSubmit={value => {
            const apiKey =
              value.trim() ||
              process.env.GEMINI_API_KEY ||
              process.env.GOOGLE_API_KEY ||
              ''
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
          onSave={(profile, env) => finishProfileSave(onDone, profile, env)}
          onBack={() => setStep({ name: 'choose' })}
          onCancel={() => onDone()}
        />
      )
  }
}

export const call: LocalJSXCommandCall = async (onDone, _context, args) => {
  const normalizedArgs = args?.trim().toLowerCase() || ''

  if (COMMON_INFO_ARGS.includes(normalizedArgs)) {
    onDone(buildUsageText(), { display: 'system' })
    return null
  }

  if (COMMON_HELP_ARGS.includes(normalizedArgs)) {
    onDone(buildUsageText(), { display: 'system' })
    return null
  }

  if (normalizedArgs) {
    onDone('Usage: /provider', { display: 'system' })
    return null
  }

  return <ProviderWizard onDone={onDone} />
}
