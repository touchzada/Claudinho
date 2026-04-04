import { expect, test } from 'bun:test'
import fc from 'fast-check'
import { extractMessagePreviews, formatRelativeTime, truncateText } from './utils.js'

/**
 * Property 7: Relative Time Display
 * **Validates: Requirements 1.7**
 *
 * For any session in the session list, the session entry should display
 * the time since last activity in a relative format string.
 */
test('Property 7: formatRelativeTime returns correct format for any valid date', () => {
  fc.assert(
    fc.property(
      // Generate dates from 1 year ago to now
      fc.date({ min: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000), max: new Date() }),
      (date) => {
        const result = formatRelativeTime(date)
        const now = new Date()
        const diffMs = now.getTime() - date.getTime()
        const diffMinutes = Math.floor(diffMs / 60000)
        const diffHours = Math.floor(diffMs / 3600000)
        const diffDays = Math.floor(diffMs / 86400000)
        const diffWeeks = Math.floor(diffMs / 604800000)

        // Verify the result is a non-empty string
        expect(typeof result).toBe('string')
        expect(result.length).toBeGreaterThan(0)

        // Verify the format matches the expected pattern based on time difference
        if (diffMinutes < 1) {
          // Requirement 5.1: < 1 minute should be "just now"
          expect(result).toBe('just now')
        } else if (diffMinutes < 60) {
          // Requirement 5.2: < 1 hour should be "X minute(s) ago"
          expect(result).toMatch(/^\d+ minutes? ago$/)
          const minutes = parseInt(result.split(' ')[0])
          expect(minutes).toBe(diffMinutes)
          if (diffMinutes === 1) {
            expect(result).toBe('1 minute ago')
          } else {
            expect(result).toBe(`${diffMinutes} minutes ago`)
          }
        } else if (diffHours < 24) {
          // Requirement 5.3: < 24 hours should be "X hour(s) ago"
          expect(result).toMatch(/^\d+ hours? ago$/)
          const hours = parseInt(result.split(' ')[0])
          expect(hours).toBe(diffHours)
          if (diffHours === 1) {
            expect(result).toBe('1 hour ago')
          } else {
            expect(result).toBe(`${diffHours} hours ago`)
          }
        } else if (diffDays < 7) {
          // Requirement 5.4: < 7 days should be "X day(s) ago"
          expect(result).toMatch(/^\d+ days? ago$/)
          const days = parseInt(result.split(' ')[0])
          expect(days).toBe(diffDays)
          if (diffDays === 1) {
            expect(result).toBe('1 day ago')
          } else {
            expect(result).toBe(`${diffDays} days ago`)
          }
        } else if (diffWeeks < 5) {
          // Requirement 5.5: < 5 weeks should be "X week(s) ago"
          expect(result).toMatch(/^\d+ weeks? ago$/)
          const weeks = parseInt(result.split(' ')[0])
          expect(weeks).toBe(diffWeeks)
          if (diffWeeks === 1) {
            expect(result).toBe('1 week ago')
          } else {
            expect(result).toBe(`${diffWeeks} weeks ago`)
          }
        } else {
          // Requirement 5.6: >= 5 weeks should be absolute date
          // Should be a valid date string (not contain "ago")
          expect(result).not.toContain('ago')
          // Should be the result of toLocaleDateString()
          expect(result).toBe(date.toLocaleDateString())
        }
      }
    ),
    { numRuns: 100 }
  )
})

// Edge case tests for boundary conditions
test('formatRelativeTime: just now (< 1 minute)', () => {
  const now = new Date()
  const thirtySecondsAgo = new Date(now.getTime() - 30 * 1000)
  expect(formatRelativeTime(thirtySecondsAgo)).toBe('just now')
})

test('formatRelativeTime: 1 minute ago (singular)', () => {
  const now = new Date()
  const oneMinuteAgo = new Date(now.getTime() - 60 * 1000)
  expect(formatRelativeTime(oneMinuteAgo)).toBe('1 minute ago')
})

test('formatRelativeTime: multiple minutes ago (plural)', () => {
  const now = new Date()
  const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000)
  expect(formatRelativeTime(fiveMinutesAgo)).toBe('5 minutes ago')
})

test('formatRelativeTime: 1 hour ago (singular)', () => {
  const now = new Date()
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)
  expect(formatRelativeTime(oneHourAgo)).toBe('1 hour ago')
})

