import React, { useEffect, useRef, useState } from 'react';
import { Box, Text } from '../ink.js';
import { getTotalCostUSD, hasUnknownModelCost } from '../bootstrap/state.js';

const BAR_WIDTH = 12;
const EASE = 0.35;
const DEFAULT_BUDGET = 2.0;

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

function formatCost(usd: number): string {
  if (usd > 0 && usd < 0.01) return '<$0.01';
  return `$${usd.toFixed(2)}`;
}

interface Props {
  budget?: number; // in USD, defaults to DEFAULT_BUDGET
}

export function BudgetStatusBar({ budget = DEFAULT_BUDGET }: Props): React.ReactElement | null {
  // Read the actual accumulated cost from STATE
  const [usedCost, setUsedCost] = useState(getTotalCostUSD());

  // Poll for cost updates since STATE is a global mutable object
  // and doesn't emit React-friendly state changes
  useEffect(() => {
    const timer = setInterval(() => {
      setUsedCost(getTotalCostUSD());
    }, 500);
    return () => clearInterval(timer);
  }, []);

  const rawPct = budget > 0 ? Math.max(0, Math.round((usedCost / budget) * 100)) : 0;
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

  const barColor = exceeded || rawPct >= 85 ? '#ef4444' : getBarColor(displayPct);
  const filled = Math.round((displayPct / 100) * BAR_WIDTH);
  const empty = BAR_WIDTH - filled;
  const unknownModelCost = hasUnknownModelCost();

  if (usedCost <= 0) return null;

  return (
    <Box flexDirection="row">
      <Text color="#6b7280">$ </Text>
      <Text color="#6b7280">[</Text>
      <Text color={barColor}>{'\u25B0'.repeat(filled)}</Text>
      <Text color="#374151" dimColor>{'\u25B1'.repeat(empty)}</Text>
      <Text color="#6b7280">] </Text>
      <Text color={barColor}>{displayPct}%</Text>
      <Text color="#6b7280"> </Text>
      <Text color={barColor}>{formatCost(usedCost)}</Text>
      <Text color="#6b7280">/{formatCost(budget)}</Text>
      {exceeded && <Text color="#ef4444"> {'\u26a0'}</Text>}
      {unknownModelCost && (
        <Text color="#f59e0b"> {'\u26a0'}</Text>
      )}
      {unknownModelCost && (
        <Text color="#6b7280" dimColor> estimado</Text>
      )}
      {unknownModelCost && (
        <Text color="#a78bfa" wrap="truncate"> (/cost-model)</Text>
      )}
    </Box>
  );
}
