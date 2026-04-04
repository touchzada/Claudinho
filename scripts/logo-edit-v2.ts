#!/usr/bin/env bun
/**
 * Logo Editor 2.0 - Advanced Interactive Logo Designer
 * 
 * Features:
 * - Live ASCII art editor with cursor
 * - Real-time preview
 * - Multiple fonts/styles
 * - Color picker with RGB/HEX
 * - Undo/Redo support
 * - Templates library
 * - Export/Import
 */

import { readFileSync, writeFileSync, existsSync, copyFileSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const PROJECT_ROOT = join(__dirname, '..')
const CONFIG_PATH = join(PROJECT_ROOT, 'src', 'components', 'logoConfig.json')
const BACKUP_DIR = join(PROJECT_ROOT, 'src', 'components', 'backups')
const TEMPLATES_DIR = join(PROJECT_ROOT, 'scripts', 'logo-templates')

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

interface EditorState {
  config: LogoConfig
  history: LogoConfig[]
  historyIndex: number
  currentView: 'menu' | 'ascii-editor' | 'color-picker' | 'templates'
  editingField: keyof LogoConfig | null
}

const ESC = '\x1b['
const RESET = `${ESC}0m`
const CLEAR = '\x1b[2J\x1b[H'
const BOLD = `${ESC}1m`
const DIM = `${ESC}2m`

const rgb = (r: number, g: number, b: number) => `${ESC}38;2;${r};${g};${b}m`
const bgRgb = (r: number, g: number, b: number) => `${ESC}48;2;${r};${g};${b}m`

// ASCII Art Templates
const TEMPLATES = {
  'blocky': [
    '  ██████╗ ██████╗ ███████╗███╗   ██╗',
    ' ██╔═══██╗██╔══██╗██╔════╝████╗  ██║',
    ' ██║   ██║██████╔╝█████╗  ██╔██╗ ██║',
    ' ██║   ██║██╔═══╝ ██╔══╝  ██║╚██╗██║',
    ' ╚██████╔╝██║     ███████╗██║ ╚████║',
    '  ╚═════╝ ╚═╝     ╚══════╝╚═╝  ╚═══╝',
  ],
  'slant': [
    '    ____                 ',
    '   / __ \\____  ___  ____ ',
    '  / / / / __ \\/ _ \\/ __ \\',
    ' / /_/ / /_/ /  __/ / / /',
    ' \\____/ .___/\\___/_/ /_/ ',
    '     /_/                 ',
  ],
  'double': [
    '  ╔═══╗╔═══╗╔═══╗╔═╗ ╔╗',
    '  ║╔═╗║║╔═╗║║╔══╝║║╚╗║║',
    '  ║║ ║║║╚═╝║║╚══╗║╔╗╚╝║',
    '  ║║ ║║║╔══╝║╔══╝║║╚╗║║',
    '  ║╚═╝║║║   ║╚══╗║║ ║║║',
    '  ╚═══╝╚╝   ╚═══╝╚╝ ╚═╝',
  ],
  'shadow': [
    '  ▄▄▄█████▓ ██░ ██ ▓█████ ',
    '  ▓  ██▒ ▓▒▓██░ ██▒▓█   ▀ ',
    '  ▒ ▓██░ ▒░▒██▀▀██░▒███   ',
    '  ░ ▓██▓ ░ ░▓█ ░██ ▒▓█  ▄ ',
    '    ▒██▒ ░ ░▓█▒░██▓░▒████▒',
    '    ▒ ░░    ▒ ░░▒░▒░░ ▒░ ░',
  ],
  'minimal': [
    '  ___  ___  ___ _ __  ',
    ' / _ \\/ _ \\/ _ \\ \'_ \\ ',
    '| (_) | (_) |  __/ | | |',
    ' \\___/ \\___/ \\___|_| |_|',
  ],
}

const COLOR_PRESETS = {
  'sunset': [[255, 180, 100], [240, 140, 80], [217, 119, 87], [193, 95, 60]],
  'ocean': [[100, 180, 255], [80, 140, 240], [87, 119, 217], [60, 95, 193]],
  'forest': [[130, 255, 130], [100, 220, 100], [80, 180, 80], [60, 140, 60]],
  'fire': [[255, 100, 50], [255, 150, 50], [255, 200, 100], [255, 220, 150]],
  'purple': [[200, 100, 255], [180, 80, 240], [160, 70, 220], [140, 60, 200]],
  'neon': [[0, 255, 255], [255, 0, 255], [255, 255, 0], [0, 255, 0]],
}

function loadConfig(): LogoConfig {
  if (existsSync(CONFIG_PATH)) {
    return JSON.parse(readFileSync(CONFIG_PATH, 'utf8'))
  }
  return {
    tagline: 'Any model. Every tool. Zero limits.',
    gradientColors: [[255, 180, 100], [240, 140, 80], [217, 119, 87]],
    accentColor: [240, 148, 100],
    creamColor: [220, 195, 170],
  }
}

function saveConfig(config: LogoConfig) {
  if (!existsSync(BACKUP_DIR)) {
    mkdirSync(BACKUP_DIR, { recursive: true })
  }
  if (existsSync(CONFIG_PATH)) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)
    const backupPath = join(BACKUP_DIR, `logoConfig.${timestamp}.json`)
    copyFileSync(CONFIG_PATH, backupPath)
  }
  writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2) + '\n', 'utf8')
}

