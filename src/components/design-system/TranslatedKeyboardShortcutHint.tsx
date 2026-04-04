import React from 'react'
import { translateKeyboardAction } from '../../i18n/pt-BR.js'
import { KeyboardShortcutHint } from './KeyboardShortcutHint.js'

type Props = {
  /** The key or chord to display (e.g., "ctrl+o", "Enter", "↑/↓") */
  shortcut: string
  /** The action the key performs (e.g., "expand", "select", "navigate") */
  action: string
  /** Whether to wrap the hint in parentheses. Default: false */
  parens?: boolean
  /** Whether to render the shortcut in bold. Default: false */
  bold?: boolean
}

/**
 * Wrapper around KeyboardShortcutHint that translates the action text to PT-BR
 */
export function TranslatedKeyboardShortcutHint({
  shortcut,
  action,
  parens = false,
  bold = false,
}: Props): React.ReactNode {
  const translatedAction = translateKeyboardAction(action)
  
  return (
    <KeyboardShortcutHint
      shortcut={shortcut}
      action={translatedAction}
      parens={parens}
      bold={bold}
    />
  )
}
