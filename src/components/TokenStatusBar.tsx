import React, { useEffect, useState, useRef } from 'react';
import { Box, Text } from '../ink.js';
import type { Message } from '../types/message.js';
import { finalContextTokensFromLastResponse, getTokenUsage } from '../utils/tokens.js';
import { roughTokenCountEstimationForMessages } from '../services/tokenEstimation.js';

const SPINNER_CHARS = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
const FADEOUT_MS = 5_000; // Show the thinking badge for 5s after response completes
const THINKING_PHRASES = [
  'Claudiando...',
  'Cerebrando...',
  'Trabalhando nisso...',
  'Fritando neurônio...',
  'Embananando...',
  'Desembananando...',
  'Bebopando...',
  'Caramelizando...',
  'Chacoalhando o servidor...',
  'Cozinhando os dados...',
  'Fermentando ideia...',
  'Frescurando no código...',
  'Zanzando nas variáveis...',
  'Cutucando a nuvem...',
  'Boogieando no heap...',
  'Claudiando com raiva...',
  'Catapultando tokens...',
  'Borrifando código...',
  'Cascateando na API...',
  'Brewando café virtual...',
  'Claudiando no modo turbo...',
  'Emocionando o CPU...',
  'Minguando tokens...',
];
let lastPhraseIndex = 0;

function randomPhrase(): string {
  let idx: number;
  do {
    idx = Math.floor(Math.random() * THINKING_PHRASES.length);
  } while (idx === lastPhraseIndex && THINKING_PHRASES.length > 1);
  lastPhraseIndex = idx;
  return THINKING_PHRASES[idx]!;
}

function ThinkingBadge({ isLoading }: { isLoading: boolean }): React.ReactElement | null {
  const [frame, setFrame] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [finalElapsed, setFinalElapsed] = useState(0);
  const [phrase, setPhrase] = useState(randomPhrase());
  const startRef = useRef(0);
  const fadeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!isLoading) {
      // Store the final elapsed time so we can show it in fade-out
      if (startRef.current > 0) {
        setFinalElapsed(Date.now() - startRef.current);
        startRef.current = 0;
      }
      // Start a fade-out timer
      if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current);
      fadeTimerRef.current = setTimeout(() => setFinalElapsed(0), FADEOUT_MS);
      return;
    }

    // Loading just started (or resumed)
    if (startRef.current === 0) {
      startRef.current = Date.now();
    }
    setFinalElapsed(0); // Clear any lingering fade-out
    if (fadeTimerRef.current) {
      clearTimeout(fadeTimerRef.current);
      fadeTimerRef.current = null;
    }
    const spinnerTimer = setInterval(() => setFrame(f => (f + 1) % SPINNER_CHARS.length), 80);
    const elapsedTimer = setInterval(() => setElapsed(Date.now() - startRef.current), 50);
    // Rotate phrases so it doesn't get stale
    const phraseTimer = setInterval(() => setPhrase(randomPhrase()), 4000);
    return () => {
      clearInterval(spinnerTimer);
      clearInterval(elapsedTimer);
      clearInterval(phraseTimer);
    };
  }, [isLoading]);

  // Nothing to show
  if (!isLoading && finalElapsed === 0) return null;

  const showMs = isLoading ? elapsed : finalElapsed;
  const sec = (showMs / 1000).toFixed(1);

  const statusText = isLoading ? phrase : `✓ ${sec}s`;

  return (
    <Text>
      {!isLoading ? (
        <Text color="#22c55e">■</Text>
      ) : (
        <Text color="#6b7280">{SPINNER_CHARS[frame]}</Text>
      )}
      <Text color="#a78bfa"> {statusText}</Text>
      <Text color="#4b5563"> {sec}s</Text>
    </Text>
  );
}

const BAR_WIDTH = 12;
const EASE = 0.35;

function approach(current: number, target: number): number {
  if (current === target) return target;
  const next = current + (target - current) * EASE;
  return Math.abs(next - target) < 1 ? target : Math.round(next);
}

