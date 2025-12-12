'use client'

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import React, { Suspense } from 'react'

import ButtonCta from '@/components/ButtonCta'
import MobileNavbar from '@/components/MobileNavbar'
import { RequireAuth } from '@/components/RequireAuth'
import { useAuthSession } from '@/hooks/useAuthSession'
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
}

type ThreadRow = {
  id: string
}

const HERO_PLACEHOLDER = '/icons/event-placeholder.svg'

const formatEventDate = (iso?: string | null) => {
  if (!iso) return ''
  const date = new Date(iso)
  const weekday = date.toLocaleDateString(undefined, { weekday: 'long' })
  const day = `${date.getDate()}`.padStart(2, '0')
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const year = date.getFullYear()
  const time = date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: false })
  const tz = new Intl.DateTimeFormat(undefined, { timeZoneName: 'short' })
    .formatToParts(date)
    .find(part => part.type === 'timeZoneName')?.value
  return `${weekday} / ${day}.${month}.${year} / ${time}${tz ? ` (${tz})` : ''}`
}

const formatGoing = (slotsTotal?: number | null, slotsOpen?: number | null) => {
  if (slotsTotal == null || slotsOpen == null) return 'Attendance TBD'
  const going = Math.max(0, slotsTotal - slotsOpen)
  return `${going} people are going`
}

const extractCity = (location?: string | null) => {
  if (!location) return ''
  const parts = location.split(',').map(part => part.trim()).filter(Boolean)
  if (parts.length > 1) return parts[parts.length - 1]
  return ''
}

function EventDetailContent() {
  const searchParams = useSearchParams()
  const eventId = searchParams.get('eventId')
  const router = useRouter()
  const { session } = useAuthSession()
  const userId = session?.user?.id

  const [event, setEvent] = React.useState<EventRow | null>(null)
  const [thread, setThread] = React.useState<ThreadRow | null>(null)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [joining, setJoining] = React.useState(false)

  React.useEffect(() => {
    let cancelled = false
    const client = supabase
    if (!eventId) {
      setError('Event not found')
      return
    }
    if (!client) {
      setError('Unable to connect to Supabase')
      return
    }

    const fetchEvent = async () => {
      setLoading(true)
      setError(null)
      const { data: eventData, error: eventError } = await client
        .from('events')
        .select('id,title,location,description,start_at,slots_total,slots_open,image_url')
        .eq('id', eventId)
        .maybeSingle()

      if (cancelled) return

      if (eventError || !eventData) {
        setEvent(null)
        setThread(null)
        setError('Event not found')
        setLoading(false)
        return
      }

      const { data: threadData } = await client
        .from('threads')
        .select('id')
        .eq('type', 'event')
        .eq('event_id', eventId)
        .maybeSingle()

      if (cancelled) return

      setEvent(eventData)
      setThread(threadData ?? null)
      setLoading(false)
    }

    fetchEvent()

    return () => {
      cancelled = true
    }
  }, [eventId])

  const timeLabel = formatEventDate(event?.start_at)
  const goingLabel = formatGoing(event?.slots_total, event?.slots_open)
  const cityLabel = extractCity(event?.location) || 'Location'

  const handleJoinChat = async () => {
    if (!supabase || !userId || !event) {
      setError('You must be signed in and have an event loaded to join chat.')
      return
    }
    setJoining(true)
    setError(null)
    const now = new Date().toISOString()
    let threadId = thread?.id

    // If no event thread exists yet, create one on the fly
    if (!threadId) {
      const { data: newThread, error: createErr } = await supabase
        .from('threads')
        .insert({
          type: 'event',
          event_id: event.id,
          title: event.title,
          last_message: 'New event chat',
          last_message_at: now,
        })
        .select('id')
        .maybeSingle()
      if (createErr || !newThread?.id) {
        setError(createErr?.message || 'Could not create event chat.')
        setJoining(false)
        return
      }
      threadId = newThread.id as string
      setThread({ id: threadId })
    }

    // Ensure participation and bump ordering
    const { error: partErr } = await supabase.from('thread_participants').upsert({ thread_id: threadId, user_id: userId })
    if (partErr) {
      setError(partErr.message)
      setJoining(false)
      return
    }
    // Drop a system message to ensure unread + ordering like other chats
    const { data: newMsg, error: msgErr } = await supabase
      .from('messages')
      .insert({
        thread_id: threadId,
        body: 'Joined event',
        sender_id: userId,
        receiver_id: userId,
        status: 'unread',
      })
      .select('created_at')
      .maybeSingle()
    const bumpAt = newMsg?.created_at ?? now
    await supabase.from('threads').update({ last_message_at: bumpAt, last_message: 'Joined event' }).eq('id', threadId)
    setJoining(false)
    router.push(`/chats/${threadId}`)
  }

  return (
    <div className="events-detail-screen" data-name="/event/detail">
      <div className="events-detail-content">
        <div className="events-detail-card">
          <div className="events-detail-backbar">
            <Link href="/events" className="events-detail-back-btn" aria-label="Back to events">
              <img src="/icons/chevron-left.svg" alt="" className="events-detail-back-icon" />
            </Link>
            <div className="events-detail-back-text">back</div>
            <div className="events-detail-dots">
              <img src="/icons/dots.svg" alt="" className="events-detail-dots-img" />
            </div>
          </div>

          {loading && <p className="events-detail-status">Loading event…</p>}
          {!loading && error && <p className="events-detail-status events-detail-status-error">{error}</p>}

          {event && !loading && !error && (
            <>
              <div className="events-detail-hero">
                <img
                  src={event.image_url || HERO_PLACEHOLDER}
                  alt={event.title || 'Event'}
                  className="events-detail-hero-img"
                />
                <div className="events-detail-hero-overlay" />
                <div className="events-detail-hero-text">
                  <p className="events-detail-title">{event.title}</p>
                  {event.location ? <p className="events-detail-subtitle">{event.location}</p> : null}
                  <div className="events-detail-info-row">
                    <p className="events-detail-info-loc">{cityLabel}</p>
                    <p className="events-detail-info-att">{goingLabel}</p>
                  </div>
                </div>
              </div>

              <div className="events-detail-block">
                <div className="events-detail-block-text">
                  <p className="events-detail-block-title">TIME &amp; LOCATION</p>
                  <p className="events-detail-block-body">
                    {timeLabel || 'Schedule to be announced'}
                  </p>
                </div>
              </div>

              <div className="events-detail-block">
                <div className="events-detail-block-text">
                  <p className="events-detail-block-title">DESCRIPTION</p>
                  <p className="events-detail-block-body">
                    {event.description || 'Details coming soon.'}
                  </p>
                </div>
              </div>

              <div className="events-detail-cta-row">
                    <ButtonCta onClick={handleJoinChat} disabled={joining || loading || !event}>
                      {joining ? 'Joining…' : 'Join Chat'}
                    </ButtonCta>
                <ButtonCta>I’m Going</ButtonCta>
              </div>
            </>
          )}
        </div>

        <MobileNavbar active="events" />
      </div>
    </div>
  )
}

export default function EventDetailPage() {
  return (
    <RequireAuth>
      <Suspense fallback={null}>
        <EventDetailContent />
      </Suspense>
    </RequireAuth>
  )
}
