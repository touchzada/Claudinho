#!/usr/bin/env bun
/**
 * Script de teste para ver as tips traduzidas
 */

import { t } from './src/i18n/pt-BR.js'

console.log('🇧🇷 TIPS TRADUZIDAS DO CLAUDINHO\n')
console.log('=' .repeat(60))

const tips = [
  'new-user-warmup',
  'plan-mode-for-complex-tasks',
  'default-permission-mode-config',
  'git-worktrees',
  'color-when-multi-clauding',
  'terminal-setup-apple',
  'terminal-setup-other',
  'shift-enter-apple',
  'shift-enter-other',
  'memory-command',
  'theme-command',
  'colorterm-truecolor',
  'powershell-tool-env',
  'status-line',
  'prompt-queue',
  'enter-to-steer-in-realtime',
  'todo-list',
  'feedback-command',
  'important-claudemd',
  'skillify',
]

tips.forEach((tip, i) => {
  console.log(`\n${i + 1}. ${tip}`)
  console.log(`   ${t(`tips.${tip}`, { shortcut: 'Shift+Tab', command: '/exemplo', terminal: 'code' })}`)
})

console.log('\n' + '='.repeat(60))
console.log('✅ Total de tips traduzidas:', tips.length)
