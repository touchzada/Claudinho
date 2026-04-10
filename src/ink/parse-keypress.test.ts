import { expect, test } from 'bun:test'

import {
  INITIAL_STATE,
  parseMultipleKeypresses,
  type ParsedKey,
} from './parse-keypress.ts'
import { InputEvent } from './events/input-event.ts'

function parseInputEvent(sequence: string): InputEvent {
  const [items] = parseMultipleKeypresses(INITIAL_STATE, sequence)

  expect(items).toHaveLength(1)

  const item = items[0]
  expect(item?.kind).toBe('key')

  return new InputEvent(item as ParsedKey)
}

test('treats CSI-u modifier 0 as unmodified printable input', () => {
  const event = parseInputEvent('\x1b[47;0u')

  expect(event.input).toBe('/')
  expect(event.key.ctrl).toBe(false)
  expect(event.key.meta).toBe(false)
  expect(event.key.shift).toBe(false)
  expect(event.key.super).toBe(false)
})

test('preserves printable Unicode CSI-u input', () => {
  const event = parseInputEvent('\x1b[231u')

  expect(event.input).toBe('ç')
  expect(event.key.ctrl).toBe(false)
  expect(event.key.meta).toBe(false)
  expect(event.key.shift).toBe(false)
  expect(event.key.super).toBe(false)
})

test('preserves printable Unicode CSI-u input with explicit modifier 0', () => {
  const event = parseInputEvent('\x1b[231;0u')

  expect(event.input).toBe('ç')
  expect(event.key.ctrl).toBe(false)
  expect(event.key.meta).toBe(false)
  expect(event.key.shift).toBe(false)
  expect(event.key.super).toBe(false)
})

test('recovers split Shift+Tab after a forced ESC flush', () => {
  const [preFlushItems, stateWithIncompleteEsc] = parseMultipleKeypresses(
    INITIAL_STATE,
    '\x1b',
  )
  expect(preFlushItems).toHaveLength(0)

  const [flushItems, postFlushState] = parseMultipleKeypresses(
    stateWithIncompleteEsc,
    null,
  )
  expect(flushItems).toHaveLength(1)

  const flushed = flushItems[0] as ParsedKey
  expect(flushed.kind).toBe('key')
  expect(flushed.name).toBe('escape')
  expect(postFlushState.pendingEscPrefix).toBe(true)

  const [tailItems, finalState] = parseMultipleKeypresses(postFlushState, '[Z')
  expect(tailItems).toHaveLength(1)

  const recovered = tailItems[0] as ParsedKey
  expect(recovered.kind).toBe('key')
  expect(recovered.name).toBe('tab')
  expect(recovered.shift).toBe(true)
  expect(recovered.sequence).toBe('\x1b[Z')
  expect(finalState.pendingEscPrefix).toBe(false)
})

test('keeps plain [Z text as text without pending ESC prefix', () => {
  const event = parseInputEvent('[Z')

  expect(event.input).toBe('[Z')
  expect(event.key.name).toBe(undefined)
  expect(event.key.shift).toBe(false)
})

