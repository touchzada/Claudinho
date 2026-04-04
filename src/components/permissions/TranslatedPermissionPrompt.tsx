import React, { type ReactNode } from 'react'
import { translatePermission } from '../../i18n/pt-BR.js'
import { Box, Text } from '../../ink.js'
import {
  PermissionPrompt,
  type PermissionPromptOption,
  type PermissionPromptProps,
  type ToolAnalyticsContext,
} from './PermissionPrompt.js'

/**
 * Wrapper around PermissionPrompt that translates UI text to PT-BR
 */
export function TranslatedPermissionPrompt<T extends string>({
  options,
  onSelect,
  onCancel,
  question = translatePermission('do-you-want-to-proceed'),
  toolAnalyticsContext,
}: PermissionPromptProps<T>): React.ReactNode {
  return (
    <PermissionPrompt
      options={options}
      onSelect={onSelect}
      onCancel={onCancel}
      question={question}
      toolAnalyticsContext={toolAnalyticsContext}
    />
  )
}

/**
 * Helper to create translated footer text for permission dialogs
 */
export function TranslatedPermissionFooter({
  showTabHint = false,
  showExplainer = false,
  explainerVisible = false,
}: {
  showTabHint?: boolean
  showExplainer?: boolean
  explainerVisible?: boolean
}): React.ReactNode {
  const parts: string[] = [translatePermission('esc-to-cancel')]
  
  if (showTabHint) {
    parts.push(translatePermission('tab-to-amend'))
  }
  
  if (showExplainer) {
    const action = explainerVisible ? 'esconder' : 'explicar'
    parts.push(`ctrl+e pra ${action}`)
  }
  
  return (
    <Box marginTop={1}>
      <Text dimColor>{parts.join(' · ')}</Text>
    </Box>
  )
}
