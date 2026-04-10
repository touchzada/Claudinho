import { beforeEach, describe, expect, test } from 'bun:test'

import {
  getSessionSkillBehaviorMode,
  setSessionSkillBehaviorMode,
} from '../../bootstrap/state.js'
import { call } from './skills-mode.js'

describe('/skills-mode command', () => {
  beforeEach(() => {
    setSessionSkillBehaviorMode('natural')
  })

  test('enables turbo mode with /skills-mode turbo', async () => {
    let output = ''
    await call(
      message => {
        output = message ?? ''
      },
      {} as never,
      'turbo',
    )

    expect(getSessionSkillBehaviorMode()).toBe('turbo')
    expect(output).toContain('TURBO')
  })

  test('sets natural mode with /skills-mode natural', async () => {
    setSessionSkillBehaviorMode('turbo')
    let output = ''
    await call(
      message => {
        output = message ?? ''
      },
      {} as never,
      'natural',
    )

    expect(getSessionSkillBehaviorMode()).toBe('natural')
    expect(output).toContain('NATURAL')
  })

  test('toggles when no argument is provided', async () => {
    await call(() => {}, {} as never, '')
    expect(getSessionSkillBehaviorMode()).toBe('turbo')

    await call(() => {}, {} as never, '')
    expect(getSessionSkillBehaviorMode()).toBe('natural')
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

    expect(output).toContain('Uso: /skills-mode [natural|turbo|on|off|toggle|status]')
  })
})
