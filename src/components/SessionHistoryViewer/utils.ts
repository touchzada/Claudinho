import type { LogOption } from '../../types/logs.js'

export function formatRelativeTime(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMinutes = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)
  const diffWeeks = Math.floor(diffMs / 604800000)

  if (diffMinutes < 1) return 'just now'
  if (diffMinutes < 60)
    return `${diffMinutes} minute${diffMinutes === 1 ? '' : 's'} ago`
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`
  if (diffDays < 7) return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`
  if (diffWeeks < 5) return `${diffWeeks} week${diffWeeks === 1 ? '' : 's'} ago`

  // Absolute date for older sessions
  return date.toLocaleDateString()
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength - 3) + '...'
}

export function extractMessagePreviews(session: LogOption): {
  first: string
  last: string
} {
  if (session.isLite || !session.messages || session.messages.length === 0) {
    return {
      first: session.firstPrompt || 'No messages',
      last: 'No messages',
    }
  }

  const userMessages = session.messages.filter(m => m.role === 'user')
  if (userMessages.length === 0) {
    return {
      first: session.firstPrompt || 'No messages',
      last: 'No messages',
    }
  }

  const firstMessage = userMessages[0]
  const lastMessage = userMessages[userMessages.length - 1]

  const first =
    firstMessage?.content?.[0]?.text || session.firstPrompt || 'No content'
  const last = lastMessage?.content?.[0]?.text || 'No content'

  return {
    first: truncateText(first, 60),
    last: truncateText(last, 60),
  }
}
