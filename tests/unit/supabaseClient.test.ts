import { describe, expect, it } from 'vitest'
import {
  createSupabaseClient,
  SupabaseConfigurationError,
} from '../../src/lib/supabase'

describe('Supabase client configuration', () => {
  it('reports missing environment settings without inventing credentials', () => {
    expect(() => createSupabaseClient({})).toThrow(SupabaseConfigurationError)
  })
})