function renderLogo(config: LogoConfig) {
  const grad = config.gradientColors ?? [[255, 180, 100], [240, 140, 80]]
  const logo1 = config.logoOpen ?? []
  const logo2 = config.logoSecondary ?? []
  const allLogo = [...logo1, '', ...logo2]
  
  const lines: string[] = []
  for (let i = 0; i < allLogo.length; i++) {
    if (!allLogo[i]) {
      lines.push('')
      continue
    }
    let line = ''
    const total = allLogo.filter(x => x).length
    const idx = allLogo.filter(x => x).indexOf(allLogo[i])
    const t = total > 1 ? idx / (total - 1) : 0
    
    for (let j = 0; j < allLogo[i]!.length; j++) {
      const tt = allLogo[i]!.length > 1 ? t * 0.5 + (j / (allLogo[i]!.length - 1)) * 0.5 : t
      const s = Math.max(0, Math.min(1, tt))
      const ci = Math.min(Math.floor(s * (grad.length - 1)), grad.length - 1)
      const cf = s * (grad.length - 1) - ci
      const c1 = grad[ci] ?? [255, 255, 255]
      const c2 = grad[ci + 1] ?? c1
      const r = Math.round(c1[0] + (c2[0] - c1[0]) * cf)
      const g = Math.round(c1[1] + (c2[1] - c1[1]) * cf)
      const b = Math.round(c1[2] + (c2[2] - c1[2]) * cf)
      line += `${rgb(r, g, b)}${allLogo[i]![j]}`
    }
    lines.push(line + RESET)
  }
  return lines
}

function renderPreview(config: LogoConfig) {
  console.log(CLEAR)
  console.log('')
  
  const logoLines = renderLogo(config)
  logoLines.forEach(line => console.log(line))
  
  console.log('')
  const accent = config.accentColor ?? [240, 148, 100]
  const cream = config.creamColor ?? [220, 195, 170]
  const tagline = config.tagline ?? 'Any model. Every tool. Zero limits.'
  console.log(`  ${rgb(...accent)}✦${RESET} ${rgb(...cream)}${tagline}${RESET} ${rgb(...accent)}✦${RESET}`)
  console.log('')
}

function printMainMenu() {
  console.log(`${rgb(240, 148, 100)}${BOLD}╔═══════════════════════════════════════════════════════════╗${RESET}`)
  console.log(`${rgb(240, 148, 100)}${BOLD}║         LOGO EDITOR 2.0 - Advanced Designer           ║${RESET}`)
  console.log(`${rgb(240, 148, 100)}${BOLD}╚═══════════════════════════════════════════════════════════╝${RESET}`)
  console.log('')
  console.log(`${rgb(220, 195, 170)}  📝 EDIT CONTENT${RESET}`)
  console.log(`    ${rgb(220, 195, 170)}1.${RESET} ASCII Art Editor (with live preview)`)
  console.log(`    ${rgb(220, 195, 170)}2.${RESET} Edit Tagline`)
  console.log(`    ${rgb(220, 195, 170)}3.${RESET} Extra Lines (before/after)`)
  console.log('')
  console.log(`${rgb(220, 195, 170)}  🎨 COLORS & STYLE${RESET}`)
  console.log(`    ${rgb(220, 195, 170)}4.${RESET} Color Picker (gradient, accent, cream)`)
  console.log(`    ${rgb(220, 195, 170)}5.${RESET} Color Presets (sunset, ocean, fire, etc)`)
  console.log('')
  console.log(`${rgb(220, 195, 170)}  📚 TEMPLATES${RESET}`)
  console.log(`    ${rgb(220, 195, 170)}6.${RESET} Browse Templates (blocky, slant, shadow, etc)`)
  console.log(`    ${rgb(220, 195, 170)}7.${RESET} Import from file`)
  console.log(`    ${rgb(220, 195, 170)}8.${RESET} Export current design`)
  console.log('')
  console.log(`${rgb(220, 195, 170)}  🔧 ACTIONS${RESET}`)
  console.log(`    ${rgb(220, 195, 170)}p.${RESET} Preview (full screen)`)
  console.log(`    ${rgb(220, 195, 170)}u.${RESET} Undo`)
  console.log(`    ${rgb(220, 195, 170)}r.${RESET} Redo`)
  console.log(`    ${rgb(130, 175, 130)}s.${RESET} Save & Exit`)
  console.log(`    ${rgb(200, 100, 100)}q.${RESET} Quit without saving`)
  console.log('')
  console.log(`${rgb(240, 148, 100)}${BOLD}═══════════════════════════════════════════════════════════${RESET}`)
}

