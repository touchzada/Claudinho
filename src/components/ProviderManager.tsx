import figures from 'figures'
import * as React from 'react'
import { Box, Text } from '../ink.js'
import { useKeybinding } from '../keybindings/useKeybinding.js'
import { useTerminalSize } from '../hooks/useTerminalSize.js'
import { updateSettingsForSource } from '../utils/settings/settings.js'
import { DEFAULT_CODEX_BASE_URL } from '../services/api/providerConfig.js'
import { buildCodexProfileEnv } from '../utils/providerProfile.js'
import {
  addProviderProfile,
  deleteProviderProfile,
  getActiveProviderProfile,
  getProviderPresetDefaults,
  getProviderProfiles,
  getProviderSummaryLine,
  getProviderTypeLabel,
  setActiveProviderProfile,
  updateProviderProfile,
  type ProviderPreset,
  type SavedProviderProfileInput,
} from '../utils/providerProfiles.js'
import type { SavedProviderProfile } from '../utils/config.js'
import { Select } from './CustomSelect/index.js'
import { Pane } from './design-system/Pane.js'
import TextInput from './TextInput.js'
import { LoadingState } from './design-system/LoadingState.js'
import { runCodexOAuthFlow } from '../services/oauth/codex-client.js'
import { saveCodexOAuthTokens } from '../utils/codex-auth.js'

export type ProviderManagerResult = {
  action: 'saved' | 'cancelled'
  activeProfileId?: string
  message?: string
}

type Props = {
  mode: 'manage'
  onDone: (result?: ProviderManagerResult) => void
}

type Screen =
  | 'menu'
  | 'select-preset'
  | 'form'
  | 'select-active'
  | 'select-edit'
  | 'select-delete'
  | 'codex-setup'
  | 'codex-oauth'
  | 'codex-manual-key'
  | 'codex-manual-account'
  | 'codex-model'
  | 'codex-effort'

type DraftField = 'name' | 'baseUrl' | 'model' | 'apiKey' | 'accountId'

type ProviderDraft = Record<DraftField, string>

type FormStep = {
  key: DraftField
  label: string
  placeholder: string
  helpText: string
  optional?: boolean
}

type CodexModelChoice = 'gpt-5.4' | 'gpt-5.4-mini' | 'gpt-5.3-codex' | 'gpt-5.2'
type CodexEffortChoice = 'low' | 'medium' | 'high' | 'xhigh'

const PRESET_OPTIONS: Array<{
  value: ProviderPreset
  label: string
  description: string
}> = [
  {
    value: 'anthropic',
    label: 'Claude oficial',
    description: 'API oficial da Anthropic.',
  },
  {
    value: 'ollama',
    label: 'Ollama',
    description: 'Modelo local rodando no seu PC.',
  },
  {
    value: 'openai',
    label: 'OpenAI',
    description: 'Perfil pronto para a OpenAI.',
  },
  {
    value: 'openrouter',
    label: 'OpenRouter',
    description: 'Atalho pronto com endpoint e modelo gratis.',
  },
  {
    value: 'deepseek',
    label: 'DeepSeek',
    description: 'Perfil pronto para DeepSeek.',
  },
  {
    value: 'groq',
    label: 'Groq',
    description: 'Perfil pronto para Groq.',
  },
  {
    value: 'mistral',
    label: 'Mistral',
    description: 'Perfil pronto para Mistral.',
  },
  {
    value: 'moonshotai',
    label: 'Moonshot AI',
    description: 'Perfil pronto para Moonshot.',
  },
  {
    value: 'together',
    label: 'Together AI',
    description: 'Perfil pronto para Together.',
  },
  {
    value: 'azure-openai',
    label: 'Azure OpenAI',
    description: 'Perfil pronto para Azure OpenAI.',
  },
  {
    value: 'lmstudio',
    label: 'LM Studio',
    description: 'Modelo local pelo LM Studio.',
  },
  {
    value: 'gemini',
    label: 'Gemini',
    description: 'Gemini nativo com chave do Google.',
  },
  {
    value: 'codex',
    label: 'Codex',
    description: 'Codex com conta e modelo do ChatGPT.',
  },
  {
    value: 'custom',
    label: 'Customizado',
    description: 'Qualquer endpoint no estilo OpenAI.',
  },
]

