'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckIn, loadCheckIns } from '@/lib/communityData'
import Eyebrow from '@/components/Eyebrow'

export default function CheckInPage() {
  const router = useRouter()
  const [checkIns, setCheckIns] = useState<CheckIn[]>([])
  const [loading, setLoading] = useState(true)
  const [pinged, setPinged] = useState<Record<string, boolean>>({})
  const [liveCount, setLiveCount] = useState(0)
  const [statPulse, setStatPulse] = useState<'up' | 'down' | null>(null)

  useEffect(() => {
    let mounted = true
    const load = async () => {
      const data = await loadCheckIns()
      if (!mounted) return
      setCheckIns(data)
      setLiveCount(data.length || 6)
      setLoading(false)
    }
    load()
    return () => {
      mounted = false
    }
  }, [])

  useEffect(() => {
    if (!checkIns.length && liveCount === 0) return
    let timeoutId: ReturnType<typeof setTimeout> | undefined
    const tick = () => {
      setLiveCount(prev => {
        const base = prev || 6
        const delta = Math.floor(Math.random() * 5) - 2 // -2 to +2
        const next = base + delta
        const clamped = Math.max(2, Math.min(40, next))
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
  }, [checkIns.length, liveCount])

  const occupancy = useMemo(() => {
    return checkIns.reduce<Record<string, number>>((acc, curr) => {
      acc[curr.gym] = (acc[curr.gym] ?? 0) + 1
      return acc
    }, {})
  }, [checkIns])

  const handlePing = (id: string) => {
    setPinged(prev => ({ ...prev, [id]: true }))
    router.push('/signup')
  }

  return (
    <main className="feature-shell">
      <section className="feature-hero">
        <div className="hero-visual">
          <img src="/group3.jpg" alt="Climbers checking in at the gym" className="hero-image" />
        </div>
        <div className="hero-copy">
          <Eyebrow>Presence</Eyebrow>
          <h1 className="hero-metal">Check-ins that feel live.</h1>
          <p className="lede">
            Opt-in status so you can see who is at your gym right now, who is driving there, and who is wrapping up.
            Perfect for spontaneous linkups.
          </p>
          <div className="feature-actions">
            <button className="cta" onClick={() => router.push('/signup')}>Get started</button>
            <button className="ghost" onClick={() => router.push('/partner-finder')}>Find a partner</button>
          </div>
          <div className="pill-row">
            <span>Privacy-first opt-in</span>
            <span>Auto-timeout after sessions</span>
            <span>Gym-level occupancy</span>
          </div>
        </div>
        {checkIns.length ? (
          <div className="feature-stat stat-tall">
            <div>
              <p className="stat__label">People checked in</p>
              <p
                className={`stat__number ${
                  statPulse === 'up' ? 'stat-pulse-up' : statPulse === 'down' ? 'stat-pulse-down' : ''
                }`}
              >
                {liveCount || checkIns.length || 6}
              </p>
              <p className="muted small">Presence expires after your session. No weird passive tracking.</p>
            </div>
          </div>
        ) : null}
      </section>

      <section className="panel occupancy-panel">
        <div className="occupancy-grid">
          {Object.entries(occupancy).map(([gym, count]) => (
            <div key={gym} className="occupancy-card">
              <Eyebrow>{gym}</Eyebrow>
              <h3>{count} climbers</h3>
              <p className="muted small">Live check-ins only.</p>
            </div>
          ))}
          {!Object.keys(occupancy).length && !loading ? (
            <p className="muted small">No one checked in yet.</p>
          ) : null}
        </div>
      </section>

      <section className="checkin-grid">
        {checkIns.map(checkin => (
          <article key={checkin.id} className="session-card">
            <header>
              <div>
                <Eyebrow>{checkin.gym}</Eyebrow>
                <h3>{checkin.name}</h3>
                <p className="muted small">{checkin.status} - {checkin.since}</p>
              </div>
              <span
                className={`pill ${
                  checkin.status === 'Here now'
                    ? 'herenow'
                    : checkin.status === 'On my way'
                      ? 'onmyway'
                      : 'leavingsoon'
                }`}
              >
                {checkin.status}
              </span>
            </header>
            <div className="session-meta">
              <div>
                <p className="muted small">Grade</p>
                <strong>{checkin.grade}</strong>
              </div>
              <div>
                <p className="muted small">Plan</p>
                <strong>{checkin.plan}</strong>
              </div>
            </div>
            <div className="tagline">
              {checkin.tags.map(tag => <span key={tag} className="ghost-tag">{tag}</span>)}
            </div>
            <div className="session-actions">
              <button className="ghost" onClick={() => router.push('/gym-chat')}>Ask in wall</button>
              <button className="cta" onClick={() => handlePing(checkin.id)}>
                {pinged[checkin.id] ? (
                  'Ping sent'
                ) : (
                  <>
                    <span className="dab-text">dab</span> to climb
                  </>
                )}
              </button>
            </div>
          </article>
        ))}

        {!checkIns.length && !loading ? (
          <div className="panel empty-state">
            <h3>No live check-ins.</h3>
            <p className="muted">Be the first to drop a presence status.</p>
            <button className="cta" onClick={() => router.push('/signup')}>Check in</button>
          </div>
        ) : null}
      </section>
    </main>
  )
}
