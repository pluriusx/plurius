import 'server-only'

interface SupabaseQueryError {
  code?: string
  message: string
  details?: string | null
  hint?: string | null
}

export function assertNoSupabaseError(
  error: SupabaseQueryError | null,
  context: string,
) {
  if (!error) {
    return
  }

  throw new Error(`${context}: ${error.message}`)
}

export function requireSupabaseData<T>(
  data: T | null | undefined,
  context: string,
): T {
  if (data === null || data === undefined) {
    throw new Error(context)
  }

  return data
}

export function isSupabaseDuplicateError(
  error: SupabaseQueryError | null,
  constraintName?: string,
) {
  if (!error || error.code !== '23505') {
    return false
  }

  if (!constraintName) {
    return true
  }

  return error.message.includes(constraintName)
}

export function parseSupabaseNumber(value: number | string | null | undefined) {
  if (typeof value === 'number') {
    return Number.isNaN(value) ? 0 : value
  }

  if (typeof value === 'string') {
    const parsed = Number(value)
    return Number.isNaN(parsed) ? 0 : parsed
  }

  return 0
}

export function parseSupabaseNullableNumber(
  value: number | string | null | undefined,
) {
  if (value === null || value === undefined || value === '') {
    return null
  }

  if (typeof value === 'number') {
    return Number.isNaN(value) ? null : value
  }

  const parsed = Number(value)
  return Number.isNaN(parsed) ? null : parsed
}