test('formatRelativeTime: multiple hours ago (plural)', () => {
  const now = new Date()
  const threeHoursAgo = new Date(now.getTime() - 3 * 60 * 60 * 1000)
  expect(formatRelativeTime(threeHoursAgo)).toBe('3 hours ago')
})

test('formatRelativeTime: 1 day ago (singular)', () => {
  const now = new Date()
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
  expect(formatRelativeTime(oneDayAgo)).toBe('1 day ago')
})

test('formatRelativeTime: multiple days ago (plural)', () => {
  const now = new Date()
  const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000)
  expect(formatRelativeTime(threeDaysAgo)).toBe('3 days ago')
})

test('formatRelativeTime: 1 week ago (singular)', () => {
  const now = new Date()
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  expect(formatRelativeTime(oneWeekAgo)).toBe('1 week ago')
})

test('formatRelativeTime: multiple weeks ago (plural)', () => {
  const now = new Date()
  const twoWeeksAgo = new Date(now.getTime() - 2 * 7 * 24 * 60 * 60 * 1000)
  expect(formatRelativeTime(twoWeeksAgo)).toBe('2 weeks ago')
})

test('formatRelativeTime: 5 weeks or more returns absolute date', () => {
  const now = new Date()
  const fiveWeeksAgo = new Date(now.getTime() - 5 * 7 * 24 * 60 * 60 * 1000)
  const result = formatRelativeTime(fiveWeeksAgo)
  expect(result).not.toContain('ago')
  expect(result).toBe(fiveWeeksAgo.toLocaleDateString())
})

/**
 * Property 13: Message Preview Truncation
 * **Validates: Requirements 6.9**
 *
 * For any message text that exceeds the maximum display width, the truncated
 * preview should be exactly max_width - 3 characters followed by "...".
 */
test('Property 13: truncateText correctly truncates text exceeding max length', () => {
  fc.assert(
    fc.property(
      fc.string(),
      fc.integer({ min: 4, max: 200 }), // maxLength must be at least 4 to accommodate "..."
      (text, maxLength) => {
        const result = truncateText(text, maxLength)

        if (text.length <= maxLength) {
          // Requirement 6.9: Text within limit should be unchanged
          expect(result).toBe(text)
          expect(result.length).toBe(text.length)
        } else {
          // Requirement 6.9: Text exceeding limit should be truncated
          // Result should be exactly maxLength characters
          expect(result.length).toBe(maxLength)
          
          // Result should end with "..."
          expect(result.endsWith('...')).toBe(true)
          
          // The text before "..." should be exactly maxLength - 3 characters
          const textBeforeEllipsis = result.slice(0, -3)
          expect(textBeforeEllipsis.length).toBe(maxLength - 3)
          
          // The text before "..." should match the beginning of the original text
          expect(textBeforeEllipsis).toBe(text.slice(0, maxLength - 3))
        }
      }
    ),
    { numRuns: 100 }
  )
})

// Edge case tests for truncateText
test('truncateText: text shorter than maxLength returns unchanged', () => {
  expect(truncateText('Hello', 10)).toBe('Hello')
  expect(truncateText('', 10)).toBe('')
})

test('truncateText: text exactly at maxLength returns unchanged', () => {
  expect(truncateText('Hello World', 11)).toBe('Hello World')
})

test('truncateText: text longer than maxLength is truncated with ellipsis', () => {
  const result = truncateText('Hello World, this is a long message', 20)
  expect(result).toBe('Hello World, this...')
  expect(result.length).toBe(20)
})

test('truncateText: minimal maxLength (4) works correctly', () => {
  const result = truncateText('Hello', 4)
  expect(result).toBe('H...')
  expect(result.length).toBe(4)
})

test('truncateText: maxLength of 3 produces only ellipsis', () => {
  const result = truncateText('Hello', 3)
  expect(result).toBe('...')
  expect(result.length).toBe(3)
})

test('truncateText: handles special characters and emojis', () => {
  const text = 'Hello 👋 World 🌍 with special chars: @#$%'
  const result = truncateText(text, 20)
  expect(result.length).toBe(20)
  expect(result.endsWith('...')).toBe(true)
  expect(result).toBe(text.slice(0, 17) + '...')
})

