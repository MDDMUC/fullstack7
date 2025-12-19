import { requireSupabase } from './supabaseClient'

export type Block = {
  id: string
  blocker_id: string
  blocked_id: string
  created_at: string
  reason?: string | null
}

export async function blockUser(blockedId: string, reason?: string): Promise<Block> {
  const supabase = requireSupabase()
  const { data: userData, error: userErr } = await supabase.auth.getUser()
  if (userErr) throw userErr
  const userId = userData.user?.id
  if (!userId) throw new Error('Not authenticated')
  if (userId === blockedId) throw new Error('Cannot block yourself')

  const { data, error } = await supabase
    .from('blocks')
    .insert({ blocker_id: userId, blocked_id: blockedId, reason })
    .select()
    .single()

  if (error) throw error
  return data as Block
}

export async function unblockUser(blockedId: string): Promise<void> {
  const supabase = requireSupabase()
  const { data: userData, error: userErr } = await supabase.auth.getUser()
  if (userErr) throw userErr
  const userId = userData.user?.id
  if (!userId) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('blocks')
    .delete()
    .eq('blocker_id', userId)
    .eq('blocked_id', blockedId)

  if (error) throw error
}

export async function isUserBlocked(blockedId: string): Promise<boolean> {
  const supabase = requireSupabase()
  const { data: userData, error: userErr } = await supabase.auth.getUser()
  if (userErr) throw userErr
  const userId = userData.user?.id
  if (!userId) return false

  const { data, error } = await supabase
    .from('blocks')
    .select('id')
    .eq('blocker_id', userId)
    .eq('blocked_id', blockedId)
    .maybeSingle()

  if (error) throw error
  return !!data
}

export async function getBlockedUsers(): Promise<string[]> {
  const supabase = requireSupabase()
  const { data: userData, error: userErr } = await supabase.auth.getUser()
  if (userErr) throw userErr
  const userId = userData.user?.id
  if (!userId) return []

  const { data, error } = await supabase
    .from('blocks')
    .select('blocked_id')
    .eq('blocker_id', userId)

  if (error) throw error
  return (data ?? []).map(b => b.blocked_id)
}
