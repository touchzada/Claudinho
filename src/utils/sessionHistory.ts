/**
 * Session History — independent session list viewer.
 *
 * Scans `.claude/projects/<dir>/*.jsonl` transcript files in the current
 * project directory and builds a list of past sessions with title, date,
 * first prompt summary, and message count. Fully independent of SynaBun —
 * relies only on the JSONL transcripts that Claudinho already writes to disk.
 */

import { readdir, stat } from 'fs/promises'
import { join } from 'path'
import { getClaudeConfigHomeDir } from './envUtils.js'
import { parseJSONL } from './json.js'

export type SessionInfo = {
  sessionId: string
  title: string | null
  firstPrompt: string | null
  lastModified: number
  messageCount: number
  transcriptPath: string
}

/**
 * Parse a single JSONL transcript and extract session metadata.
 * Reads only the head (first ~4KB) to avoid loading multi-GB files.
 */
async function parseSessionFile(
  filePath: string,
  fileName: string,
): Promise<SessionInfo> {
  const sessionId = fileName.replace(/\.jsonl$/, '')
  const fileStat = await stat(filePath)

  // Read first portion to extract first prompt and title
  const head = await readFirstBytes(filePath, 4096)
  let title: string | null = null
  let firstPrompt: string | null = null
  // Estimate message count from file size (avg ~1KB per message)
  const messageCountEst = Math.max(1, Math.floor(fileStat.size / 1024))
  let messageCount = messageCountEst

  try {
    const entries = parseJSONL(head)

    for (const entry of entries) {
      // Title may be stored as a user message customTitle or sessionId field
      if (!title && entry.sessionId) {
        // Try customTitle or title from entry metadata
        const customTitle = (entry as any).customTitle || (entry as any).title
        if (customTitle) title = customTitle
      }

      // First prompt: user messages have message.content in this format
      if (!firstPrompt && entry.type === 'user') {
        let content: string | null = null
        // Format A: entry.message?.content (new format)
        if (entry.message && typeof entry.message.content === 'string') {
          content = entry.message.content
        }
        // Format B: entry.message?.content as array
        else if (entry.message && Array.isArray(entry.message.content)) {
          content = entry.message.content
            .filter(b => b.type === 'text')
            .map(b => b.text ?? '')
            .join(' ')
        }
        // Format C: entry.content directly
        else if (typeof entry.content === 'string') {
          content = entry.content
        }
        // Format D: entry.content as array
        else if (Array.isArray(entry.content)) {
          content = entry.content
            .filter(b => b.type === 'text')
            .map(b => (b as { text?: string }).text ?? '')
            .join(' ')
        }

        if (content && content.trim()) {
          firstPrompt = content.trim().slice(0, 200)
          // Use first few words as title if we don't have one
          if (!title) {
            const words = content.trim().split(/\s+/).slice(0, 6).join(' ')
            title = words.length > 50 ? words.slice(0, 50) + '...' : words
          }
        }
      }

      if (title && firstPrompt) break
    }
  } catch {
    // Corrupt or empty transcript — use defaults
  }

  return {
    sessionId,
    title,
    firstPrompt,
    lastModified: fileStat.mtimeMs,
    messageCount,
    transcriptPath: filePath,
  }
}

/**
 * Read the first N bytes of a file efficiently.
 */
async function readFirstBytes(filePath: string, length: number): Promise<string> {
  const { open, read, close, stat } = await import('fs/promises')

  const fileStat = await stat(filePath)
  const toRead = Math.min(length, fileStat.size)

  const fh = await open(filePath, 'r')
  try {
    const { buffer } = await fh.read({
      buffer: Buffer.alloc(toRead),
      position: 0,
      length: toRead,
    })
    return buffer.toString('utf-8')
  } finally {
    await fh.close()
  }
}

/**
 * Get the transcript directory for the current project.
 * Transcripts live in `.claude/projects/<sanitized-path>/`.
 */
