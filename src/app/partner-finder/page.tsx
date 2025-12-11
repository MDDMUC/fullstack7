'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Session, loadSessions } from '@/lib/communityData'
import Eyebrow from '@/components/Eyebrow'

const unique = (list: string[]) => Array.from(new Set(list))

const formatBoulderweltGrade = (grade: string) => {
  if (!grade) return ''
  const trimmed = grade.trim()
  const numeric = parseInt(trimmed, 10)
  if (!Number.isNaN(numeric)) return `Boulderwelt ${Math.min(Math.max(numeric, 1), 9)}`

  const vMatch = trimmed.toUpperCase().match(/^V\s*([0-9+]+)/)
  if (vMatch) {
    const vNum = parseInt(vMatch[1].replace('+', ''), 10)
    const map: Record<number, number> = { 0: 1, 1: 2, 2: 3, 3: 4, 4: 5, 5: 6, 6: 7, 7: 8, 8: 9, 9: 9 }
    const bw = map[Math.min(vNum, 9)] ?? 5
    return `Boulderwelt ${bw}`
  }
  return trimmed
}

export default function PartnerFinderPage() {
  const router = useRouter()
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const [statPulse, setStatPulse] = useState<'up' | 'down' | null>(null)
  const [liveSpots, setLiveSpots] = useState(0)
  const [filters, setFilters] = useState({
    gym: 'All',
    style: 'All',
    day: 'All',
    belay: 'any',
    search: '',
  })

  useEffect(() => {
    let mounted = true
    const load = async () => {
      const data = await loadSessions()
      if (!mounted) return
      setSessions(data)
      const sum = data.reduce((acc, s) => acc + (parseInt(s.availability, 10) || 0), 0)
      setLiveSpots(sum || 8)
      setLoading(false)
    }
    load()
    return () => {
      mounted = false
    }
  }, [])

  useEffect(() => {
    if (!sessions.length && liveSpots === 0) return
    let timeoutId: ReturnType<typeof setTimeout> | undefined
    const tick = () => {
      setLiveSpots(prev => {
        const base = prev || 8
        const delta = Math.floor(Math.random() * 5) - 2 // -2 to +2
        const next = base + delta
        const clamped = Math.max(2, Math.min(18, next))
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
  }, [sessions.length, liveSpots])

  const gyms = useMemo(() => unique(sessions.map(s => s.gym)), [sessions])
  const styles = useMemo(() => unique(sessions.map(s => s.style)), [sessions])
  const days = useMemo(() => unique(sessions.map(s => s.day)), [sessions])

  const filteredSessions = useMemo(() => {
    return sessions.filter(session => {
      const matchesGym = filters.gym === 'All' || session.gym === filters.gym
      const matchesStyle = filters.style === 'All' || session.style === filters.style
      const matchesDay = filters.day === 'All' || session.day === filters.day
      const matchesBelay =
        filters.belay === 'any' ||
        (filters.belay === 'verified' && session.belayVerified) ||
        (filters.belay === 'unverified' && !session.belayVerified)
      const matchesSearch =
        !filters.search ||
        session.note.toLowerCase().includes(filters.search.toLowerCase()) ||
        session.tags.some(tag => tag.toLowerCase().includes(filters.search.toLowerCase()))
      return matchesGym && matchesStyle && matchesDay && matchesBelay && matchesSearch
    })
  }, [filters, sessions])

  const handleJoin = () => router.push('/signup')
  const sessionImages = ['/gym.jpg', '/group2.jpg', '/group3.jpg', '/group4.jpg', '/hero-main.jpg']
  const gymThumbFor = (gym: string) => {
    const lower = gym.toLowerCase()
    if (lower.includes('boulderwelt')) return '/gym-boulderwelt.jpg'
    if (lower.includes('thalkirchen')) return '/gym-thalkirchen.jpg'
    if (lower.includes('freimann')) return '/gym-freimann.jpg'
    return '/fallback-gym.png'
  }

  return (
    <main className="feature-shell">
      <section className="feature-hero">
        <div className="hero-visual">
          <img src="/hero-main.jpg" alt="Climbers at the wall" className="hero-image" />
        </div>
        <div className="hero-copy">
          <Eyebrow>Partner finder</Eyebrow>
          <h1 className="hero-metal">Find a session fast.</h1>
          <p className="lede">
            Availability + grade + style in one glance. No cold DMs - just opt in and climb with people who match
            your pace and stoke.
          </p>
          <div className="feature-actions">
            <button className="button-navlink button-navlink-hover" onClick={handleJoin}>Get started</button>
            <button className="button-navlink" onClick={() => router.push('/gym-chat')}>Jump into a wall</button>
          </div>
          <div className="pill-row">
            <span>Belay verification</span>
            <span>Grade & style filters</span>
            <span>Outdoor trip ready</span>
          </div>
        </div>
        {sessions.length ? (
          <div className="feature-stat stat-tall">
            <div>
              <p className="stat__label">Spots open right now</p>
              <p
                className={`stat__number ${
                  statPulse === 'up' ? 'stat-pulse-up' : statPulse === 'down' ? 'stat-pulse-down' : ''
                }`}
              >
                {liveSpots || sessions.reduce((sum, s) => sum + (parseInt(s.availability, 10) || 0), 0) || 8}
              </p>
              <p className="muted small">Low-friction invites, opt-in responses, and clear safety signals.</p>
            </div>
          </div>
        ) : null}
      </section>

      <section className="panel filter-panel" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr)) 100px', gap: '10px', alignItems: 'end' }}>
        <label className="field">
          <span>Gym</span>
          <select value={filters.gym} onChange={e => setFilters(prev => ({ ...prev, gym: e.target.value }))}>
            <option>All</option>
            {gyms.map(gym => <option key={gym}>{gym}</option>)}
          </select>
        </label>
        <label className="field">
          <span>Style</span>
          <select value={filters.style} onChange={e => setFilters(prev => ({ ...prev, style: e.target.value }))}>
          <option>All</option>
            {styles.map(style => <option key={style}>{style}</option>)}
          </select>
        </label>
        <label className="field">
          <span>Day</span>
          <select value={filters.day} onChange={e => setFilters(prev => ({ ...prev, day: e.target.value }))}>
            <option>All</option>
            {days.map(day => <option key={day}>{day}</option>)}
          </select>
        </label>
        <label className="field">
          <span>Belay</span>
          <select value={filters.belay} onChange={e => setFilters(prev => ({ ...prev, belay: e.target.value }))}>
            <option value="any">Any</option>
            <option value="verified">Verified</option>
            <option value="unverified">Not verified</option>
          </select>
        </label>
        <label className="field">
          <span>Search</span>
          <input
            type="search"
            placeholder="Comp wall, carpool, morning..."
            value={filters.search}
            onChange={e => setFilters(prev => ({ ...prev, search: e.target.value }))}
          />
        </label>
        <button
          className="button-navlink"
          style={{ alignSelf: 'center', justifySelf: 'end', height: '100%' }}
          onClick={() => setFilters({ gym: 'All', style: 'All', day: 'All', belay: 'any', search: '' })}
        >
          Reset
        </button>
      </section>

      <section className="session-grid">
        {filteredSessions.map(session => (
          <article key={session.id} className="session-card">
            <div style={{ position: 'relative', overflow: 'hidden', borderRadius: '12px', border: '1px solid var(--color-stroke)', marginBottom: 10 }}>
              <img
                src={sessionImages[Math.abs(session.id.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0)) % sessionImages.length]}
                alt={session.gym}
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
                  <div style={{ position: 'absolute', top: 10, left: 10, width: 52, height: 52, borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--color-stroke)' }}>
                    <img src={gymThumbFor(session.gym)} alt={session.gym} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div>
                    <Eyebrow>{session.gym} • {session.location}</Eyebrow>
                    <h4 style={{ margin: 0 }}>{session.host} is climbing</h4>
                  </div>
                  <div
                    className="pill"
                    style={{
                      width: 'fit-content',
                      padding: '4px 10px',
                      fontSize: '11px',
                      lineHeight: 1.1,
                      border: '1px solid var(--color-stroke)',
                      background: 'rgba(12,14,18,0.65)',
                      color: 'var(--color-text)',
                      letterSpacing: '0.2px',
                    }}
                  >
                    {session.availability}
                  </div>
                </div>
              </div>
            </div>
            <header>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '8px', alignItems: 'center' }}>
                <div>
                  <p className="muted small" style={{ margin: 0 }}>{session.day} - {session.time}</p>
                  <p className="muted small" style={{ margin: 0 }}>Style: {session.style} • Grade: {session.grade}</p>
                </div>
                <span className={`pill ${session.belayVerified ? 'verified' : ''}`} style={{ justifySelf: 'end' }}>
                  {session.belayVerified ? 'Belay verified' : 'Boulder crew'}
                </span>
              </div>
            </header>
            <div className="session-meta">
              <div>
                <p className="muted small">Grade</p>
                <strong>{formatBoulderweltGrade(session.grade)}</strong>
              </div>
              <div>
                <p className="muted small">Style</p>
                <strong>{session.style}</strong>
              </div>
              <div>
                <p className="muted small">Partners</p>
                <strong>{session.partners}</strong>
              </div>
              <div>
                <p className="muted small">Availability</p>
                <strong>{session.availability}</strong>
              </div>
            </div>
            <p className="session-note">{session.note}</p>
            <div className="tagline">
              {session.tags.map(tag => <span key={tag} className="ghost-tag">{tag}</span>)}
            </div>
            <div className="session-actions">
              <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
                <button className="button-navlink" style={{ flex: 1 }} onClick={() => router.push('/gym-chat')}>Ask in wall</button>
                <button className="button-navlink button-navlink-hover" style={{ flex: 1 }} onClick={handleJoin}>I&apos;m in</button>
              </div>
            </div>
          </article>
        ))}

        {!filteredSessions.length && !loading ? (
          <div className="panel empty-state">
            <h3>No sessions match your filters.</h3>
            <p className="muted">Try broadening grade or day, or post your own slot.</p>
            <button className="button-navlink button-navlink-hover" onClick={handleJoin}>Post a session</button>
          </div>
        ) : null}
      </section>
    </main>
  )
}
