import React, { useState, useEffect } from 'react'
import { Box, Text, useInput, useApp } from '../ink.js'
import type { LogOption } from '../types/logs.js'
import { fetchLogs } from '../utils/sessionStorage.js'
import {
  formatRelativeTime,
  truncateText,
  extractMessagePreviews,
} from './SessionHistoryViewer/utils.js'

interface SessionHistoryViewerProps {
  onSelect: (sessionId: string | null) => void
  onExit: () => void
}

export function SessionHistoryViewer({
  onSelect,
  onExit,
}: SessionHistoryViewerProps): React.ReactElement {
  const [sessions, setSessions] = useState<LogOption[]>([])
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { exit } = useApp()

  // Load sessions on mount
  useEffect(() => {
    async function loadSessions() {
      try {
        const logs = await fetchLogs(20)
        // Filter out sidechain sessions and sort by modified date
        const mainSessions = logs
          .filter(log => !log.isSidechain)
          .sort((a, b) => b.modified.getTime() - a.modified.getTime())
        setSessions(mainSessions)
      } catch (err) {
        console.error('Failed to load sessions:', err)
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    loadSessions()
  }, [])

  // Keyboard navigation
  useInput((input, key) => {
    if (key.upArrow) {
      setSelectedIndex(prev => Math.max(0, prev - 1))
    } else if (key.downArrow) {
      const itemCount = sessions.length + 1 // +1 for "Start new conversation"
      setSelectedIndex(prev => Math.min(itemCount - 1, prev + 1))
    } else if (key.return) {
      if (selectedIndex === 0) {
        // Start new conversation
        onSelect(null)
      } else {
        // Resume selected session
        const session = sessions[selectedIndex - 1]
        onSelect(session?.sessionId || null)
      }
    } else if (key.escape || (key.ctrl && input === 'c')) {
      onExit()
      exit()
    }
  })

  if (loading) {
    return (
      <Box flexDirection="column" padding={1}>
        <Text>Loading sessions...</Text>
      </Box>
    )
  }

  if (error) {
    return (
      <Box flexDirection="column" padding={1}>
        <Text color="red">Error loading sessions: {error}</Text>
        <Text dimColor>Press Escape to exit</Text>
      </Box>
    )
  }

  return (
    <Box flexDirection="column" padding={1}>
      {/* Header */}
      <Box marginBottom={1}>
        <Text bold>Bem-vindo ao Claudinho</Text>
      </Box>

      {/* Session list */}
      <SessionList sessions={sessions} selectedIndex={selectedIndex} />

      {/* Navigation instructions */}
      <Box marginTop={1}>
        <Text dimColor>↑/↓ pra navegar · Enter pra selecionar · Esc pra sair</Text>
      </Box>
    </Box>
  )
}

interface SessionListProps {
  sessions: LogOption[]
  selectedIndex: number
}

function SessionList({ sessions, selectedIndex }: SessionListProps): React.ReactElement {
  return (
    <Box flexDirection="column">
      {/* "Start new conversation" option */}
      <NewSessionEntry isSelected={selectedIndex === 0} />

      {/* Previous sessions */}
      {sessions.length === 0 ? (
        <Box marginTop={1}>
          <Text dimColor>No previous sessions found</Text>
        </Box>
      ) : (
        sessions.map((session, index) => (
          <SessionEntry
            key={session.sessionId || index}
            session={session}
            isSelected={selectedIndex === index + 1}
          />
        ))
      )}
    </Box>
  )
}

interface NewSessionEntryProps {
  isSelected: boolean
}

function NewSessionEntry({ isSelected }: NewSessionEntryProps): React.ReactElement {
  return (
    <Box
      flexDirection="column"
      paddingX={2}
      paddingY={1}
      borderStyle="round"
      borderColor={isSelected ? 'cyan' : 'gray'}
    >
      <Text bold color={isSelected ? 'cyan' : 'white'}>
        Start new conversation
      </Text>
    </Box>
  )
}

interface SessionEntryProps {
  session: LogOption
  isSelected: boolean
}

function SessionEntry({ session, isSelected }: SessionEntryProps): React.ReactElement {
  const { first, last } = extractMessagePreviews(session)
  const relativeTime = formatRelativeTime(session.modified)
  const title = session.customTitle || truncateText(session.firstPrompt || 'Untitled session', 60)

  return (
    <Box
      flexDirection="column"
      paddingX={2}
      paddingY={1}
      borderStyle="round"
      borderColor={isSelected ? 'cyan' : 'gray'}
      marginTop={1}
    >
      <Text bold color={isSelected ? 'cyan' : 'white'}>
        {title}
      </Text>
      <Box marginTop={1}>
        <Text dimColor>First: {first}</Text>
      </Box>
      <Box>
        <Text dimColor>Last: {last}</Text>
      </Box>
      <Box marginTop={1} flexDirection="row">
        <Text dimColor>
          {session.messageCount} messages · {relativeTime} · {session.sessionId}
        </Text>
      </Box>
    </Box>
  )
}
