import * as React from 'react'

import {
  getSessionSkillBehaviorMode,
  setSessionSkillBehaviorMode,
  type SessionSkillBehaviorMode,
} from '../../bootstrap/state.js'
import type { LocalJSXCommandOnDone } from '../../types/command.js'

function renderStatus(mode: SessionSkillBehaviorMode): string {
  if (mode === 'turbo') {
    return 'ProMax: ON (sessao atual) - modo agressivo ligado: mais zoeira, mais proatividade e skills no talo.'
  }
  return 'ProMax: OFF (sessao atual) - modo normal ligado: respostas mais enxutas e uso de skills quando fizer sentido.'
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

  if (normalized === 'off' || normalized === 'natural') {
    setSessionSkillBehaviorMode('natural')
    onDone(renderStatus('natural'), { display: 'system' })
    return null
  }

  if (normalized === 'on' || normalized === 'turbo') {
    setSessionSkillBehaviorMode('turbo')
    onDone(renderStatus('turbo'), { display: 'system' })
    return null
  }

  onDone('Uso: /promax [on|off|toggle|status]', { display: 'system' })
  return null
}
