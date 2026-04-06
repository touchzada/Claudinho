import React from 'react';
import { Box, Text } from '../ink.js';
import { hasUnknownModelCost } from '../bootstrap/state.js';

export function UnknownModelWarning(): React.ReactElement | null {
  if (!hasUnknownModelCost()) return null;

  return (
    <Box flexDirection="row" gap={1}>
      <Text color="#f59e0b">⚠</Text>
      <Text color="#6b7280" wrap="truncate">Modelo desconhecido — custo estimado. Configure com </Text>
      <Text color="#a78bfa" wrap="truncate">/cost-model</Text>
    </Box>
  );
}
