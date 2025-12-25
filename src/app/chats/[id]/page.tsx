'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import MobileNavbar from '@/components/MobileNavbar'
import BackBar from '@/components/BackBar'
import { ChatMessage } from '@/components/ChatMessage'
import ActionMenu from '@/components/ActionMenu'
import ReportModal from '@/components/ReportModal'
import { supabase } from '@/lib/supabaseClient'
import { useAuthSession } from '@/hooks/useAuthSession'
import { fetchProfiles, Profile } from '@/lib/profiles'
import { blockUser } from '@/lib/blocks'

const ICON_BACK = '/icons/chevron-left.svg'
const ICON_MENU = '/icons/dots.svg'
const ICON_DELIVERED = 'https://www.figma.com/api/mcp/asset/8d007e14-674b-4781-b75a-1433ad6a9bd0'
const ICON_READ = 'https://www.figma.com/api/mcp/asset/b87f2116-034c-420b-860c-b640b7e7f3d2'
const ICON_SEND = '/icons/send.svg'
const STATUS_BIG = 'https://www.figma.com/api/mcp/asset/73d0a820-9b34-4bea-b239-5d0244d7c4a5'
const STATUS_SMALL = 'https://www.figma.com/api/mcp/asset/8a1f46ba-167c-42fb-911b-b54ae9cb70dc'

