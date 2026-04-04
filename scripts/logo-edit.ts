#!/usr/bin/env bun
/**
 * Interactive Logo Editor for OpenClaude Startup Screen
 *
 * Run with: bun run scripts/logo-edit.ts
 * Or: openclaude logo-edit
 *
 * Lets you customize the startup logo, tagline, and colors with live preview.
 * All changes saved to src/components/logoConfig.json
 * Safety backup auto-created before each save.
 */

import { readFileSync, writeFileSync, existsSync, copyFileSync, readdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const PROJECT_ROOT = join(__dirname, '..')
const CONFIG_PATH = join(PROJECT_ROOT, 'src', 'components', 'logoConfig.json')
const BACKUP_DIR = join(PROJECT_ROOT, 'src', 'components', 'backups')

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

const ESC = '\x1b['
const RESET = `${ESC}0m`
const rgb = (r: number, g: number, b: number) => `${ESC}38;2;${r};${g};${b}m`

function loadConfig(): LogoConfig {
  if (existsSync(CONFIG_PATH)) {
    return JSON.parse(readFileSync(CONFIG_PATH, 'utf8'))
  }
  return {}
}

function saveConfig(config: LogoConfig): string {
  // Create backup directory
  if (!existsSync(BACKUP_DIR)) {
    import('fs').then(fs => fs.mkdirSync(BACKUP_DIR, { recursive: true }))
  }

  // Auto-backup before each save
  if (existsSync(CONFIG_PATH)) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)
    const backupPath = join(BACKUP_DIR, `logoConfig.${timestamp}.json.bak`)
    copyFileSync(CONFIG_PATH, backupPath)
    return backupPath
  }
  return 'new file'
}

function writeConfig(config: LogoConfig) {
  if (!existsSync(BACKUP_DIR)) {
    const fsModule = require('fs')
    fsModule.mkdirSync(BACKUP_DIR, { recursive: true })
  }
  // Auto-backup before save
  if (existsSync(CONFIG_PATH)) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)
    const backupPath = join(BACKUP_DIR, `logoConfig.${timestamp}.json`)
    copyFileSync(CONFIG_PATH, backupPath)
    console.log(`  ${rgb(130, 175, 130)}Backup created: ${BACKUP_DIR}/logoConfig.${timestamp}.json${RESET}`)
  }
  writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2) + '\n', 'utf8')
}

function renderPreview(config: LogoConfig) {
  // Clear screen
  process.stdout.write('\x1b[H\x1b[2J')

  const sunsetGrad = config.gradientColors ?? [[255, 180, 100], [240, 140, 80], [217, 119, 87], [193, 95, 60], [160, 75, 55], [130, 60, 50]]
  const accent = config.accentColor ?? [240, 148, 100]
  const cream = config.creamColor ?? [220, 195, 170]
  const dimCol = config.dimColor ?? [120, 100, 82]

  console.log('')

  // Render gradient logo
  const logo1 = config.logoOpen ?? []
  const logo2 = config.logoSecondary ?? []
  const allLogo = [...logo1, '', ...logo2]
  for (let i = 0; i < allLogo.length; i++) {
    if (!allLogo[i]) {
      console.log('')
      continue
    }
    let line = ''
    const total = allLogo.filter(x => x).length
    const idx = allLogo.filter(x => x).indexOf(allLogo[i])
    const t = total > 1 ? idx / (total - 1) : 0
    for (let j = 0; j < allLogo[i]!.length; j++) {
      const tt = allLogo[i]!.length > 1 ? t * 0.5 + (j / (allLogo[i]!.length - 1)) * 0.5 : t
      const s = Math.max(0, Math.min(1, tt))
      const ci = Math.min(Math.floor(s * (sunsetGrad.length - 1)), sunsetGrad.length - 1)
      const cf = s * (sunsetGrad.length - 1) - ci
      const c1 = sunsetGrad[ci] ?? [255, 255, 255]
      const c2 = sunsetGrad[ci + 1] ?? c1
      const r = Math.round(c1[0] + (c2[0] - c1[0]) * cf)
      const g = Math.round(c1[1] + (c2[1] - c1[1]) * cf)
      const b = Math.round(c1[2] + (c2[2] - c1[2]) * cf)
      line += `${rgb(r, g, b)}${allLogo[i]![j]}`
    }
    console.log(line + RESET)
  }

  console.log('')

  // Tagline
  const tagline = config.tagline ?? 'Any model. Every tool. Zero limits.'
  console.log(`  ${rgb(...accent)}✦${RESET} ${rgb(...cream)}${tagline}${RESET} ${rgb(...accent)}✦${RESET}`);

  // Extra lines
  ;(config.extraLinesBefore ?? []).forEach(l => console.log(`  ${rgb(...dimCol)}${l}${RESET}`))
  ;(config.extraLinesAfter ?? []).forEach(l => console.log(`  ${rgb(...dimCol)}${l}${RESET}`))

  console.log('')
  console.log(`${rgb(...dimCol)}  Provider: Ollama  |  Model: llama3.2:3b  |  Endpoint: http://localhost:11434/api${RESET}`)
  console.log('')
  console.log(`${rgb(130, 175, 130)}  ● local    Ready — type /help to begin${RESET}`)
  console.log('')
}

