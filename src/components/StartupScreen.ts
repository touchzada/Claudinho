/**
 * Claudinho startup screen — filled-block text logo with sunset gradient.
 * Called once at CLI startup before the Ink UI renders.
 *
 * Logo customization: edit src/components/logoConfig.json
 * Run: claudinho logo-preview (preview), claudinho logo-edit (interactive editor)
 * Safety backup: StartupScreen.ts.bak.original (copy of the original)
 *
 * Addresses: https://github.com/touchzada/Claudinho/issues/55
 */

declare const MACRO: { VERSION: string; DISPLAY_VERSION?: string }

const ESC = '\x1b['
const RESET = `${ESC}0m`
const DIM = `${ESC}2m`

type RGB = [number, number, number]
const rgb = (r: number, g: number, b: number) => `${ESC}38;2;${r};${g};${b}m`

function lerp(a: RGB, b: RGB, t: number): RGB {
  return [
    Math.round(a[0] + (b[0] - a[0]) * t),
    Math.round(a[1] + (b[1] - a[1]) * t),
    Math.round(a[2] + (b[2] - a[2]) * t),
  ]
}

function gradAt(stops: RGB[], t: number): RGB {
  const c = Math.max(0, Math.min(1, t))
  const s = c * (stops.length - 1)
  const i = Math.floor(s)
  if (i >= stops.length - 1) return stops[stops.length - 1]
  return lerp(stops[i], stops[i + 1], s - i)
}

function paintLine(text: string, stops: RGB[], lineT: number): string {
  let out = ''
  for (let i = 0; i < text.length; i++) {
    const t = text.length > 1 ? lineT * 0.5 + (i / (text.length - 1)) * 0.5 : lineT
    const [r, g, b] = gradAt(stops, t)
    out += `${rgb(r, g, b)}${text[i]}`
  }
  return out + RESET
}

// Raw character length helper (ignoring combining/non-printing characters)
function rawLen(text: string): number {
  return text.length
}

// ─── Config loading ───────────────────────────────────────────────────────────

interface LogoConfig {
  logoOpen?: string[]
  logoSecondary?: string[]
  tagline?: string
  extraLinesBefore?: string[]
  extraLinesAfter?: string[]
  gradientColors?: [number, number, number][]
  accentColor?: [number, number, number]
  creamColor?: [number, number, number]
  dimColor?: [number, number, number]
  borderColor?: [number, number, number]
  boxWidth?: number
}

let configCache: LogoConfig | null = null

function loadConfig(): LogoConfig {
  if (configCache) return configCache
  try {
    // Dynamic ESM import — works in both ESM build and Node environments
    // eslint-disable-next-line
    const fs = (0, eval)('require')('fs')
    // eslint-disable-next-line
    const path = (0, eval)('require')('path')
    const configPath = path.join(__dirname, 'logoConfig.json')
    if (fs.existsSync(configPath)) {
      configCache = JSON.parse(fs.readFileSync(configPath, 'utf8'))
    }
  } catch {
    // Fallback to defaults
  }
  configCache = configCache || ({} as LogoConfig)
  return configCache
}

// ─── Filled Block Text Logo (loaded from config, fallback to hardcoded) ───

const LOGO_OPEN: string[] = (() => {
  const cfg = loadConfig()
  if (cfg.logoOpen && cfg.logoOpen.length > 0) return cfg.logoOpen
  return [
    `   ██████╗ ██╗      █████╗ ██╗   ██╗██████╗ ██╗███╗   ██╗██╗  ██╗ ██████╗ `,
    `  ██╔════╝ ██║     ██╔══██╗██║   ██║██╔══██╗██║████╗  ██║██║  ██║██╔═══██╗`,
    `  ██║      ██║     ███████║██║   ██║██║  ██║██║██╔██╗ ██║███████║██║   ██║`,
    `  ██║      ██║     ██╔══██║██║   ██║██║  ██║██║██║╚██╗██║██╔══██║██║   ██║`,
    `  ╚██████╗ ███████╗██║  ██║╚██████╔╝██████╔╝██║██║ ╚████║██║  ██║╚██████╔╝`,
    `   ╚═════╝ ╚══════╝╚═╝  ╚═╝ ╚═════╝ ╚═════╝ ╚═╝╚═╝  ╚═══╝╚═╝  ╚═╝ ╚═════╝ `,
  ]
})()

const LOGO_CLAUDE: string[] = (() => {
  const cfg = loadConfig()
  if (cfg.logoSecondary && cfg.logoSecondary.length > 0) return cfg.logoSecondary
  return []
})()

