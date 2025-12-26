'use client'

import React from 'react'
import Link from 'next/link'
import { RequireAuth } from '@/components/RequireAuth'
import MobileFilterBar from '@/components/MobileFilterBar'
import MobileNavbar from '@/components/MobileNavbar'
import MobileTopbar from '@/components/MobileTopbar'
import UnreadDot from '@/components/UnreadDot'
import LoadingState from '@/components/LoadingState'
import EmptyState from '@/components/EmptyState'
import Avatar from '@/components/Avatar'
import { supabase } from '@/lib/supabaseClient'
import { fetchProfiles, fetchGymsFromTable, Gym } from '@/lib/profiles'
import { isThreadUnread, UnreadCheckMessage } from '@/lib/messages'
import { useAuthSession } from '@/hooks/useAuthSession'
import { getBlockedUsers } from '@/lib/blocks'

type ThreadRow = {
  id: string
  user_a: string | null
  user_b: string | null
  last_message: string | null
  last_message_at: string | null
   created_at?: string | null
  type?: string | null
  gym_id?: string | null
  title?: string | null
  event_id?: string | null
  crew_id?: string | null
}

type Profile = {
  id: string
  username: string | null
  avatar_url: string | null
  city?: string | null
  homebase?: string | null
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
  gymId?: string | null
  city?: string | null
}

type MessageSlim = {
  id: string
  thread_id: string
  body: string
  created_at: string
  sender_id: string
  receiver_id: string
  status: string | null
}

type EventRow = {
  id: string
  title: string | null
  image_url: string | null
}


type FilterKey = 'city' | 'gym'