function printMenu() {
  console.log(`${rgb(240, 148, 100)}═══════════════ OpenClaude Logo Editor ═══════════════════${RESET}`)
  console.log('')
  console.log(`  ${rgb(220, 195, 170)}1.${RESET}  Edit logoOpen (first logo)`)
  console.log(`  ${rgb(220, 195, 170)}2.${RESET}  Edit logoSecondary (CLAUDE text)`)
  console.log(`  ${rgb(220, 195, 170)}3.${RESET}  Edit tagline`)
  console.log(`  ${rgb(220, 195, 170)}4.${RESET}  Extra lines before logo`)
  console.log(`  ${rgb(220, 195, 170)}5.${RESET}  Extra lines after tagline`)
  console.log(`  ${rgb(220, 195, 170)}6.${RESET}  Gradient colors`)
  console.log(`  ${rgb(220, 195, 170)}7.${RESET}  Accent color`)
  console.log(`  ${rgb(220, 195, 170)}8.${RESET}  Cream color`)
  console.log(`  ${rgb(220, 195, 170)}9.${RESET}  Dim color`)
  console.log(`  ${rgb(220, 195, 170)}10.${RESET} Border color`)
  console.log('')
  console.log(`  ${rgb(220, 195, 170)}p.${RESET}  Preview (show only)`)
  console.log(`  ${rgb(130, 175, 130)}s.${RESET}  Save & Exit`)
  console.log(`  ${rgb(200, 100, 100)}r.${RESET}  Reset to defaults`)
  console.log(`  ${rgb(200, 100, 100)}q.${RESET}  Quit without saving`)
  console.log(`${rgb(240, 148, 100)}═══════════════════════════════════════════════════════════${RESET}`)
}

function readInput(prompt: string): Promise<string> {
  process.stdout.write(prompt)
  return new Promise((resolve) => {
    process.stdin.once('data', (data) => {
      const str = data.toString().trim()
      resolve(str)
    })
  })
}

async function editLogoArray(prop: 'logoOpen' | 'logoSecondary', config: LogoConfig) {
  const lines = config[prop] ?? []
  console.log(`\nEditing ${prop} (enter lines one by one, empty line to end):\n`)
  if (lines.length > 0) {
    console.log(`Current value (${lines.length} lines):\n`)
    lines.forEach((l, i) => console.log(`  ${i + 1}: ${l}`))
    console.log('')
  }
  console.log('Enter new lines (empty line to finish):')

  const newLines: string[] = []
  while (true) {
    const line = await readInput(`  line ${newLines.length + 1}: `)
    if (line === '') break
    newLines.push(line)
  }

  if (newLines.length > 0) {
    config[prop] = newLines
    console.log(`  ${rgb(130, 175, 130)}Updated ${prop} with ${newLines.length} lines${RESET}\n`)
  } else {
    console.log(`  Skipped (kept current value)\n`)
  }
}

async function editStringProp(key: keyof Pick<LogoConfig, 'tagline'>, config: LogoConfig) {
  const current = config[key] || ''
  const newVal = await readInput(`\nCurrent ${key}: "${current}"\nNew value (empty to keep): `)
  if (newVal) {
    config[key] = newVal
    console.log(`  ${rgb(130, 175, 130)}Updated ${key} to: "${newVal}"${RESET}\n`)
  } else {
    console.log(`  Skipped\n`)
  }
}

async function editExtraLines(key: 'extraLinesBefore' | 'extraLinesAfter', config: LogoConfig) {
  const lines = config[key] ?? []
  console.log(`\nEditing ${key}:`)
  if (lines.length > 0) {
    console.log(`Current:\n`)
    lines.forEach((l, i) => console.log(`  ${i + 1}: "${l}"`))
    console.log('')
  }
  console.log('Enter new lines (empty line to finish):')

  const newLines: string[] = []
  while (true) {
    const line = await readInput(`  line ${newLines.length + 1}: `)
    if (line === '') break
    newLines.push(line)
  }

  if (newLines.length > 0) {
    config[key] = newLines
  }
  console.log(`  ${rgb(130, 175, 130)}Updated${RESET}\n`)
}

async function editRGB(prop: keyof LogoConfig, config: LogoConfig): Promise<[number, number, number]> {
  const current = (config[prop] as [number, number, number] ?? [0, 0, 0])
  const [r, g, b] = current
  const newVal = await readInput(`\nCurrent ${prop}: [${r}, ${g}, ${b}]${RESET}\nNew value (R G B or "rr gg bb" or empty to keep): `)

  if (newVal === '') return current

  const parts = newVal.split(/[\s,]+/).map(Number)
  if (parts.length === 3 && parts.every(n => !isNaN(n) && n >= 0 && n <= 255)) {
    config[prop] = parts as [number, number, number]
    console.log(`  ${rgb(130, 175, 130)}Updated ${prop} to [${parts[0]}, ${parts[1]}, ${parts[2]}]${RESET}\n`)
  } else {
    console.log(`  ${rgb(200, 100, 100)}Invalid RGB values, keeping current${RESET}\n`)
  }
  return current
}

