import React, { useEffect, useRef, useState } from 'react';
import { Box, Text } from '../ink.js';
import { useTerminalSize } from '../hooks/useTerminalSize.js';
import type { Message } from '../types/message.js';
import { truncateToWidth } from '../utils/format.js';

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
  'Fritando neuronio...',
  'Embananando...',
  'Desembananando...',
  'Bebopando...',
  'Caramelizando...',
  'Chacoalhando o servidor...',
  'Cozinhando os dados...',
  'Fermentando ideia...',
  'Frescurando no codigo...',
  'Zanzando nas variaveis...',
  'Cutucando a nuvem...',
  'Boogieando no heap...',
  'Claudiando com raiva...',
  'Catapultando tokens...',
  'Borrifando codigo...',
  'Cascateando na API...',
  'Brewando cafe virtual...',
  'Claudiando no modo turbo...',
  'Emocionando o CPU...',
  'Minguando tokens...',
];

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
  const days = Math.floor(totalSeconds / 86_400);
  const hours = Math.floor((totalSeconds % 86_400) / 3_600);
  const minutes = Math.floor((totalSeconds % 3_600) / 60);
  const seconds = totalSeconds % 60;
  const ss = String(seconds).padStart(2, '0');

  if (days > 0) return `${days}d ${hours}h ${minutes}min`;
  if (hours > 0) return `${hours}h ${minutes}min ${ss}s`;
  if (minutes > 0) return `${minutes}min ${ss}s`;
  return `${seconds}s`;
}

function randomPhrase(): string {
  return THINKING_PHRASES[Math.floor(Math.random() * THINKING_PHRASES.length)]!;
}

function clipToWidth(text: string, width: number): string {
  if (width <= 0) return '';
  return Array.from(text).slice(0, width).join('');
}

function formatThinkingElapsed(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  if (totalSeconds < 60) return `${totalSeconds}s`;

  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (minutes < 60) {
    return `${minutes}m${String(seconds).padStart(2, '0')}s`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h${String(remainingMinutes).padStart(2, '0')}m`;
}

function ThinkingBadge({
  isLoading,
  width,
  showPhrase,
}: {
  isLoading: boolean;
  width: number;
  showPhrase: boolean;
}): React.ReactElement | null {
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
  const timeLabel = formatThinkingElapsed(shownMs);
  const label = isLoading ? phrase : 'pronto';
  const phraseBudget = Math.max(0, width - (timeLabel.length + 7));
  const phraseText = showPhrase ? clipToWidth(label, Math.max(8, phraseBudget)) : '';

  return (
    <Box width={width} flexShrink={0}>
      <Text>
        {showPhrase && (
          <Text color={isLoading ? '#a78bfa' : '#22c55e'}>
            {phraseText}
            {' '}
          </Text>
        )}
        {isLoading ? (
          <Text color="#6b7280">{SPINNER_CHARS[frame]}</Text>
        ) : (
          <Text color="#22c55e">{'\u2713'}</Text>
        )}
        <Text color="#4b5563"> {timeLabel}</Text>
        {showPhrase && <Text color="#4b5563"> {'\u00b7'}</Text>}
      </Text>
    </Box>
  );
}

export function TokenStatusBar({
  messages,
  isLoading,
  typingSignal = '',
}: Props): React.ReactElement | null {
  const { columns } = useTerminalSize();
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

  const isFreeModel = model?.toLowerCase().includes(':free') || false;
  if (messages.length === 0 && !isLoading && !isTypingActive) {
    return null;
  }

  const activeInFlightMs = isSessionActive
    ? safeElapsedMs(now, activeStartedAtRef.current)
    : 0;
  const sessionMs = Math.max(0, now - SESSION_STARTED_AT);
  const activeMs = Math.min(sessionMs, Math.max(0, totalActiveMs + activeInFlightMs));
  const idleMs = Math.max(0, sessionMs - activeMs);

  const displayName = model?.replace(/:free$/i, '') || undefined;
  const showActivity = columns >= 120;
  const showModel = columns >= 150;
  const showThinkingPhrase = isLoading || columns >= 150;
  const thinkingWidth = showThinkingPhrase ? (columns >= 150 ? 34 : 26) : 10;
  const showSeparator = showModel && !!displayName && showActivity;

  return (
    <Box flexDirection="row" gap={1} flexShrink={1}>
      <ThinkingBadge
        isLoading={isLoading}
        width={thinkingWidth}
        showPhrase={showThinkingPhrase}
      />
      <Box flexShrink={1}>
        <Text wrap="truncate">
          {showModel && displayName && (
            <Text color="#4b5563">{truncateToWidth(displayName, 24)}</Text>
          )}
          {showSeparator && <Text color="#374151"> {' \u2502 '}</Text>}
          {showActivity && (
            <>
              <Text color="#86efac">ativo {formatDuration(activeMs)}</Text>
              <Text color="#4b5563"> {'\u00b7'} </Text>
              <Text color="#6b7280">ocioso {formatDuration(idleMs)}</Text>
            </>
          )}
          {isFreeModel && (
            <Text color="#22c55e"> {'\u00b7'} FREE</Text>
          )}
        </Text>
      </Box>
    </Box>
  );
}
