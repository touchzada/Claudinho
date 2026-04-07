import React, { useEffect, useRef, useState } from 'react';
import { Box, Text } from '../ink.js';
import { roughTokenCountEstimationForMessages } from '../services/tokenEstimation.js';
import type { Message } from '../types/message.js';
import {
  finalContextTokensFromLastResponse,
  getTokenUsage,
} from '../utils/tokens.js';

const SPINNER_CHARS = ['\u280b', '\u2819', '\u2839', '\u2838', '\u283c', '\u2834', '\u2826', '\u2827', '\u2807', '\u280f'];
const FADEOUT_MS = 5_000;
const SESSION_STARTED_AT = Date.now();
const SESSION_ACTIVITY = {
  totalActiveMs: 0,
  activeStartedAt: null as number | null,
};
const THINKING_PHRASES = [
  'Claudiando...',
  'Cerebrando...',
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

const BAR_WIDTH = 12;
const EASE = 0.35;
const DEFAULT_CONTEXT = 200_000;

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

const MODEL_CONTEXT: Record<string, number> = {
  'gpt-4o': 128_000,
  'gpt-4o-mini': 128_000,
  'gpt-4': 8_192,
  'gpt-3.5-turbo': 16_385,
  o1: 200_000,
  'o1-mini': 128_000,
  'o3-mini': 200_000,
  'claude-sonnet-4-6': 200_000,
  'claude-opus-4-6': 200_000,
  'claude-3.5-sonnet': 200_000,
  'claude-3.5-haiku': 200_000,
  'claude-3-opus': 200_000,
  'gemini-2.0-flash': 1_048_576,
  'gemini-2.5-pro': 1_048_576,
  'gemini-2.5-flash': 1_048_576,
  'deepseek-chat': 64_000,
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
  'llama3.1:8b': 8_000,
  'llama3.3:70b': 128_000,
};

interface Props {
  messages: Message[];
  isLoading: boolean;
  typingSignal?: string;
}

function safeElapsedMs(endMs: number, startMs: number | null): number {
  if (startMs == null || !Number.isFinite(startMs) || startMs <= 0) return 0;
  const delta = endMs - startMs;
  if (!Number.isFinite(delta) || delta < 0) return 0;
  return delta;
}

function formatDuration(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const monthSeconds = 30 * 24 * 60 * 60;
  const weekSeconds = 7 * 24 * 60 * 60;
  const daySeconds = 24 * 60 * 60;
  const hourSeconds = 60 * 60;
  const minuteSeconds = 60;

  let remaining = totalSeconds;
  const months = Math.floor(remaining / monthSeconds);
  remaining -= months * monthSeconds;
  const weeks = Math.floor(remaining / weekSeconds);
  remaining -= weeks * weekSeconds;
  const days = Math.floor(remaining / daySeconds);
  remaining -= days * daySeconds;
  const hours = Math.floor(remaining / hourSeconds);
  remaining -= hours * hourSeconds;
  const minutes = Math.floor(remaining / minuteSeconds);
  remaining -= minutes * minuteSeconds;
  const seconds = remaining;

  if (months > 0) return `${months}mes ${weeks}sem ${days}d ${hours}h ${minutes}min ${seconds}s`;
  if (weeks > 0) return `${weeks}sem ${days}d ${hours}h ${minutes}min ${seconds}s`;
  if (days > 0) return `${days}d ${hours}h ${minutes}min ${seconds}s`;
  if (hours > 0) return `${hours}h ${minutes}min ${seconds}s`;
  if (minutes > 0) return `${minutes}min ${seconds}s`;
  return `${seconds}s`;
}

function randomPhrase(): string {
  return THINKING_PHRASES[Math.floor(Math.random() * THINKING_PHRASES.length)]!;
}

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

function getContextWindow(model: string | undefined, provider: string | undefined): number {
  if (!model) return DEFAULT_CONTEXT;
  if (MODEL_CONTEXT[model]) return MODEL_CONTEXT[model]!;

  for (const [key, val] of Object.entries(MODEL_CONTEXT)) {
    if (model.startsWith(key)) return val;
  }

  if (provider && PROVIDER_CONTEXT_DEFAULTS[provider]) {
    return PROVIDER_CONTEXT_DEFAULTS[provider]!;
  }
  return DEFAULT_CONTEXT;
}

function getTotalContextSize(messages: Message[]): number {
  const lastResponseContext = finalContextTokensFromLastResponse(messages);
  if (lastResponseContext <= 0) return roughTokenCountEstimationForMessages(messages);

  let i = messages.length - 1;
  while (i >= 0) {
    const msg = messages[i];
    if (msg && getTokenUsage(msg)) break;
    i--;
  }

  return (
    lastResponseContext + roughTokenCountEstimationForMessages(messages.slice(i + 1))
  );
}

function ThinkingBadge({ isLoading }: { isLoading: boolean }): React.ReactElement | null {
  const [frame, setFrame] = useState(0);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [finalElapsedMs, setFinalElapsedMs] = useState(0);
  const [phrase, setPhrase] = useState(randomPhrase());
  const startRef = useRef(0);
  const fadeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!isLoading) {
      if (startRef.current > 0) {
        setFinalElapsedMs(Date.now() - startRef.current);
        startRef.current = 0;
      }
      if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current);
      fadeTimerRef.current = setTimeout(() => setFinalElapsedMs(0), FADEOUT_MS);
      return;
    }

    if (startRef.current === 0) startRef.current = Date.now();
    setFinalElapsedMs(0);
    if (fadeTimerRef.current) {
      clearTimeout(fadeTimerRef.current);
      fadeTimerRef.current = null;
    }

    const spinnerTimer = setInterval(
      () => setFrame(prev => (prev + 1) % SPINNER_CHARS.length),
      90,
    );
    const elapsedTimer = setInterval(
      () => setElapsedMs(Date.now() - startRef.current),
      100,
    );
    const phraseTimer = setInterval(() => setPhrase(randomPhrase()), 4000);

    return () => {
      clearInterval(spinnerTimer);
      clearInterval(elapsedTimer);
      clearInterval(phraseTimer);
    };
  }, [isLoading]);

  if (!isLoading && finalElapsedMs <= 0) return null;

  const shownMs = isLoading ? elapsedMs : finalElapsedMs;
  const secLabel = `${(shownMs / 1000).toFixed(1)}s`;

  return (
    <Text>
      {isLoading ? (
        <Text color="#6b7280">{SPINNER_CHARS[frame]}</Text>
      ) : (
        <Text color="#22c55e">{'\u2713'}</Text>
      )}
      <Text color={isLoading ? '#a78bfa' : '#22c55e'}>
        {isLoading ? ` ${phrase}` : ' pronto'}
      </Text>
      <Text color="#4b5563"> {secLabel}</Text>
    </Text>
  );
}

