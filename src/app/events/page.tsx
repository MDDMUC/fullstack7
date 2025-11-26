'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Event, loadEvents } from '@/lib/communityData'

export default function EventsPage() {
  const router = useRouter()
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [going, setGoing] = useState<Record<string, boolean>>({})

  useEffect(() => {
    let mounted = true
    const load = async () => {
      const data = await loadEvents()
      if (!mounted) return
      setEvents(data)
      setLoading(false)
    }
    load()
    return () => {
      mounted = false
    }
  }, [])

  const totalAttendees = useMemo(
    () => events.reduce((sum, e) => sum + e.attendees, 0),
    [events]
  )

  const toggleGoing = (id: string) => {
    setGoing(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const handleRSVP = (id: string) => {
    toggleGoing(id)
    router.push('/signup')
  }

  return (
    <main className="feature-shell">
      <section className="feature-hero">
        <div>
          <p className="eyebrow">Events</p>
          <h1>Meetups, trips, cleanups.</h1>
          <p className="lede">
            Give people a reason to open Dab on weekends. RSVP, see who else is going, and keep the thread alive
            through the event.
          </p>
          <div className="feature-actions">
            <button className="cta" onClick={() => router.push('/signup')}>Get started</button>
            <button className="ghost" onClick={() => router.push('/gym-chat')}>Chat with hosts</button>
          </div>
          <div className="pill-row">
            <span>Gym & outdoor</span>
            <span>Carpool built-in</span>
            <span>RSVP + thread</span>
          </div>
        </div>
        {events.length ? (
          <div className="feature-stat">
            <p className="stat__label">People attending</p>
            <p className="stat__number">{totalAttendees}</p>
            <p className="muted small">Threads stay attached to events for coordination and safety.</p>
          </div>
        ) : null}
      </section>

      <section className="event-grid">
        {events.map(event => {
          const fill = Math.min(100, Math.round((event.attendees / event.capacity) * 100))
          return (
            <article key={event.id} className="event-card">
              <header>
                <div>
                  <p className="eyebrow">{event.type}</p>
                  <h3>{event.title}</h3>
                  <p className="muted small">{event.host} - {event.date} - {event.time}</p>
                  <p className="muted small">{event.location}</p>
                </div>
                <div className="pill">{event.attendees}/{event.capacity} going</div>
              </header>
              <p className="event-desc">{event.description}</p>
              <div className="tagline">
                {event.tags.map(tag => <span key={tag} className="ghost-tag">{tag}</span>)}
              </div>
              <div className="progress">
                <div className="progress-bar" style={{ width: `${fill}%` }} />
              </div>
              <div className="event-actions">
                <button className="ghost" onClick={() => router.push('/gym-chat')}>Open thread</button>
                <button
                  className={`cta ${going[event.id] ? 'is-active' : ''}`}
                  onClick={() => handleRSVP(event.id)}
                >
                  {going[event.id] ? 'Marked as going' : 'RSVP'}
                </button>
              </div>
            </article>
          )
        })}

        {!events.length && !loading ? (
          <div className="panel empty-state">
            <h3>No events yet.</h3>
            <p className="muted">Host the first one and set the tone.</p>
            <button className="cta" onClick={() => router.push('/signup')}>Host an event</button>
          </div>
        ) : null}
      </section>
    </main>
  )
}