function getBarColor(pct: number): string {
  if (pct < 50) return '#22c55e';
  if (pct < 70) return '#eab308';
  if (pct < 85) return '#f59e0b';
  return '#ef4444';
}

function humanizeTokens(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}k`;
  return String(Math.round(n));
}

/**
 * Detect the active provider from the base URL.
 * The base URL reveals the real identity, not just the model name.
 */
function detectProviderFromBaseUrl(baseUrl: string | undefined): string | undefined {
  if (!baseUrl) return undefined;
  const url = baseUrl.toLowerCase();
  if (url.includes('openrouter') || url.includes('openrouter.ai')) return 'openrouter';
  if (url.includes('anthropic') || url.includes('api.anthropic.com')) return 'anthropic';
  if (url.includes('googleapis') || url.includes('generativelanguage')) return 'gemini';
  if (url.includes('localhost:11434') || url.includes('127.0.0.1:11434')) return 'ollama';
  if (url.includes('openai.com') || url.includes('api.openai.com')) return 'openai';
  if (url.includes('groq') || url.includes('api.groq.com')) return 'groq';
  if (url.includes('together') || url.includes('api.together.xyz')) return 'together';
  if (url.includes('deepinfra') || url.includes('api.deepinfra.com')) return 'deepinfra';
  if (url.includes('fireworks') || url.includes('api.wonderflow.com')) return 'fireworks';
  return undefined;
}

/**
 * Provider-based context window defaults.
 * Used when the model name doesn't match MODEL_CONTEXT exactly.
 */
const PROVIDER_CONTEXT_DEFAULTS: Record<string, number> = {
  openrouter: 128_000,
  openai: 128_000,
  groq: 128_000,
  together: 128_000,
  deepinfra: 128_000,
  fireworks: 128_000,
  anthropic: 200_000,
  gemini: 1_048_576,
  ollama: 128_000,
};

/** Map of known model context windows (in tokens). */
const MODEL_CONTEXT: Record<string, number> = {
  // OpenAI
  'gpt-4o': 128_000,
  'gpt-4o-mini': 128_000,
  'gpt-4': 8_192,
  'gpt-3.5-turbo': 16_385,
  'o1': 200_000,
  'o1-mini': 128_000,
  'o3-mini': 200_000,
  // Claude
  'claude-sonnet-4-6': 200_000,
  'claude-opus-4-6': 200_000,
  'claude-3.5-sonnet': 200_000,
  'claude-3.5-haiku': 200_000,
  'claude-3-opus': 200_000,
  // Gemini
  'gemini-2.0-flash': 1_048_576,
  'gemini-2.5-pro': 1_048_576,
  'gemini-2.5-flash': 1_048_576,
  // DeepSeek
  'deepseek-chat': 64_000,
  // Qwen
  'qwen3.6': 131_072,
  'qwen3.6-plus': 131_072,
  'qwen/qwen3.6': 131_072,
  'qwen/qwen3.6-plus': 131_072,
  'qwen3-235b-a22b': 131_072,
  'qwen3-30b-a3b': 131_072,
  'qwen3-32b': 131_072,
  'qwen-max': 32_768,
  'qwen-plus': 131_072,
  'qwen-turbo': 131_072,
  // Llama (local)
  'llama3.1:8b': 8_000,
  'llama3.3:70b': 128_000,
};

const DEFAULT_CONTEXT = 200_000;

function getContextWindow(
  model: string | undefined,
  provider: string | undefined,
): number {
  if (!model) return DEFAULT_CONTEXT;

  // Exact match (highest priority)
  if (MODEL_CONTEXT[model]) return MODEL_CONTEXT[model]!;

  // Partial match (e.g. "claude-sonnet-4-6-2025..." → match "claude-sonnet-4-6")
  for (const [key, val] of Object.entries(MODEL_CONTEXT)) {
    if (model.startsWith(key)) return val;
  }

  // Fallback by provider defaults
  if (provider && PROVIDER_CONTEXT_DEFAULTS[provider]) {
    return PROVIDER_CONTEXT_DEFAULTS[provider]!;
  }

  return DEFAULT_CONTEXT;
}

interface Props {
  messages: Message[];
  isLoading: boolean;
}

/**
 * Get the total context size including messages not yet in an API response.
 * Uses the last API response's final context window + estimates for all
 * messages after that point (new user messages, streaming assistant content,
 * tool_results still being generated, etc.).
 *
 * This ensures the bar shows the FULL context, not just the last response's
 * portion, and accurately updates during streaming.
 */
function getTotalContextSize(messages: Message[]): number {
  const lastResponseContext = finalContextTokensFromLastResponse(messages);

  if (lastResponseContext > 0) {
    // Find where the last API response ends so we estimate only the
    // messages that came AFTER it (streaming content, new user msg, etc.)
    let i = messages.length - 1;
    while (i >= 0) {
      const msg = messages[i];
      const usage = msg ? getTokenUsage(msg) : undefined;
      if (usage) {
        // Found the last assistant message with usage data
        break;
      }
      i--;
    }
    // If i < 0, no API response found → estimate everything
    // If i >= 0, estimate only messages after the response anchor
    const afterAnchor = messages.slice(i + 1);
    const estimate = roughTokenCountEstimationForMessages(afterAnchor);
    return lastResponseContext + estimate;
  }

  // No API response yet — estimate all messages
  return roughTokenCountEstimationForMessages(messages);
}

export function TokenStatusBar({ messages, isLoading }: Props): React.ReactElement | null {
  const model = process.env.OPENAI_MODEL ||
                process.env.OPENROUTER_MODEL ||
                process.env.ANTHROPIC_MODEL ||
                undefined;

  const baseUrl = process.env.OPENAI_BASE_URL ||
                  process.env.OPENROUTER_BASE_URL ||
                  process.env.ANTHROPIC_BASE_URL ||
                  undefined;

  const provider = detectProviderFromBaseUrl(baseUrl);
  const windowTokens = getContextWindow(model, provider);
  const usedTokens = getTotalContextSize(messages);

  // Detect free tier from model name (e.g., "qwen/qwen3.6-plus:free")
  const isFreeModel = model?.toLowerCase().includes(':free') || false;

  // Track if we exceeded the window (for color), but cap display at 100
  const rawPct = windowTokens > 0
    ? Math.max(0, Math.round((usedTokens / windowTokens) * 100))
    : 0;
  const exceeded = rawPct > 100;
  const pct = exceeded ? 100 : rawPct;

  // Initialize displayPct at the current pct so color is correct immediately
  const pctRef = useRef(pct);
  const [displayPct, setDisplayPct] = useState(pct);

  useEffect(() => {
    pctRef.current = pct;
    const timer = setInterval(() => {
      setDisplayPct(prev => approach(prev, pctRef.current));
    }, 50);
    return () => clearInterval(timer);
  }, [pct]);

  // Color uses rawPct so it goes red when exceeded
  const barColor = exceeded || rawPct >= 85 ? '#ef4444' : getBarColor(displayPct);
  const filled = Math.round((displayPct / 100) * BAR_WIDTH);
  const empty = BAR_WIDTH - filled;

  if (usedTokens === 0 && messages.length === 0 && !isLoading) return null;

  // Clean model name for display (strip ":free" suffix)
  const displayName = model?.replace(/:free$/i, '') || undefined;

  return (
    <Box flexDirection="row" gap={1}>
      <ThinkingBadge isLoading={isLoading} />
      <Box>
        <Text color="#6b7280">[</Text>
        <Text color={barColor}>{'\u25B0'.repeat(filled)}</Text>
        <Text color="#374151" dimColor>{'\u25B1'.repeat(empty)}</Text>
        <Text color="#6b7280">] </Text>
        <Text color={barColor}>{displayPct}%</Text>
        <Text color="#6b7280"> {humanizeTokens(usedTokens)}/{humanizeTokens(windowTokens)}</Text>
        {exceeded && <Text color="#ef4444"> ⚠</Text>}
        {isFreeModel && (
          <Text color="#22c55e"> FREE</Text>
        )}
        {displayName && (
          <Text color="#6b7280"> {displayName}</Text>
        )}
      </Box>
    </Box>
  );
}
