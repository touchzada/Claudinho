// Stub — types not included in source snapshot
export const OUTPUTS_SUBDIR = 'tool-results'

export interface PersistedFile {
  path: string
  content: string
  size: number
}

export type TurnStartTime = number

export const DEFAULT_UPLOAD_CONCURRENCY = 5
export const FILE_COUNT_LIMIT = 100
