'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import MobileNavbar from '@/components/MobileNavbar'
import { supabase } from '@/lib/supabaseClient'
import { useAuthSession } from '@/hooks/useAuthSession'

const ICON_BACK = 'https://www.figma.com/api/mcp/asset/a49ea4b7-6599-4ce6-aa44-c601e6fd102a'
const ICON_MENU = 'https://www.figma.com/api/mcp/asset/33b7141b-49a6-4ce2-ae52-d507412781c7'
const ICON_DELIVERED = 'https://www.figma.com/api/mcp/asset/8d007e14-674b-4781-b75a-1433ad6a9bd0'
const ICON_READ = 'https://www.figma.com/api/mcp/asset/b87f2116-034c-420b-860c-b640b7e7f3d2'
const ICON_SENT = 'https://www.figma.com/api/mcp/asset/3f64e2fc-69b1-4a45-8c47-010f80f0bd7a'
const ICON_SEND = 'https://www.figma.com/api/mcp/asset/7b3e15a5-2310-4b80-a3aa-92d21aab5773'

const AVATAR_PLACEHOLDER = 'https://www.figma.com/api/mcp/asset/ed027546-d8d0-4b5a-87e8-12db5e07cdd7'

type ThreadRow = {
  id: string
  user_a: string | null
  user_b: string | null
  type?: string | null
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

export default function ChatDetailPage() {
  const params = useParams()
  const router = useRouter()
  const chatId = (params?.id as string) ?? ''
  const { session } = useAuthSession()
  const userId = session?.user?.id

  const [thread, setThread] = useState<ThreadRow | null>(null)
  const [otherProfile, setOtherProfile] = useState<Profile | null>(null)
  const [participants, setParticipants] = useState<string[]>([])
  const [messages, setMessages] = useState<MessageRow[]>([])
  const [draft, setDraft] = useState('')
  const [loading, setLoading] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement | null>(null)

  const otherUserId = useMemo(() => {
    if (!thread || !userId) return null
    return thread.user_a === userId ? thread.user_b : thread.user_a
  }, [thread, userId])

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

      // Participants for group/gym threads
      const { data: participantRows } = await client
        .from('thread_participants')
        .select('user_id')
        .eq('thread_id', chatId)

      const participantIds = (participantRows ?? []).map(p => p.user_id)

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

      // Other profile
      const isDirect = (t.type ?? 'direct') === 'direct'
      const otherId = isDirect ? (t.user_a === userId ? t.user_b : t.user_a) : null
      if (otherId) {
        const { data: p } = await client
          .from('profiles')
          .select('id,username,avatar_url')
          .eq('id', otherId)
          .single()
        if (p) setOtherProfile(p)
      }

      // Messages
      const { data: msgs } = await client
        .from('messages')
        .select('*')
        .eq('thread_id', chatId)
        .order('created_at', { ascending: true })
      setMessages(msgs ?? [])
      setLoading(false)
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
    const body = draft.trim()
    setDraft('')
    await client.from('messages').insert({
      thread_id: chatId,
      sender_id: userId,
      receiver_id: otherUserId || userId, // for group threads we still populate receiver_id to satisfy schema
      body,
      status: 'sent',
    })
  }

  const statusIcon = (status?: string) => {
    if (status === 'read') return ICON_READ
    if (status === 'delivered') return ICON_DELIVERED
    return ICON_SENT
  }

  return (
    <div className="chat-detail-screen" data-chat-id={chatId}>
      <div className="chat-detail-content">
        <div className="chat-detail-card">
          <header className="chat-detail-header">
            <button type="button" className="chat-detail-icon-btn" aria-label="Back" onClick={() => router.back()}>
              <img src={ICON_BACK} alt="" width={28} height={28} />
            </button>
            <div className="chat-detail-partner">
              <div className="chat-detail-avatar">
                <img src={otherProfile?.avatar_url || AVATAR_PLACEHOLDER} alt="" width={34} height={34} className="chat-detail-avatar-img" />
              </div>
              <div className="chat-detail-name">{otherProfile?.username || 'Dabber'}</div>
            </div>
            <button type="button" className="chat-detail-icon-btn" aria-label="More options">
              <img src={ICON_MENU} alt="" width={28} height={28} />
            </button>
          </header>

          <div className="chat-detail-divider" />

          <div className="chat-detail-messages">
            <div className="chat-detail-system">You connected recently.</div>

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
                      <div className="chat-detail-status-icons">
                        <span className="chat-detail-status-icon delivered">
                          <img src={statusIcon(msg.status)} alt="" width={12} height={12} />
                        </span>
                      </div>
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
        <MobileNavbar active="chats" />
      </div>
    </div>
  )
}