function getCodexModelOptions(): Array<{
  value: CodexModelChoice
  label: string
  description: string
}> {
  return [
    {
      value: 'gpt-5.4',
      label: 'GPT-5.4',
      description: 'Mais equilibrado para uso geral.',
    },
    {
      value: 'gpt-5.4-mini',
      label: 'GPT-5.4-Mini',
      description: 'Mais rapido e economico.',
    },
    {
      value: 'gpt-5.3-codex',
      label: 'GPT-5.3-Codex',
      description: 'Focado em codigo e ferramentas.',
    },
    {
      value: 'gpt-5.2',
      label: 'GPT-5.2',
      description: 'Bom para tarefas longas com consistencia.',
    },
  ]
}

function getCodexEffortOptions(): Array<{
  value: CodexEffortChoice
  label: string
  description: string
}> {
  return [
    {
      value: 'low',
      label: 'Baixa',
      description: 'Mais rapido, menos reflexao.',
    },
    {
      value: 'medium',
      label: 'Media',
      description: 'Equilibrio entre velocidade e qualidade.',
    },
    {
      value: 'high',
      label: 'Alta',
      description: 'Analise mais profunda.',
    },
    {
      value: 'xhigh',
      label: 'Altissima',
      description: 'Maximo de raciocinio disponivel.',
    },
  ]
}

function normalizeCodexModelChoice(
  model: string | undefined,
): CodexModelChoice | undefined {
  if (!model) return undefined
  const normalized = model.trim().toLowerCase()
  if (normalized.startsWith('gpt-5.4-mini')) return 'gpt-5.4-mini'
  if (normalized.startsWith('gpt-5.4') || normalized.startsWith('codexplan')) {
    return 'gpt-5.4'
  }
  if (
    normalized.startsWith('gpt-5.3-codex') ||
    normalized.startsWith('codexspark')
  ) {
    return 'gpt-5.3-codex'
  }
  if (normalized.startsWith('gpt-5.2')) return 'gpt-5.2'
  return undefined
}

function extractCodexEffortChoice(
  model: string | undefined,
): CodexEffortChoice | undefined {
  if (!model) return undefined
  const normalized = model.trim().toLowerCase()
  const fromQuery = normalized.match(/[?&]reasoning=(low|medium|high|xhigh)\b/)
  if (fromQuery?.[1]) return fromQuery[1] as CodexEffortChoice
  const fromSuffix = normalized.match(/\((low|medium|high|xhigh)\)\s*$/)
  if (fromSuffix?.[1]) return fromSuffix[1] as CodexEffortChoice
  return undefined
}

function getDefaultCodexEffortChoice(
  model: CodexModelChoice,
): CodexEffortChoice {
  if (model === 'gpt-5.3-codex') return 'high'
  return 'medium'
}

function buildCodexModelWithEffort(
  model: CodexModelChoice,
  effort: CodexEffortChoice,
): string {
  return `${model} (${effort})`
}

function toDraft(profile: SavedProviderProfile): ProviderDraft {
  return {
    name: profile.name,
    baseUrl: profile.baseUrl,
    model: profile.model,
    apiKey: profile.apiKey ?? '',
    accountId: profile.accountId ?? '',
  }
}

function isLocalBaseUrl(baseUrl: string): boolean {
  const normalized = baseUrl.toLowerCase()
  return (
    normalized.includes('localhost') ||
    normalized.includes('127.0.0.1') ||
    normalized.includes('0.0.0.0')
  )
}

function isApiKeyRequired(
  provider: SavedProviderProfile['provider'],
  baseUrl: string,
): boolean {
  if (provider === 'anthropic' || provider === 'gemini') {
    return true
  }

  if (provider === 'codex') {
    return false
  }

  return !isLocalBaseUrl(baseUrl)
}

function getFormSteps(
  provider: SavedProviderProfile['provider'],
  draft: ProviderDraft,
): FormStep[] {
  const apiKeyRequired = isApiKeyRequired(provider, draft.baseUrl)
  const steps: FormStep[] = [
    {
      key: 'name',
      label: 'Nome',
      placeholder: 'Ex.: OpenRouter rapido',
      helpText: 'Esse nome aparece na lista de provedores.',
    },
    {
      key: 'baseUrl',
      label: 'Endereco da API',
      placeholder: 'Ex.: https://api.openai.com/v1',
      helpText: 'Se nao souber, pode manter o valor que veio pronto.',
    },
    {
      key: 'model',
      label: 'Modelo',
      placeholder: 'Ex.: gpt-4o',
      helpText: 'Esse modelo sera usado quando esse perfil estiver ativo.',
    },
    {
      key: 'apiKey',
      label: 'Chave',
      placeholder: apiKeyRequired ? 'Cole a chave aqui' : 'Pode deixar vazio',
      helpText: apiKeyRequired
        ? 'Cole a chave desse provedor.'
        : provider === 'codex'
          ? 'Pode deixar vazio se o login do Codex ja funciona nesse PC.'
          : 'Se nao precisar de chave, pode deixar vazio.',
      optional: !apiKeyRequired,
    },
  ]

  if (provider === 'codex') {
    steps.push({
      key: 'accountId',
      label: 'Conta do Codex',
      placeholder: 'Ex.: acc_123',
      helpText: 'Se ficar vazio, o Claudinho tenta usar a conta ja salva no Codex.',
      optional: true,
    })
  }

  return steps
}

