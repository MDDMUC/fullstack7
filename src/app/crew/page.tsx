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
import { supabase } from '@/lib/supabaseClient'
import { useAuthSession } from '@/hooks/useAuthSession'
import { fetchProfiles, fetchGymsFromTable, Gym } from '@/lib/profiles'
import { isMessageUnread } from '@/lib/messages'

type CrewRow = {
  id: string
  title: string
  location: string | null
  description: string | null
  image_url?: string | null
  created_at?: string | null
  created_by?: string | null
}

type FilterKey = 'city' | 'style' | 'gym'

// Extract styles from profile.style field
const getStylesFromProfile = (profile?: any): string[] => {
  if (!profile || !profile.style) return []
  if (Array.isArray(profile.style)) {
    return profile.style.map((s: string) => s.trim()).filter(Boolean)
  }
  if (typeof profile.style === 'string') {
    return profile.style.split(',').map((s: string) => s.trim()).filter(Boolean)
  }
  return []
}

type ThreadRow = {
  id: string
  crew_id: string | null
  last_message: string | null
  last_message_at: string | null
}

type MessageSlim = {
  id: string
  thread_id: string
  sender_id: string
  receiver_id: string | null
  status: string | null
}

export default function CrewScreen() {
  const { session } = useAuthSession()
  const userId = session?.user?.id
  const [crews, setCrews] = React.useState<
    Array<
      CrewRow & {
        thread?: ThreadRow | null
        unread?: boolean
        lastMessageSenderName?: string | null
        creatorStyle?: string[]
        creatorGym?: string[]
        creatorName?: string | null
        memberCount?: number
      }
    >
  >([])
  const [allCrews, setAllCrews] = React.useState<
    Array<
      CrewRow & {
        thread?: ThreadRow | null
        unread?: boolean
        lastMessageSenderName?: string | null
        creatorStyle?: string[]
        creatorGym?: string[]
        creatorName?: string | null
        memberCount?: number
      }
    >
  >([])
  const [loading, setLoading] = React.useState(false)
  const [filters, setFilters] = React.useState<Record<FilterKey, string>>({
    city: 'All',
    style: 'All',
    gym: 'All',
  })
  const [gyms, setGyms] = React.useState<Gym[]>([])

  const fetchCrews = React.useCallback(async () => {
    const client = supabase
    if (!client || !userId) return
    setLoading(true)
    const { data: crewsData, error: crewsError } = await client
      .from('crews')
      .select('id,title,location,description,image_url,created_at,created_by')
      .order('created_at', { ascending: false, nullsFirst: false })

    if (crewsError || !crewsData) {
      setCrews([])
      setLoading(false)
      return
    }

    const crewIds = crewsData.map(c => c.id)
    let threadsMap: Record<string, ThreadRow> = {}
    if (crewIds.length > 0) {
      const { data: threadsData } = await client
        .from('threads')
        .select('id,crew_id,last_message,last_message_at')
        .eq('type', 'crew')
        .in('crew_id', crewIds)
      threadsMap =
        threadsData?.reduce<Record<string, ThreadRow>>((acc, t) => {
          if (t.crew_id) acc[t.crew_id] = t
          return acc
        }, {}) ?? {}
    }

    // Check which crew threads the user is a participant in
    const threadIds = Object.values(threadsMap)
      .map(t => t.id)
      .filter(Boolean) as string[]

    // Get member counts for each thread
    let memberCountMap: Record<string, number> = {}
    if (threadIds.length > 0) {
      const { data: allParticipants } = await client
        .from('thread_participants')
        .select('thread_id')
        .in('thread_id', threadIds)

      if (allParticipants) {
        // Count participants per thread
        for (const p of allParticipants) {
          if (p.thread_id) {
            memberCountMap[p.thread_id] = (memberCountMap[p.thread_id] || 0) + 1
          }
        }
      }
    }

    let unreadMap: Record<string, boolean> = {}
    let lastMessageSenderMap: Record<string, string> = {}
    
    if (threadIds.length > 0) {
      // Check if user is a participant in these threads
      const { data: participants } = await client
        .from('thread_participants')
        .select('thread_id')
        .eq('user_id', userId)
        .in('thread_id', threadIds)

      const userThreadIds = new Set(
        participants?.map(p => p.thread_id).filter(Boolean) as string[]
      )

      // Get latest messages for threads where user is a participant
      if (userThreadIds.size > 0) {
        const { data: latestMessages } = await client
          .from('messages')
          .select('id,thread_id,sender_id,receiver_id,status')
          .in('thread_id', Array.from(userThreadIds))
          .order('created_at', { ascending: false })

        if (latestMessages && latestMessages.length > 0) {
          // Group by thread_id and get the latest message per thread
          const latestByThread = new Map<string, MessageSlim>()
          for (const msg of latestMessages as MessageSlim[]) {
            if (!latestByThread.has(msg.thread_id)) {
              latestByThread.set(msg.thread_id, msg)
            }
          }

          // Get sender IDs for fetching profiles
          const senderIds = Array.from(
            new Set(
              Array.from(latestByThread.values())
                .map(msg => msg.sender_id)
                .filter(Boolean) as string[]
            )
          )

          // Fetch sender profiles
          let senderProfilesMap: Record<string, { username: string }> = {}
          if (senderIds.length > 0) {
            try {
              const profiles = await fetchProfiles(client, senderIds)
              senderProfilesMap = profiles.reduce<Record<string, { username: string }>>((acc, p) => {
                acc[p.id] = { username: p.username }
                return acc
              }, {})
            } catch (err) {
              console.error('Failed to fetch sender profiles', err)
            }
          }

          // Check which threads have unread messages and map sender names
          // Crew threads are group threads: use isMessageUnread with isDirect=false
          for (const [threadId, msg] of latestByThread.entries()) {
            const unreadCheck = isMessageUnread(
              { sender_id: msg.sender_id, receiver_id: msg.receiver_id || '', status: msg.status },
              userId,
              false // isDirect = false for crew threads
            )
            if (unreadCheck) {
              const thread = Object.values(threadsMap).find(t => t.id === threadId)
              if (thread?.crew_id) {
                unreadMap[thread.crew_id] = true
              }
            }

            // Map sender name for this thread
            const thread = Object.values(threadsMap).find(t => t.id === threadId)
            if (thread?.crew_id && msg.sender_id) {
              const senderProfile = senderProfilesMap[msg.sender_id]
              if (senderProfile) {
                const firstName = senderProfile.username.trim().split(/\s+/)[0] || 'User'
                lastMessageSenderMap[thread.crew_id] = firstName
              }
            }
          }
        }
      }
    }

    // Fetch creator profiles to get style and gym info
    const creatorIds = Array.from(new Set(crewsData.map(c => c.created_by).filter(Boolean) as string[]))
    let creatorProfilesMap: Record<string, any> = {}
    if (creatorIds.length > 0) {
      try {
        const profiles = await fetchProfiles(client, creatorIds)
        creatorProfilesMap = profiles.reduce<Record<string, any>>((acc, p) => {
          acc[p.id] = p
          return acc
        }, {})
      } catch (err) {
        console.error('Failed to fetch creator profiles', err)
      }
    }

    const combined = crewsData.map(crew => {
      const creator = crew.created_by ? creatorProfilesMap[crew.created_by] : null
      const creatorStyle = creator ? getStylesFromProfile(creator) : []
      const creatorGym = creator && Array.isArray(creator.gym) ? creator.gym : []
      const creatorName = creator?.username?.split(' ')[0] || null

      const thread = threadsMap[crew.id] ?? null
      const memberCount = thread ? (memberCountMap[thread.id] || 0) : 0

      return {
        ...crew,
        thread,
        unread: unreadMap[crew.id] ?? false,
        lastMessageSenderName: lastMessageSenderMap[crew.id] ?? null,
        creatorStyle,
        creatorGym,
        creatorName,
        memberCount,
      }
    })
    setAllCrews(combined)
    setLoading(false)
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

  // Extract filter options from all crews
  const filterOptions = React.useMemo(() => {
    const cities = new Set<string>(['All'])
    const styles = new Set<string>(['All'])
    const gymNames = new Set<string>(['All'])

    allCrews.forEach(crew => {
      if (crew.location) cities.add(crew.location)
      crew.creatorStyle?.forEach(s => styles.add(s))
    })

    gyms.forEach(gym => {
      if (gym.name) gymNames.add(gym.name)
    })

    return {
      city: Array.from(cities).sort(),
      style: Array.from(styles).sort(),
      gym: Array.from(gymNames).sort(),
    }
  }, [allCrews, gyms])

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

  // Filter crews based on selected filters
  const filteredCrews = React.useMemo(() => {
    return allCrews.filter(crew => {
      // Filter by city - case-insensitive
      if (filters.city !== 'All') {
        const crewCity = (crew.location || '').trim().toLowerCase()
        const filterCity = filters.city.trim().toLowerCase()
        if (crewCity !== filterCity) return false
      }

      // Filter by style - check if creator's style includes the selected style
      if (filters.style !== 'All') {
        const creatorStyles = (crew.creatorStyle || []).map(s => s.trim().toLowerCase())
        const filterStyle = filters.style.trim().toLowerCase()
        if (!creatorStyles.includes(filterStyle)) return false
      }

      // Filter by gym - check if creator's gym includes the selected gym
      if (filters.gym !== 'All') {
        const creatorGyms = crew.creatorGym || []
        const filterGym = filters.gym.trim().toLowerCase()
        
        // Check if any creator gym matches (by ID or name)
        const hasGym = creatorGyms.some(g => {
          if (!g || typeof g !== 'string') return false
          const trimmed = g.trim().toLowerCase()
          // Match by ID (UUID format) or by name
          const gymName = gymMap.get(g) || ''
          return trimmed === filterGym || gymName.trim().toLowerCase() === filterGym
        })
        
        if (!hasGym) return false
      }

      return true
    })
  }, [allCrews, filters, gymMap])

  // Update crews when filters change
  React.useEffect(() => {
    setCrews(filteredCrews)
  }, [filteredCrews])

  React.useEffect(() => {
    fetchCrews()

    // Subscribe to message changes
    const client = supabase
    if (!client || !userId) return
    const channel = client
      .channel('crew-unread-check')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'messages' },
        () => {
          fetchCrews()
        },
      )
      .subscribe()

    return () => {
      client.removeChannel(channel)
    }
  }, [userId, fetchCrews])

  return (
    <RequireAuth>
      <div className="events-screen" data-name="/ crew">
        <div className="events-content">
          <MobileTopbar breadcrumb="Crew" />
          {/* Filters */}
          <MobileFilterBar
            filters={filters}
            filterOptions={filterOptions}
            onFilterChange={(key, val) => setFilters(prev => ({ ...prev, [key]: val }))}
            filterKeys={['city', 'style', 'gym']}
          />
            <div className="events-card custom-scrollbar">
            <Link href="/crew/create" className="events-createbar" data-name="create-crew-mobile" data-node-id="636:2102">
              <div className="events-createbar-left">
                <div className="events-createbar-plus" data-name="plus" data-node-id="636:2101">
                  <div className="events-createbar-plus-inner" data-name="plus" data-node-id="636:2099">
                    <div className="events-createbar-icon" data-name="Icon" data-node-id="I636:2099;633:7054">
                      <div className="events-createbar-stroke">
                        <img src="/icons/plus.svg" alt="" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="events-createbar-center" data-name="name" data-node-id="636:2092">
                <p className="events-createbar-text">create crew</p>
              </div>
              <div className="events-createbar-right" data-name="Auto Layout Horizontal" data-node-id="636:2094">
                <div className="events-createbar-ghost">
                  <div className="events-createbar-ghost-inner">
                    <div className="events-createbar-ghost-frame">
                      <div className="events-createbar-ghost-img">
                        <img src="/icons/dots.svg" alt="" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Link>

            {loading && <LoadingState message="Loading crews…" />}
            {!loading && crews.length === 0 && (
              <EmptyState message="No crews found" />
            )}
            {!loading &&
              crews.map(crew => (
                <Link key={crew.id} href={`/crew/detail?crewId=${crew.id}`} className="events-tile">
                  <div className="events-tile-img">
                    <img
                      src={crew.image_url || '/icons/event-placeholder.svg'}
                      alt=""
                      className="events-tile-img-el"
                    />
                    {crew.creatorName && (
                      <div className="events-tile-host-badge">
                        <span className="events-tile-host-label">Host:</span>
                        <span className="events-tile-host-name">{crew.creatorName}</span>
                      </div>
                    )}
                    {crew.unread && <UnreadDot />}
                    {crew.lastMessageSenderName && (
                      <div className="events-tile-last-message">
                        Last message by {crew.lastMessageSenderName}
                      </div>
                    )}
                  </div>
                  <div className="events-tile-overlay" />
                  <div className="events-tile-text">
                    <p className="events-tile-title">{crew.title}</p>
                    <p className="events-tile-subtitle">{crew.location || ''}</p>
                    <div className="events-tile-info">
                      <p className="events-tile-att">
                        {crew.memberCount === 1
                          ? '1 member'
                          : `${crew.memberCount || 0} members`}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
          </div>

          <MobileNavbar active="crew" />
        </div>
      </div>
    </RequireAuth>
  )
}


