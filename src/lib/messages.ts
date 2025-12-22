import { supabase, requireSupabase } from './supabaseClient'
import { fetchProfiles } from './profiles'

export type Thread = {
  id: string
  type: 'gym' | 'partner' | 'event' | 'crew' | 'trip' | 'dm'
  title?: string
  gym_id?: string | null
  event_id?: string | null
  crew_id?: string | null
  trip_id?: string | null
  created_by?: string | null
  created_at?: string | null
}

export type ProfileLite = { id: string; username: string; avatar_url: string | null }

export type Message = {
  id: string
  thread_id: string
  sender_id: string
  receiver_id: string | null
  body: string
  status: string
  created_at: string
  profiles?: ProfileLite
}

const client = () => supabase ?? requireSupabase()

export async function fetchThreads(filter?: { type?: Thread['type']; gymId?: string; eventId?: string; crewId?: string; tripId?: string }) {
  const c = client()
  let q = c.from('threads').select('*').order('created_at', { ascending: false })
  if (filter?.type) q = q.eq('type', filter.type)
  if (filter?.gymId) q = q.eq('gym_id', filter.gymId)
  if (filter?.eventId) q = q.eq('event_id', filter.eventId)
  if (filter?.crewId) q = q.eq('crew_id', filter.crewId)
  if (filter?.tripId) q = q.eq('trip_id', filter.tripId)
  const { data, error } = await q
  if (error) throw error
  return data as Thread[]
}

export async function fetchMessages(threadId: string) {
  const c = client()
  const { data, error } = await c
    .from('messages')
    .select('id, thread_id, sender_id, receiver_id, body, status, created_at')
    .eq('thread_id', threadId)
    .order('created_at', { ascending: true })
  if (error) throw error

  const rows = data ?? []
  const senderIds = Array.from(new Set(rows.map(row => row.sender_id).filter(Boolean)))
  let profilesMap: Record<string, ProfileLite> = {}

  if (senderIds.length > 0) {
    const profiles = await fetchProfiles(c, senderIds)
    profilesMap = profiles.reduce<Record<string, ProfileLite>>((acc, profile) => {
      acc[profile.id] = {
        id: profile.id,
        username: profile.username ?? 'Climber',
        avatar_url: profile.avatar_url ?? null,
      }
      return acc
    }, {})
  }

  return rows.map(row => ({
    id: row.id,
    thread_id: row.thread_id,
    sender_id: row.sender_id,
    receiver_id: row.receiver_id ?? null,
    body: row.body,
    status: row.status,
    created_at: row.created_at,
    profiles: profilesMap[row.sender_id],
  })) as Message[]
}

export async function sendMessage(threadId: string, body: string, receiverId?: string) {
  const c = client()
  const { data: userData, error: userErr } = await c.auth.getUser()
  if (userErr || !userData.user) throw new Error('Not authenticated')
  const senderId = userData.user.id
  const receiver_id = receiverId ?? senderId
  const { error } = await c.from('messages').insert({
    thread_id: threadId,
    sender_id: senderId,
    receiver_id,
    body,
    status: 'sent',
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

/**
 * Unified unread detection logic.
 *
 * Rules:
 * - Direct chats: receiver_id === userId && sender_id !== userId && status !== 'read'
 * - Group threads: sender_id !== userId && status !== 'read' (receiver_id unreliable in groups)
 */
export type UnreadCheckMessage = {
  sender_id: string
  receiver_id: string | null
  status: string | null
}

export function isMessageUnread(
  msg: UnreadCheckMessage,
  userId: string,
  isDirect: boolean
): boolean {
  const statusLower = (msg.status ?? '').toLowerCase()
  const isRead = statusLower === 'read'
  const notFromMe = msg.sender_id !== userId
  const receiverId = msg.receiver_id ?? ''

  if (isDirect) {
    return receiverId === userId && notFromMe && !isRead
  } else {
    // Group threads: any unread message not from the current user
    return notFromMe && !isRead
  }
}

/**
 * Check if a thread has any unread messages based on the latest message.
 */
export function isThreadUnread(
  latestMsg: UnreadCheckMessage | null | undefined,
  userId: string,
  isDirect: boolean,
  hasMessages: boolean
): boolean {
  // For direct chats with no messages yet, consider as "unread" to encourage interaction
  if (!hasMessages && isDirect) return true
  if (!latestMsg) return false
  return isMessageUnread(latestMsg, userId, isDirect)
}