async function showEditor() {
  const config = loadConfig()
  let dirty = false

  while (true) {
    renderPreview(config)
    printMenu()

    const choice = await readInput('\n  Choice: ')

    switch (choice) {
      case '1':
        await editLogoArray('logoOpen', config)
        dirty = true
        break
      case '2':
        await editLogoArray('logoSecondary', config)
        dirty = true
        break
      case '3':
        await editStringProp('tagline', config)
        dirty = true
        break
      case '4':
        await editExtraLines('extraLinesBefore', config)
        dirty = true
        break
      case '5':
        await editExtraLines('extraLinesAfter', config)
        dirty = true
        break
      case '6':
        console.log(`\nGradient colors: add one by one (empty R to finish)\n`)
        console.log(`Current gradient (${config.gradientColors?.length ?? 0} stops):`)
        config.gradientColors?.forEach((c, i) => {
          console.log(`  ${i + 1}: rgb(${c[0]}, ${c[1]}, ${c[2]}) ${rgb(...c)}████${RESET}`)
        })
        console.log('')
        const newGrad: [number, number, number][] = []
        while (true) {
          const r = await readInput(`  R (0-255, empty to end): `)
          if (r === '') break
          const g = await readInput(`      G (0-255): `)
          const b = await readInput(`      B (0-255): `)
          const rn = parseInt(r), gn = parseInt(g), bn = parseInt(b)
          if (rn >= 0 && rn <= 255 && gn >= 0 && gn <= 255 && bn >= 0 && bn <= 255) {
            newGrad.push([rn, gn, bn])
            console.log(`  ${rgb(rn, gn, bn)}████ added${RESET}`)
          } else {
            console.log(`  ${rgb(200, 100, 100)}Invalid, skipped${RESET}`)
          }
        }
        if (newGrad.length > 0) {
          config.gradientColors = newGrad
          dirty = true
        }
        break
      case '7': await editRGB('accentColor', config); dirty = true; break
      case '8': await editRGB('creamColor', config); dirty = true; break
      case '9': await editRGB('dimColor', config); dirty = true; break
      case '10': await editRGB('borderColor', config); dirty = true; break
      case 'p':
        renderPreview(config)
        console.log('  ^--- THIS IS THE PREVIEW ---\n')
        await readInput('  Press Enter to continue...')
        break
      case 's':
        if (dirty || existsSync(CONFIG_PATH)) {
          writeConfig(config)
          console.log(`\n  ${rgb(130, 175, 130)}Config saved to src/components/logoConfig.json${RESET}`)
          console.log(`  ${rgb(220, 195, 170)}Backups are in src/components/backups/${RESET}`)
        } else {
          console.log(`\n  ${rgb(130, 175, 130)}No changes to save${RESET}`)
        }
        return
      case 'r': {
        const confirm = await readInput(`\n  ${rgb(200, 100, 100)}Reset to defaults? (y/N): ${RESET}`)
        if (confirm.toLowerCase() === 'y') {
          if (existsSync(CONFIG_PATH)) {
            writeConfig({} as LogoConfig)
          }
          console.log(`  ${rgb(130, 175, 130)}Reset to defaults${RESET}\n`)
          return
        }
        break
      }
      case 'q':
        console.log(`\n  ${rgb(220, 195, 170)}Quit without saving${RESET}\n`)
        return
      default:
        console.log(`\n  ${rgb(200, 100, 100)}Invalid choice, try again${RESET}\n`)
    }
  }
}

console.log(`${rgb(240, 148, 100)}
██╗  ██╗ ███████╗ █████╗  ██████╗ ███████╗    ███████╗ █████╗  ██████╗██╗  ██╗████████╗
██║  ██║ ██╔════╝██╔══██╗██╔════╝ ██╔════╝    ██╔════╝██╔══██╗██╔════╝██║  ██║╚══██╔══╝
███████║ █████╗  ███████║██║  ███╗█████╗      █████╗  ███████║██║     ███████║   ██║
██╔══██║ ██╔══╝  ██╔══██║██║   ██║██╔══╝      ██╔══╝  ██╔══██║██║     ██╔══██║   ██║
██║  ██║ ███████╗██║  ██║╚██████╔╝███████╗    ██║     ██║  ██║╚██████╗██║  ██║   ██║
╚═╝  ╚═╝ ╚══════╝╚═╝  ╚═╝ ╚═════╝ ╚══════╝    ╚═╝     ╚═╝  ╚═╝ ╚═════╝╚═╝  ╚═╝   ╚═╝
${RESET}`)

console.log(`${rgb(220, 195, 170)}  OpenClaude Startup Screen Editor${RESET}`)
console.log(`${rgb(120, 100, 82)}  Safety: all changes backed up to src/components/backups/${RESET}`)
console.log('')

// Set stdin to raw mode
process.stdin.setRawMode(true)
process.stdin.resume()
process.stdin.setEncoding('utf8')

// Small delay so the ASCII art renders cleanly
setTimeout(() => showEditor(), 100)
