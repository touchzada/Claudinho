import React, { useEffect, useMemo, useState } from 'react';
import { Box, Text } from '../ink.js';

const SESSION_STARTED_AT = Date.now();
const WEATHER_REFRESH_MS = 15 * 60 * 1000;
const WEATHER_TIMEOUT_MS = 5000;

type WeatherSnapshot = {
  tempC: number;
  icon: string;
};

function normalizeWeekday(label: string): string {
  const clean = label.replace('.', '').trim();
  if (!clean) return '';
  return clean.charAt(0).toUpperCase() + clean.slice(1);
}

function formatUptime(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const days = Math.floor(totalSeconds / 86_400);
  const hours = Math.floor((totalSeconds % 86_400) / 3_600);
  const minutes = Math.floor((totalSeconds % 3_600) / 60);
  const seconds = totalSeconds % 60;

  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
}

function weatherIconByCode(code: number): string {
  // https://www.worldweatheronline.com/developer/api/docs/weather-icons.aspx
  if (code === 113) return '\u2600';
  if (code === 116) return '\u26c5';
  if (code === 119 || code === 122) return '\u2601';
  if (
    code === 176 ||
    code === 263 ||
    code === 266 ||
    code === 293 ||
    code === 296 ||
    code === 299 ||
    code === 302 ||
    code === 305 ||
    code === 308 ||
    code === 353 ||
    code === 356
  ) {
    return '\u2614';
  }
  if (
    code === 179 ||
    code === 182 ||
    code === 185 ||
    code === 227 ||
    code === 230 ||
    code === 323 ||
    code === 326 ||
    code === 329 ||
    code === 332 ||
    code === 335 ||
    code === 338 ||
    code === 368 ||
    code === 371
  ) {
    return '\u2744';
  }
  if (code === 200 || code === 386 || code === 389 || code === 392 || code === 395) {
    return '\u26a1';
  }
  return '\u26c5';
}

async function fetchWeatherSnapshot(): Promise<WeatherSnapshot | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), WEATHER_TIMEOUT_MS);

  try {
    // wttr returns weather based on client IP, no setup needed.
    const res = await fetch('https://wttr.in/?format=j1', {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) return null;

    const payload = (await res.json()) as {
      current_condition?: Array<{ temp_C?: string; weatherCode?: string }>;
    };

    const current = payload.current_condition?.[0];
    if (!current) return null;

    const tempC = Number.parseInt(current.temp_C ?? '', 10);
    const weatherCode = Number.parseInt(current.weatherCode ?? '', 10);
    if (!Number.isFinite(tempC)) return null;

    return {
      tempC,
      icon: weatherIconByCode(Number.isFinite(weatherCode) ? weatherCode : 116),
    };
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

interface Props {
  compact?: boolean;
}

export function SessionHud({ compact = false }: Props): React.ReactElement {
  const [now, setNow] = useState(() => Date.now());
  const [weather, setWeather] = useState<WeatherSnapshot | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (compact) {
      setWeather(null);
      return;
    }

    let mounted = true;

    const refresh = async () => {
      const next = await fetchWeatherSnapshot();
      if (mounted) setWeather(next);
    };

    void refresh();
    const interval = setInterval(() => {
      void refresh();
    }, WEATHER_REFRESH_MS);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [compact]);

  const localeDate = useMemo(() => new Date(now), [now]);
  const timeLabel = useMemo(
    () =>
      new Intl.DateTimeFormat('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }).format(localeDate),
    [localeDate],
  );
  const weekdayLabel = useMemo(
    () => normalizeWeekday(new Intl.DateTimeFormat('pt-BR', { weekday: 'short' }).format(localeDate)),
    [localeDate],
  );
  const uptimeLabel = useMemo(() => formatUptime(now - SESSION_STARTED_AT), [now]);

  return (
    <Box flexDirection="row">
      <Text color="#6b7280">{'\u23f0'} </Text>
      <Text color="#93c5fd">{timeLabel}</Text>

      <Text color="#4b5563"> {'\u00b7'} </Text>
      <Text color="#9ca3af">{weekdayLabel}</Text>

      {!compact && (
        <>
          <Text color="#4b5563"> {'\u00b7'} </Text>
          <Text color="#6b7280">{'\u23f1'} </Text>
          <Text color="#86efac">{uptimeLabel}</Text>
        </>
      )}

      {!compact && weather && (
        <>
          <Text color="#4b5563"> {'\u00b7'} </Text>
          <Text color="#6b7280">{weather.icon} </Text>
          <Text color="#fbbf24">{weather.tempC}{'\u00b0'}C</Text>
        </>
      )}
    </Box>
  );
}