test('truncateText: handles whitespace correctly', () => {
  const text = '   Leading and trailing spaces   '
  const result = truncateText(text, 15)
  expect(result.length).toBe(15)
  expect(result).toBe('   Leading a...')
})

/**
 * Property 2: First Message Preview Display
 * **Validates: Requirements 1.4, 6.3**
 *
 * For any session in the session list, the session entry should display
 * a preview of the first user message, truncated to the maximum display width.
 */
test('Property 2: extractMessagePreviews returns first user message preview', () => {
  fc.assert(
    fc.property(
      // Generate sessions with various message configurations
      fc.record({
        isLite: fc.boolean(),
        firstPrompt: fc.string(),
        messages: fc.oneof(
          // Case 1: No messages array (undefined)
          fc.constant(undefined),
          // Case 2: Empty messages array
          fc.constant([]),
          // Case 3: Array with user messages
          fc.array(
            fc.record({
              role: fc.constantFrom('user', 'assistant'),
              content: fc.array(
                fc.record({
                  type: fc.constant('text'),
                  text: fc.string(),
                }),
                { minLength: 1, maxLength: 3 }
              ),
            }),
            { minLength: 1, maxLength: 10 }
          )
        ),
      }),
      (session: any) => {
        const result = extractMessagePreviews(session)

        // Verify result structure
        expect(result).toHaveProperty('first')
        expect(result).toHaveProperty('last')
        expect(typeof result.first).toBe('string')
        expect(typeof result.last).toBe('string')

        // Verify first message preview logic
        if (session.isLite || !session.messages || session.messages.length === 0) {
          // Requirement 6.3: For lite sessions or no messages, use firstPrompt
          const expectedFirst = session.firstPrompt || 'No messages'
          expect(result.first).toBe(truncateText(expectedFirst, 60))
        } else {
          const userMessages = session.messages.filter((m: any) => m.role === 'user')
          if (userMessages.length === 0) {
            // No user messages, should use firstPrompt
            const expectedFirst = session.firstPrompt || 'No messages'
            expect(result.first).toBe(truncateText(expectedFirst, 60))
          } else {
            // Should extract from first user message
            const firstUserMessage = userMessages[0]
            const expectedText =
              firstUserMessage?.content?.[0]?.text || session.firstPrompt || 'No content'
            expect(result.first).toBe(truncateText(expectedText, 60))
          }
        }

        // Verify truncation to 60 characters
        expect(result.first.length).toBeLessThanOrEqual(60)
      }
    ),
    { numRuns: 100 }
  )
})

/**
 * Property 3: Last Message Preview Display
 * **Validates: Requirements 1.5, 6.4**
 *
 * For any session in the session list, the session entry should display
 * a preview of the last message (user or assistant), truncated to the
 * maximum display width.
 */
test('Property 3: extractMessagePreviews returns last user message preview', () => {
  fc.assert(
    fc.property(
      // Generate sessions with various message configurations
      fc.record({
        isLite: fc.boolean(),
        firstPrompt: fc.string(),
        messages: fc.oneof(
          // Case 1: No messages array (undefined)
          fc.constant(undefined),
          // Case 2: Empty messages array
          fc.constant([]),
          // Case 3: Array with user messages
          fc.array(
            fc.record({
              role: fc.constantFrom('user', 'assistant'),
              content: fc.array(
                fc.record({
                  type: fc.constant('text'),
                  text: fc.string(),
                }),
                { minLength: 1, maxLength: 3 }
              ),
            }),
            { minLength: 1, maxLength: 10 }
          )
        ),
      }),
      (session: any) => {
        const result = extractMessagePreviews(session)

        // Verify result structure
        expect(result).toHaveProperty('first')
        expect(result).toHaveProperty('last')
        expect(typeof result.first).toBe('string')
        expect(typeof result.last).toBe('string')

        // Verify last message preview logic
        if (session.isLite || !session.messages || session.messages.length === 0) {
          // Requirement 6.4: For lite sessions or no messages, show "No messages"
          expect(result.last).toBe('No messages')
        } else {
          const userMessages = session.messages.filter((m: any) => m.role === 'user')
          if (userMessages.length === 0) {
            // No user messages, should show "No messages"
            expect(result.last).toBe('No messages')
          } else {
            // Should extract from last user message
            const lastUserMessage = userMessages[userMessages.length - 1]
            const expectedText = lastUserMessage?.content?.[0]?.text || 'No content'
            expect(result.last).toBe(truncateText(expectedText, 60))
          }
        }

        // Verify truncation to 60 characters
        expect(result.last.length).toBeLessThanOrEqual(60)
      }
    ),
    { numRuns: 100 }
  )
})

