import * as React from 'react'
import { useEffect, useRef, useState } from 'react'
import { Box, Text } from '../ink.js'
import type { InputEvent } from '../ink/events/input-event.js'
import { listSessions } from '../utils/sessionHistory.js'
import { getCwd } from '../utils/cwd.js'
// Importando a versão do package.json (resolveJsonModule habilitado)
import * as pkg from '../../package.json'

const APP_VERSION = (pkg as unknown as { version: string }).version

interface SessionInfo {
  sessionId: string
  title: string | null
  firstPrompt: string | null
  lastModified: number
  messageCount: number
}

interface Props {
  onNew: () => void
  onResume: (sessionId: string) => void
  onSkip: () => void
}

const MAX_SESSIONS_DISPLAY = 100
const DIRECT_SHORTCUT_MAX = 9
const ITEMS_PER_PAGE = 10

function timeAgo(timestampMs: number): string {
  const diff = Date.now() - timestampMs
  const secs = Math.floor(diff / 1000)
  if (secs < 60) return 'agora'
  const mins = Math.floor(secs / 60)
  if (mins < 60) return `${mins}m atras`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h atras`
  const days = Math.floor(hours / 24)
  return `${days}d atras`
}

export function SessionPickerDialog({ onNew, onResume, onSkip }: Props) {
  const [sessions, setSessions] = useState<SessionInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const sessionsRef = useRef(sessions)
  sessionsRef.current = sessions
  const selectedRef = useRef(selectedIndex)
  selectedRef.current = selectedIndex
  const handlersRef = useRef({ onNew, onResume, onSkip })
  handlersRef.current = { onNew, onResume, onSkip }

  const totalPages = Math.max(1, Math.ceil(sessions.length / ITEMS_PER_PAGE))
  const currentPage = Math.floor(selectedIndex / ITEMS_PER_PAGE)
  const pageStart = currentPage * ITEMS_PER_PAGE
  const pageEnd = pageStart + ITEMS_PER_PAGE
  const visibleSessions = sessions.slice(pageStart, pageEnd)

  // Load sessions on mount
  useEffect(() => {
    ;(async () => {
      try {
        const cwd = getCwd()
        const data = await listSessions(cwd, MAX_SESSIONS_DISPLAY)
        setSessions(data)
      } catch {
        // No sessions or error
      }
      setLoading(false)
    })()
  }, [])

  // Register input handler with Ink's internal event emitter
  // This ensures we capture input before the REPL keybinding system
  useEffect(() => {
    const handlePreempt = (ev: InputEvent) => {
      const input: string = (ev as any).input ?? ''
      const key = (ev as any).key ?? {}

      const isUpArrow = !!key.upArrow
      const isDownArrow = !!key.downArrow
      const isLeftArrow = !!key.leftArrow
      const isRightArrow = !!key.rightArrow
      const isReturn = !!key.return
      const isEscape = !!key.escape

      if (isUpArrow) {
        setSelectedIndex(prev => Math.max(0, prev - 1))
        try { ev.stopImmediatePropagation() } catch {}
        return
      }
      if (isDownArrow) {
        setSelectedIndex(prev => Math.min(Math.max(0, sessionsRef.current.length - 1), prev + 1))
        try { ev.stopImmediatePropagation() } catch {}
        return
      }
      if (isLeftArrow) {
        setSelectedIndex(prev => {
          const page = Math.floor(prev / ITEMS_PER_PAGE)
          if (page <= 0) return prev
          return (page - 1) * ITEMS_PER_PAGE
        })
        try { ev.stopImmediatePropagation() } catch {}
        return
      }
      if (isRightArrow) {
        setSelectedIndex(prev => {
          const page = Math.floor(prev / ITEMS_PER_PAGE)
          const maxPage = Math.max(0, Math.ceil(sessionsRef.current.length / ITEMS_PER_PAGE) - 1)
          if (page >= maxPage) return prev
          return (page + 1) * ITEMS_PER_PAGE
        })
        try { ev.stopImmediatePropagation() } catch {}
        return
      }

      if (isReturn || input === ' ') {
        const { onNew: hNew, onResume: hResume } = handlersRef.current
        if (sessionsRef.current.length > 0) {
          hResume(sessionsRef.current[selectedRef.current]!.sessionId)
        } else {
          hNew()
        }
        try { ev.stopImmediatePropagation() } catch {}
        return
      }

      if (isEscape) {
        handlersRef.current.onSkip()
        try { ev.stopImmediatePropagation() } catch {}
        return
      }

      const num = parseInt(input, 10)
      const currentPageStart = Math.floor(selectedRef.current / ITEMS_PER_PAGE) * ITEMS_PER_PAGE
      const pageItemCount = Math.min(
        ITEMS_PER_PAGE,
        Math.max(0, sessionsRef.current.length - currentPageStart),
      )
      if (
        !isNaN(num) &&
        num >= 1 &&
        num <= DIRECT_SHORTCUT_MAX &&
        num <= pageItemCount
      ) {
        handlersRef.current.onResume(sessionsRef.current[currentPageStart + num - 1]!.sessionId)
        try { ev.stopImmediatePropagation() } catch {}
        return
      }
    }

    // Try to use prependListener (Ink internal), fallback to process.stdin
    let cleanup: (() => void) | undefined

    ;(async () => {
      try {
        const ink = await import('../ink.js')
        const emitter = (ink as any).internal_eventEmitter
        if (emitter && typeof emitter.prependListener === 'function') {
          emitter.prependListener('input', handlePreempt)
          cleanup = () => { emitter.removeListener('input', handlePreempt) }
          return
        }
      } catch {}

      // Fallback: use process.stdin directly
      const handler = (chunk: Buffer) => {
        const input = chunk.toString()
        if (input === '\x1b[A') { // Up
          setSelectedIndex(prev => Math.max(0, prev - 1))
        } else if (input === '\x1b[B') { // Down
          setSelectedIndex(prev => Math.min(Math.max(0, sessionsRef.current.length - 1), prev + 1))
        } else if (input === '\x1b[D') { // Left
          setSelectedIndex(prev => {
            const page = Math.floor(prev / ITEMS_PER_PAGE)
            if (page <= 0) return prev
            return (page - 1) * ITEMS_PER_PAGE
          })
        } else if (input === '\x1b[C') { // Right
          setSelectedIndex(prev => {
            const page = Math.floor(prev / ITEMS_PER_PAGE)
            const maxPage = Math.max(0, Math.ceil(sessionsRef.current.length / ITEMS_PER_PAGE) - 1)
            if (page >= maxPage) return prev
            return (page + 1) * ITEMS_PER_PAGE
          })
        } else if (input === '\r' || input === '\n') {
          const { onNew: hNew, onResume: hResume } = handlersRef.current
          if (sessionsRef.current.length > 0) {
            hResume(sessionsRef.current[selectedRef.current]!.sessionId)
          } else {
            hNew()
          }
        } else if (input === '\x1b') {
          handlersRef.current.onSkip()
        } else {
          const num = parseInt(input, 10)
          const currentPageStart = Math.floor(selectedRef.current / ITEMS_PER_PAGE) * ITEMS_PER_PAGE
          const pageItemCount = Math.min(
            ITEMS_PER_PAGE,
            Math.max(0, sessionsRef.current.length - currentPageStart),
          )
          if (
            !isNaN(num) &&
            num >= 1 &&
            num <= DIRECT_SHORTCUT_MAX &&
            num <= pageItemCount
          ) {
            handlersRef.current.onResume(sessionsRef.current[currentPageStart + num - 1]!.sessionId)
          }
        }
      }
      process.stdin.on('data', handler)
      cleanup = () => { process.stdin.off('data', handler) }
    })()

    return () => { cleanup?.() }
  }, [])

  return (
    <Box flexDirection="column" alignItems="center" paddingX={2} paddingY={1}>
      <Box flexDirection="column" borderStyle="round" borderColor="cyan" paddingX={2} paddingY={1} width={72}>
        <Text bold={true}>
          <Text color="cyan"> Bem-vindo ao Claudinho</Text>{' '}
          <Text dimColor={true}>v{APP_VERSION}</Text>
        </Text>
        <Text color="gray" dimColor={true}>
          {'  '}────────────────────────────────────────────────────
        </Text>

        {loading && (
          <Text dimColor={true}>  Carregando sessoes...</Text>
        )}

        {!loading && sessions.length === 0 && (
          <>
            <Text dimColor={true}>  Nenhuma sessao anterior encontrada.</Text>
            <Box marginTop={1}>
              <Text color="cyan">  Pressione Enter para iniciar uma nova sessao</Text>
            </Box>
          </>
        )}

        {!loading && sessions.length > 0 && (
          <>
            <Box flexDirection="column" marginTop={1}>
              {visibleSessions.map((s, i) => {
                const globalIndex = pageStart + i
                return (
                <Box key={s.sessionId}>
                  <Text>
                    {globalIndex === selectedIndex ? (
                      <Text color="cyan" bold={true}>
                        {'>'}{' '}{i + 1}.{' '}
                      </Text>
                    ) : (
                      <Text dimColor={true}>
                        {'  '}{i + 1}.{' '}
                      </Text>
                    )}
                    <Text color={globalIndex === selectedIndex ? 'cyan' : undefined}>
                      [{timeAgo(s.lastModified)}]{' '}
                      {s.title ? `"${s.title}"` : 'Untitled'}{' '}
                      <Text dimColor={true}>({s.messageCount} msgs)</Text>
                    </Text>
                  </Text>
                </Box>
              )})}
            </Box>

            <Box marginTop={1}>
              <Text dimColor={true}>
                Pag {currentPage + 1}/{totalPages}  |  [1-{Math.min(DIRECT_SHORTCUT_MAX, visibleSessions.length)}] Retomar rapido  |  [↑/↓] Navegar  |  [←/→] Pagina  |  [Enter] Selecionada  |  [Esc] Pular
              </Text>
            </Box>
          </>
        )}
      </Box>
    </Box>
  )
}
