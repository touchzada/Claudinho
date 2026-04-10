/**
 * Codex authentication helpers.
 * Manages Codex OAuth tokens and provides utilities for authentication.
 */
import type { CodexTokens } from '../services/oauth/codex-client.js'
import { refreshCodexToken } from '../services/oauth/codex-client.js'
import { getGlobalConfig, saveGlobalConfig } from './config.js'
import { logForDebugging } from './debug.js'

/**
 * Gets the stored Codex OAuth tokens from config.
 */
export function getCodexOAuthTokens(): CodexTokens | null {
  const config = getGlobalConfig()
  return config.codexOAuthTokens ?? null
}

/**
 * Saves Codex OAuth tokens to config.
 */
export function saveCodexOAuthTokens(tokens: CodexTokens): void {
  saveGlobalConfig((current) => ({
    ...current,
    codexOAuthTokens: tokens,
  }))
  logForDebugging('Codex OAuth tokens saved', { level: 'info' })
}

/**
 * Clears Codex OAuth tokens from config.
 */
export function clearCodexOAuthTokens(): void {
  saveGlobalConfig((current) => {
    const { codexOAuthTokens, ...rest } = current
    return rest
  })
  logForDebugging('Codex OAuth tokens cleared', { level: 'info' })
}

/**
 * Checks if Codex OAuth tokens are expired (with 5 minute buffer).
 */
export function isCodexTokenExpired(tokens: CodexTokens | null): boolean {
  if (!tokens) return true
  const bufferTime = 5 * 60 * 1000 // 5 minutes
  return Date.now() + bufferTime >= tokens.expiresAt
}

/**
 * Ensures we have a valid Codex access token, refreshing if needed.
 * Throws if not authenticated or refresh fails.
 */
export async function ensureValidCodexToken(): Promise<CodexTokens> {
  const tokens = getCodexOAuthTokens()

  if (!tokens) {
    throw new Error(
      'Not authenticated with Codex. Run /provider codex to login.',
    )
  }

  // Check if token is expired or about to expire
  if (isCodexTokenExpired(tokens)) {
    logForDebugging('Codex token expired, refreshing...', { level: 'info' })
    try {
      const newTokens = await refreshCodexToken(tokens.refreshToken)
      saveCodexOAuthTokens(newTokens)
      logForDebugging('Codex token refreshed successfully', { level: 'info' })
      return newTokens
    } catch (err) {
      logForDebugging(`Codex token refresh failed: ${err}`, { level: 'error' })
      // Clear invalid tokens
      clearCodexOAuthTokens()
      throw new Error(
        'Codex token refresh failed. Please run /provider codex to re-login.',
      )
    }
  }

  return tokens
}

/**
 * Checks if the user is authenticated with Codex.
 */
export function isCodexAuthenticated(): boolean {
  const tokens = getCodexOAuthTokens()
  return tokens !== null && !isCodexTokenExpired(tokens)
}

/**
 * Gets the Codex account ID if authenticated.
 */
export function getCodexAccountId(): string | null {
  const tokens = getCodexOAuthTokens()
  return tokens?.accountId ?? null
}
