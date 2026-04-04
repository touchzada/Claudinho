import { basename } from 'path'
import React, { type ReactNode } from 'react'
import { translatePermission } from '../../../i18n/pt-BR.js'
import { Text } from '../../../ink.js'
import { getShortcutDisplay } from '../../../keybindings/shortcutFormat.js'
import type { ToolPermissionContext } from '../../../Tool.js'
import { getDirectoryForPath } from '../../../utils/path.js'
import { pathInAllowedWorkingPath } from '../../../utils/permissions/filesystem.js'
import type { OptionWithDescription } from '../../CustomSelect/select.js'
import {
  isInClaudeFolder,
  isInGlobalClaudeFolder,
  type FileOperationType,
  type PermissionOption,
  type PermissionOptionWithLabel,
} from './permissionOptions.js'

/**
 * Versão traduzida de getFilePermissionOptions
 */
export function getTranslatedFilePermissionOptions({
  filePath,
  toolPermissionContext,
  operationType = 'write',
  onRejectFeedbackChange,
  onAcceptFeedbackChange,
  yesInputMode = false,
  noInputMode = false,
}: {
  filePath: string
  toolPermissionContext: ToolPermissionContext
  operationType?: FileOperationType
  onRejectFeedbackChange?: (value: string) => void
  onAcceptFeedbackChange?: (value: string) => void
  yesInputMode?: boolean
  noInputMode?: boolean
}): PermissionOptionWithLabel[] {
  const options: PermissionOptionWithLabel[] = []
  const modeCycleShortcut = getShortcutDisplay(
    'chat:cycleMode',
    'Chat',
    'shift+tab',
  )

  // Opção 1: Yes
  if (yesInputMode && onAcceptFeedbackChange) {
    options.push({
      type: 'input',
      label: translatePermission('yes'),
      value: 'yes',
      placeholder: translatePermission('and-tell-claude-what-next'),
      onChange: onAcceptFeedbackChange,
      allowEmptySubmitToCancel: true,
      option: { type: 'accept-once' },
    })
  } else {
    options.push({
      label: translatePermission('yes'),
      value: 'yes',
      option: { type: 'accept-once' },
    })
  }

  const inAllowedPath = pathInAllowedWorkingPath(
    filePath,
    toolPermissionContext,
  )

  const inClaudeFolder = isInClaudeFolder(filePath)
  const inGlobalClaudeFolder = isInGlobalClaudeFolder(filePath)

  // Opção 2: Session-level permission
  if ((inClaudeFolder || inGlobalClaudeFolder) && operationType !== 'read') {
    options.push({
      label: translatePermission('yes-allow-claude-edit-settings'),
      value: 'yes-claude-folder',
      option: {
        type: 'accept-session',
        scope: inGlobalClaudeFolder ? 'global-claude-folder' : 'claude-folder',
      },
    })
  } else {
    let sessionLabel: ReactNode

    if (inAllowedPath) {
      if (operationType === 'read') {
        sessionLabel = translatePermission('yes-during-session')
      } else {
        sessionLabel = (
          <Text>
            {translatePermission('yes-allow-all-edits-session')}{' '}
            <Text bold>({modeCycleShortcut})</Text>
          </Text>
        )
      }
    } else {
      const dirPath = getDirectoryForPath(filePath)
      const dirName = basename(dirPath) || 'this directory'

      if (operationType === 'read') {
        sessionLabel = (
          <Text>
            {translatePermission('yes-allow-reading-from')}{' '}
            <Text bold>{dirName}/</Text>{' '}
            {translatePermission('during-this-session')}
          </Text>
        )
      } else {
        sessionLabel = (
          <Text>
            {translatePermission('yes-allow-all-edits-in')}{' '}
            <Text bold>{dirName}/</Text>{' '}
            {translatePermission('during-this-session')}{' '}
            <Text bold>({modeCycleShortcut})</Text>
          </Text>
        )
      }
    }

    options.push({
      label: sessionLabel,
      value: 'yes-session',
      option: { type: 'accept-session' },
    })
  }

  // Opção 3: No
  if (noInputMode && onRejectFeedbackChange) {
    options.push({
      type: 'input',
      label: translatePermission('no'),
      value: 'no',
      placeholder: translatePermission('and-tell-claude-what-differently'),
      onChange: onRejectFeedbackChange,
      allowEmptySubmitToCancel: true,
      option: { type: 'reject' },
    })
  } else {
    options.push({
      label: translatePermission('no'),
      value: 'no',
      option: { type: 'reject' },
    })
  }

  return options
}
