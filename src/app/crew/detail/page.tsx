'use client'

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import React, { Suspense, useEffect, useRef, useState } from 'react'

import MobileNavbar from '@/components/MobileNavbar'
import { RequireAuth } from '@/components/RequireAuth'
import { useAuthSession } from '@/hooks/useAuthSession'
import { supabase } from '@/lib/supabaseClient'

const BACK_ICON = '/icons/chevron-left.svg'
const MENU_ICON = '/icons/dots.svg'
const STATUS_ICON_PRIMARY = 'https://www.figma.com/api/mcp/asset/9669b4a0-521f-4460-b5ea-398ba81c3620'
const STATUS_ICON_SECONDARY = 'https://www.figma.com/api/mcp/asset/a7a888de-184f-46cf-a824-bf78fa777b31'
const ICON_SEND = '/icons/send.svg'
const AVATAR_PLACEHOLDER = 'https://www.figma.com/api/mcp/asset/ed027546-d8d0-4b5a-87e8-12db5e07cdd7'

type CrewRow = {
  id: string
  title: string
  location: string | null
  description: string | null
  image_url?: string | null
  created_by: string | null
}

type ThreadRow = {
  id: string
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

const extractCity = (location?: string | null) => {
  if (!location) return ''
  const parts = location.split(',').map(part => part.trim()).filter(Boolean)
  if (parts.length > 1) return parts[parts.length - 1]
  return ''
}

function CrewDetailContent() {
  const searchParams = useSearchParams()
  const crewId = searchParams.get('crewId')
  const router = useRouter()
  const { session } = useAuthSession()
  const userId = session?.user?.id

  const [crew, setCrew] = useState<CrewRow | null>(null)
  const [thread, setThread] = useState<ThreadRow | null>(null)
  const [messages, setMessages] = useState<MessageRow[]>([])
  const [profiles, setProfiles] = useState<Record<string, Profile>>({})
  const [draft, setDraft] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [joinedAt, setJoinedAt] = useState<string | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [leaving, setLeaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement | null>(null)
  const menuRef = useRef<HTMLDivElement | null>(null)

  // Fetch crew, thread, messages, and ensure participation
  useEffect(() => {
    let cancelled = false
    const client = supabase
    if (!crewId || !userId) {
      if (!crewId) setError('Crew not found')
      setLoading(false)
      return
    }
    if (!client) {
      setError('Unable to connect to Supabase')
      setLoading(false)
      return
    }

    const fetchData = async () => {
      setLoading(true)
      setError(null)

      // Fetch crew
      const { data: crewData, error: crewError } = await client
        .from('crews')
        .select('id,title,location,description,image_url,created_by')
        .eq('id', crewId)
        .maybeSingle()

      if (cancelled) return

      if (crewError || !crewData) {
        setError('Crew not found')
        setLoading(false)
        return
      }

      setCrew(crewData)

      // Get or create thread
      let threadData = await client
        .from('threads')
        .select('id')
        .eq('type', 'crew')
        .eq('crew_id', crewId)
        .maybeSingle()

      if (cancelled) return

      let threadId: string | null = threadData?.data?.id ?? null

      // Create thread if it doesn't exist
      if (!threadId) {
        const { data: newThread, error: createErr } = await client
          .from('threads')
          .insert({
            type: 'crew',
            crew_id: crewId,
            title: crewData.title,
            user_a: userId, // Set user_a to satisfy RLS policies that may require it
            last_message: 'New crew chat',
            last_message_at: new Date().toISOString(),
          })
          .select('id')
          .maybeSingle()
        if (createErr || !newThread?.id) {
          setError(createErr?.message || 'Could not create crew chat.')
          setLoading(false)
          return
        }
        threadId = newThread.id
        if (threadId) {
          setThread({ id: threadId })
        }
      } else if (threadId) {
        setThread({ id: threadId })
      }

      // Ensure user is a participant
      await client
        .from('thread_participants')
        .upsert({ thread_id: threadId, user_id: userId, role: 'member' })

      // Get join date from participant record
      const { data: participantData } = await client
        .from('thread_participants')
        .select('created_at')
        .eq('thread_id', threadId)
        .eq('user_id', userId)
        .maybeSingle()
      if (participantData?.created_at) {
        const joinDate = new Date(participantData.created_at)
        setJoinedAt(joinDate.toLocaleDateString(undefined, { month: '2-digit', day: '2-digit', year: 'numeric' }))
      }

      // Fetch messages
      const { data: msgs, error: messagesError } = await client
        .from('messages')
        .select('*')
        .eq('thread_id', threadId)
        .order('created_at', { ascending: true })

      if (cancelled) return

      setMessages(msgs ?? [])
      if (messagesError) {
        console.error('Error loading messages', messagesError)
      }

      // Fetch profiles for message senders
      const senderIds = Array.from(new Set((msgs ?? []).map(m => m.sender_id).filter(Boolean)))
      if (senderIds.length > 0) {
        const { data: profilesData } = await client
          .from('profiles')
          .select('id,username,avatar_url')
          .in('id', senderIds)
        if (profilesData) {
          const profilesMap: Record<string, Profile> = {}
          profilesData.forEach(p => {
            profilesMap[p.id] = p
          })
          setProfiles(profilesMap)
        }
      }

      setLoading(false)
    }

    fetchData()

    return () => {
      cancelled = true
    }
  }, [crewId, userId])

  // Real-time subscription for new messages
  useEffect(() => {
    const client = supabase
    if (!client || !thread?.id) return
    const channel = client
      .channel(`crew-thread-${thread.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'messages', filter: `thread_id=eq.${thread.id}` },
        payload => {
          if (payload.eventType === 'INSERT') {
            setMessages(prev => [...prev, payload.new as MessageRow])
            // Fetch sender profile if new
            const newMsg = payload.new as MessageRow
            if (newMsg.sender_id && !profiles[newMsg.sender_id]) {
              client
                .from('profiles')
                .select('id,username,avatar_url')
                .eq('id', newMsg.sender_id)
                .single()
                .then(({ data }) => {
                  if (data) {
                    setProfiles(prev => ({ ...prev, [data.id]: data }))
                  }
                })
            }
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
  }, [thread?.id, profiles])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    const client = supabase
    if (!client || !userId || !thread?.id || !draft.trim()) return

    const body = draft.trim()
    setDraft('')
    const { data, error: sendError } = await client
      .from('messages')
      .insert({
        thread_id: thread.id,
        sender_id: userId,
        receiver_id: userId, // For group threads we populate receiver_id to satisfy schema
        body,
        status: 'sent',
      })
      .select('*')
      .single()

    if (sendError) {
      console.error('Error sending message:', sendError?.message ?? sendError)
      setDraft(body) // restore draft on failure
      return
    }

    if (data) {
      setMessages(prev => [...prev, data as MessageRow])
      // Update thread last_message / last_message_at
      await client
        .from('threads')
        .update({ last_message: body, last_message_at: data.created_at })
        .eq('id', thread.id)
    }
  }

  // Mark incoming messages as read when viewing
  useEffect(() => {
    const client = supabase
    if (!client || !userId || !thread?.id || messages.length === 0) return
    const incoming = messages.filter(m => m.receiver_id === userId && m.sender_id !== userId)
    const toRead = incoming.filter(m => m.status !== 'read').map(m => m.id)
    if (toRead.length === 0) return
    ;(async () => {
      await client.from('messages').update({ status: 'read' }).in('id', toRead)
      setMessages(prev =>
        prev.map(m => (toRead.includes(m.id) ? { ...m, status: 'read' } : m)),
      )
    })()
  }, [messages, thread?.id, userId])

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

  const handleLeaveCrew = async () => {
    const client = supabase
    if (!client || !userId || !thread?.id) {
      setError('Unable to leave crew')
      return
    }
    setLeaving(true)
    setMenuOpen(false)

    // Remove user from thread participants
    const { error: leaveError } = await client
      .from('thread_participants')
      .delete()
      .eq('thread_id', thread.id)
      .eq('user_id', userId)

    if (leaveError) {
      setError(leaveError.message)
      setLeaving(false)
      return
    }

    // Redirect to crew list
    router.push('/crew')
  }

  const handleInviteUsers = () => {
    // TODO: Implement invite functionality
    // For now, just show an alert or placeholder
    setMenuOpen(false)
    alert('Invite functionality coming soon!')
  }

  const handleDeleteCrew = async () => {
    const client = supabase
    if (!client || !userId || !crew || !isCreator) {
      setError('Only the crew creator can delete the crew')
      return
    }

    // Confirm deletion
    if (!confirm(`Are you sure you want to delete "${crew.title}"? This action cannot be undone.`)) {
      return
    }

    setDeleting(true)
    setMenuOpen(false)

    // Delete the crew (threads will be cascade deleted due to FK)
    const { error: deleteError } = await client
      .from('crews')
      .delete()
      .eq('id', crew.id)
      .eq('created_by', userId) // Extra safety check

    if (deleteError) {
      setError(deleteError.message)
      setDeleting(false)
      return
    }

    // Redirect to crew list
    router.push('/crew')
  }

  const isCreator = crew?.created_by === userId

  const statusIcon = (status?: string) => {
    if (status === 'read') return STATUS_ICON_SECONDARY
    if (status === 'delivered') return STATUS_ICON_PRIMARY
    return STATUS_ICON_PRIMARY
  }

  const cityLabel = extractCity(crew?.location) || 'Location'

  if (loading) {
    return (
      <div className="chats-event-screen" data-name="/crew/detail">
        <div className="chats-event-content">
          <div className="chats-event-card">
            <p style={{ padding: '20px', textAlign: 'center' }}>Loading crew chat…</p>
          </div>
          <MobileNavbar active="crew" />
        </div>
      </div>
    )
  }

  if (error || !crew) {
    return (
      <div className="chats-event-screen" data-name="/crew/detail">
        <div className="chats-event-content">
          <div className="chats-event-card">
            <p style={{ padding: '20px', textAlign: 'center', color: 'red' }}>{error || 'Crew not found'}</p>
          </div>
          <MobileNavbar active="crew" />
        </div>
      </div>
    )
  }

  return (
    <div className="chats-event-screen" data-name="/crew/detail">
      <div className="chats-event-content">
        <div className="chats-event-card">
          <div className="chats-event-backbar">
            <Link href="/crew" className="chats-event-back" aria-label="Back">
              <img src={BACK_ICON} alt="" className="chats-event-back-icon" />
            </Link>
            <div className="chats-event-back-title">back</div>
            <div style={{ position: 'relative' }} ref={menuRef}>
              <button
                type="button"
                className="chats-event-menu"
                aria-label="Menu"
                onClick={() => setMenuOpen(!menuOpen)}
              >
                <img src={MENU_ICON} alt="" className="chats-event-menu-icon" />
              </button>
              {menuOpen && (
                <div
                  className="mh-silver-dropdown-menu mh-silver-dropdown-right"
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 8px)',
                    right: 0,
                    zIndex: 1000,
                    minWidth: '180px',
                    background: 'var(--color-surface-card)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-stroke)',
                    padding: '4px 0',
                  }}
                >
                  {isCreator && (
                    <>
                      <button
                        type="button"
                        className="mh-silver-dropdown-item"
                        onClick={handleInviteUsers}
                        style={{
                          display: 'block',
                          width: '100%',
                          padding: 'var(--space-md) var(--space-lg)',
                          background: 'transparent',
                          border: 'none',
                          textAlign: 'left',
                          color: 'var(--color-text-default)',
                          fontFamily: 'var(--fontfamily-inter)',
                          fontSize: '14px',
                          fontWeight: 500,
                          cursor: 'pointer',
                        }}
                      >
                        Invite users to Crew
                      </button>
                      <div
                        style={{
                          height: '1px',
                          background: 'var(--color-stroke)',
                          margin: '4px 0',
                        }}
                      />
                      <button
                        type="button"
                        className="mh-silver-dropdown-item"
                        onClick={handleDeleteCrew}
                        disabled={deleting}
                        style={{
                          display: 'block',
                          width: '100%',
                          padding: 'var(--space-md) var(--space-lg)',
                          background: 'transparent',
                          border: 'none',
                          textAlign: 'left',
                          color: deleting ? 'var(--color-text-muted)' : '#ff4444',
                          fontFamily: 'var(--fontfamily-inter)',
                          fontSize: '14px',
                          fontWeight: 500,
                          cursor: deleting ? 'not-allowed' : 'pointer',
                          opacity: deleting ? 0.6 : 1,
                        }}
                      >
                        {deleting ? 'Deleting...' : 'Delete Crew'}
                      </button>
                      <div
                        style={{
                          height: '1px',
                          background: 'var(--color-stroke)',
                          margin: '4px 0',
                        }}
                      />
                    </>
                  )}
                  <button
                    type="button"
                    className="mh-silver-dropdown-item"
                    onClick={handleLeaveCrew}
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
                    {leaving ? 'Leaving...' : 'Leave crew'}
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="chats-event-hero">
            <div
              className="chats-event-hero-bg"
              style={{ backgroundImage: `url(${crew.image_url || AVATAR_PLACEHOLDER})` }}
            />
            <div className="chats-event-hero-overlay" />
            <div className="chats-event-hero-text">
              <div className="chats-event-hero-title">{crew.title}</div>
              <div className="chats-event-hero-subtitle">{crew.location || cityLabel}</div>
              <div className="chats-event-hero-info">
                <span className="chats-event-hero-location">{cityLabel}</span>
                <span className="chats-event-hero-attendance">Group Chat</span>
              </div>
            </div>
          </div>

          <div className="chats-event-divider" />

          {joinedAt && (
            <div className="chats-event-system-text">You joined this chat on {joinedAt}.</div>
          )}

          {messages.map(msg => {
            const isOutgoing = msg.sender_id === userId
            const senderProfile = profiles[msg.sender_id]
            const senderName = senderProfile?.username || 'User'
            const senderAvatar = senderProfile?.avatar_url || AVATAR_PLACEHOLDER

            if (isOutgoing) {
              return (
                <div key={msg.id} className="chats-event-response">
                  <div className="chats-event-bubble chats-event-bubble-outgoing">{msg.body}</div>
                  <div className="chats-event-status-row">
                    <div className="chats-event-status-iconwrap">
                      <img src={statusIcon(msg.status)} alt="" className="chats-event-status-icon" />
                    </div>
                    <img src={STATUS_ICON_SECONDARY} alt="" className="chats-event-status-check" />
                    <span className="chats-event-status-text">
                      {msg.status === 'read' ? 'Read' : msg.status === 'delivered' ? 'Delivered' : 'Sent'}
                    </span>
                  </div>
                </div>
              )
            }

            return (
              <div key={msg.id} className="chats-event-message-row">
                <div className="chats-event-avatar">
                  <img src={senderAvatar} alt={senderName} />
                </div>
                <div className="chats-event-bubble chats-event-bubble-incoming">{msg.body}</div>
              </div>
            )
          })}

          <div ref={messagesEndRef} />

          <div className="chats-event-divider" />

          <div className="chats-event-input">
            <input
              type="text"
              placeholder="Type a message ..."
              value={draft}
              onChange={e => setDraft(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  if (draft.trim()) handleSend()
                }
              }}
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                outline: 'none',
                fontFamily: 'var(--fontfamily-inter)',
                fontWeight: 500,
                fontSize: '14px',
                color: 'var(--color-text-darker)',
                minWidth: 0,
              }}
            />
            {draft.trim() && (
              <button
                type="button"
                onClick={handleSend}
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  marginLeft: '8px',
                }}
              >
                <img src={ICON_SEND} alt="Send" style={{ width: '20px', height: '20px' }} />
              </button>
            )}
          </div>
        </div>

        <MobileNavbar active="crew" />
      </div>
    </div>
  )
}

export default function CrewDetailPage() {
  return (
    <RequireAuth>
      <Suspense fallback={null}>
        <CrewDetailContent />
      </Suspense>
    </RequireAuth>
  )
}
