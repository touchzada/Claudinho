// Stub — original type not included in source snapshot
export interface ConnectorTextBlock {
  type: 'connector_text'
  text: string
}

export interface ConnectorTextDelta {
  type: 'connector_text_delta'
  text: string
}

export function isConnectorTextBlock(block: unknown): block is ConnectorTextBlock {
  return (
    typeof block === 'object' &&
    block !== null &&
    (block as Record<string, unknown>).type === 'connector_text'
  )
}