// Edge case tests for extractMessagePreviews
test('extractMessagePreviews: lite session uses firstPrompt', () => {
  const session = {
    isLite: true,
    firstPrompt: 'Hello, how are you?',
    messages: [],
  }
  const result = extractMessagePreviews(session as any)
  expect(result.first).toBe('Hello, how are you?')
  expect(result.last).toBe('No messages')
})

test('extractMessagePreviews: session with no messages uses firstPrompt', () => {
  const session = {
    isLite: false,
    firstPrompt: 'Test prompt',
    messages: [],
  }
  const result = extractMessagePreviews(session as any)
  expect(result.first).toBe('Test prompt')
  expect(result.last).toBe('No messages')
})

test('extractMessagePreviews: session with undefined messages uses firstPrompt', () => {
  const session = {
    isLite: false,
    firstPrompt: 'Another test',
    messages: undefined,
  }
  const result = extractMessagePreviews(session as any)
  expect(result.first).toBe('Another test')
  expect(result.last).toBe('No messages')
})

test('extractMessagePreviews: session with only assistant messages uses firstPrompt', () => {
  const session = {
    isLite: false,
    firstPrompt: 'User prompt',
    messages: [
      {
        role: 'assistant',
        content: [{ type: 'text', text: 'Assistant response' }],
      },
    ],
  }
  const result = extractMessagePreviews(session as any)
  expect(result.first).toBe('User prompt')
  expect(result.last).toBe('No messages')
})

test('extractMessagePreviews: session with user messages extracts correctly', () => {
  const session = {
    isLite: false,
    firstPrompt: 'Initial prompt',
    messages: [
      {
        role: 'user',
        content: [{ type: 'text', text: 'First user message' }],
      },
      {
        role: 'assistant',
        content: [{ type: 'text', text: 'Assistant response' }],
      },
      {
        role: 'user',
        content: [{ type: 'text', text: 'Second user message' }],
      },
    ],
  }
  const result = extractMessagePreviews(session as any)
  expect(result.first).toBe('First user message')
  expect(result.last).toBe('Second user message')
})

test('extractMessagePreviews: truncates long messages to 60 characters', () => {
  const longMessage = 'This is a very long message that exceeds sixty characters and should be truncated'
  const session = {
    isLite: false,
    firstPrompt: 'Short',
    messages: [
      {
        role: 'user',
        content: [{ type: 'text', text: longMessage }],
      },
    ],
  }
  const result = extractMessagePreviews(session as any)
  expect(result.first.length).toBe(60)
  expect(result.first.endsWith('...')).toBe(true)
  expect(result.first).toBe(longMessage.slice(0, 57) + '...')
})

test('extractMessagePreviews: handles message with no content', () => {
  const session = {
    isLite: false,
    firstPrompt: 'Fallback prompt',
    messages: [
      {
        role: 'user',
        content: [],
      },
    ],
  }
  const result = extractMessagePreviews(session as any)
  expect(result.first).toBe('Fallback prompt')
  expect(result.last).toBe('No content')
})

test('extractMessagePreviews: handles message with undefined content', () => {
  const session = {
    isLite: false,
    firstPrompt: 'Fallback prompt',
    messages: [
      {
        role: 'user',
        content: undefined,
      },
    ],
  }
  const result = extractMessagePreviews(session as any)
  expect(result.first).toBe('Fallback prompt')
  expect(result.last).toBe('No content')
})

test('extractMessagePreviews: handles empty firstPrompt', () => {
  const session = {
    isLite: true,
    firstPrompt: '',
    messages: [],
  }
  const result = extractMessagePreviews(session as any)
  expect(result.first).toBe('No messages')
  expect(result.last).toBe('No messages')
})

test('extractMessagePreviews: handles null firstPrompt', () => {
  const session = {
    isLite: true,
    firstPrompt: null,
    messages: [],
  }
  const result = extractMessagePreviews(session as any)
  expect(result.first).toBe('No messages')
  expect(result.last).toBe('No messages')
})