export default function ChatsScreen() {
  const { session, loading } = useAuthSession()
  const userId = session?.user?.id
  const [items, setItems] = React.useState<ChatListItem[]>([])
  const [allItems, setAllItems] = React.useState<ChatListItem[]>([]) // Store all items for filtering
  const [isLoading, setIsLoading] = React.useState(false)
  const [filters, setFilters] = React.useState<Record<FilterKey, string>>({
    city: 'All',
    gym: 'All',
  })
  const [gyms, setGyms] = React.useState<Gym[]>([])

  const formatSubtitle = (msg: string | null) => {
    if (!msg) return 'No messages yet. Say hi!'
    return msg.length > 60 ? `${msg.slice(0, 57)}...` : msg
  }

  const formatTimestamp = (iso: string | null) => {
    if (!iso) return ''
    const now = new Date()
    const then = new Date(iso)
    const diffMs = now.getTime() - then.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays}d ago`

    // For older messages, show the date
    return then.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
  }

  const fetchThreads = React.useCallback(async () => {
    if (!supabase || !userId) return
    setIsLoading(true)

    // Fetch blocks (users blocked by current user OR users who blocked current user)
    const { data: blocksData } = await supabase
      .from('blocks')
      .select('blocker_id, blocked_id')
      .or(`blocker_id.eq.${userId},blocked_id.eq.${userId}`)

    const blockedUserIds = new Set<string>()
    if (blocksData) {
      blocksData.forEach(block => {
        // Add users I blocked
        if (block.blocker_id === userId) {
          blockedUserIds.add(block.blocked_id)
        }
        // Add users who blocked me
        if (block.blocked_id === userId) {
          blockedUserIds.add(block.blocker_id)
        }
      })
    }

    // Direct 1:1 threads where current user is user_a or user_b
    const { data: directThreads, error: threadsError } = await supabase
      .from('threads')
      .select('id,user_a,user_b,last_message,last_message_at,type,gym_id,event_id,crew_id,title,created_at')
      .or(`user_a.eq.${userId},user_b.eq.${userId}`)
      .order('last_message_at', { ascending: false, nullsFirst: false })

    // Group/gym threads via participant table
    const { data: participantThreads, error: participantError } = await supabase
      .from('thread_participants')
      .select('thread:threads(id,user_a,user_b,last_message,last_message_at,type,gym_id,event_id,crew_id,title,created_at)')
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

    // Filter out threads with blocked users (direct chats only - group threads handled by server)
    const withoutBlocked = uniqueThreads.filter(t => {
      if ((t.type ?? 'direct') !== 'direct') return true
      const otherUserId = t.user_a === userId ? t.user_b : t.user_a
      return otherUserId ? !blockedUserIds.has(otherUserId) : true
    })

    // Exclude crew threads - they only appear on /crew page
    const withoutCrews = withoutBlocked.filter(t => (t.type ?? 'direct') !== 'crew')

    // Keep only the three canonical gym thread titles; drop anything else.
    const allowedGymTitles = new Set(['general', 'beta center', 'routesetting'])
    const filteredThreads = withoutCrews.filter(t => {
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

    const latestByThread: Record<string, MessageSlim> = {}
    const threadIds = fullyFilteredThreads.map(t => t.id)
    if (threadIds.length > 0) {
      const { data: latestMsgs } = await supabase
        .from('messages')
        .select('id,thread_id,body,created_at,sender_id,receiver_id,status')
        .in('thread_id', threadIds)
        .order('created_at', { ascending: false })
      if (latestMsgs) {
        for (const m of latestMsgs as MessageSlim[]) {
          if (!latestByThread[m.thread_id]) {
            latestByThread[m.thread_id] = m
          }
        }
      }
    }

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
      try {
        const mergedProfiles = await fetchProfiles(supabase, otherIds)
        profilesMap =
          mergedProfiles?.reduce<Record<string, Profile>>((acc, p) => {
            acc[p.id] = {
              id: p.id,
              username: p.username ?? p.email ?? '',
              avatar_url: p.avatar_url ?? (p as any)?.photo ?? null,
              city: p.city,
              homebase: p.homebase,
            }
            return acc
          }, {}) ?? {}
      } catch (err) {
        console.error('Failed to fetch profiles for chats', err)
      }
    }

    // Gyms map for gym threads
    const gymIds = Array.from(
      new Set(
        fullyFilteredThreads
          .filter(t => (t.type ?? 'direct') === 'gym' && t.gym_id)
          .map(t => t.gym_id as string),
      ),
    )

    let gymsMap: Record<string, { id: string; name: string | null; avatar_url: string | null; area: string | null }> = {}
    if (gymIds.length > 0) {
      const { data: gyms } = await supabase
        .from('gyms')
        .select('id,name,avatar_url,area')
        .in('id', gymIds)
      gymsMap =
        gyms?.reduce<Record<string, { id: string; name: string | null; avatar_url: string | null; area: string | null }>>(
          (acc, g) => {
            acc[g.id] = g
            return acc
          },
          {},
        ) ?? {}
    }

    // Events map for event threads
    const eventIds = Array.from(
      new Set(
        fullyFilteredThreads
          .filter(t => (t.type ?? 'direct') === 'event' && t.event_id)
          .map(t => t.event_id as string),
      ),
    )

    let eventsMap: Record<string, EventRow & { location?: string | null }> = {}
    if (eventIds.length > 0) {
      const { data: events } = await supabase
        .from('events')
        .select('id,title,image_url,location')
        .in('id', eventIds)
      eventsMap =
        events?.reduce<Record<string, EventRow & { location?: string | null }>>((acc, ev) => {
          acc[ev.id] = ev
          return acc
        }, {}) ?? {}
    }

    // Crew threads are excluded from /chats page - they only appear on /crew page
    // No need to fetch crew data here

    // Drop gym threads that have no matching gym record (or missing gym_id)
    const finalThreads = fullyFilteredThreads.filter(t => {
      if ((t.type ?? 'direct') !== 'gym') return true
      if (!t.gym_id) return false
      return Boolean(gymsMap[t.gym_id])
    })

    // Fetch blocked users
    let blockedIds: string[] = []
    try {
      blockedIds = await getBlockedUsers()
    } catch (err) {
      console.error('Failed to fetch blocked users', err)
    }

    const normalized = finalThreads.map<ChatListItem>(t => {
      const isDirect = (t.type ?? 'direct') === 'direct'
      const otherUserId = isDirect ? (t.user_a === userId ? t.user_b : t.user_a) : null
      const profile = otherUserId ? profilesMap[otherUserId] : undefined
      const gym = !isDirect && t.gym_id ? gymsMap[t.gym_id] : undefined
      const ev = !isDirect && t.event_id ? eventsMap[t.event_id] : undefined
      // Crew threads are excluded from /chats - they only appear on /crew page
      const fallbackMsg = latestByThread[t.id]
      const firstName = (profile?.username || '').trim().split(/\s+/)[0] || 'Dabber'

      // Build title based on thread type
      let title: string
      if (isDirect) {
        title = firstName
      } else if (t.type === 'gym' && gym) {
        // For gym threads: "Gym Name channel-name" (e.g., "DAV Thalkirchen general")
        title = `${gym.name} ${t.title || 'thread'}`.trim()
      } else if (t.type === 'event' && ev) {
        // For event threads: Just show the event title (no duplication)
        title = ev.title || 'Event'
      } else {
        // Fallback for other group threads
        title = t.title || 'Group chat'
      }
      const avatar = isDirect
        ? profile?.avatar_url ?? null
        : ev?.image_url ||
          gym?.avatar_url ||
          'https://www.figma.com/api/mcp/asset/d19fa6c1-2d62-4bd-940b-0bf7cbc80c45'
      const lastMessageAt = t.last_message_at ?? fallbackMsg?.created_at ?? t.created_at ?? null
      const hasMessages = !!fallbackMsg || !!t.last_message
      // Use unified unread helper from lib/messages
      const unreadMsg: UnreadCheckMessage | null = fallbackMsg
        ? { sender_id: fallbackMsg.sender_id, receiver_id: fallbackMsg.receiver_id, status: fallbackMsg.status }
        : null
      const isUnread = isThreadUnread(unreadMsg, userId, isDirect, hasMessages)
      // Get city from profile (for direct chats) or from gym/event
      // Normalize city: extract first part before comma (e.g., "Munich, Germany" -> "Munich")
      // Store as-is (not lowercased) so filter dropdown shows proper case
      const getNormalizedCity = (cityStr: string | null | undefined): string | null => {
        if (!cityStr) return null
        const normalized = cityStr.trim().split(',')[0].trim()
        return normalized || null
      }
      const city = isDirect
        ? getNormalizedCity(profile?.city || profile?.homebase || null)
        : getNormalizedCity(gym?.area || ev?.location || null)

      return {
        threadId: t.id,
        otherUserId,
        title,
        subtitle: formatSubtitle(t.last_message ?? fallbackMsg?.body ?? null),
        avatar,
        lastMessageAt,
        unread: isUnread,
        type: t.type,
        gymId: t.gym_id || null,
        city: city,
      }
    }).filter(item => {
      // Filter out direct threads with blocked users
      if (item.type === 'direct' && item.otherUserId && blockedIds.includes(item.otherUserId)) {
        return false
      }
      return true
    })

    // Sort: unread messages first, then by lastMessageAt desc (nulls last)
    normalized.sort((a, b) => {
      // Prioritize unread messages
      if (a.unread && !b.unread) return -1
      if (!a.unread && b.unread) return 1
      
      // Within same unread status, sort by lastMessageAt desc
      if (!a.lastMessageAt && !b.lastMessageAt) return 0
      if (!a.lastMessageAt) return 1
      if (!b.lastMessageAt) return -1
      return new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
    })

    setAllItems(normalized)
    setIsLoading(false)
  }, [userId])

  // Fetch gyms on mount
  React.useEffect(() => {
    const loadGyms = async () => {
      if (!supabase) return
      const gymsList = await fetchGymsFromTable(supabase)
      setGyms(gymsList)
    }
    loadGyms()
  }, [])

  // Extract filter options from all items
  const filterOptions = React.useMemo(() => {
    const cities = new Set<string>(['All'])
    const gymNames = new Set<string>(['All'])

    // Extract cities from items - normalize them to avoid duplicates
    // (e.g., "Munich" and "Munich, Germany" should both appear as "Munich")
    allItems.forEach(item => {
      if (item.city) {
        // Normalize city name: extract first part before comma
        const normalized = item.city.trim().split(',')[0].trim()
        if (normalized) cities.add(normalized)
      }
    })

    // Extract gym names from gyms table
    gyms.forEach(gym => {
      if (gym.name) gymNames.add(gym.name)
    })

    return {
      city: Array.from(cities).sort(),
      gym: Array.from(gymNames).sort(),
    }
  }, [allItems, gyms])

  // Create gym ID to name map for filtering
  const gymMap = React.useMemo(() => {
    const map = new Map<string, string>()
    gyms.forEach(gym => {
      if (gym.id && gym.name) {
        map.set(gym.id, gym.name)
      }
    })
    return map
  }, [gyms])

  // Normalize city name: extract first part before comma (e.g., "Munich, Germany" -> "Munich")
  const normalizeCity = (cityStr: string | null | undefined): string => {
    if (!cityStr) return ''
    return cityStr.trim().split(',')[0].trim().toLowerCase()
  }

  // Filter items based on selected filters
  const filteredItems = React.useMemo(() => {
    return allItems.filter(item => {
      // Filter by city - exact match after normalization (case-insensitive)
      // Normalize both values to handle cases like "Munich, Germany" matching "Munich"
      if (filters.city !== 'All') {
        const itemCityNormalized = normalizeCity(item.city)
        const filterCityNormalized = normalizeCity(filters.city)
        
        // Exact match only (after normalization)
        if (itemCityNormalized !== filterCityNormalized) return false
      }

      // Filter by gym - for gym threads, check if gym name matches
      if (filters.gym !== 'All') {
        if (item.type === 'gym' && item.gymId) {
          const gymName = gymMap.get(item.gymId) || ''
          if (gymName.trim().toLowerCase() !== filters.gym.trim().toLowerCase()) {
            return false
          }
        } else {
          // For non-gym threads, exclude them when gym filter is active
          return false
        }
      }

      return true
    })
  }, [allItems, filters, gymMap])

  // Update items when filters change
  React.useEffect(() => {
    setItems(filteredItems)
  }, [filteredItems])

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
        <MobileTopbar breadcrumb="Chats" />
        {/* Top Navigation - Filters: city, gym */}
        <MobileFilterBar
          filters={filters}
          filterOptions={filterOptions}
          onFilterChange={(key, val) => setFilters(prev => ({ ...prev, [key]: val }))}
          filterKeys={['city', 'gym']}
        />

        <div className="chats-content">
          {isLoading && <LoadingState message="Loading chats…" />}
          {!isLoading && items.length === 0 && (
            <EmptyState message="No messages yet. Say hi!" />
          )}
          {!isLoading &&
            items.map((chat) => (
              <Link
                key={chat.threadId}
                href={`/chats/${chat.threadId}`}
                className={`chats-preview ${chat.unread ? 'chats-preview-unread' : ''}`}
              >
                <div className="chats-preview-cont">
                  <div className="chats-avatar-wrapper">
                    <Avatar
                      src={chat.avatar}
                      className="chats-avatar-img"
                    />
                    {chat.unread && <UnreadDot />}
                  </div>
                  <div className="chats-text">
                    <p className="chats-title">{chat.title}</p>
                    <p className="chats-subtitle">{chat.subtitle}</p>
                    {chat.lastMessageAt && (
                      <p className="chats-timestamp">{formatTimestamp(chat.lastMessageAt)}</p>
                    )}
                  </div>
                </div>
              </Link>
            ))}
        </div>

        <MobileNavbar active="chats" />
      </div>
    </RequireAuth>
  )
}


