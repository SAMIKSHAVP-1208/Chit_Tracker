import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '../types/database'

export type SupabaseEnvironment = {
  VITE_SUPABASE_URL?: string
  VITE_SUPABASE_ANON_KEY?: string
}

export class SupabaseConfigurationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'SupabaseConfigurationError'
  }
}

let client: SupabaseClient<Database> | undefined

export function createSupabaseClient(
  environment: SupabaseEnvironment = import.meta.env,
): SupabaseClient<Database> {
  const url = environment.VITE_SUPABASE_URL?.trim()
  const anonKey = environment.VITE_SUPABASE_ANON_KEY?.trim()

  if (!url || !anonKey) {
    throw new SupabaseConfigurationError(
      'Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local before using Supabase services.',
    )
  }

  let parsedUrl: URL
  try {
    parsedUrl = new URL(url)
  } catch (error) {
    if (error instanceof TypeError) {
      throw new SupabaseConfigurationError('VITE_SUPABASE_URL must be a valid URL.')
    }
    throw error
  }

  const isLocalHttp =
    parsedUrl.protocol === 'http:' &&
    ['localhost', '127.0.0.1', '[::1]'].includes(parsedUrl.hostname)

  if (
    (parsedUrl.protocol !== 'https:' && !isLocalHttp) ||
    parsedUrl.username.length > 0 ||
    parsedUrl.password.length > 0
  ) {
    throw new SupabaseConfigurationError(
      'Use an HTTPS Supabase URL, or HTTP on localhost for local development. Do not include URL credentials.',
    )
  }

  return createClient<Database>(url, anonKey, {
    auth: {
      autoRefreshToken: true,
      detectSessionInUrl: true,
      persistSession: true,
    },
  })
}

export function getSupabaseClient(): SupabaseClient<Database> {
  if (!client) client = createSupabaseClient()
  return client
}
