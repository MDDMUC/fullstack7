// src/lib/messages.ts
import { requireSupabase } from './supabaseClient'
import { safeGetUser } from './authUtils'

export type Message = {
  id: string
  match_id: string
  sender: string
  body: string
  created_at: string
}

export async function listMessages(matchId: string): Promise<Message[]> {
  const supabase = requireSupabase()
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('match_id', matchId)
    .order('created_at', { ascending: true })

  if (error) throw error
  return data ?? []
}

export async function sendMessage(matchId: string, body: string): Promise<Message> {
  const supabase = requireSupabase()
  const { user, error: userErr } = await safeGetUser(supabase)
  if (userErr) throw userErr
  const userId = user?.id
  if (!userId) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('messages')
    .insert({ match_id: matchId, sender: userId, body })
    .select()
    .single()

  if (error) throw error
  return data
}

export function subscribeToMessages(matchId: string, onMessage: (msg: Message) => void) {
  const supabase = requireSupabase()
  const channel = supabase
    .channel(`messages:${matchId}`)
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'messages', filter: `match_id=eq.${matchId}` },
      payload => onMessage(payload.new as Message)
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}
