'use client'

import React from 'react'
import Link from 'next/link'
import { RequireAuth } from '@/components/RequireAuth'
import FilterDropdownMobile from '@/components/FilterDropdownMobile'
import MobileNavbar from '@/components/MobileNavbar'
import { supabase } from '@/lib/supabaseClient'
import { useAuthSession } from '@/hooks/useAuthSession'

type ThreadRow = {
  id: string
  user_a: string | null
  user_b: string | null
  last_message: string | null
  last_message_at: string | null
  type?: string | null
  gym_id?: string | null
  title?: string | null
}

type Profile = {
  id: string
  username: string | null
  avatar_url: string | null
}

type ParticipantRow = {
  thread_id: string
  user_id: string
}

type ChatListItem = {
  threadId: string
  otherUserId: string | null
  title: string
  subtitle: string
  avatar: string | null
  lastMessageAt: string | null
  unread: boolean
  type: string | null | undefined
}

export default function ChatsScreen() {
  const { session, loading } = useAuthSession()
  const userId = session?.user?.id
  const [items, setItems] = React.useState<ChatListItem[]>([])
  const [isLoading, setIsLoading] = React.useState(false)
  const [filter, setFilter] = React.useState<'All'>('All')

  const filterOptions: Array<'All'> = ['All']

  const formatSubtitle = (msg: string | null) => {
    if (!msg) return 'No messages yet. Say hi!'
    return msg.length > 60 ? `${msg.slice(0, 57)}...` : msg
  }

  const fetchThreads = React.useCallback(async () => {
    if (!supabase || !userId) return
    setIsLoading(true)

    // Direct 1:1 threads where current user is user_a or user_b
    const { data: directThreads, error: threadsError } = await supabase
      .from('threads')
      .select('id,user_a,user_b,last_message,last_message_at,type,gym_id,title')
      .or(`user_a.eq.${userId},user_b.eq.${userId}`)
      .order('last_message_at', { ascending: false, nullsFirst: false })

    // Group/gym threads via participant table
    const { data: participantThreads, error: participantError } = await supabase
      .from('thread_participants')
      .select('thread:threads(id,user_a,user_b,last_message,last_message_at,type,gym_id,title)')
      .eq('user_id', userId)

    if (threadsError) {
      console.error('Error loading direct threads', threadsError)
    }
    if (participantError) {
      console.error('Error loading participant threads', participantError)
    }

    if ((!directThreads || threadsError) && (!participantThreads || participantError)) {
      setItems([])
      setIsLoading(false)
      return
    }

    const directIds = new Set<string>((directThreads ?? []).map(t => t.id).filter(Boolean))
    const participantThreadRows = (participantThreads ?? [])
      .map(p => (p as unknown as { thread: ThreadRow }).thread)
      .filter(Boolean) as ThreadRow[]
    const participantIds = new Set<string>(participantThreadRows.map(t => t.id).filter(Boolean))
    const allowedIds = new Set<string>([...directIds, ...participantIds])

    const threadsData: ThreadRow[] = [
      ...(directThreads ?? []),
      ...participantThreadRows,
    ].filter(t => t?.id && allowedIds.has(t.id))

    // Dedupe by thread id
    const uniqueThreadsMap = new Map<string, ThreadRow>()
    threadsData.forEach(t => {
      if (t?.id && allowedIds.has(t.id) && !uniqueThreadsMap.has(t.id)) {
        uniqueThreadsMap.set(t.id, t)
      }
    })
    const uniqueThreads = Array.from(uniqueThreadsMap.values())

    // Keep only the three canonical gym thread titles; drop anything else.
    const allowedGymTitles = new Set(['general', 'beta center', 'routesetting'])
    const filteredThreads = uniqueThreads.filter(t => {
      if ((t.type ?? 'direct') !== 'gym') return true
      const title = (t.title ?? '').trim().toLowerCase()
      return allowedGymTitles.has(title)
    })

    // Dedupe gym threads per gym_id+title
    const gymKeySeen = new Set<string>()
    const fullyFilteredThreads: ThreadRow[] = []
    filteredThreads.forEach(t => {
      if ((t.type ?? 'direct') !== 'gym') {
        fullyFilteredThreads.push(t)
        return
      }
      const key = `${t.gym_id ?? ''}::${(t.title ?? '').trim().toLowerCase()}`
      if (!gymKeySeen.has(key)) {
        gymKeySeen.add(key)
        fullyFilteredThreads.push(t)
      }
    })

    const otherIds = Array.from(
      new Set(
        fullyFilteredThreads
          .filter(t => (t.type ?? 'direct') === 'direct')
          .map(t => (t.user_a === userId ? t.user_b : t.user_a))
          .filter(Boolean) as string[],
      ),
    )

    let profilesMap: Record<string, Profile> = {}
    if (otherIds.length > 0) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id,username,avatar_url')
        .in('id', otherIds)
      profilesMap =
        profiles?.reduce<Record<string, Profile>>((acc, p) => {
          acc[p.id] = p
          return acc
        }, {}) ?? {}
    }

    // Gyms map for gym threads
    const gymIds = Array.from(
      new Set(
        fullyFilteredThreads
          .filter(t => (t.type ?? 'direct') === 'gym' && t.gym_id)
          .map(t => t.gym_id as string),
      ),
    )

    let gymsMap: Record<string, { id: string; name: string | null; avatar_url: string | null }> = {}
    if (gymIds.length > 0) {
      const { data: gyms } = await supabase
        .from('gyms')
        .select('id,name,avatar_url')
        .in('id', gymIds)
      gymsMap =
        gyms?.reduce<Record<string, { id: string; name: string | null; avatar_url: string | null }>>(
          (acc, g) => {
            acc[g.id] = g
            return acc
          },
          {},
        ) ?? {}
    }

    // Drop gym threads that have no matching gym record (or missing gym_id)
    const finalThreads = fullyFilteredThreads.filter(t => {
      if ((t.type ?? 'direct') !== 'gym') return true
      if (!t.gym_id) return false
      return Boolean(gymsMap[t.gym_id])
    })

    const normalized = finalThreads.map<ChatListItem>(t => {
      const isDirect = (t.type ?? 'direct') === 'direct'
      const otherUserId = isDirect ? (t.user_a === userId ? t.user_b : t.user_a) : null
      const profile = otherUserId ? profilesMap[otherUserId] : undefined
      const gym = !isDirect && t.gym_id ? gymsMap[t.gym_id] : undefined
      const title = isDirect
        ? profile?.username || 'Dabber'
        : `${gym?.name || 'Gym'} ${t.title || 'thread'}`.trim()
      const avatar = isDirect
        ? profile?.avatar_url ?? null
        : gym?.avatar_url ?? 'https://www.figma.com/api/mcp/asset/d19fa6c1-2d62-4bd-940b-0bf7cbc80c45'
      return {
        threadId: t.id,
        otherUserId,
        title,
        subtitle: formatSubtitle(t.last_message),
        avatar,
        lastMessageAt: t.last_message_at,
        unread: false,
        type: t.type,
      }
    })

    // Sort by lastMessageAt desc (nulls last)
    normalized.sort((a, b) => {
      if (!a.lastMessageAt && !b.lastMessageAt) return 0
      if (!a.lastMessageAt) return 1
      if (!b.lastMessageAt) return -1
      return new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
    })

    setItems(normalized)
    setIsLoading(false)
  }, [userId])

  React.useEffect(() => {
    fetchThreads()
  }, [fetchThreads])

  React.useEffect(() => {
    const client = supabase
    if (!client || !userId) return
    const channel = client
      .channel('messages-feed')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'messages' },
        payload => {
          const msg = payload.new as { sender_id?: string; receiver_id?: string }
          if (msg.sender_id === userId || msg.receiver_id === userId) {
            fetchThreads()
          }
        },
      )
      .subscribe()

    return () => {
      client.removeChannel(channel)
    }
  }, [userId, fetchThreads])

  return (
    <RequireAuth>
      <div className="chats-screen" data-name="/ chats">
        <div className="chats-content">
          {/* Top Navigation - Filters: gym, event, personal */}
          <div className="chats-topnav">
            <FilterDropdownMobile
              label="filter"
              value={filter}
              options={filterOptions}
              onChange={val => setFilter(val as any)}
            />
          </div>

          {/* Chat List Card */}
          <div className="chats-card">
            {isLoading && <p className="chats-subtitle">Loading chats…</p>}
            {!isLoading && items.length === 0 && (
              <p className="chats-subtitle">No messages yet. Say hi!</p>
            )}
            {!isLoading &&
              items.map((chat, idx) => (
                <React.Fragment key={chat.threadId}>
                  <Link href={`/chats/${chat.threadId}`} className="chats-preview">
                    <div className="chats-preview-cont">
                      <div className="chats-avatar-wrapper">
                        <div className="chats-avatar-bg" />
                        <img
                          src={
                            chat.avatar ||
                            'https://www.figma.com/api/mcp/asset/ed027546-d8d0-4b5a-87e8-12db5e07cdd7'
                          }
                          alt=""
                          className="chats-avatar-img"
                        />
                      </div>
                      <div className="chats-text">
                        <p className="chats-title">{chat.title}</p>
                        <p className="chats-subtitle">{chat.subtitle}</p>
                      </div>
                      {chat.unread && (
                        <div className="chats-unread-badge">
                          <img src="/icons/unread-badge.svg" alt="" className="chats-badge-img" />
                        </div>
                      )}
                    </div>
                  </Link>
                  {idx < items.length - 1 && (
                    <div className="chats-divider">
                      <img src="/icons/divider-line.svg" alt="" className="chats-divider-img" />
                    </div>
                  )}
                </React.Fragment>
              ))}
          </div>

          <MobileNavbar active="chats" />
        </div>
      </div>
    </RequireAuth>
  )
}

