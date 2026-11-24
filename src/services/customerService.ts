import { getSupabaseClient } from '../lib/supabase'
import type { DatabaseTables } from '../types/database'
import { throwDatabaseError } from './supabaseError'

type Customer = DatabaseTables['customers']['Row']
type NewCustomer = DatabaseTables['customers']['Insert']

export async function listCustomers(): Promise<Customer[]> {
  const { data, error } = await getSupabaseClient()
    .from('customers')
    .select('*')
    .order('full_name', { ascending: true })

  if (error) throwDatabaseError('Load customers', error)
  return data
}

export async function searchCustomersByName(query: string): Promise<Customer[]> {
  const { data, error } = await getSupabaseClient()
    .from('customers')
    .select('*')
    .ilike('full_name', `%${query}%`)
    .order('full_name', { ascending: true })

  if (error) throwDatabaseError('Search customers by name', error)
  return data
}

export async function searchCustomersByMobile(
  query: string,
): Promise<Customer[]> {
  const { data, error } = await getSupabaseClient()
    .from('customers')
    .select('*')
    .ilike('mobile_number', `%${query}%`)
    .order('full_name', { ascending: true })

  if (error) throwDatabaseError('Search customers by mobile number', error)
  return data
}

export async function createCustomer(input: NewCustomer): Promise<Customer> {
  const { data, error } = await getSupabaseClient()
    .from('customers')
    .insert(input)
    .select('*')
    .single()

  if (error) throwDatabaseError('Create customer', error)
  return data
}

export async function addCustomerToMembership(
  membershipId: string,
  customerId: string,
): Promise<void> {
  const { error } = await getSupabaseClient().rpc('add_customer_to_membership', {
    p_membership_id: membershipId,
    p_customer_id: customerId,
  })

  if (error) throwDatabaseError('Add customer to membership', error)
}

export async function removeCustomerFromMembership(
  membershipId: string,
  customerId: string,
): Promise<void> {
  const { error } = await getSupabaseClient().rpc(
    'remove_customer_from_membership',
    {
      p_membership_id: membershipId,
      p_customer_id: customerId,
    },
  )

  if (error) throwDatabaseError('Remove customer from membership', error)
}

export async function archiveCustomer(customerId: string): Promise<void> {
  const { error } = await getSupabaseClient().rpc('archive_customer', {
    p_customer_id: customerId,
  })

  if (error) throwDatabaseError('Archive customer', error)
}

export async function deleteCustomerWithoutFinancialHistory(
  customerId: string,
): Promise<void> {
  const { error } = await getSupabaseClient().rpc(
    'delete_customer_if_no_financial_history',
    { p_customer_id: customerId },
  )

  if (error) throwDatabaseError('Delete customer', error)
}