const AVATAR_PLACEHOLDER = '/avatar-fallback.jpg'

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
  created_by: string | null
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
  const [profiles, setProfiles] = useState<Record<string, Profile>>({})
  const [gym, setGym] = useState<Gym | null>(null)
  const [event, setEvent] = useState<EventRow | null>(null)
  const [crew, setCrew] = useState<CrewRow | null>(null)
  const [participants, setParticipants] = useState<string[]>([])
  const [messages, setMessages] = useState<MessageRow[]>([])
  const [draft, setDraft] = useState('')
  const [loading, setLoading] = useState(true)
  const [menuOpen, setMenuOpen] = useState(false)
  const [groupMenuOpen, setGroupMenuOpen] = useState(false)
  const [leaving, setLeaving] = useState(false)
  const [blocking, setBlocking] = useState(false)
  const [reportModalOpen, setReportModalOpen] = useState(false)
  const [deletingEvent, setDeletingEvent] = useState(false)
  const [sending, setSending] = useState(false)
  const [sendError, setSendError] = useState<{ body: string; error: string } | null>(null)
  const messagesEndRef = useRef<HTMLDivElement | null>(null)
  const menuRef = useRef<HTMLDivElement | null>(null)
  const groupMenuRef = useRef<HTMLDivElement | null>(null)

  // Rate limiting: max 5 messages per 10 seconds
  const RATE_LIMIT_MAX = 5
  const RATE_LIMIT_WINDOW_MS = 10000
  const messageTimes = useRef<number[]>([])
  const [rateLimited, setRateLimited] = useState(false)

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
            setOtherProfile(profile)
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
          .select('id,title,location,start_at,slots_total,slots_open,image_url,description,created_by')
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
      
      // Fetch profiles for all message senders (for ALL thread types, including direct chats)
      const profilesMap: Record<string, Profile> = {}
      
      if (msgs && msgs.length > 0) {
        // Get all unique sender IDs (exclude current user)
        const senderIds = Array.from(new Set(
          msgs
            .map((m: MessageRow) => m.sender_id)
            .filter((id): id is string => !!id && id !== userId)
        ))
        
        if (senderIds.length > 0) {
          try {
            const senderProfiles = await fetchProfiles(client, senderIds)
            senderProfiles.forEach(p => {
              if (p.id) profilesMap[p.id] = p
            })
            console.log('Fetched profiles for senders:', Object.keys(profilesMap).length, 'profiles', senderIds, senderProfiles.map(p => ({ id: p.id, username: p.username })))
          } catch (err) {
            console.error('Error fetching sender profiles:', err)
          }
        }
      }
      
      // For direct chats, merge in otherProfile if we have it
      if (isDirect && otherProfile?.id) {
        profilesMap[otherProfile.id] = otherProfile as Profile
      }
      
      setProfiles(profilesMap)
      
      setLoading(false)
      if (messagesError) {
        console.error('Error loading messages', messagesError)
      }
    }
    fetchData()
  }, [chatId, router, userId])

  // Fetch missing profiles when messages change
  useEffect(() => {
    const client = supabase
    if (!client || !userId || messages.length === 0) return

    // Get all sender IDs that we don't have profiles for
    const missingSenderIds = Array.from(new Set(
      messages
        .map(m => m.sender_id)
        .filter((id): id is string => 
          !!id && 
          id !== userId && 
          !profiles[id] && 
          !(isDirect && id === otherUserId && otherProfile)
        )
    ))

    if (missingSenderIds.length > 0) {
      console.log('Fetching missing profiles for senders:', missingSenderIds)
      fetchProfiles(client, missingSenderIds).then(senderProfiles => {
        const newProfiles: Record<string, Profile> = {}
        senderProfiles.forEach(p => {
          if (p.id) newProfiles[p.id] = p
        })
        if (Object.keys(newProfiles).length > 0) {
          setProfiles(prev => ({ ...prev, ...newProfiles }))
          console.log('Added profiles:', Object.keys(newProfiles))
        }
      }).catch(err => {
        console.error('Error fetching missing profiles:', err)
      })
    }
  }, [messages, profiles, userId, isDirect, otherUserId, otherProfile])

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
            const newMsg = payload.new as MessageRow
            // Only add if not already in the list (prevents duplicates from optimistic updates)
            setMessages(prev => {
              if (prev.some(m => m.id === newMsg.id)) return prev
              return [...prev, newMsg]
            })
            // Fetch profile for new message sender if not already cached
            if (newMsg.sender_id && newMsg.sender_id !== userId) {
              setProfiles(prev => {
                if (prev[newMsg.sender_id]) return prev
                fetchProfiles(client, [newMsg.sender_id]).then(profiles => {
                  if (profiles.length > 0 && profiles[0].id) {
                    setProfiles(prevProfiles => ({ ...prevProfiles, [profiles[0].id]: profiles[0] }))
                  }
                })
                return prev
              })
            }
          } else if (payload.eventType === 'UPDATE') {
            const updated = payload.new as MessageRow
            setMessages(prev =>
              prev.map(m => (m.id === updated.id ? updated : m)),
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

  const handleSend = async (retryBody?: string) => {
    const client = supabase
    const messageBody = retryBody || draft.trim()
    if (!client || !userId || !chatId || !messageBody) return
    const isDirect = (thread?.type ?? 'direct') === 'direct'
    if (isDirect && !otherUserId) return

    // Rate limiting check
    const now = Date.now()
    messageTimes.current = messageTimes.current.filter(t => now - t < RATE_LIMIT_WINDOW_MS)
    if (messageTimes.current.length >= RATE_LIMIT_MAX) {
      setRateLimited(true)
      setSendError({ body: messageBody, error: 'Slow down! You can send up to 5 messages per 10 seconds.' })
      setTimeout(() => setRateLimited(false), RATE_LIMIT_WINDOW_MS)
      return
    }
    messageTimes.current.push(now)

    setSending(true)
    setSendError(null)
    if (!retryBody) setDraft('')

    // Ensure membership for gym threads before sending
    if (!isDirect) {
      await client
        .from('thread_participants')
        .upsert({ thread_id: chatId, user_id: userId, role: 'member' })
    }

    const { data, error } = await client
      .from('messages')
      .insert({
        thread_id: chatId,
        sender_id: userId,
        receiver_id: otherUserId || userId, // for group threads we still populate receiver_id to satisfy schema
        body: messageBody,
        status: 'sent',
      })
      .select('*')
      .single()

    setSending(false)

    if (error) {
      console.error('Error sending message:', error?.message ?? error)
      setSendError({ body: messageBody, error: error.message || 'Failed to send message' })
      return
    }

    if (data) {
      setMessages(prev => [...prev, data as MessageRow])
      // Update thread last_message / last_message_at for overview freshness
      await client
        .from('threads')
        .update({ last_message: messageBody, last_message_at: (data as MessageRow).created_at })
        .eq('id', chatId)
    }
  }

  const handleRetry = () => {
    if (sendError?.body) {
      handleSend(sendError.body)
    }
  }

  const handleClearError = () => {
    if (sendError?.body) {
      setDraft(sendError.body) // restore to draft for editing
    }
    setSendError(null)
  }

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false)
      }
      if (groupMenuRef.current && !groupMenuRef.current.contains(event.target as Node)) {
        setGroupMenuOpen(false)
      }
    }
    if (menuOpen || groupMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [menuOpen, groupMenuOpen])

  // Mark incoming messages as read when viewing the thread
  // For direct chats: only mark messages where user is receiver AND not sender
  // For group chats: mark any message not from current user (receiver_id is unreliable in groups)
  useEffect(() => {
    const client = supabase
    if (!client || !userId || !chatId || messages.length === 0) return
    // For group threads, receiver_id is set to sender, so we can't use it reliably
    // Instead, mark any non-sender message as read for groups
    const isGroup = isGroupThread
    const incoming = isGroup
      ? messages.filter(m => m.sender_id !== userId)
      : messages.filter(m => m.receiver_id === userId && m.sender_id !== userId)
    // Status flow: sent -> delivered -> read (respect sequence)
    const toDeliver = incoming.filter(m => m.status === 'sent').map(m => m.id)
    const toRead = incoming.filter(m => m.status === 'delivered').map(m => m.id)
    if (toDeliver.length === 0 && toRead.length === 0) return
    ;(async () => {
      // First mark 'sent' as 'delivered'
      if (toDeliver.length > 0) {
        await client.from('messages').update({ status: 'delivered' }).in('id', toDeliver)
      }
      // Then mark 'delivered' as 'read' (only messages that were already delivered)
      if (toRead.length > 0) {
        await client.from('messages').update({ status: 'read' }).in('id', toRead)
      }
      // Also mark newly delivered messages as read in next tick (for immediate read on view)
      if (toDeliver.length > 0) {
        await client.from('messages').update({ status: 'read' }).in('id', toDeliver)
      }
      setMessages(prev =>
        prev.map(m => {
          if (toRead.includes(m.id) || toDeliver.includes(m.id)) return { ...m, status: 'read' }
          return m
        }),
      )
    })()
  }, [messages, chatId, userId, isGroupThread])

  const handleLeaveChat = async () => {
    const client = supabase
    if (!client || !userId || !chatId) {
      return
    }

    const chatName = isDirect ? otherFullName : isEventThread ? event?.title || 'this event chat' : isGymThread ? gym?.name || 'this gym chat' : 'this chat'

    // Confirm leaving
    if (!confirm(`Are you sure you want to leave ${chatName}?`)) {
      return
    }

    setLeaving(true)
    setMenuOpen(false)
    setGroupMenuOpen(false)

    if (isDirect) {
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
    } else {
      // For group threads, remove user from participants
      const { error: leaveError } = await client
        .from('thread_participants')
        .delete()
        .eq('thread_id', chatId)
        .eq('user_id', userId)

      if (leaveError) {
        console.error('Error leaving chat:', leaveError)
        setLeaving(false)
        return
      }
    }

    // Redirect to chats list
    router.push('/chats')
  }

  const handleBlockUser = async () => {
    if (!otherUserId) return
    setBlocking(true)
    try {
      await blockUser(otherUserId)
      setMenuOpen(false)
      // After blocking, leave the chat and redirect
      router.push('/chats')
    } catch (err) {
      console.error('block failed', err)
    }
    setBlocking(false)
  }

  const handleOpenReport = () => {
    setMenuOpen(false)
    setReportModalOpen(true)
  }

  const handleDeleteEventChat = async () => {
    const client = supabase
    if (!client || !userId || !chatId || !isEventThread || !event) {
      return
    }

    // Confirm deletion
    if (!confirm(`Are you sure you want to delete the chat for "${event.title}"? This action cannot be undone.`)) {
      return
    }

    setDeletingEvent(true)
    setGroupMenuOpen(false)

    // Delete the event thread
    const { error: deleteError } = await client
      .from('threads')
      .delete()
      .eq('id', chatId)
      .eq('type', 'event')
      .eq('event_id', event.id)

    if (deleteError) {
      console.error('Error deleting event chat:', deleteError)
      setDeletingEvent(false)
      return
    }

    // Redirect to chats list
    router.push('/chats')
  }

  const isEventCreator = event?.created_by === userId

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
            <BackBar
              onBackClick={() => router.back()}
              backText="back"
              className="chats-event-backbar"
              rightSlot={
                <div style={{ position: 'relative' }}>
                  <button
                    type="button"
                    className="chats-event-menu"
                    aria-label="More options"
                    onClick={() => setGroupMenuOpen(!groupMenuOpen)}
                  >
                    <img src={ICON_MENU} alt="" className="chats-event-menu-icon" />
                  </button>
                  <ActionMenu
                    open={groupMenuOpen}
                    onClose={() => setGroupMenuOpen(false)}
                    items={[
                    ...(isEventThread && isEventCreator ? [{
                      label: 'Delete Event Chat',
                      onClick: handleDeleteEventChat,
                      loading: deletingEvent,
                      loadingLabel: 'Deleting...',
                      danger: true,
                    }] : []),
                    {
                      label: `Leave ${isEventThread ? 'event' : 'gym'} chat`,
                      onClick: handleLeaveChat,
                      loading: leaving,
                      loadingLabel: 'Leaving...',
                    },
                  ]}
                />
              </div>
            }
            />

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
                messages.map(msg => {
                  const isOutgoing = msg.sender_id === userId
                  // Look up profile: try profiles map first, then otherProfile for direct chats
                  let senderProfile = profiles[msg.sender_id]
                  if (!senderProfile && isDirect && msg.sender_id === otherUserId && otherProfile) {
                    senderProfile = otherProfile as Profile
                  }
                  
                  // Debug logging
                  if (!isOutgoing && !senderProfile) {
                    console.warn('Missing profile for sender:', msg.sender_id, {
                      profilesKeys: Object.keys(profiles),
                      otherUserId,
                      otherProfile: otherProfile ? 'exists' : 'null',
                      isDirect
                    })
                  }
                  
                  return (
                    <ChatMessage
                      key={msg.id}
                      message={msg}
                      senderProfile={senderProfile || undefined}
                      isOutgoing={isOutgoing}
                      statusIcon={statusIcon}
                      avatarPlaceholder={AVATAR_PLACEHOLDER}
                    />
                  )
                })}
              <div ref={messagesEndRef} />
            </div>

            <div className="chat-gym-divider" />

            {sendError && (
              <div className="chat-send-error">
                <span className="chat-send-error-text">{sendError.error}</span>
                <div className="chat-send-error-actions">
                  <button type="button" className="chat-send-error-retry" onClick={handleRetry} disabled={sending}>
                    {sending ? 'Sending...' : 'Retry'}
                  </button>
                  <button type="button" className="chat-send-error-cancel" onClick={handleClearError} disabled={sending}>
                    Cancel
                  </button>
                </div>
              </div>
            )}

            <div className="chat-gym-input">
              <input
                type="text"
                value={draft}
                onChange={e => setDraft(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !sending) handleSend()
                }}
                placeholder="Type a message ..."
                className="chat-gym-input-field"
                disabled={sending}
              />
              <button type="button" className="chat-gym-send-btn" onClick={() => handleSend()} disabled={sending}>
                <img src={ICON_SEND} alt="" width={24} height={24} style={sending ? { opacity: 0.5 } : undefined} />
              </button>
            </div>
          </div>
        ) : (
          <>
            <BackBar
              onBackClick={() => router.back()}
              className="chat-detail-header"
              centerSlot={
                <div className="chat-detail-partner">
                  <div className="chat-detail-avatar">
                    <img src={otherProfile?.avatar_url || AVATAR_PLACEHOLDER} alt="" width={34} height={34} className="chat-detail-avatar-img" />
                  </div>
                  <div className="chat-detail-name">{otherFirstName}</div>
                </div>
              }
              rightSlot={
                <div style={{ position: 'relative' }}>
                  <button
                    type="button"
                    className="chat-detail-icon-btn"
                    aria-label="More options"
                    onClick={() => setMenuOpen(!menuOpen)}
                  >
                    <img src={ICON_MENU} alt="" width={24} height={24} />
                  </button>
                  {isDirect && (
                    <ActionMenu
                      open={menuOpen}
                      onClose={() => setMenuOpen(false)}
                      items={[
                        {
                          label: `Leave chat with ${otherFirstName}`,
                          onClick: handleLeaveChat,
                          loading: leaving,
                          loadingLabel: 'Leaving...',
                        },
                        {
                          label: 'Block user',
                          onClick: handleBlockUser,
                          loading: blocking,
                          loadingLabel: 'Blocking...',
                          danger: true,
                        },
                        {
                          label: 'Report user',
                          onClick: handleOpenReport,
                        },
                      ]}
                    />
                  )}
                </div>
              }
            />

            <div className="chat-detail-divider" />

            <div className="chat-detail-card">
              <div className="chat-detail-messages">
              <div className="chat-detail-system">
                You connected with {otherFirstName} on 11/07/2023.
              </div>

              {!loading &&
                messages.map(msg => {
                  const isOutgoing = msg.sender_id === userId
                  const senderProfile = msg.sender_id === otherUserId ? otherProfile : (profiles[msg.sender_id] || null)
                  
                  return (
                    <ChatMessage
                      key={msg.id}
                      message={msg}
                      senderProfile={senderProfile}
                      isOutgoing={isOutgoing}
                      statusIcon={(status) => status === 'read' ? ICON_READ : ICON_DELIVERED}
                      avatarPlaceholder={AVATAR_PLACEHOLDER}
                    />
                  )
                })}
              <div ref={messagesEndRef} />
            </div>

            <div className="chat-detail-divider" />

            {sendError && (
              <div className="chat-send-error">
                <span className="chat-send-error-text">{sendError.error}</span>
                <div className="chat-send-error-actions">
                  <button type="button" className="chat-send-error-retry" onClick={handleRetry} disabled={sending}>
                    {sending ? 'Sending...' : 'Retry'}
                  </button>
                  <button type="button" className="chat-send-error-cancel" onClick={handleClearError} disabled={sending}>
                    Cancel
                  </button>
                </div>
              </div>
            )}

            <div className="chat-detail-input">
              <input
                type="text"
                value={draft}
                onChange={e => setDraft(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !sending) handleSend()
                }}
                placeholder="Type a message ..."
                className="chat-detail-input-field"
                disabled={sending}
              />
              <button type="button" className="chat-detail-send-btn" onClick={() => handleSend()} disabled={sending}>
                <img src={ICON_SEND} alt="" width={24} height={24} style={sending ? { opacity: 0.5 } : undefined} />
              </button>
            </div>
            </div>
          </>
        )}
        <MobileNavbar active="chats" />

        {isDirect && otherUserId && (
          <ReportModal
            open={reportModalOpen}
            onClose={() => setReportModalOpen(false)}
            reportedUserId={otherUserId}
            reportedUserName={otherFirstName}
          />
        )}
      </div>
    </div>
  )
}

