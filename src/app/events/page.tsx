'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Event, loadEvents } from '@/lib/communityData'
import Eyebrow from '@/components/Eyebrow'

export default function EventsPage() {
  const router = useRouter()
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [going, setGoing] = useState<Record<string, boolean>>({})
  const [liveAttendees, setLiveAttendees] = useState(0)
  const [statPulse, setStatPulse] = useState<'up' | 'down' | null>(null)
  const eventImages = ['/event1.jpg', '/event2.jpg', '/event3.jpg', '/event4.jpg', '/group2.jpg', '/group3.jpg', '/boardlords.jpg']
  const recentChats = [
    { user: 'Lena', avatar: '/fallback-female.jpg', time: '5m ago', message: "I might bring some snacks, anyone allergic?" },
    { user: 'Marco', avatar: '/fallback-male.jpg', time: '12m ago', message: 'Looking for a ride from Sendlinger Tor, 13:30?' },
    { user: 'Ava', avatar: '/fallback-female.jpg', time: '22m ago', message: 'I can belay 6b-7a, happy to swap leads.' },
  ]

  useEffect(() => {
    let mounted = true
    const load = async () => {
      const data = await loadEvents()
      if (!mounted) return
      setEvents(data)
      const total = data.reduce((sum, e) => sum + e.attendees, 0)
      setLiveAttendees(total || 10)
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

  useEffect(() => {
    if (!events.length && liveAttendees === 0) return
    let timeoutId: ReturnType<typeof setTimeout> | undefined
    const tick = () => {
      setLiveAttendees(prev => {
        const base = prev || 10
        const delta = Math.floor(Math.random() * 7) - 3 // -3 to +3
        const next = base + delta
        const clamped = Math.max(4, Math.min(80, next))
        setStatPulse(delta > 0 ? 'up' : delta < 0 ? 'down' : null)
        return clamped
      })
      const nextDelay = 2000 + Math.random() * 2500
      timeoutId = setTimeout(tick, nextDelay)
    }
    tick()
    return () => {
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [events.length, liveAttendees])

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
        <div className="hero-visual">
          <img src="/group2.jpg" alt="Climbing event crowd" className="hero-image" />
        </div>
        <div className="hero-copy">
          <Eyebrow>Events</Eyebrow>
          <h1 className="hero-metal">Meetups, trips, cleanups.</h1>
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
          <div className="feature-stat stat-tall">
            <div>
              <p className="stat__label">People attending</p>
              <p
                className={`stat__number ${
                  statPulse === 'up' ? 'stat-pulse-up' : statPulse === 'down' ? 'stat-pulse-down' : ''
                }`}
              >
                {liveAttendees || totalAttendees || 10}
              </p>
              <p className="muted small">Threads stay attached to events for coordination and safety.</p>
              <div style={{ marginTop: 10, display: 'grid', gap: 10 }}>
                {recentChats.map(chat => (
                  <div
                    key={`${chat.user}-${chat.time}`}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'auto 1fr',
                      gap: '8px',
                      alignItems: 'center',
                      padding: '8px',
                      borderRadius: '10px',
                      border: '1px solid var(--stroke)',
                      background: 'rgba(12,14,18,0.65)',
                    }}
                  >
                    <img
                      src={chat.avatar}
                      alt={chat.user}
                      style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--stroke)' }}
                    />
                    <div style={{ display: 'grid', gap: '2px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '6px' }}>
                        <strong style={{ fontSize: 13 }}>{chat.user}</strong>
                        <span className="muted small" style={{ fontSize: 11 }}>{chat.time}</span>
                      </div>
                      <p className="muted small" style={{ margin: 0, fontSize: 12 }}>
                        {chat.message.length > 42 ? `${chat.message.slice(0, 42)}…` : chat.message}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </section>

      <section className="event-grid">
        {[...events].sort((a, b) => (a.id === 'e-boardlords' ? -1 : b.id === 'e-boardlords' ? 1 : 0)).map(event => {
          const fill = Math.min(100, Math.round((event.attendees / event.capacity) * 100))
          const imageForEvent = (() => {
            if (event.id === 'e4') return '/lead2.jpg'
            if (event.id === 'e-boardlords') return '/boardlords.jpg'
            if (event.id === 'e2') return '/kocheltrip.jpg'
            const hash = event.id.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0)
            return eventImages[Math.abs(hash) % eventImages.length] || eventImages[0]
          })()
          return (
            <article key={event.id} className="event-card">
              <div style={{ position: 'relative', overflow: 'hidden', borderRadius: '12px', border: '1px solid var(--stroke)' }}>
                <img
                  src={imageForEvent}
                  alt={event.title}
                  style={{ width: '100%', height: '200px', objectFit: 'cover', display: 'block' }}
                />
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(180deg, rgba(0,0,0,0.05), rgba(0,0,0,0.55))',
                    display: 'flex',
                    alignItems: 'flex-end',
                    padding: '12px',
                  }}
                >
                  <div style={{ display: 'grid', gap: '6px' }}>
                    <div>
                      <p className="eyebrow" style={{ marginBottom: 4 }}>{event.type}</p>
                      <h4 style={{ margin: 0 }}>{event.title}</h4>
                    </div>
                    <div
                      className="pill"
                      style={{
                        width: 'fit-content',
                        padding: '4px 10px',
                        fontSize: '11px',
                        lineHeight: 1.1,
                        border: '1px solid var(--stroke)',
                        background: 'rgba(12,14,18,0.65)',
                        color: 'var(--text)',
                        letterSpacing: '0.2px',
                      }}
                    >
                      {event.attendees}/{event.capacity} going
                    </div>
                  </div>
                </div>
              </div>
              <header>
                <div style={{ display: 'grid', gap: '4px', alignItems: 'start', width: '100%' }}>
                  <p className="muted small">{event.host} - {event.date} - {event.time}</p>
                  <p className="muted small">{event.location}</p>
                </div>
              </header>
              <p className="event-desc">{event.description}</p>
              <div className="tagline">
                {event.tags.map(tag => <span key={tag} className="ghost-tag">{tag}</span>)}
              </div>
              <div className="progress">
                <div className="progress-bar" style={{ width: `${fill}%` }} />
              </div>
              <div className="event-actions">
                <button className="ghost" onClick={() => router.push('/gym-chat')}>Join Chat</button>
                <button
                  className={`cta ${going[event.id] ? 'is-active' : ''}`}
                  onClick={() => handleRSVP(event.id)}
                >
                  {going[event.id] ? 'Marked as going' : 'Join'}
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
