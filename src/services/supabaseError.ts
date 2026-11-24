import type { PostgrestError } from '@supabase/supabase-js'

export class DatabaseServiceError extends Error {
  readonly operation: string
  readonly code: string
  readonly details: string
  readonly hint: string

  constructor(operation: string, error: PostgrestError) {
    super(`${operation}: ${error.message}`)
    this.name = 'DatabaseServiceError'
    this.operation = operation
    this.code = error.code
    this.details = error.details
    this.hint = error.hint
  }
}

export function throwDatabaseError(
  operation: string,
  error: PostgrestError,
): never {
  throw new DatabaseServiceError(operation, error)
}