function clearStartupProviderOverrideFromUserSettings(): string | null {
  const { error } = updateSettingsForSource('userSettings', {
    env: {
      CLAUDE_CODE_USE_OPENAI: undefined as never,
      CLAUDE_CODE_USE_GEMINI: undefined as never,
      CLAUDE_CODE_USE_GITHUB: undefined as never,
      CLAUDE_CODE_USE_BEDROCK: undefined as never,
      CLAUDE_CODE_USE_VERTEX: undefined as never,
      CLAUDE_CODE_USE_FOUNDRY: undefined as never,
    },
  })

  return error ? error.message : null
}

function buildProfileInput(
  provider: SavedProviderProfile['provider'],
  draft: ProviderDraft,
): SavedProviderProfileInput {
  return {
    provider,
    name: draft.name.trim(),
    baseUrl: draft.baseUrl.trim(),
    model: draft.model.trim(),
    apiKey: draft.apiKey.trim() || undefined,
    accountId: draft.accountId.trim() || undefined,
  }
}

function getMenuStatusMessage(
  message: string,
  settingsOverrideError: string | null,
): string {
  if (!settingsOverrideError) {
    return message
  }

  return `${message} Aviso: nao consegui limpar um override antigo das configuracoes (${settingsOverrideError}).`
}

