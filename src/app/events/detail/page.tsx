'use client'

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

import { useRouter, useSearchParams } from 'next/navigation'
import React, { Suspense } from 'react'

import ButtonCta from '@/components/ButtonCta'
import MobileNavbar from '@/components/MobileNavbar'
import BackBar from '@/components/BackBar'
import LoadingState from '@/components/LoadingState'
import { RequireAuth } from '@/components/RequireAuth'
import { useAuthSession } from '@/hooks/useAuthSession'
import { supabase, requireSupabase } from '@/lib/supabaseClient'

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
  const [isGoing, setIsGoing] = React.useState(false)
  const [rsvpLoading, setRsvpLoading] = React.useState(false)
  const [rsvpError, setRsvpError] = React.useState<string | null>(null)

  const loadEvent = React.useCallback(async (showLoading = true) => {
    if (!eventId) {
      setError('Event not found')
      if (showLoading) setLoading(false)
      return null
    }
    if (!supabase) {
      setError('Unable to connect to Supabase')
      if (showLoading) setLoading(false)
      return null
    }

    if (showLoading) setLoading(true)
    setError(null)

    const { data: eventData, error: eventError } = await supabase
      .from('events')
      .select('id,title,location,description,start_at,slots_total,slots_open,image_url')
      .eq('id', eventId)
      .maybeSingle()

    if (eventError || !eventData) {
      setEvent(null)
      setThread(null)
      setError('Event not found')
      if (showLoading) setLoading(false)
      return null
    }

    const { data: threadData } = await supabase
      .from('threads')
      .select('id')
      .eq('type', 'event')
      .eq('event_id', eventId)
      .maybeSingle()

    setEvent(eventData)
    setThread(threadData ?? null)
    if (showLoading) setLoading(false)
    return eventData
  }, [eventId])

  React.useEffect(() => {
    let cancelled = false
    if (!eventId || !supabase) return

    const fetchEventAndRsvp = async () => {
      const eventData = await loadEvent(true)
      if (cancelled || !eventData) return

      if (!userId) {
        setIsGoing(false)
        return
      }

      const { data: rsvp } = await requireSupabase()
        .from('event_rsvps')
        .select('id')
        .eq('event_id', eventData.id)
        .eq('user_id', userId)
        .maybeSingle()

      if (cancelled) return
      setIsGoing(!!rsvp)
    }

    fetchEventAndRsvp()

    return () => {
      cancelled = true
    }
  }, [eventId, userId, loadEvent])

  const timeLabel = formatEventDate(event?.start_at)
  const goingLabel = formatGoing(event?.slots_total, event?.slots_open)
  const cityLabel = extractCity(event?.location) || 'Location'
  const isFull = event?.slots_open != null && event.slots_open <= 0
  const rsvpDisabled = rsvpLoading || !event || (!isGoing && isFull)
  const rsvpLabel = isGoing ? 'Leave' : isFull ? 'Full' : "I'm Going"

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
    // Use RPC function to bypass RLS if direct insert fails
    const { error: partErr } = await supabase.from('thread_participants').upsert({ thread_id: threadId, user_id: userId })
    if (partErr) {
      // If direct insert fails due to RLS, try using the RPC function
      const { error: rpcErr } = await supabase.rpc('add_thread_participant', {
        p_thread_id: threadId,
        p_user_id: userId,
        p_role: 'member',
      })
      if (rpcErr) {
        console.error('Error joining thread:', rpcErr)
        setError(rpcErr.message || partErr.message || 'Failed to join chat')
        setJoining(false)
        return
      }
    }
    // Drop a system message to ensure unread + ordering like other chats
    const { data: newMsg, error: msgErr } = await supabase
      .from('messages')
      .insert({
        thread_id: threadId,
        body: 'Joined event',
        sender_id: userId,
        receiver_id: userId,
        status: 'sent',
      })
      .select('created_at')
      .maybeSingle()
    const bumpAt = newMsg?.created_at ?? now
    await supabase.from('threads').update({ last_message_at: bumpAt, last_message: 'Joined event' }).eq('id', threadId)
    setJoining(false)
    router.push(`/chats/${threadId}`)
  }

  const handleRsvpToggle = async () => {
    if (!supabase || !userId || !event) {
      setRsvpError('You must be signed in to RSVP.')
      return
    }

    if (!isGoing && isFull) {
      setRsvpError('This event is full.')
      return
    }

    setRsvpLoading(true)
    setRsvpError(null)

    try {
      const { data: existing } = await supabase
        .from('event_rsvps')
        .select('id')
        .eq('event_id', event.id)
        .eq('user_id', userId)
        .maybeSingle()

      if (existing?.id) {
        const { error: deleteError } = await supabase
          .from('event_rsvps')
          .delete()
          .eq('id', existing.id)
        if (deleteError) throw deleteError
        setIsGoing(false)
      } else {
        const { error: insertError } = await supabase
          .from('event_rsvps')
          .insert({ event_id: event.id, user_id: userId, status: 'going' })
        if (insertError) throw insertError
        setIsGoing(true)
      }

      await loadEvent(false)
    } catch (err: any) {
      setRsvpError(err?.message || 'Unable to update RSVP.')
    } finally {
      setRsvpLoading(false)
    }
  }

  return (
    <div className="events-detail-screen" data-name="/event/detail">
      <div className="events-detail-content">
        <div className="events-detail-card">
          <BackBar
            backHref="/events"
            backText="back"
            className="chats-event-backbar"
            rightSlot={
              <button type="button" className="chats-event-menu" aria-label="Menu">
                <img src="/icons/dots.svg" alt="" className="chats-event-menu-icon" />
              </button>
            }
          />

          {loading && <LoadingState message="Loading event…" />}
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
                  {joining ? 'Joining...' : 'Join Chat'}
                </ButtonCta>
                <ButtonCta onClick={handleRsvpToggle} disabled={rsvpDisabled}>
                  {rsvpLoading ? 'Saving...' : rsvpLabel}
                </ButtonCta>
              </div>
              {rsvpError && (
                <p className="events-detail-status events-detail-status-error">{rsvpError}</p>
              )}
            </>
          )}
        </div>
      </div>
      <MobileNavbar active="events" />
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



