'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import MobileNavbar from '@/components/MobileNavbar'
import { supabase } from '@/lib/supabaseClient'
import { useAuthSession } from '@/hooks/useAuthSession'
import { fetchProfiles } from '@/lib/profiles'

const ICON_BACK = '/icons/chevron-left.svg'
const ICON_MENU = '/icons/dots.svg'
const ICON_DELIVERED = 'https://www.figma.com/api/mcp/asset/8d007e14-674b-4781-b75a-1433ad6a9bd0'
const ICON_READ = 'https://www.figma.com/api/mcp/asset/b87f2116-034c-420b-860c-b640b7e7f3d2'
const ICON_SEND = '/icons/send.svg'
const STATUS_BIG = 'https://www.figma.com/api/mcp/asset/73d0a820-9b34-4bea-b239-5d0244d7c4a5'
const STATUS_SMALL = 'https://www.figma.com/api/mcp/asset/8a1f46ba-167c-42fb-911b-b54ae9cb70dc'

const AVATAR_PLACEHOLDER = 'https://www.figma.com/api/mcp/asset/ed027546-d8d0-4b5a-87e8-12db5e07cdd7'

type ThreadRow = {
  id: string
  user_a: string | null
  user_b: string | null
  type?: string | null
  gym_id?: string | null
  event_id?: string | null
  crew_id?: string | null
  title?: string | null
}

type MessageRow = {
  id: string
  thread_id: string
  sender_id: string
  receiver_id: string
  body: string
  status: 'sent' | 'delivered' | 'read'
  created_at: string
}

type Profile = {
  id: string
  username: string | null
  avatar_url: string | null
}

type Gym = {
  id: string
  name: string | null
  avatar_url: string | null
  location?: string | null
}

type EventRow = {
  id: string
  title: string | null
  location: string | null
  start_at: string | null
  slots_total: number | null
  slots_open: number | null
  image_url: string | null
  description: string | null
}

type CrewRow = {
  id: string
  title: string | null
  location: string | null
  start_at: string | null
  slots_total: number | null
  slots_open: number | null
  image_url: string | null
  description: string | null
}

