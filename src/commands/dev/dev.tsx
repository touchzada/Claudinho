import * as React from 'react'

import {
  getSessionDevMode,
  setSessionDevMode,
} from '../../bootstrap/state.js'
import type { LocalJSXCommandOnDone } from '../../types/command.js'

function renderStatus(enabled: boolean): string {
  return enabled
    ? 'Modo dev: ON (sessao atual)'
    : 'Modo dev: OFF (sessao atual)'
}

export async function call(
  onDone: LocalJSXCommandOnDone,
  _context: unknown,
  args?: string,
): Promise<React.ReactNode | null> {
  const normalized = args?.trim().toLowerCase()

  if (!normalized || normalized === 'toggle') {
    const next = !getSessionDevMode()
    setSessionDevMode(next)
    onDone(renderStatus(next), { display: 'system' })
    return null
  }

  if (normalized === 'on') {
    setSessionDevMode(true)
    onDone(renderStatus(true), { display: 'system' })
    return null
  }

  if (normalized === 'off') {
    setSessionDevMode(false)
    onDone(renderStatus(false), { display: 'system' })
    return null
  }

  if (normalized === 'status') {
    onDone(renderStatus(getSessionDevMode()), { display: 'system' })
    return null
  }

  onDone('Uso: /dev [on|off|status]', { display: 'system' })
  return null
}
