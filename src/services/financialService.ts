import { getSupabaseClient } from '../lib/supabase'
import type { DatabaseTables } from '../types/database'
import { throwDatabaseError } from './supabaseError'

type MonthlyAuction = DatabaseTables['monthly_auctions']['Row']
type Collection = DatabaseTables['collections']['Row']
type CollectionPayment = DatabaseTables['collection_payments']['Row']
type WinnerPayout = DatabaseTables['winner_payouts']['Row']
type PayoutPayment = DatabaseTables['payout_payments']['Row']

type ScheduledAuctionInput = Pick<
  DatabaseTables['monthly_auctions']['Insert'],
  | 'chit_group_id'
  | 'month_number'
  | 'auction_date'
  | 'auction_sequence_position'
>

type CollectionObligationInput = Pick<
  DatabaseTables['collections']['Insert'],
  'chit_group_id' | 'membership_id' | 'auction_id' | 'expected_amount'
>

type CollectionPaymentInput = DatabaseTables['collection_payments']['Insert']

type WinnerPayoutInput = Pick<
  DatabaseTables['winner_payouts']['Insert'],
  'chit_group_id' | 'auction_id' | 'winning_membership_id' | 'calculated_payout'
>

type PayoutPaymentInput = DatabaseTables['payout_payments']['Insert']

export async function listMonthlyAuctions(
  chitGroupId: string,
): Promise<MonthlyAuction[]> {
  const { data, error } = await getSupabaseClient()
    .from('monthly_auctions')
    .select('*')
    .eq('chit_group_id', chitGroupId)
    .order('month_number', { ascending: true })

  if (error) throwDatabaseError('Load monthly auctions', error)
  return data
}

export async function createScheduledAuction(
  input: ScheduledAuctionInput,
): Promise<MonthlyAuction> {
  const { data, error } = await getSupabaseClient()
    .from('monthly_auctions')
    .insert(input)
    .select('*')
    .single()

  if (error) throwDatabaseError('Create scheduled auction', error)
  return data
}

export async function createCollectionObligation(
  input: CollectionObligationInput,
): Promise<Collection> {
  const { data, error } = await getSupabaseClient()
    .from('collections')
    .insert({
      ...input,
      amount_paid: 0,
      remaining_balance: input.expected_amount,
      payment_status: 'pending',
    })
    .select('*')
    .single()

  if (error) throwDatabaseError('Create collection obligation', error)
  return data
}

export async function listCollectionsForAuction(
  auctionId: string,
): Promise<Collection[]> {
  const { data, error } = await getSupabaseClient()
    .from('collections')
    .select('*')
    .eq('auction_id', auctionId)
    .order('created_at', { ascending: true })

  if (error) throwDatabaseError('Load collections', error)
  return data
}

export async function recordCollectionPayment(
  input: CollectionPaymentInput,
): Promise<CollectionPayment> {
  const { data, error } = await getSupabaseClient()
    .from('collection_payments')
    .insert(input)
    .select('*')
    .single()

  if (error) throwDatabaseError('Record collection payment', error)
  return data
}

export async function listCollectionPaymentHistory(
  collectionId: string,
): Promise<CollectionPayment[]> {
  const { data, error } = await getSupabaseClient()
    .from('collection_payments')
    .select('*')
    .eq('collection_id', collectionId)
    .order('payment_date', { ascending: false })
    .order('created_at', { ascending: false })

  if (error) throwDatabaseError('Load collection payment history', error)
  return data
}

export async function createWinnerPayout(
  input: WinnerPayoutInput,
): Promise<WinnerPayout> {
  const { data, error } = await getSupabaseClient()
    .from('winner_payouts')
    .insert({
      ...input,
      actual_amount_paid: 0,
      remaining_balance: input.calculated_payout,
      payout_status: 'pending',
    })
    .select('*')
    .single()

  if (error) throwDatabaseError('Create winner payout', error)
  return data
}

export async function recordPayoutPayment(
  input: PayoutPaymentInput,
): Promise<PayoutPayment> {
  const { data, error } = await getSupabaseClient()
    .from('payout_payments')
    .insert(input)
    .select('*')
    .single()

  if (error) throwDatabaseError('Record payout payment', error)
  return data
}

export async function listPayoutPaymentHistory(
  payoutId: string,
): Promise<PayoutPayment[]> {
  const { data, error } = await getSupabaseClient()
    .from('payout_payments')
    .select('*')
    .eq('payout_id', payoutId)
    .order('payment_date', { ascending: false })
    .order('created_at', { ascending: false })

  if (error) throwDatabaseError('Load payout payment history', error)
  return data
}