export function ProviderManager({ onDone }: Props): React.ReactNode {
  const { columns } = useTerminalSize()
  const [profiles, setProfiles] = React.useState(() => getProviderProfiles())
  const [activeProfileId, setActiveProfileId] = React.useState(
    () => getActiveProviderProfile()?.id,
  )
  const [screen, setScreen] = React.useState<Screen>('menu')
  const [editingProfileId, setEditingProfileId] = React.useState<string | null>(null)
  const [draftProvider, setDraftProvider] = React.useState<SavedProviderProfile['provider']>('openai')
  const [draft, setDraft] = React.useState<ProviderDraft>({
    name: '',
    baseUrl: '',
    model: '',
    apiKey: '',
    accountId: '',
  })
  const [formStepIndex, setFormStepIndex] = React.useState(0)
  const [cursorOffset, setCursorOffset] = React.useState(0)
  const [statusMessage, setStatusMessage] = React.useState<string | undefined>()
  const [errorMessage, setErrorMessage] = React.useState<string | undefined>()
  const [codexModelChoice, setCodexModelChoice] =
    React.useState<CodexModelChoice>('gpt-5.4')
  const [codexEffortChoice, setCodexEffortChoice] =
    React.useState<CodexEffortChoice>('medium')

  const formSteps = getFormSteps(draftProvider, draft)
  const currentStep = formSteps[formStepIndex] ?? formSteps[0]
  const currentValue = draft[currentStep.key]
  const inputColumns = Math.max(30, Math.min(90, columns - 8))

  function refreshProfiles(): void {
    setProfiles(getProviderProfiles())
    setActiveProfileId(getActiveProviderProfile()?.id)
  }

  function closeWithCancelled(message: string): void {
    onDone({
      action: 'cancelled',
      message,
    })
  }

  function startCodexGuidedFlow(
    nextDraft: ProviderDraft,
    options?: { editingProfileId?: string | null },
  ): void {
    const normalizedModel =
      normalizeCodexModelChoice(nextDraft.model) ?? 'gpt-5.4'
    const normalizedEffort =
      extractCodexEffortChoice(nextDraft.model) ??
      getDefaultCodexEffortChoice(normalizedModel)

    setEditingProfileId(options?.editingProfileId ?? null)
    setDraftProvider('codex')
    setDraft({
      ...nextDraft,
      name: nextDraft.name.trim() || 'Codex',
      baseUrl: DEFAULT_CODEX_BASE_URL,
      model: buildCodexModelWithEffort(normalizedModel, normalizedEffort),
    })
    setCodexModelChoice(normalizedModel)
    setCodexEffortChoice(normalizedEffort)
    setErrorMessage(undefined)
    setScreen('codex-setup')
  }

  function persistCodexWithSelectedModel(effort: CodexEffortChoice): void {
    const modelWithEffort = buildCodexModelWithEffort(codexModelChoice, effort)
    const manualApiKey = draft.apiKey.trim() || null
    const manualAccountId = draft.accountId.trim()
    const processEnvForBuild: NodeJS.ProcessEnv = {
      ...process.env,
      CHATGPT_ACCOUNT_ID: manualAccountId || process.env.CHATGPT_ACCOUNT_ID,
      CODEX_ACCOUNT_ID: manualAccountId || process.env.CODEX_ACCOUNT_ID,
    }

    const env = buildCodexProfileEnv({
      model: modelWithEffort,
      apiKey: manualApiKey,
      processEnv: processEnvForBuild,
    })

    if (!env) {
      setErrorMessage(
        'Nao consegui montar o perfil Codex. Faca login OAuth ou preencha as credenciais manualmente.',
      )
      setScreen('codex-setup')
      return
    }

    const resolvedAccountId =
      env.CHATGPT_ACCOUNT_ID ?? env.CODEX_ACCOUNT_ID ?? undefined
    if (!resolvedAccountId) {
      setErrorMessage(
        'Faltou conta do Codex. Informe CHATGPT_ACCOUNT_ID/CODEX_ACCOUNT_ID ou use OAuth.',
      )
      setScreen('codex-setup')
      return
    }

    const payload: SavedProviderProfileInput = {
      provider: 'codex',
      name: draft.name.trim() || 'Codex',
      baseUrl: env.OPENAI_BASE_URL ?? DEFAULT_CODEX_BASE_URL,
      model: env.OPENAI_MODEL ?? modelWithEffort,
      apiKey: manualApiKey ?? undefined,
      accountId: resolvedAccountId,
    }

    const saved = editingProfileId
      ? updateProviderProfile(editingProfileId, payload)
      : addProviderProfile(payload, { makeActive: true })

    if (!saved) {
      setErrorMessage('Nao consegui salvar esse provedor Codex. Tenta de novo.')
      setScreen('codex-setup')
      return
    }

    const settingsOverrideError = clearStartupProviderOverrideFromUserSettings()
    refreshProfiles()
    setErrorMessage(undefined)
    setFormStepIndex(0)
    setScreen('menu')
    setStatusMessage(
      getMenuStatusMessage(
        editingProfileId
          ? `Provedor atualizado: ${saved.name}.`
          : `Provedor salvo e ativado: ${saved.name}.`,
        settingsOverrideError,
      ),
    )
  }

  function startCreateFromPreset(preset: ProviderPreset): void {
    const defaults = getProviderPresetDefaults(preset)
    const nextDraft: ProviderDraft = {
      name: defaults.name,
      baseUrl: defaults.baseUrl,
      model: defaults.model,
      apiKey: defaults.apiKey ?? '',
      accountId: defaults.accountId ?? '',
    }

    if (preset === 'codex') {
      startCodexGuidedFlow(nextDraft, { editingProfileId: null })
      return
    }

    setEditingProfileId(null)
    setDraftProvider(defaults.provider)
    setDraft(nextDraft)
    setFormStepIndex(0)
    setCursorOffset(nextDraft.name.length)
    setErrorMessage(undefined)
    setScreen('form')
  }
  function startEditProfile(profileId: string): void {
    const existing = profiles.find(profile => profile.id === profileId)
    if (!existing) {
      return
    }

    const nextDraft = toDraft(existing)
    if (existing.provider === 'codex') {
      startCodexGuidedFlow(nextDraft, { editingProfileId: profileId })
      return
    }

    setEditingProfileId(profileId)
    setDraftProvider(existing.provider)
    setDraft(nextDraft)
    setFormStepIndex(0)
    setCursorOffset(nextDraft.name.length)
    setErrorMessage(undefined)
    setScreen('form')
  }
  function validateDraftField(
    field: DraftField,
    value: string,
  ): string | null {
    const trimmed = value.trim()

    if (field === 'name' && trimmed.length === 0) {
      return 'Preencha um nome.'
    }

    if (field === 'baseUrl' && trimmed.length === 0) {
      return 'Preencha o endereco da API.'
    }

    if (field === 'model' && trimmed.length === 0) {
      return 'Preencha o modelo.'
    }

    if (
      field === 'apiKey' &&
      isApiKeyRequired(draftProvider, draft.baseUrl) &&
      trimmed.length === 0
    ) {
      return 'Essa chave e obrigatoria nesse perfil.'
    }

    return null
  }

  function persistDraft(): void {
    const payload = buildProfileInput(draftProvider, draft)
    const saved = editingProfileId
      ? updateProviderProfile(editingProfileId, payload)
      : addProviderProfile(payload, { makeActive: true })

    if (!saved) {
      setErrorMessage('Nao consegui salvar esse provedor. Confere os campos e tenta de novo.')
      return
    }

    const settingsOverrideError = clearStartupProviderOverrideFromUserSettings()
    refreshProfiles()
    setErrorMessage(undefined)
    setEditingProfileId(null)
    setFormStepIndex(0)
    setScreen('menu')
    setStatusMessage(
      getMenuStatusMessage(
        editingProfileId
          ? `Provedor atualizado: ${saved.name}.`
          : `Provedor salvo e ativado: ${saved.name}.`,
        settingsOverrideError,
      ),
    )
  }

  function handleFormSubmit(value: string): void {
    const validationError = validateDraftField(currentStep.key, value)
    if (validationError) {
      setErrorMessage(validationError)
      return
    }

    const nextDraft = {
      ...draft,
      [currentStep.key]: value.trim(),
    }
    setDraft(nextDraft)
    setErrorMessage(undefined)

    if (formStepIndex < formSteps.length - 1) {
      const nextIndex = formStepIndex + 1
      const nextKey = formSteps[nextIndex]?.key ?? 'name'
      setFormStepIndex(nextIndex)
      setCursorOffset(nextDraft[nextKey].length)
      return
    }

    persistDraft()
  }

  function handleBackFromForm(): void {
    setErrorMessage(undefined)

    if (formStepIndex > 0) {
      const nextIndex = formStepIndex - 1
      const nextKey = formSteps[nextIndex]?.key ?? 'name'
      setFormStepIndex(nextIndex)
      setCursorOffset(draft[nextKey].length)
      return
    }

    setScreen(editingProfileId ? 'select-edit' : 'select-preset')
  }

  useKeybinding('confirm:no', handleBackFromForm, {
    context: 'Settings',
    isActive: screen === 'form',
  })

  useKeybinding(
    'confirm:no',
    () => {
      setErrorMessage(undefined)
      if (screen === 'codex-manual-account') {
        setScreen('codex-manual-key')
        return
      }
      if (screen === 'codex-manual-key') {
        setScreen('codex-setup')
      }
    },
    {
      context: 'Settings',
      isActive:
        screen === 'codex-manual-key' || screen === 'codex-manual-account',
    },
  )

  function renderPresetSelection(): React.ReactNode {
    return (
      <Box flexDirection="column" gap={1}>
        <Text color="remember" bold>
          Escolha o tipo de provedor
        </Text>
        <Text dimColor>
          Eu ja deixei varios modelos prontos pra facilitar.
        </Text>
        <Select
          options={PRESET_OPTIONS}
          onChange={value => startCreateFromPreset(value as ProviderPreset)}
          onCancel={() => setScreen('menu')}
          visibleOptionCount={Math.min(12, PRESET_OPTIONS.length)}
        />
      </Box>
    )
  }

  function renderForm(): React.ReactNode {
    return (
      <Box flexDirection="column" gap={1}>
        <Text color="remember" bold>
          {editingProfileId ? 'Editar provedor' : 'Novo provedor'}
        </Text>
        <Text dimColor>{getProviderTypeLabel(draftProvider)}</Text>
        <Text dimColor>
          Passo {formStepIndex + 1} de {formSteps.length}: {currentStep.label}
        </Text>
        <Text dimColor>{currentStep.helpText}</Text>
        <Box flexDirection="row" gap={1}>
          <Text>{figures.pointer}</Text>
          <TextInput
            value={currentValue}
            onChange={value =>
              setDraft(prev => ({
                ...prev,
                [currentStep.key]: value,
              }))
            }
            onSubmit={handleFormSubmit}
            focus={true}
            showCursor={true}
            placeholder={currentStep.placeholder}
            columns={inputColumns}
            cursorOffset={cursorOffset}
            onChangeCursorOffset={setCursorOffset}
          />
        </Box>
        {errorMessage ? <Text color="error">{errorMessage}</Text> : null}
        <Text dimColor>
          Enter avanca. Esc volta.
        </Text>
      </Box>
    )
  }

  function renderCodexSetup(): React.ReactNode {
    return (
      <Box flexDirection="column" gap={1}>
        <Text color="remember" bold>
          Setup do Codex
        </Text>
        <Text dimColor>
          Esse fluxo segue o mesmo estilo do comando /provider codex.
        </Text>
        {errorMessage ? <Text color="error">{errorMessage}</Text> : null}
        <Select
          options={[
            {
              value: 'detected',
              label: 'Usar credenciais detectadas',
              description: 'Usa login ja salvo no Codex e vai pro seletor de modelo.',
            },
            {
              value: 'oauth',
              label: 'Login com OAuth',
              description: 'Abre o navegador e conecta sua conta automaticamente.',
            },
            {
              value: 'manual',
              label: 'Credenciais manuais',
              description: 'Informa CODEX_API_KEY e conta manualmente.',
            },
            {
              value: 'back',
              label: 'Voltar',
              description: 'Retorna para a tela anterior.',
            },
          ]}
          onChange={value => {
            setErrorMessage(undefined)
            if (value === 'detected') {
              setScreen('codex-model')
              return
            }
            if (value === 'oauth') {
              setScreen('codex-oauth')
              return
            }
            if (value === 'manual') {
              setCursorOffset(draft.apiKey.length)
              setScreen('codex-manual-key')
              return
            }
            setScreen(editingProfileId ? 'select-edit' : 'select-preset')
          }}
          onCancel={() => setScreen(editingProfileId ? 'select-edit' : 'select-preset')}
          visibleOptionCount={4}
        />
      </Box>
    )
  }

  function renderCodexManualKey(): React.ReactNode {
    return (
      <Box flexDirection="column" gap={1}>
        <Text color="remember" bold>
          Codex manual - chave
        </Text>
        <Text dimColor>Cole sua CODEX_API_KEY para continuar.</Text>
        <Box flexDirection="row" gap={1}>
          <Text>{figures.pointer}</Text>
          <TextInput
            value={draft.apiKey}
            onChange={value =>
              setDraft(prev => ({
                ...prev,
                apiKey: value,
              }))
            }
            onSubmit={value => {
              const trimmed = value.trim()
              if (!trimmed) {
                setErrorMessage('Digite uma CODEX_API_KEY valida.')
                return
              }
              setDraft(prev => ({
                ...prev,
                apiKey: trimmed,
              }))
              setErrorMessage(undefined)
              setCursorOffset(draft.accountId.length)
              setScreen('codex-manual-account')
            }}
            focus={true}
            showCursor={true}
            placeholder="sk-..."
            columns={inputColumns}
            cursorOffset={cursorOffset}
            onChangeCursorOffset={setCursorOffset}
          />
        </Box>
        {errorMessage ? <Text color="error">{errorMessage}</Text> : null}
        <Text dimColor>Enter avanca. Esc volta.</Text>
      </Box>
    )
  }

  function renderCodexManualAccount(): React.ReactNode {
    return (
      <Box flexDirection="column" gap={1}>
        <Text color="remember" bold>
          Codex manual - conta
        </Text>
        <Text dimColor>Informe seu CHATGPT_ACCOUNT_ID (ou CODEX_ACCOUNT_ID).</Text>
        <Box flexDirection="row" gap={1}>
          <Text>{figures.pointer}</Text>
          <TextInput
            value={draft.accountId}
            onChange={value =>
              setDraft(prev => ({
                ...prev,
                accountId: value,
              }))
            }
            onSubmit={value => {
              const trimmed = value.trim()
              if (!trimmed) {
                setErrorMessage('Informe a conta do Codex para continuar.')
                return
              }
              setDraft(prev => ({
                ...prev,
                accountId: trimmed,
              }))
              setErrorMessage(undefined)
              setScreen('codex-model')
            }}
            focus={true}
            showCursor={true}
            placeholder="acc_..."
            columns={inputColumns}
            cursorOffset={cursorOffset}
            onChangeCursorOffset={setCursorOffset}
          />
        </Box>
        {errorMessage ? <Text color="error">{errorMessage}</Text> : null}
        <Text dimColor>Enter avanca. Esc volta.</Text>
      </Box>
    )
  }

  function renderCodexModelSelection(): React.ReactNode {
    return (
      <Box flexDirection="column" gap={1}>
        <Text color="remember" bold>
          Codex - selecionar modelo
        </Text>
        <Text dimColor>Escolha o modelo. Em seguida voce escolhe o raciocinio.</Text>
        <Select
          options={getCodexModelOptions()}
          defaultValue={codexModelChoice}
          defaultFocusValue={codexModelChoice}
          inlineDescriptions
          visibleOptionCount={4}
          onChange={value => {
            setCodexModelChoice(value as CodexModelChoice)
            setCodexEffortChoice(
              getDefaultCodexEffortChoice(value as CodexModelChoice),
            )
            setScreen('codex-effort')
          }}
          onCancel={() => setScreen('codex-setup')}
        />
      </Box>
    )
  }

  function renderCodexEffortSelection(): React.ReactNode {
    return (
      <Box flexDirection="column" gap={1}>
        <Text color="remember" bold>
          Codex - selecionar raciocinio
        </Text>
        <Text dimColor>Defina a eficiencia do raciocinio para esse modelo.</Text>
        <Select
          options={getCodexEffortOptions()}
          defaultValue={codexEffortChoice}
          defaultFocusValue={codexEffortChoice}
          inlineDescriptions
          visibleOptionCount={4}
          onChange={value => {
            const effort = value as CodexEffortChoice
            setCodexEffortChoice(effort)
            persistCodexWithSelectedModel(effort)
          }}
          onCancel={() => setScreen('codex-model')}
        />
      </Box>
    )
  }

  function renderMenu(): React.ReactNode {
    const hasProfiles = profiles.length > 0
    const menuOptions = [
      {
        value: 'add',
        label: 'Adicionar provedor',
        description: 'Criar um perfil novo.',
      },
      {
        value: 'activate',
        label: 'Escolher o ativo',
        description: 'Trocar qual perfil fica valendo.',
        disabled: !hasProfiles,
      },
      {
        value: 'edit',
        label: 'Editar provedor',
        description: 'Mudar nome, URL, modelo ou chave.',
        disabled: !hasProfiles,
      },
      {
        value: 'delete',
        label: 'Apagar provedor',
        description: 'Remover um perfil salvo.',
        disabled: !hasProfiles,
      },
      {
        value: 'done',
        label: 'Fechar',
        description: 'Voltar pro chat.',
      },
    ]

    return (
      <Box flexDirection="column" gap={1}>
        <Text color="remember" bold>
          Gerenciador de provedores
        </Text>
        <Text dimColor>
          O perfil ativo define qual provedor, modelo e chave o Claudinho usa.
        </Text>
        {statusMessage ? <Text>{statusMessage}</Text> : null}
        {errorMessage ? <Text color="error">{errorMessage}</Text> : null}
        <Box flexDirection="column">
          {hasProfiles ? (
            profiles.map(profile => (
              <Text key={profile.id} dimColor>
                - {profile.name}: {getProviderSummaryLine(profile, profile.id === activeProfileId)}
              </Text>
            ))
          ) : (
            <Text dimColor>Nenhum provedor salvo ainda.</Text>
          )}
        </Box>
        <Select
          options={menuOptions}
          onChange={value => {
            setErrorMessage(undefined)
            switch (value) {
              case 'add':
                setScreen('select-preset')
                break
              case 'activate':
                setScreen('select-active')
                break
              case 'edit':
                setScreen('select-edit')
                break
              case 'delete':
                setScreen('select-delete')
                break
              default:
                closeWithCancelled('Gerenciador de provedores fechado.')
                break
            }
          }}
          onCancel={() => closeWithCancelled('Gerenciador de provedores fechado.')}
          visibleOptionCount={menuOptions.length}
        />
      </Box>
    )
  }

  function renderProfileSelection(
    title: string,
    emptyMessage: string,
    onSelect: (profileId: string) => void,
  ): React.ReactNode {
    if (profiles.length === 0) {
      return (
        <Box flexDirection="column" gap={1}>
          <Text color="remember" bold>
            {title}
          </Text>
          <Text dimColor>{emptyMessage}</Text>
          <Select
            options={[
              {
                value: 'back',
                label: 'Voltar',
                description: 'Volta pro menu.',
              },
            ]}
            onChange={() => setScreen('menu')}
            onCancel={() => setScreen('menu')}
            visibleOptionCount={1}
          />
        </Box>
      )
    }

    return (
      <Box flexDirection="column" gap={1}>
        <Text color="remember" bold>
          {title}
        </Text>
        <Select
          options={profiles.map(profile => ({
            value: profile.id,
            label:
              profile.id === activeProfileId
                ? `${profile.name} (ativo)`
                : profile.name,
            description: getProviderSummaryLine(
              profile,
              profile.id === activeProfileId,
            ),
          }))}
          onChange={onSelect}
          onCancel={() => setScreen('menu')}
          visibleOptionCount={Math.min(10, Math.max(2, profiles.length))}
        />
      </Box>
    )
  }

  let content: React.ReactNode

  switch (screen) {
    case 'select-preset':
      content = renderPresetSelection()
      break
    case 'form':
      content = renderForm()
      break
    case 'codex-setup':
      content = renderCodexSetup()
      break
    case 'codex-oauth':
      content = (
        <CodexOAuthScreen
          onSuccess={(accountId) => {
            setDraft(prev => ({
              ...prev,
              accountId: accountId ?? prev.accountId,
            }))
            setErrorMessage(undefined)
            setScreen('codex-model')
          }}
          onError={(message) => {
            setErrorMessage(message)
            setScreen('codex-setup')
          }}
        />
      )
      break
    case 'codex-manual-key':
      content = renderCodexManualKey()
      break
    case 'codex-manual-account':
      content = renderCodexManualAccount()
      break
    case 'codex-model':
      content = renderCodexModelSelection()
      break
    case 'codex-effort':
      content = renderCodexEffortSelection()
      break
    case 'select-active':
      content = renderProfileSelection(
        'Escolha o provedor ativo',
        'Voce ainda nao tem provedor salvo.',
        profileId => {
          const active = setActiveProviderProfile(profileId)
          if (!active) {
            setErrorMessage('Nao consegui trocar o provedor ativo.')
            setScreen('menu')
            return
          }

          const settingsOverrideError = clearStartupProviderOverrideFromUserSettings()
          refreshProfiles()
          setStatusMessage(
            getMenuStatusMessage(
              `Agora o provedor ativo e: ${active.name}.`,
              settingsOverrideError,
            ),
          )
          setScreen('menu')
        },
      )
      break
    case 'select-edit':
      content = renderProfileSelection(
        'Escolha o provedor para editar',
        'Voce ainda nao tem provedor salvo.',
        profileId => {
          startEditProfile(profileId)
        },
      )
      break
    case 'select-delete':
      content = renderProfileSelection(
        'Escolha o provedor para apagar',
        'Voce ainda nao tem provedor salvo.',
        profileId => {
          const result = deleteProviderProfile(profileId)
          if (!result.removed) {
            setErrorMessage('Nao consegui apagar esse provedor.')
          } else {
            const settingsOverrideError = result.activeProfileId
              ? clearStartupProviderOverrideFromUserSettings()
              : null
            refreshProfiles()
            setStatusMessage(
              getMenuStatusMessage('Provedor apagado.', settingsOverrideError),
            )
          }
          setScreen('menu')
        },
      )
      break
    case 'menu':
    default:
      content = renderMenu()
      break
  }

  return <Pane color="permission">{content}</Pane>
}

