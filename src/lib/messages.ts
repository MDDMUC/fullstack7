import { supabase, requireSupabase } from './supabaseClient'

export type Thread = {
  id: string
  type: 'gym' | 'partner' | 'event' | 'trip' | 'dm'
  title?: string
  gym_id?: string | null
  event_id?: string | null
  trip_id?: string | null
  created_by?: string | null
  created_at?: string | null
}

export type ProfileLite = { id: string; username: string; avatar_url: string | null }

export type Message = {
  id: string
  thread_id: string
  user_id: string
  body: string
  created_at: string
  profiles?: ProfileLite
}

const client = () => supabase ?? requireSupabase()

export async function fetchThreads(filter?: { type?: Thread['type']; gymId?: string; eventId?: string; tripId?: string }) {
  const c = client()
  let q = c.from('threads').select('*').order('created_at', { ascending: false })
  if (filter?.type) q = q.eq('type', filter.type)
  if (filter?.gymId) q = q.eq('gym_id', filter.gymId)
  if (filter?.eventId) q = q.eq('event_id', filter.eventId)
  if (filter?.tripId) q = q.eq('trip_id', filter.tripId)
  const { data, error } = await q
  if (error) throw error
  return data as Thread[]
}

export async function fetchMessages(threadId: string) {
  const c = client()
  const { data, error } = await c
    .from('messages')
    .select('id, thread_id, user_id, body, created_at, profiles:profiles!messages_user_id_fkey(id, username, avatar_url)')
    .eq('thread_id', threadId)
    .order('created_at', { ascending: true })
  if (error) throw error
  return (data ?? []).map(row => ({
    id: row.id,
    thread_id: row.thread_id,
    user_id: row.user_id,
    body: row.body,
    created_at: row.created_at,
    profiles: Array.isArray((row as any).profiles) ? (row as any).profiles[0] : (row as any).profiles,
  })) as Message[]
}

export async function sendMessage(threadId: string, body: string) {
  const c = client()
  const { data: userData, error: userErr } = await c.auth.getUser()
  if (userErr || !userData.user) throw new Error('Not authenticated')
  const { error } = await c.from('messages').insert({
    thread_id: threadId,
    user_id: userData.user.id,
    body,
  })
  if (error) throw error
}

export function subscribeToThread(threadId: string, cb: (msg: Message) => void) {
  const c = client()
  return c
    .channel(`messages-${threadId}`)
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'messages', filter: `thread_id=eq.${threadId}` },
      payload => cb(payload.new as Message)
    )
    .subscribe()
}
