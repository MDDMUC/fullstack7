'use client'

import React from 'react'
import Link from 'next/link'
import { RequireAuth } from '@/components/RequireAuth'
import MobileNavbar from '@/components/MobileNavbar'
import { supabase } from '@/lib/supabaseClient'

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
      }
    >
  >([])
  const [loading, setLoading] = React.useState(false)

  React.useEffect(() => {
    const fetchEvents = async () => {
      const client = supabase
      if (!client) return
      setLoading(true)
      
      const { data: eventsData, error: eventsError } = await client
        .from('events')
        .select('id,title,location,description,start_at,slots_total,slots_open,image_url,created_at')
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
        
        return {
          ...ev,
          thread: threadsMap[ev.id] ?? null,
          isNew,
        }
      })
      
      setEvents(combined)
      setLoading(false)
    }

    fetchEvents()
  }, [])

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

  return (
    <RequireAuth>
      <div className="events-screen" data-name="/ events">
        <div className="events-content">
            <div className="events-card custom-scrollbar">
            <Link href="/events/create" className="events-createbar" data-name="create-event-mobile" data-node-id="636:2102">
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
                <p className="events-createbar-text">create event</p>
              </div>
            </Link>

            {loading && <p className="events-loading">Loading events…</p>}
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
      </div>
    </RequireAuth>
  )
}