// Componente separado para evitar erro de hooks e re-renders
function CodexOAuthScreen({
  onSuccess,
  onError,
}: {
  onSuccess: (accountId?: string) => void
  onError: (message: string) => void
}): React.ReactNode {
  const [oauthState, setOauthState] = React.useState<
    'starting' | 'waiting' | 'success' | 'error'
  >('starting')
  const [errorMsg, setErrorMsg] = React.useState<string>('')

  React.useEffect(() => {
    let cancelled = false

    async function doOAuth() {
      try {
        setOauthState('waiting')

        const tokens = await runCodexOAuthFlow()
        if (cancelled) return

        saveCodexOAuthTokens(tokens)
        setOauthState('success')

        setTimeout(() => {
          if (!cancelled) {
            onSuccess(tokens.accountId)
          }
        }, 700)
      } catch (error) {
        if (cancelled) return

        const message = error instanceof Error ? error.message : String(error)
        setErrorMsg(message)
        setOauthState('error')

        setTimeout(() => {
          if (!cancelled) {
            onError(`Erro no OAuth: ${message}`)
          }
        }, 1000)
      }
    }

    void doOAuth()

    return () => {
      cancelled = true
    }
  }, [onSuccess, onError])

  return (
    <Box flexDirection="column" gap={1}>
      <Text color="remember" bold>
        Login Codex OAuth
      </Text>

      {oauthState === 'starting' && (
        <>
          <Text dimColor>Iniciando autenticacao...</Text>
          <LoadingState />
        </>
      )}

      {oauthState === 'waiting' && (
        <>
          <Text bold>Abrindo navegador...</Text>
          <Text dimColor>Faca login na sua conta OpenAI no navegador.</Text>
          <Text dimColor>Apos autorizar, voltamos automaticamente.</Text>
          <LoadingState />
        </>
      )}

      {oauthState === 'success' && (
        <>
          <Text bold color="success">
            Login concluido!
          </Text>
          <Text dimColor>Tokens salvos. Indo para selecao de modelo...</Text>
        </>
      )}

      {oauthState === 'error' && (
        <>
          <Text bold color="error">
            Erro no login
          </Text>
          <Text color="error">{errorMsg}</Text>
          <Text dimColor>Voltando para o setup do Codex...</Text>
        </>
      )}
    </Box>
  )
}