function getProjectTranscriptDir(cwd: string): string {
  // Match the exact sanitization sessionStorage uses for project dirs.
  // Real mapping on Windows: C:\Users\Bruno\Documents\Claudin →
  //   C--Users-Bruno-Documents-Claudin
  // (: becomes -, \ becomes -)
  const home = getClaudeConfigHomeDir()
  const sanitized = cwd
    .replace(/:/g, '-')
    .replace(/\\/g, '-')
    .replace(/\//g, '-')
    .replace(/[^a-zA-Z0-9_.~-]/g, '_')
  return join(home, 'projects', sanitized)
}

/**
 * List all sessions for a given project directory.
 * Returns sessions sorted by lastModified descending.
 */
export async function listSessions(
  cwd: string,
  limit = 20,
): Promise<SessionInfo[]> {
  const dir = getProjectTranscriptDir(cwd)

  // DEBUG: log the resolved directory path
  const { readdirSync, existsSync } = await import('fs')
  const { readdir } = await import('fs/promises')

  let files: string[]
  try {
    // Check if dir exists, try alternatives if not
    if (!existsSync(dir)) {
      // Try to find the actual project dir by listing
      const parentDir = getProjectTranscriptDir('/').replace(/\/$/, '') + '/projects'
      try {
        const parentEntries = readdirSync(parentDir).map(String)
        // Find any dir that looks like a Windows path (contains the current folder name)
        const currentFolder = cwd.split(/[\\\/]/).filter(Boolean).pop() || ''
        const match = parentEntries.find(e => e.includes(currentFolder || 'Claudin'))
        if (match) {
          // Use the actual directory name found on disk
          const actualDir = join(getProjectTranscriptDir('/').replace(/\/$/, ''), 'projects', match)
          const entries = await readdir(actualDir, { withFileTypes: true })
          files = entries
            .filter(e => e.isFile() && e.name.endsWith('.jsonl'))
            .map(e => e.name)
        } else {
          return []
        }
      } catch {
        return []
      }
    } else {
      const entries = await readdir(dir, { withFileTypes: true })
      files = entries
        .filter(e => e.isFile() && e.name.endsWith('.jsonl'))
        .map(e => e.name)
    }
  } catch {
    return [] // Directory doesn't exist yet
  }

  const sessions = await Promise.all(
    files.map(name =>
      parseSessionFile(join(dir, name), name),
    ),
  )

  sessions.sort((a, b) => b.lastModified - a.lastModified)
  return sessions.slice(0, limit)
}

/**
 * Format a session summary line for display.
 */
export function formatSessionSummary(session: SessionInfo): string {
  const ago = timeAgo(session.lastModified)
  const title = session.title ? `"${session.title}"` : 'Untitled'
  const prompt = session.firstPrompt
    ? ` — ${truncate(session.firstPrompt, 60)}`
    : ''
  return `${ago}  ${title}  (${session.messageCount} msgs)${prompt}`
}

/**
 * Render a numbered session list for interactive menu display.
 */
export function renderSessionList(
  sessions: SessionInfo[],
): string {
  if (sessions.length === 0) {
    return '  Nenhuma sessão anterior encontrada.'
  }

  const lines = sessions.map((s, i) => {
    const num = i + 1
    const ago = timeAgo(s.lastModified)
    const title = s.title ? `"${s.title}"` : 'Untitled'
    const prompt = s.firstPrompt
      ? `\n       ${truncate(s.firstPrompt, 80)}`
      : ''
    const count = `${s.messageCount} msgs`
    return `  ${num}. [${ago}] ${title}  (${count})${prompt}`
  })

  return lines.join('\n')
}

function timeAgo(timestampMs: number): string {
  const diff = Date.now() - timestampMs
  const secs = Math.floor(diff / 1000)
  if (secs < 60) return 'agora'
  const mins = Math.floor(secs / 60)
  if (mins < 60) return `${mins}m atrás`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h atrás`
  const days = Math.floor(hours / 24)
  return `${days}d atrás`
}

function truncate(s: string, len: number): string {
  return s.length > len ? s.slice(0, len) + '…' : s
}
