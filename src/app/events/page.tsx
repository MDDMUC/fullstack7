'use client'

import React from 'react'
import Link from 'next/link'
import { RequireAuth } from '@/components/RequireAuth'
import MobileFilterBar from '@/components/MobileFilterBar'
import MobileNavbar from '@/components/MobileNavbar'
import MobileTopbar from '@/components/MobileTopbar'
import LoadingState from '@/components/LoadingState'
import EmptyState from '@/components/EmptyState'
import CreateButton from '@/components/CreateButton'
import { supabase } from '@/lib/supabaseClient'
import { fetchProfiles, fetchGymsFromTable, Gym } from '@/lib/profiles'

type EventRow = {
  id: string
  title: string
  location: string | null
  description: string | null
  start_at: string | null
  slots_total: number | null
  slots_open: number | null
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
  event_id: string | null
  last_message: string | null
  last_message_at: string | null
}

export default function EventsScreen() {
  const [events, setEvents] = React.useState<
    Array<
      EventRow & {
        thread?: ThreadRow | null
        isNew?: boolean
        creatorStyle?: string[]
        creatorGym?: string[]
        creatorName?: string | null
      }
    >
  >([])
  const [allEvents, setAllEvents] = React.useState<
    Array<
      EventRow & {
        thread?: ThreadRow | null
        isNew?: boolean
        creatorStyle?: string[]
        creatorGym?: string[]
        creatorName?: string | null
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

  React.useEffect(() => {
    const fetchEvents = async () => {
      const client = supabase
      if (!client) return
      setLoading(true)
      
      const { data: eventsData, error: eventsError } = await client
        .from('events')
        .select('id,title,location,description,start_at,slots_total,slots_open,image_url,created_at,created_by')
        .order('created_at', { ascending: false, nullsFirst: false })
        .order('start_at', { ascending: false, nullsFirst: false })

      if (eventsError || !eventsData) {
        setEvents([])
        setLoading(false)
        return
      }

      const eventIds = eventsData.map(e => e.id)
      let threadsMap: Record<string, ThreadRow> = {}
      if (eventIds.length > 0) {
        const { data: threadsData } = await client
          .from('threads')
          .select('id,event_id,last_message,last_message_at')
          .eq('type', 'event')
          .in('event_id', eventIds)
        threadsMap =
          threadsData?.reduce<Record<string, ThreadRow>>((acc, t) => {
            if (t.event_id) acc[t.event_id] = t
            return acc
          }, {}) ?? {}
      }

      // Fetch creator profiles to get style and gym info
      const creatorIds = Array.from(new Set(eventsData.map(e => e.created_by).filter(Boolean) as string[]))
      let creatorProfilesMap: Record<string, any> = {}
      if (creatorIds.length > 0) {
        const profiles = await fetchProfiles(client, creatorIds)
        creatorProfilesMap = profiles.reduce<Record<string, any>>((acc, p) => {
          acc[p.id] = p
          return acc
        }, {})
      }

      // Get today's date (start of day) for comparison
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const todayStart = today.getTime()
      
      const combined = eventsData.map(ev => {
        // Check if event was created today (same day)
        let isNew = false
        if (ev.created_at) {
          const eventCreatedAt = new Date(ev.created_at)
          eventCreatedAt.setHours(0, 0, 0, 0)
          const eventDayStart = eventCreatedAt.getTime()
          
          // Event is new if it was created on the same day (today)
          isNew = eventDayStart === todayStart
        }
        
        const creator = ev.created_by ? creatorProfilesMap[ev.created_by] : null
        const creatorStyle = creator ? getStylesFromProfile(creator) : []
        const creatorGym = creator && Array.isArray(creator.gym) ? creator.gym : []
        const creatorName = creator?.username?.split(' ')[0] || null

        return {
          ...ev,
          thread: threadsMap[ev.id] ?? null,
          isNew,
          creatorStyle,
          creatorGym,
          creatorName,
        }
      })
      
      setAllEvents(combined)
      setLoading(false)
    }

    fetchEvents()
    
    // Fetch gyms on mount
    const loadGyms = async () => {
      if (!supabase) return
      const gymsList = await fetchGymsFromTable(supabase)
      setGyms(gymsList)
    }
    loadGyms()
  }, [])

  // Extract filter options from all events
  const filterOptions = React.useMemo(() => {
    const cities = new Set<string>(['All'])
    const styles = new Set<string>(['All'])
    const gymNames = new Set<string>(['All'])

    allEvents.forEach(ev => {
      if (ev.location) cities.add(ev.location)
      ev.creatorStyle?.forEach(s => styles.add(s))
    })

    gyms.forEach(gym => {
      if (gym.name) gymNames.add(gym.name)
    })

    return {
      city: Array.from(cities).sort(),
      style: Array.from(styles).sort(),
      gym: Array.from(gymNames).sort(),
    }
  }, [allEvents, gyms])

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

  // Filter events based on selected filters
  const filteredEvents = React.useMemo(() => {
    return allEvents.filter(ev => {
      // Filter by city - case-insensitive
      if (filters.city !== 'All') {
        const eventCity = (ev.location || '').trim().toLowerCase()
        const filterCity = filters.city.trim().toLowerCase()
        if (eventCity !== filterCity) return false
      }

      // Filter by style - check if creator's style includes the selected style
      if (filters.style !== 'All') {
        const creatorStyles = (ev.creatorStyle || []).map(s => s.trim().toLowerCase())
        const filterStyle = filters.style.trim().toLowerCase()
        if (!creatorStyles.includes(filterStyle)) return false
      }

      // Filter by gym - check if creator's gym includes the selected gym
      if (filters.gym !== 'All') {
        const creatorGyms = ev.creatorGym || []
        if (creatorGyms.length === 0) return false
        
        const filterGym = filters.gym.trim().toLowerCase()
        
        // Find the gym ID that matches the selected gym name
        const selectedGymId = Array.from(gymMap.entries()).find(
          ([_, name]) => name.trim().toLowerCase() === filterGym
        )?.[0]
        
        if (!selectedGymId) {
          // If we can't find the gym ID, the filter might be invalid, but try name matching
          const hasGym = creatorGyms.some(g => {
            if (!g || typeof g !== 'string') return false
            const trimmed = g.trim().toLowerCase()
            return trimmed === filterGym
          })
          if (!hasGym) return false
        } else {
          // Check if any creator gym matches (by ID or by name)
          const hasGym = creatorGyms.some(g => {
            if (!g || typeof g !== 'string') return false
            const trimmed = g.trim()
            
            // Check if it's a UUID (gym ID) - UUIDs are typically 36 chars with dashes
            const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(trimmed)
            
            if (isUUID) {
              // It's a gym ID, compare with selected gym ID
              return trimmed.toLowerCase() === selectedGymId.toLowerCase()
            } else {
              // It's a gym name, compare directly (case-insensitive)
              return trimmed.toLowerCase() === filterGym
            }
          })
          
          if (!hasGym) return false
        }
      }

      return true
    })
  }, [allEvents, filters, gymMap])

  // Update events when filters change
  React.useEffect(() => {
    setEvents(filteredEvents)
  }, [filteredEvents])

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

  const formatTimeAgo = (iso?: string | null) => {
    if (!iso) return null
    const now = new Date()
    const then = new Date(iso)
    const diffMs = now.getTime() - then.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return null // Don't show if older than a week
  }

  return (
    <RequireAuth>
      <div className="events-screen" data-name="/ events">
        <MobileTopbar breadcrumb="Events" />
        {/* Filters */}
        <MobileFilterBar
          filters={filters}
          filterOptions={filterOptions}
          onFilterChange={(key, val) => setFilters(prev => ({ ...prev, [key]: val }))}
          filterKeys={['city', 'style', 'gym']}
        />

        <div className="events-content">
          <CreateButton href="/events/create" label="Create Event" variant="ghost" />

          {loading && <LoadingState message="Loading events…" />}
          {!loading && events.length === 0 && (
            <EmptyState message="No events found" />
          )}
          {!loading &&
            events.map(ev => (
              <Link
                key={ev.id}
                href={`/events/detail?eventId=${ev.id}`}
                className={`events-tile ${ev.isNew ? 'events-tile-new' : ''}`}
              >
                <div className="events-tile-img">
                  <img
                    src={ev.image_url || '/icons/event-placeholder.svg'}
                    alt=""
                    className="events-tile-img-el"
                  />
                  {ev.creatorName && (
                    <div className="events-tile-host-badge">
                      <span className="events-tile-host-label">Host:</span>
                      <span className="events-tile-host-name">{ev.creatorName}</span>
                    </div>
                  )}
                  {ev.thread?.last_message_at && formatTimeAgo(ev.thread.last_message_at) && (
                    <div className="events-tile-last-message">
                      Active {formatTimeAgo(ev.thread.last_message_at)}
                    </div>
                  )}
                  <div className="events-tile-icon">
                    <img src="/icons/events.svg" alt="" />
                  </div>
                </div>
                <div className="events-tile-overlay" />
                <div className="events-tile-text">
                  <p className="events-tile-title">{ev.title}</p>
                  <p className="events-tile-subtitle">{ev.location || ''}</p>
                  <div className="events-tile-info">
                    <p className="events-tile-loc">{formatDate(ev.start_at)}</p>
                    <p className="events-tile-att">
                      {ev.slots_total != null && ev.slots_open != null
                        ? `${ev.slots_total - ev.slots_open} going · ${ev.slots_open} open`
                        : 'Slots TBD'}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
        </div>

        <MobileNavbar active="events" />
      </div>
    </RequireAuth>
  )
}

