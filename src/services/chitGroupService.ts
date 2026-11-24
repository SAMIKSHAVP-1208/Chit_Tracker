import { getSupabaseClient } from '../lib/supabase'
import type { ChitGroupStatus, DatabaseTables } from '../types/database'
import { throwDatabaseError } from './supabaseError'

type ChitGroup = DatabaseTables['chit_groups']['Row']
type NewChitGroup = DatabaseTables['chit_groups']['Insert']

export async function listChitGroups(
  status?: ChitGroupStatus,
): Promise<ChitGroup[]> {
  let query = getSupabaseClient()
    .from('chit_groups')
    .select('*')
    .order('created_at', { ascending: false })

  if (status) query = query.eq('status', status)

  const { data, error } = await query
  if (error) throwDatabaseError('Load chit groups', error)
  return data
}

export async function createChitGroup(
  input: NewChitGroup,
): Promise<ChitGroup> {
  const { data, error } = await getSupabaseClient()
    .from('chit_groups')
    .insert(input)
    .select('*')
    .single()

  if (error) throwDatabaseError('Create chit group', error)
  return data
}

export async function archiveChitGroup(chitGroupId: string): Promise<void> {
  const { error } = await getSupabaseClient().rpc('archive_chit_group', {
    p_chit_group_id: chitGroupId,
  })

  if (error) throwDatabaseError('Archive chit group', error)
}

export async function deleteChitGroupWithoutFinancialHistory(
  chitGroupId: string,
): Promise<void> {
  const { error } = await getSupabaseClient().rpc(
    'delete_chit_group_if_no_financial_history',
    { p_chit_group_id: chitGroupId },
  )

  if (error) throwDatabaseError('Delete chit group', error)
}