function readInput(prompt: string): Promise<string> {
  process.stdout.write(prompt)
  return new Promise((resolve) => {
    process.stdin.once('data', (data) => {
      resolve(data.toString().trim())
    })
  })
}

async function asciiArtEditor(state: EditorState) {
  console.log(CLEAR)
  console.log(`${rgb(240, 148, 100)}${BOLD}ASCII ART EDITOR${RESET}`)
  console.log(`${DIM}Enter lines one by one. Empty line to finish. Type 'template' to use a template.${RESET}`)
  console.log('')
  
  const useTemplate = await readInput('Use template? (y/N): ')
  let lines: string[] = []
  
  if (useTemplate.toLowerCase() === 'y') {
    console.log('\nAvailable templates:')
    Object.keys(TEMPLATES).forEach((name, i) => {
      console.log(`  ${i + 1}. ${name}`)
    })
    const choice = await readInput('\nChoose template (1-' + Object.keys(TEMPLATES).length + '): ')
    const idx = parseInt(choice) - 1
    const templateName = Object.keys(TEMPLATES)[idx]
    if (templateName && TEMPLATES[templateName as keyof typeof TEMPLATES]) {
      lines = [...TEMPLATES[templateName as keyof typeof TEMPLATES]]
      console.log(`\n${rgb(130, 175, 130)}Template "${templateName}" loaded!${RESET}`)
    }
  }
  
  console.log('\nEnter your ASCII art (empty line to finish):')
  let lineNum = lines.length
  
  while (true) {
    const line = await readInput(`  ${lineNum + 1}: `)
    if (line === '') break
    lines.push(line)
    lineNum++
  }
  
  if (lines.length > 0) {
    const target = await readInput('\nSave to: 1=logoOpen, 2=logoSecondary (1/2): ')
    if (target === '1') {
      state.config.logoOpen = lines
    } else if (target === '2') {
      state.config.logoSecondary = lines
    }
    console.log(`${rgb(130, 175, 130)}✓ Saved!${RESET}`)
  }
  
  await readInput('\nPress Enter to continue...')
}

async function colorPicker(state: EditorState) {
  console.log(CLEAR)
  console.log(`${rgb(240, 148, 100)}${BOLD}COLOR PICKER${RESET}`)
  console.log('')
  console.log('What do you want to edit?')
  console.log('  1. Gradient colors')
  console.log('  2. Accent color')
  console.log('  3. Cream color')
  console.log('  4. Dim color')
  console.log('  5. Border color')
  console.log('')
  
  const choice = await readInput('Choice (1-5): ')
  
  if (choice === '1') {
    console.log('\nCurrent gradient:')
    state.config.gradientColors?.forEach((c, i) => {
      console.log(`  ${i + 1}. ${rgb(...c)}████${RESET} rgb(${c[0]}, ${c[1]}, ${c[2]})`)
    })
    
    console.log('\nEnter new gradient colors (R G B format, empty to finish):')
    const newGrad: [number, number, number][] = []
    
    while (true) {
      const input = await readInput(`  Color ${newGrad.length + 1} (R G B): `)
      if (input === '') break
      
      const parts = input.split(/\s+/).map(Number)
      if (parts.length === 3 && parts.every(n => n >= 0 && n <= 255)) {
        newGrad.push([parts[0], parts[1], parts[2]])
        console.log(`  ${rgb(parts[0], parts[1], parts[2])}████${RESET} Added!`)
      } else {
        console.log(`  ${rgb(200, 100, 100)}Invalid RGB values${RESET}`)
      }
    }
    
    if (newGrad.length > 0) {
      state.config.gradientColors = newGrad
      console.log(`${rgb(130, 175, 130)}✓ Gradient updated!${RESET}`)
    }
  } else {
    const colorMap: Record<string, keyof LogoConfig> = {
      '2': 'accentColor',
      '3': 'creamColor',
      '4': 'dimColor',
      '5': 'borderColor',
    }
    
    const field = colorMap[choice]
    if (field) {
      const current = state.config[field] as [number, number, number] | undefined
      if (current) {
        console.log(`\nCurrent: ${rgb(...current)}████${RESET} rgb(${current[0]}, ${current[1]}, ${current[2]})`)
      }
      
      const input = await readInput('\nNew color (R G B): ')
      const parts = input.split(/\s+/).map(Number)
      
      if (parts.length === 3 && parts.every(n => n >= 0 && n <= 255)) {
        state.config[field] = [parts[0], parts[1], parts[2]] as any
        console.log(`${rgb(130, 175, 130)}✓ Color updated!${RESET}`)
      }
    }
  }
  
  await readInput('\nPress Enter to continue...')
}