export default function ChatDetailPage() {
  const params = useParams()
  const router = useRouter()
  const chatId = (params?.id as string) ?? ''
  const { session } = useAuthSession()
  const userId = session?.user?.id

  const [thread, setThread] = useState<ThreadRow | null>(null)
  const [otherProfile, setOtherProfile] = useState<Profile | null>(null)
  const [gym, setGym] = useState<Gym | null>(null)
  const [event, setEvent] = useState<EventRow | null>(null)
  const [crew, setCrew] = useState<CrewRow | null>(null)
  const [participants, setParticipants] = useState<string[]>([])
  const [messages, setMessages] = useState<MessageRow[]>([])
  const [draft, setDraft] = useState('')
  const [loading, setLoading] = useState(true)
  const [menuOpen, setMenuOpen] = useState(false)
  const [leaving, setLeaving] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement | null>(null)
  const menuRef = useRef<HTMLDivElement | null>(null)

  const otherUserId = useMemo(() => {
    if (!thread || !userId) return null
    return thread.user_a === userId ? thread.user_b : thread.user_a
  }, [thread, userId])

  const isDirect = useMemo(() => {
    return (thread?.type ?? 'direct') === 'direct'
  }, [thread])

  const isGymThread = useMemo(() => {
    return (thread?.type ?? '') === 'gym'
  }, [thread])

  const isEventThread = useMemo(() => {
    return (thread?.type ?? '') === 'event'
  }, [thread])

  const isCrewThread = useMemo(() => {
    return (thread?.type ?? '') === 'crew'
  }, [thread])

  const isGroupThread = isGymThread || isEventThread || isCrewThread

  const otherFirstName = useMemo(() => {
    const name = otherProfile?.username || ''
    if (!name) return 'User'
    const first = name.trim().split(/\s+/)[0]
    return first || 'User'
  }, [otherProfile])

  const otherFullName = useMemo(() => {
    const name = otherProfile?.username || ''
    if (!name) return 'User'
    return name.trim() || 'User'
  }, [otherProfile])

  const formatDate = (iso?: string | null) => {
    if (!iso) return ''
    const d = new Date(iso)
    return d.toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  useEffect(() => {
    const fetchData = async () => {
      const client = supabase
      if (!client || !userId || !chatId) return

      // Thread
      const { data: t, error: threadError } = await client
        .from('threads')
        .select('*')
        .eq('id', chatId)
        .single()
      if (threadError || !t) {
        router.replace('/chats')
        return
      }

      // For gym/group threads, ensure the current user is recorded as participant in threads.user_a to satisfy RLS.
      if ((t.type ?? '') === 'gym' && !t.user_a) {
        await client.from('threads').update({ user_a: userId }).eq('id', chatId)
        t.user_a = userId
      }

      // Participants for group/gym threads
      const { data: participantRows } = await client
        .from('thread_participants')
        .select('user_id')
        .eq('thread_id', chatId)

      const participantIds = (participantRows ?? []).map(p => p.user_id)
      const isDirect = (t.type ?? 'direct') === 'direct'
      // Ensure current user is recorded as participant for gym/group threads
      if (!isDirect && !participantIds.includes(userId)) {
        await client
          .from('thread_participants')
          .upsert({ thread_id: chatId, user_id: userId, role: 'member' })
        participantIds.push(userId)
      }

      // Guard participant
      const isParticipant =
        t.user_a === userId ||
        t.user_b === userId ||
        participantIds.includes(userId)

      if (!isParticipant) {
        router.replace('/chats')
        return
      }

      setThread(t)
      setParticipants(participantIds)

      // Other profile or gym
      const otherId = isDirect ? (t.user_a === userId ? t.user_b : t.user_a) : null
      if (otherId) {
        try {
          // Use fetchProfiles to get merged data from both profiles and onboardingprofiles
          const profiles = await fetchProfiles(client, [otherId])
          if (profiles.length > 0) {
            const profile = profiles[0]
            setOtherProfile({
              id: profile.id,
              username: profile.username || null,
              avatar_url: profile.avatar_url || null,
            })
          } else {
            // Fallback to just profiles table if fetchProfiles doesn't return anything
            const { data: p } = await client
              .from('profiles')
              .select('id,username,avatar_url')
              .eq('id', otherId)
              .single()
            if (p) setOtherProfile(p)
          }
        } catch (err) {
          console.error('Error fetching other profile:', err)
          // Fallback to just profiles table
          const { data: p } = await client
            .from('profiles')
            .select('id,username,avatar_url')
            .eq('id', otherId)
            .single()
          if (p) setOtherProfile(p)
        }
      }

      if (!isDirect && t.gym_id) {
        const { data: g } = await client
          .from('gyms')
          .select('id,name,avatar_url,location')
          .eq('id', t.gym_id)
          .single()
        if (g) setGym(g)
      }

      if (!isDirect && (t.type ?? '') === 'event' && t.event_id) {
        const { data: ev } = await client
          .from('events')
          .select('id,title,location,start_at,slots_total,slots_open,image_url,description')
          .eq('id', t.event_id)
          .single()
        if (ev) setEvent(ev)
      }

      if (!isDirect && (t.type ?? '') === 'crew' && t.crew_id) {
        const { data: cr } = await client
          .from('crews')
          .select('id,title,location,start_at,slots_total,slots_open,image_url,description')
          .eq('id', t.crew_id)
          .single()
        if (cr) setCrew(cr)
      }

      // Messages
      const { data: msgs, error: messagesError } = await client
        .from('messages')
        .select('*')
        .eq('thread_id', chatId)
        .order('created_at', { ascending: true })
      setMessages(msgs ?? [])
      setLoading(false)
      if (messagesError) {
        console.error('Error loading messages', messagesError)
      }
    }
    fetchData()
  }, [chatId, router, userId])

  useEffect(() => {
    const client = supabase
    if (!client || !chatId) return
    const channel = client
      .channel(`thread-${chatId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'messages', filter: `thread_id=eq.${chatId}` },
        payload => {
          if (payload.eventType === 'INSERT') {
            setMessages(prev => [...prev, payload.new as MessageRow])
          } else if (payload.eventType === 'UPDATE') {
            setMessages(prev =>
              prev.map(m => (m.id === (payload.old as MessageRow)?.id ? (payload.new as MessageRow) : m)),
            )
          }
        },
      )
      .subscribe()

    return () => {
      client.removeChannel(channel)
    }
  }, [chatId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    const client = supabase
    if (!client || !userId || !chatId || !draft.trim()) return
    const isDirect = (thread?.type ?? 'direct') === 'direct'
    if (isDirect && !otherUserId) return
    // Ensure membership for gym threads before sending
    if (!isDirect) {
      await client
        .from('thread_participants')
        .upsert({ thread_id: chatId, user_id: userId, role: 'member' })
    }
    const body = draft.trim()
    setDraft('')
    const { data, error } = await client
      .from('messages')
      .insert({
        thread_id: chatId,
        sender_id: userId,
        receiver_id: otherUserId || userId, // for group threads we still populate receiver_id to satisfy schema
        body,
        status: 'sent',
      })
      .select('*')
      .single()

    if (error) {
      console.error('Error sending message:', error?.message ?? error)
      setDraft(body) // restore draft on failure
      return
    }

    if (data) {
      setMessages(prev => [...prev, data as MessageRow])
      // Update thread last_message / last_message_at for overview freshness
      await client
        .from('threads')
        .update({ last_message: body, last_message_at: (data as MessageRow).created_at })
        .eq('id', chatId)
    }
  }

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false)
      }
    }
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [menuOpen])

  // Mark incoming messages as read when viewing the thread
  useEffect(() => {
    const client = supabase
    if (!client || !userId || !chatId || messages.length === 0) return
    const incoming = messages.filter(m => m.receiver_id === userId)
    const toDeliver = incoming.filter(m => m.status === 'sent').map(m => m.id)
    const toRead = incoming.filter(m => m.status !== 'read').map(m => m.id)
    if (toDeliver.length === 0 && toRead.length === 0) return
    ;(async () => {
      if (toDeliver.length > 0) {
        await client.from('messages').update({ status: 'delivered' }).in('id', toDeliver)
      }
      if (toRead.length > 0) {
        await client.from('messages').update({ status: 'read' }).in('id', toRead)
      }
      setMessages(prev =>
        prev.map(m => {
          if (toRead.includes(m.id)) return { ...m, status: 'read' }
          if (toDeliver.includes(m.id)) return { ...m, status: 'delivered' }
          return m
        }),
      )
    })()
  }, [messages, chatId, userId])

  const handleLeaveChat = async () => {
    const client = supabase
    if (!client || !userId || !chatId || !isDirect) {
      return
    }

    // Confirm leaving
    if (!confirm(`Are you sure you want to leave this chat with ${otherFullName}?`)) {
      return
    }

    setLeaving(true)
    setMenuOpen(false)

    // Delete the thread (for direct messages, leaving means ending the conversation)
    const { error: deleteError } = await client
      .from('threads')
      .delete()
      .eq('id', chatId)
      .or(`user_a.eq.${userId},user_b.eq.${userId}`)

    if (deleteError) {
      console.error('Error leaving chat:', deleteError)
      setLeaving(false)
      return
    }

    // Redirect to chats list
    router.push('/chats')
  }

  const statusIcon = (status?: string) => {
    if (status === 'read') return ICON_READ
    if (status === 'delivered') return ICON_DELIVERED
    return STATUS_BIG
  }

  const heroImage = isEventThread
    ? event?.image_url || AVATAR_PLACEHOLDER
    : isCrewThread
    ? crew?.image_url || AVATAR_PLACEHOLDER
    : gym?.avatar_url || otherProfile?.avatar_url || AVATAR_PLACEHOLDER
  const heroAvatar = isDirect
    ? otherProfile?.avatar_url || AVATAR_PLACEHOLDER
    : isGymThread
    ? gym?.avatar_url || AVATAR_PLACEHOLDER
    : isEventThread
    ? event?.image_url || AVATAR_PLACEHOLDER
    : isCrewThread
    ? crew?.image_url || AVATAR_PLACEHOLDER
    : AVATAR_PLACEHOLDER
  const heroTitle = thread?.title || event?.title || crew?.title || gym?.name || 'Thread Name'
  const heroSub = isEventThread ? event?.title || '' : isCrewThread ? crew?.title || '' : gym?.name || 'Gym Name'
  const heroInfoLeft = isEventThread ? event?.location || '' : isCrewThread ? crew?.location || '' : gym?.location || 'City'
  const heroInfoRight = isEventThread ? formatDate(event?.start_at) || 'Date/time' : isCrewThread ? formatDate(crew?.start_at) || 'Date/time' : '27 people are going'

  return (
    <div className={isGroupThread ? 'chat-gym-screen' : 'chat-detail-screen'} data-chat-id={chatId}>
      <div className={isGroupThread ? 'chat-gym-content' : 'chat-detail-content'}>
        {isGroupThread ? (
          <div className="chat-gym-card">
            <div className="chat-gym-backbar">
              <button type="button" className="chat-detail-icon-btn" aria-label="Back" onClick={() => router.back()}>
                <img src={ICON_BACK} alt="" width={28} height={28} />
              </button>
              <div className="chat-gym-backbar-title">back</div>
              <button type="button" className="chat-detail-icon-btn" aria-label="More options">
                <img src={ICON_MENU} alt="" width={28} height={28} />
              </button>
            </div>

            <div className="chat-gym-hero">
              <img src={heroImage} alt="" className="chat-gym-hero-img" />
              <div className="chat-gym-hero-gradient" />
              <div className="chat-gym-hero-text">
                <p className="chat-gym-thread-name">{heroTitle}</p>
                <p className="chat-gym-name">{heroSub}</p>
                <div className="chat-gym-info-row">
                  <p className="chat-gym-city">{heroInfoLeft}</p>
                  <p className="chat-gym-people">{heroInfoRight}</p>
                </div>
              </div>
            </div>

            <div className="chat-gym-divider" />

            <div className="chat-gym-messages">
              <div className="chat-gym-system">You joined this chat on 11/07/2023.</div>

              {!loading &&
                messages.map(msg =>
                  msg.sender_id === otherUserId ? (
                    <div className="chat-gym-row left" key={msg.id}>
                      <div className="chat-gym-avatar">
                        <img
                          src={otherProfile?.avatar_url || AVATAR_PLACEHOLDER}
                          alt=""
                          width={34}
                          height={34}
                          className="chat-gym-avatar-img"
                        />
                      </div>
                      <div className="chat-gym-bubble-in">
                        <span>{msg.body}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="chat-gym-row right" key={msg.id}>
                      <div className="chat-gym-bubble-out">
                        <span>{msg.body}</span>
                      </div>
                      <div className="chat-gym-status">
                        <span className="chat-gym-status-icon">
                          <img src={statusIcon(msg.status)} alt="" width={12} height={12} />
                        </span>
                        <span className="chat-gym-status-text">
                          {msg.status === 'read' ? 'Read' : msg.status === 'delivered' ? 'Delivered' : 'Sent'}
                        </span>
                      </div>
                    </div>
                  ),
                )}
              <div ref={messagesEndRef} />
            </div>

            <div className="chat-gym-divider" />

            <div className="chat-gym-input">
              <input
                type="text"
                value={draft}
                onChange={e => setDraft(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') handleSend()
                }}
                placeholder="Type a message ..."
                className="chat-gym-input-field"
              />
              <button type="button" className="chat-gym-send-btn" onClick={handleSend}>
                <img src={ICON_SEND} alt="" width={24} height={24} />
              </button>
            </div>
          </div>
        ) : (
          <div className="chat-detail-card">
            <header className="chat-detail-header">
              <button type="button" className="chat-detail-icon-btn" aria-label="Back" onClick={() => router.back()}>
                <img src={ICON_BACK} alt="" width={24} height={24} />
              </button>
              <div className="chat-detail-partner">
                <div className="chat-detail-avatar">
                  <img src={otherProfile?.avatar_url || AVATAR_PLACEHOLDER} alt="" width={34} height={34} className="chat-detail-avatar-img" />
                </div>
                <div className="chat-detail-name">{otherFirstName}</div>
              </div>
              <div style={{ position: 'relative' }} ref={menuRef}>
                <button
                  type="button"
                  className="chat-detail-icon-btn"
                  aria-label="More options"
                  onClick={() => setMenuOpen(!menuOpen)}
                >
                  <img src={ICON_MENU} alt="" width={24} height={24} />
                </button>
                {menuOpen && isDirect && (
                  <div
                    className="mh-silver-dropdown-menu mh-silver-dropdown-right"
                    style={{
                      position: 'absolute',
                      top: 'calc(100% + 8px)',
                      right: 0,
                      zIndex: 1000,
                      minWidth: '200px',
                      background: 'var(--color-surface-card)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--color-stroke)',
                      padding: '4px 0',
                    }}
                  >
                    <button
                      type="button"
                      className="mh-silver-dropdown-item"
                      onClick={handleLeaveChat}
                      disabled={leaving}
                      style={{
                        display: 'block',
                        width: '100%',
                        padding: 'var(--space-md) var(--space-lg)',
                        background: 'transparent',
                        border: 'none',
                        textAlign: 'left',
                        color: leaving ? 'var(--color-text-muted)' : 'var(--color-text-default)',
                        fontFamily: 'var(--fontfamily-inter)',
                        fontSize: '14px',
                        fontWeight: 500,
                        cursor: leaving ? 'not-allowed' : 'pointer',
                        opacity: leaving ? 0.6 : 1,
                      }}
                    >
                      {leaving ? 'Leaving...' : `Leave chat with ${otherFirstName}`}
                    </button>
                  </div>
                )}
              </div>
            </header>

            <div className="chat-detail-divider" />

            <div className="chat-detail-messages">
              <div className="chat-detail-system">
                You connected with {otherFirstName} on 11/07/2023.
              </div>

              {!loading &&
                messages.map(msg =>
                  msg.sender_id === otherUserId ? (
                    <div className="chat-detail-row left" key={msg.id}>
                      <div className="chat-detail-avatar chat-detail-avatar-small">
                        <img src={otherProfile?.avatar_url || AVATAR_PLACEHOLDER} alt="" width={34} height={34} className="chat-detail-avatar-img" />
                      </div>
                      <div className="chat-detail-bubble chat-detail-bubble-left">
                        <span>{msg.body}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="chat-detail-row right" key={msg.id}>
                      <div className="chat-detail-bubble chat-detail-bubble-right">
                        <span>{msg.body}</span>
                      </div>
                      <div className="chat-detail-status">
                        <span className="chat-status-indicator">
                          <span className="chat-status-indicator-circle">
                            <img src={STATUS_BIG} alt="" width={12} height={12} />
                          </span>
                          <span className="chat-status-indicator-small">
                            <img src={STATUS_SMALL} alt="" width={8} height={8} />
                          </span>
                        </span>
                        <span className="chat-detail-status-text">
                          {msg.status === 'read' ? 'Read' : msg.status === 'delivered' ? 'Delivered' : 'Sent'}
                        </span>
                      </div>
                    </div>
                  ),
                )}
              <div ref={messagesEndRef} />
            </div>

            <div className="chat-detail-divider" />

            <div className="chat-detail-input">
              <input
                type="text"
                value={draft}
                onChange={e => setDraft(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') handleSend()
                }}
                placeholder="Type a message ..."
                className="chat-detail-input-field"
              />
              <button type="button" className="chat-detail-send-btn" onClick={handleSend}>
                <img src={ICON_SEND} alt="" width={24} height={24} />
              </button>
            </div>
          </div>
        )}
        <MobileNavbar active="chats" />
      </div>
    </div>
  )
}

