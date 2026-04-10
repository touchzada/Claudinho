import * as React from 'react'

import {
  getSessionSkillBehaviorMode,
  setSessionSkillBehaviorMode,
  type SessionSkillBehaviorMode,
} from '../../bootstrap/state.js'
import type { LocalJSXCommandOnDone } from '../../types/command.js'

function renderStatus(mode: SessionSkillBehaviorMode): string {
  if (mode === 'turbo') {
    return 'Modo skills: TURBO (sessao atual) - prioriza uso proativo de skills'
  }
  return 'Modo skills: NATURAL (sessao atual) - responde normal, skills quando fizer sentido'
}

function toggleMode(mode: SessionSkillBehaviorMode): SessionSkillBehaviorMode {
  return mode === 'natural' ? 'turbo' : 'natural'
}

export async function call(
  onDone: LocalJSXCommandOnDone,
  _context: unknown,
  args?: string,
): Promise<React.ReactNode | null> {
  const normalized = args?.trim().toLowerCase()
  const current = getSessionSkillBehaviorMode()

  if (!normalized || normalized === 'toggle') {
    const next = toggleMode(current)
    setSessionSkillBehaviorMode(next)
    onDone(renderStatus(next), { display: 'system' })
    return null
  }

  if (normalized === 'status') {
    onDone(renderStatus(current), { display: 'system' })
    return null
  }

  if (normalized === 'natural' || normalized === 'off') {
    setSessionSkillBehaviorMode('natural')
    onDone(renderStatus('natural'), { display: 'system' })
    return null
  }

  if (normalized === 'turbo' || normalized === 'on') {
    setSessionSkillBehaviorMode('turbo')
    onDone(renderStatus('turbo'), { display: 'system' })
    return null
  }

  onDone('Uso: /skills-mode [natural|turbo|on|off|toggle|status]', {
    display: 'system',
  })
  return null
}