async function colorPresets(state: EditorState) {
  console.log(CLEAR)
  console.log(`${rgb(240, 148, 100)}${BOLD}COLOR PRESETS${RESET}`)
  console.log('')
  
  Object.entries(COLOR_PRESETS).forEach(([name, colors], i) => {
    process.stdout.write(`  ${i + 1}. ${name.padEnd(10)} `)
    colors.forEach(c => process.stdout.write(`${rgb(...c)}██${RESET}`))
    console.log('')
  })
  
  console.log('')
  const choice = await readInput('Choose preset (1-' + Object.keys(COLOR_PRESETS).length + '): ')
  const idx = parseInt(choice) - 1
  const presetName = Object.keys(COLOR_PRESETS)[idx]
  
  if (presetName && COLOR_PRESETS[presetName as keyof typeof COLOR_PRESETS]) {
    state.config.gradientColors = COLOR_PRESETS[presetName as keyof typeof COLOR_PRESETS]
    console.log(`${rgb(130, 175, 130)}✓ Preset "${presetName}" applied!${RESET}`)
  }
  
  await readInput('\nPress Enter to continue...')
}

async function editTagline(state: EditorState) {
  console.log(CLEAR)
  console.log(`${rgb(240, 148, 100)}${BOLD}EDIT TAGLINE${RESET}`)
  console.log('')
  console.log(`Current: "${state.config.tagline}"`)
  console.log('')
  
  const newTagline = await readInput('New tagline: ')
  if (newTagline) {
    state.config.tagline = newTagline
    console.log(`${rgb(130, 175, 130)}✓ Tagline updated!${RESET}`)
  }
  
  await readInput('\nPress Enter to continue...')
}

async function exportDesign(state: EditorState) {
  console.log(CLEAR)
  console.log(`${rgb(240, 148, 100)}${BOLD}EXPORT DESIGN${RESET}`)
  console.log('')
  
  const filename = await readInput('Export filename (without .json): ')
  if (filename) {
    const exportPath = join(PROJECT_ROOT, 'scripts', `${filename}.json`)
    writeFileSync(exportPath, JSON.stringify(state.config, null, 2) + '\n', 'utf8')
    console.log(`${rgb(130, 175, 130)}✓ Exported to: ${exportPath}${RESET}`)
  }
  
  await readInput('\nPress Enter to continue...')
}

async function importDesign(state: EditorState) {
  console.log(CLEAR)
  console.log(`${rgb(240, 148, 100)}${BOLD}IMPORT DESIGN${RESET}`)
  console.log('')
  
  const filename = await readInput('Import filename (without .json): ')
  if (filename) {
    const importPath = join(PROJECT_ROOT, 'scripts', `${filename}.json`)
    if (existsSync(importPath)) {
      const imported = JSON.parse(readFileSync(importPath, 'utf8'))
      state.config = { ...state.config, ...imported }
      console.log(`${rgb(130, 175, 130)}✓ Imported from: ${importPath}${RESET}`)
    } else {
      console.log(`${rgb(200, 100, 100)}✗ File not found${RESET}`)
    }
  }
  
  await readInput('\nPress Enter to continue...')
}

function pushHistory(state: EditorState) {
  state.history = state.history.slice(0, state.historyIndex + 1)
  state.history.push(JSON.parse(JSON.stringify(state.config)))
  state.historyIndex = state.history.length - 1
}