// Loaded colors or defaults
const SUNSET_GRAD: RGB[] = (() => {
  const cfg = loadConfig()
  return (cfg.gradientColors && cfg.gradientColors.length > 0 ? cfg.gradientColors : [
    [34, 131, 48], [46, 150, 60], [80, 175, 50],
    [140, 205, 30], [200, 225, 20], [254, 221, 20],
  ]) as RGB[]
})()
const TAGLINE: string = (() => {
  const cfg = loadConfig()
  return cfg.tagline ?? 'Qualquer provedor. Qualquer modelo. De graça, PRA SEMPRE.'
})()

// Color helpers (loaded from config or defaults)
const ACCENT: RGB = (() => {
  const cfg = loadConfig()
  return (cfg.accentColor ?? [254, 203, 0]) as RGB
})()
const CREAM: RGB = (() => {
  const cfg = loadConfig()
  return (cfg.creamColor ?? [220, 235, 200]) as RGB
})()
const DIMCOL: RGB = (() => {
  const cfg = loadConfig()
  return (cfg.dimColor ?? [50, 100, 55]) as RGB
})()
const BORDER: RGB = (() => {
  const cfg = loadConfig()
  return (cfg.borderColor ?? [20, 70, 25]) as RGB
})()
const BOX_WIDTH: number = (() => {
  const cfg = loadConfig()
  return cfg.boxWidth ?? 62
})()

// ─── Provider detection ───────────────────────────────────────────────────────

function detectProvider(): { name: string; model: string; baseUrl: string; isLocal: boolean } {
  const useGemini = process.env.CLAUDE_CODE_USE_GEMINI === '1' || process.env.CLAUDE_CODE_USE_GEMINI === 'true'
  const useGithub = process.env.CLAUDE_CODE_USE_GITHUB === '1' || process.env.CLAUDE_CODE_USE_GITHUB === 'true'
  const useOpenAI = process.env.CLAUDE_CODE_USE_OPENAI === '1' || process.env.CLAUDE_CODE_USE_OPENAI === 'true'

  if (useGemini) {
    const model = process.env.GEMINI_MODEL || 'gemini-2.0-flash'
    const baseUrl = process.env.GEMINI_BASE_URL || 'https://generativelanguage.googleapis.com/v1beta/openai'
    return { name: 'Google Gemini', model, baseUrl, isLocal: false }
  }

  if (useGithub) {
    const model = process.env.OPENAI_MODEL || 'github:copilot'
    const baseUrl =
      process.env.OPENAI_BASE_URL || 'https://models.github.ai/inference'
    return { name: 'GitHub Models', model, baseUrl, isLocal: false }
  }

  if (useOpenAI) {
    const rawModel = process.env.OPENAI_MODEL || 'gpt-4o'
    const baseUrl = process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1'
    const isLocal = /localhost|127\.0\.0\.1|0\.0\.0\.0/.test(baseUrl)
    let name = 'OpenAI'
    if (/deepseek/i.test(baseUrl) || /deepseek/i.test(rawModel))       name = 'DeepSeek'
    else if (/openrouter/i.test(baseUrl))                             name = 'OpenRouter'
    else if (/together/i.test(baseUrl))                               name = 'Together AI'
    else if (/groq/i.test(baseUrl))                                   name = 'Groq'
    else if (/mistral/i.test(baseUrl) || /mistral/i.test(rawModel))     name = 'Mistral'
    else if (/azure/i.test(baseUrl))                                  name = 'Azure OpenAI'
    else if (/localhost:11434/i.test(baseUrl))                        name = 'Ollama'
    else if (/localhost:1234/i.test(baseUrl))                         name = 'LM Studio'
    else if (/llama/i.test(rawModel))                                    name = 'Meta Llama'
    else if (isLocal)                                                  name = 'Local'
    
    // Resolve model alias to actual model name + reasoning effort
    let displayModel = rawModel
    const codexAliases: Record<string, { model: string; reasoningEffort?: string }> = {
      codexplan: { model: 'gpt-5.4', reasoningEffort: 'high' },
      'gpt-5.4': { model: 'gpt-5.4', reasoningEffort: 'high' },
      'gpt-5.3-codex': { model: 'gpt-5.3-codex', reasoningEffort: 'high' },
      'gpt-5.3-codex-spark': { model: 'gpt-5.3-codex-spark' },
      codexspark: { model: 'gpt-5.3-codex-spark' },
      'gpt-5.2-codex': { model: 'gpt-5.2-codex', reasoningEffort: 'high' },
      'gpt-5.1-codex-max': { model: 'gpt-5.1-codex-max', reasoningEffort: 'high' },
      'gpt-5.1-codex-mini': { model: 'gpt-5.1-codex-mini' },
      'gpt-5.4-mini': { model: 'gpt-5.4-mini', reasoningEffort: 'medium' },
      'gpt-5.2': { model: 'gpt-5.2', reasoningEffort: 'medium' },
    }
    const alias = rawModel.toLowerCase()
    if (alias in codexAliases) {
      const resolved = codexAliases[alias]
      displayModel = resolved.model
      if (resolved.reasoningEffort) {
        displayModel = `${displayModel} (${resolved.reasoningEffort})`
      }
    }
    
    return { name, model: displayModel, baseUrl, isLocal }
  }

  // Default: Anthropic
  const model = process.env.ANTHROPIC_MODEL || process.env.CLAUDE_MODEL || 'claude-sonnet-4-6'
  return { name: 'Anthropic', model, baseUrl: 'https://api.anthropic.com', isLocal: false }
}