export function TokenStatusBar({
  messages,
  isLoading,
  typingSignal = '',
}: Props): React.ReactElement | null {
  const [now, setNow] = useState(() => Date.now());
  const [totalActiveMs, setTotalActiveMs] = useState(() => SESSION_ACTIVITY.totalActiveMs);
  const [isTypingActive, setIsTypingActive] = useState(false);
  const activeStartedAtRef = useRef<number | null>(SESSION_ACTIVITY.activeStartedAt);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const previousTypingSignalRef = useRef<string>(typingSignal);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (typingSignal !== previousTypingSignalRef.current) {
      setIsTypingActive(true);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => setIsTypingActive(false), 1500);
      previousTypingSignalRef.current = typingSignal;
    }
  }, [typingSignal]);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      // Persist active time on unmount so remounts don't reset counters.
      if (activeStartedAtRef.current != null) {
        const delta = safeElapsedMs(Date.now(), activeStartedAtRef.current);
        SESSION_ACTIVITY.totalActiveMs += delta;
        SESSION_ACTIVITY.activeStartedAt = null;
      }
    };
  }, []);

  const isSessionActive = isLoading || isTypingActive;

  useEffect(() => {
    if (isSessionActive) {
      if (activeStartedAtRef.current == null) {
        const startedAt = Date.now();
        activeStartedAtRef.current = startedAt;
        SESSION_ACTIVITY.activeStartedAt = startedAt;
      }
      return;
    }

    if (activeStartedAtRef.current != null) {
      const delta = safeElapsedMs(Date.now(), activeStartedAtRef.current);
      setTotalActiveMs(prev => {
        const next = prev + delta;
        SESSION_ACTIVITY.totalActiveMs = next;
        return next;
      });
      activeStartedAtRef.current = null;
      SESSION_ACTIVITY.activeStartedAt = null;
    }
  }, [isSessionActive]);

  const model =
    process.env.OPENAI_MODEL ||
    process.env.OPENROUTER_MODEL ||
    process.env.ANTHROPIC_MODEL ||
    undefined;

  const baseUrl =
    process.env.OPENAI_BASE_URL ||
    process.env.OPENROUTER_BASE_URL ||
    process.env.ANTHROPIC_BASE_URL ||
    undefined;

  const provider = detectProviderFromBaseUrl(baseUrl);
  const windowTokens = getContextWindow(model, provider);
  const usedTokens = getTotalContextSize(messages);

  const isFreeModel = model?.toLowerCase().includes(':free') || false;
  const rawPct =
    windowTokens > 0 ? Math.max(0, Math.round((usedTokens / windowTokens) * 100)) : 0;
  const exceeded = rawPct > 100;
  const pct = exceeded ? 100 : rawPct;

  const pctRef = useRef(pct);
  const [displayPct, setDisplayPct] = useState(pct);

  useEffect(() => {
    pctRef.current = pct;
    const timer = setInterval(() => {
      setDisplayPct(prev => approach(prev, pctRef.current));
    }, 50);
    return () => clearInterval(timer);
  }, [pct]);

  if (usedTokens === 0 && messages.length === 0 && !isLoading) {
    return null;
  }

  const activeInFlightMs = isSessionActive
    ? safeElapsedMs(now, activeStartedAtRef.current)
    : 0;
  const sessionMs = Math.max(0, now - SESSION_STARTED_AT);
  const activeMs = Math.min(sessionMs, Math.max(0, totalActiveMs + activeInFlightMs));
  const idleMs = Math.max(0, sessionMs - activeMs);

  const contextState = exceeded || rawPct >= 90
    ? { label: 'contexto critico', color: '#ef4444' }
    : rawPct >= 75
      ? { label: 'contexto atento', color: '#f59e0b' }
      : { label: 'contexto estavel', color: '#22c55e' };

  const displayName = model?.replace(/:free$/i, '') || undefined;
  const barColor = exceeded || rawPct >= 85 ? '#ef4444' : getBarColor(displayPct);
  const filled = Math.round((displayPct / 100) * BAR_WIDTH);
  const empty = BAR_WIDTH - filled;

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
        {exceeded && <Text color="#ef4444"> {'\u26a0'}</Text>}
        {displayName && (
          <Text color="#4b5563"> {'\u00b7'} {displayName}</Text>
        )}
        <Text color="#4b5563"> {'\u00b7'} </Text>
        <Text color="#86efac">ativo {formatDuration(activeMs)}</Text>
        <Text color="#4b5563"> {'\u00b7'} </Text>
        <Text color="#6b7280">ocioso {formatDuration(idleMs)}</Text>
        <Text color="#4b5563"> {'\u00b7'} </Text>
        <Text color={contextState.color}>{contextState.label}</Text>
        {isFreeModel && (
          <Text color="#22c55e"> {'\u00b7'} FREE</Text>
        )}
      </Box>
    </Box>
  );
}