function undo(state: EditorState) {
  if (state.historyIndex > 0) {
    state.historyIndex--
    state.config = JSON.parse(JSON.stringify(state.history[state.historyIndex]))
    console.log(`${rgb(130, 175, 130)}✓ Undo${RESET}`)
  } else {
    console.log(`${rgb(200, 100, 100)}✗ Nothing to undo${RESET}`)
  }
}

function redo(state: EditorState) {
  if (state.historyIndex < state.history.length - 1) {
    state.historyIndex++
    state.config = JSON.parse(JSON.stringify(state.history[state.historyIndex]))
    console.log(`${rgb(130, 175, 130)}✓ Redo${RESET}`)
  } else {
    console.log(`${rgb(200, 100, 100)}✗ Nothing to redo${RESET}`)
  }
}

async function main() {
  const state: EditorState = {
    config: loadConfig(),
    history: [],
    historyIndex: -1,
    currentView: 'menu',
    editingField: null,
  }
  
  // Initialize history
  pushHistory(state)
  
  console.log(CLEAR)
  console.log(`${rgb(240, 148, 100)}${BOLD}
  ╔═══════════════════════════════════════════════════════════╗
  ║                                                           ║
  ║     ██      ██████   ██████   ██████                     ║
  ║     ██     ██    ██ ██       ██    ██                    ║
  ║     ██     ██    ██ ██   ███ ██    ██                    ║
  ║     ██     ██    ██ ██    ██ ██    ██                    ║
  ║     ██████  ██████   ██████   ██████                     ║
  ║                                                           ║
  ║     ███████ ██████  ██ ████████  ██████  ██████          ║
  ║     ██      ██   ██ ██    ██    ██    ██ ██   ██         ║
  ║     █████   ██   ██ ██    ██    ██    ██ ██████          ║
  ║     ██      ██   ██ ██    ██    ██    ██ ██   ██         ║
  ║     ███████ ██████  ██    ██     ██████  ██   ██         ║
  ║                                                           ║
  ║                      VERSION 2.0                          ║
  ║                                                           ║
  ╚═══════════════════════════════════════════════════════════╝
${RESET}`)
  
  console.log(`${rgb(220, 195, 170)}  Advanced Logo Designer for OpenClaude${RESET}`)
  console.log(`${DIM}  With templates, color presets, undo/redo, and more!${RESET}`)
  console.log('')
  
  await readInput('Press Enter to start...')
  
  while (true) {
    renderPreview(state.config)
    printMainMenu()
    
    const choice = await readInput('\n  Choice: ')
    
    switch (choice) {
      case '1':
        await asciiArtEditor(state)
        pushHistory(state)
        break
      case '2':
        await editTagline(state)
        pushHistory(state)
        break
      case '3':
        console.log(`${rgb(200, 100, 100)}Extra lines feature coming soon!${RESET}`)
        await readInput('Press Enter...')
        break
      case '4':
        await colorPicker(state)
        pushHistory(state)
        break
      case '5':
        await colorPresets(state)
        pushHistory(state)
        break
      case '6':
        console.log(`${rgb(200, 100, 100)}Template browser coming soon!${RESET}`)
        await readInput('Press Enter...')
        break
      case '7':
        await importDesign(state)
        pushHistory(state)
        break
      case '8':
        await exportDesign(state)
        break
      case 'p':
        renderPreview(state.config)
        console.log(`${DIM}  ^--- FULL PREVIEW ---${RESET}`)
        await readInput('\nPress Enter to continue...')
        break
      case 'u':
        undo(state)
        await readInput('Press Enter...')
        break
      case 'r':
        redo(state)
        await readInput('Press Enter...')
        break
      case 's':
        saveConfig(state.config)
        console.log(`\n${rgb(130, 175, 130)}✓ Saved to ${CONFIG_PATH}${RESET}`)
        console.log(`${rgb(220, 195, 170)}  Backup created in ${BACKUP_DIR}${RESET}`)
        await readInput('\nPress Enter to exit...')
        process.exit(0)
      case 'q':
        console.log(`\n${rgb(220, 195, 170)}Exiting without saving...${RESET}`)
        process.exit(0)
      default:
        console.log(`${rgb(200, 100, 100)}Invalid choice${RESET}`)
        await readInput('Press Enter...')
    }
  }
}

// Setup stdin
process.stdin.setRawMode(true)
process.stdin.resume()
process.stdin.setEncoding('utf8')

main().catch(console.error)
