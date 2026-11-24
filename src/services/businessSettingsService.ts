import { getSupabaseClient } from '../lib/supabase'
import type { DatabaseTables } from '../types/database'
import { throwDatabaseError } from './supabaseError'

type BusinessSettings = DatabaseTables['business_settings']['Row']
type BusinessSettingsInput = Pick<
  BusinessSettings,
  'business_name' | 'logo_url' | 'address' | 'contact_number' | 'email'
>

export async function getBusinessSettings(): Promise<BusinessSettings | null> {
  const { data, error } = await getSupabaseClient()
    .from('business_settings')
    .select('*')
    .eq('id', 1)
    .maybeSingle()

  if (error) throwDatabaseError('Load business settings', error)
  return data
}

export async function saveBusinessSettings(
  settings: BusinessSettingsInput,
): Promise<BusinessSettings> {
  const { data, error } = await getSupabaseClient()
    .from('business_settings')
    .upsert({ id: 1, ...settings })
    .select('*')
    .single()

  if (error) throwDatabaseError('Save business settings', error)
  return data
}