// ─── Box drawing ──────────────────────────────────────────────────────────────

function boxRow(content: string, width: number, rawLen: number): string {
  const pad = Math.max(0, width - 2 - rawLen)
  return `${rgb(...BORDER)}\u2502${RESET}${content}${' '.repeat(pad)}${rgb(...BORDER)}\u2502${RESET}`
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export function printStartupScreen(): void {
  // Skip in non-interactive / CI / print mode
  if (process.env.CI || !process.stdout.isTTY) return

  const p = detectProvider()
  const W = BOX_WIDTH
  const cfg = loadConfig()
  const out: string[] = []

  // Calculate horizontal centering
  const terminalWidth = process.stdout.columns || 80
  const logoWidth = 75 // Approximate width of CLAUDINHO logo
  const leftPad = Math.max(0, Math.floor((terminalWidth - logoWidth) / 2))
  const pad = ' '.repeat(leftPad)

  out.push('')

  // Extra lines before logo
  const extraBefore = cfg.extraLinesBefore ?? []
  extraBefore.forEach((line) => out.push(`${pad}  ${rgb(...DIMCOL)}${line}${RESET}`))

  // Gradient logo
  const allLogo = [...LOGO_OPEN, '', ...LOGO_CLAUDE]
  const total = allLogo.length
  for (let i = 0; i < total; i++) {
    const t = total > 1 ? i / (total - 1) : 0
    if (allLogo[i] === '') {
      out.push('')
    } else {
      out.push(pad + paintLine(allLogo[i], SUNSET_GRAD, t))
    }
  }

  out.push('')

  // Tagline
  out.push(`${pad}  ${rgb(...ACCENT)}\u2726${RESET} ${rgb(...CREAM)}${TAGLINE}${RESET} ${rgb(...ACCENT)}\u2726${RESET}`)

  // Extra lines after tagline
  const extraAfter = cfg.extraLinesAfter ?? []
  extraAfter.forEach((line) => out.push(`${pad}  ${rgb(...DIMCOL)}${line}${RESET}`))

  out.push('')

  // Provider info box (centered)
  const boxPad = ' '.repeat(Math.max(0, Math.floor((terminalWidth - W) / 2)))
  out.push(`${boxPad}${rgb(...BORDER)}\u2554${'\u2550'.repeat(W - 2)}\u2557${RESET}`)

  const lbl = (k: string, v: string, c: RGB = CREAM): [string, number] => {
    const padK = k.padEnd(9)
    return [` ${DIM}${rgb(...DIMCOL)}${padK}${RESET} ${rgb(...c)}${v}${RESET}`, ` ${padK} ${v}`.length]
  }

  const provC: RGB = p.isLocal ? [130, 175, 130] : ACCENT
  let [r, l] = lbl('Provedor', p.name, provC)
  out.push(boxPad + boxRow(r, W, l))
  ;[r, l] = lbl('Modelo', p.model)
  out.push(boxPad + boxRow(r, W, l))
  const ep = p.baseUrl.length > 38 ? p.baseUrl.slice(0, 35) + '...' : p.baseUrl
  ;[r, l] = lbl('Endpoint', ep)
  out.push(boxPad + boxRow(r, W, l))

  out.push(`${boxPad}${rgb(...BORDER)}\u2560${'\u2550'.repeat(W - 2)}\u2563${RESET}`)

  const sC: RGB = p.isLocal ? [130, 175, 130] : ACCENT
  const sL = p.isLocal ? 'local' : 'local'
  const sRow = ` ${rgb(...sC)}\u25cf${RESET} ${DIM}${rgb(...DIMCOL)}${sL}${RESET}    ${DIM}${rgb(...DIMCOL)}Pronto \u2014 lança um ${RESET}${rgb(...ACCENT)}/help${RESET}${DIM}${rgb(...DIMCOL)} ai ${RESET}`
  const sLen = ` \u25cf ${sL}    Ready \u2014 type /help to begin`.length
  out.push(boxPad + boxRow(sRow, W, sLen))

  out.push(`${boxPad}${rgb(...BORDER)}\u255a${'\u2550'.repeat(W - 2)}\u255d${RESET}`)
  out.push(`${boxPad}  ${DIM}${rgb(...DIMCOL)}                    claudinho ${RESET}${rgb(...ACCENT)}v${MACRO.DISPLAY_VERSION ?? MACRO.VERSION}${RESET}`)
  out.push('')

  process.stdout.write(out.join('\n') + '\n')
}
