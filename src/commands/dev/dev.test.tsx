import { beforeEach, describe, expect, test } from 'bun:test'

import { getSessionDevMode, setSessionDevMode } from '../../bootstrap/state.js'
import { call } from './dev.js'

describe('/dev command', () => {
  beforeEach(() => {
    setSessionDevMode(false)
  })

  test('enables dev mode with /dev on', async () => {
    let output = ''
    await call(
      message => {
        output = message ?? ''
      },
      {} as never,
      'on',
    )

    expect(getSessionDevMode()).toBe(true)
    expect(output).toContain('Modo dev: ON')
  })

  test('disables dev mode with /dev off', async () => {
    setSessionDevMode(true)
    let output = ''
    await call(
      message => {
        output = message ?? ''
      },
      {} as never,
      'off',
    )

    expect(getSessionDevMode()).toBe(false)
    expect(output).toContain('Modo dev: OFF')
  })

  test('toggles when no argument is provided', async () => {
    await call(() => {}, {} as never, '')
    expect(getSessionDevMode()).toBe(true)

    await call(() => {}, {} as never, '')
    expect(getSessionDevMode()).toBe(false)
  })

  test('returns usage for invalid arg', async () => {
    let output = ''
    await call(
      message => {
        output = message ?? ''
      },
      {} as never,
      'banana',
    )

    expect(output).toContain('Uso: /dev [on|off|status]')
  })
})
