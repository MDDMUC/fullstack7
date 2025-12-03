'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { GymRoom, loadGymRooms } from '@/lib/communityData'

const tonightPrompts = [
  'Who needs a belay?',
  "Who's in tonight?",
  'Outdoor trip this weekend?',
  'Beta for the blue comp set?',
]

const defaultPopularTimes = [
  { hour: 9, level: 2 },
  { hour: 12, level: 3 },
  { hour: 15, level: 5 },
  { hour: 17, level: 7 },
  { hour: 19, level: 9 },
  { hour: 21, level: 6 },
  { hour: 22, level: 3 },
]

export default function GymChatPage() {
  const router = useRouter()
  const [gyms, setGyms] = useState<GymRoom[]>([])
  const [loading, setLoading] = useState(true)
  const [activeGymId, setActiveGymId] = useState<string | null>(null)
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null)
  const [liveOnline, setLiveOnline] = useState(0)
  const [statPulse, setStatPulse] = useState<'up' | 'down' | null>(null)

  useEffect(() => {
    let mounted = true
    const load = async () => {
      const data = await loadGymRooms()
      if (!mounted) return
      setGyms(data)
      setActiveGymId(prev => prev ?? data[0]?.id ?? null)
      setActiveThreadId(prev => prev ?? data[0]?.threads?.[0]?.id ?? null)
      setLoading(false)
    }
    load()
    return () => {
      mounted = false
    }
  }, [])

  const activeGym = useMemo(
    () => gyms.find(g => g.id === activeGymId) ?? gyms[0],
    [activeGymId, gyms]
  )

  const activeThread = useMemo(
    () => activeGym?.threads.find(t => t.id === activeThreadId) ?? activeGym?.threads?.[0],
    [activeThreadId, activeGym]
  )

  const visibleMessages = useMemo(
    () => (activeGym?.messages ?? []).filter(m => m.threadId === activeThread?.id),
    [activeGym, activeThread]
  )

  const currentHour = useMemo(() => new Date().getHours(), [])

  const baseOnline = useMemo(() => gyms.reduce((sum, g) => sum + g.online, 0), [gyms])

  useEffect(() => {
    setLiveOnline(baseOnline)
  }, [baseOnline])

  useEffect(() => {
    if (!baseOnline) return
    let timeoutId: ReturnType<typeof setTimeout> | undefined

    const tick = () => {
      setLiveOnline(prev => {
        const delta = Math.floor(Math.random() * 13) - 6 // -6 to +6
        const next = prev + delta
        const min = Math.max(0, baseOnline - 12)
        const max = baseOnline + 12
        const clamped = Math.min(max, Math.max(min, next))
        setStatPulse(delta > 0 ? 'up' : delta < 0 ? 'down' : null)
        return clamped
      })
      const nextDelay = 1800 + Math.random() * 3200
      timeoutId = setTimeout(tick, nextDelay)
    }

    tick()

    return () => {
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [baseOnline])

  useEffect(() => {
    if (!baseOnline) return
    if (!statPulse) return
    const t = setTimeout(() => setStatPulse(null), 900)
    return () => clearTimeout(t)
  }, [statPulse, baseOnline])

  const handleJoin = () => router.push('/signup')

  const renderBusyMeter = (gym: GymRoom) => {
    const times = (gym.popularTimes && gym.popularTimes.length ? gym.popularTimes : defaultPopularTimes).slice(0, 7)
    const maxLevel = Math.max(...times.map(t => t.level), 1)
    const barData = times.map(time => {
      const height = Math.max(16, Math.round((time.level / maxLevel) * 48))
      return {
        time,
        height,
        isLive: time.hour === currentHour,
      }
    })
    const peakHeight = Math.max(...barData.map(b => b.height), 1)
    const busiestLabel =
      gym.busiestDay || gym.busiestHour
        ? `${gym.busiestDay ?? ''}${gym.busiestDay && gym.busiestHour ? ' ' : ''}${gym.busiestHour ?? ''}`.trim()
        : 'No data'

    return (
      <div className="busy-meter" aria-label="Gym busyness">
        <div className="busy-body">
          <div className="busy-bars" aria-hidden="true">
            <div className="busy-peak-line" style={{ bottom: `${peakHeight}px` }} title="Usual peak" />
            {barData.map(({ time, height, isLive }) => (
              <div className="busy-bar-wrap" key={`${gym.id}-${time.hour}`}>
                <div
                  className={`busy-bar ${isLive ? 'is-live' : ''}`}
                  style={{ height: `${height}px` }}
                  title={`${time.hour}:00`}
                />
              </div>
            ))}
          </div>
          <div className="busy-meta">
            <strong className="busy-meta-text">{busiestLabel}</strong>
          </div>
        </div>
      </div>
    )
  }

  const renderChatAd = () => {
    if (activeGym?.id === 'thalkirchen') {
      return (
        <div className="prompt-ad prompt-ad--alt chat-ad chat-ad--bd">
          <div className="prompt-ad-image alt">
            <img src="/ad-blackdiamond.webp" alt="Black Diamond climbing gear" />
            <div className="prompt-ad-overlay bd-overlay">
              <div className="overlay-top">
                <p className="prompt-hint">Sponsored Black Diamond</p>
              </div>
              <div className="overlay-bottom">
                <h4 className="prompt-ad-headline">The Cragging Kit</h4>
                <p className="muted small">
                  The rope, the rack and the shirt on your back. We&apos;ve got you covered for a season of sending,
                  from our apparel built for the climbing life, to our cornerstone equipment. Let&apos;s go.
                </p>
                <div className="prompt-ad-cta">
                  <a
                    href="https://www.blackdiamondequipment.com"
                    target="_blank"
                    rel="noreferrer"
                    className="prompt-link"
                  >
                    Shop Black Diamond
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    }

    if (activeGym?.id === 'freimann') {
      return (
        <div className="prompt-ad prompt-ad--alt chat-ad chat-ad--video">
          <div className="prompt-ad-copy">
            <p className="prompt-hint">Sponsored Edelrid</p>
            <h4 className="prompt-ad-headline">Ohmega Tour 20025</h4>
            <p className="muted small">
              The OHMEGA is now touring Europe&apos;s climbing gyms - your chance to test the new belaying experience live!
            </p>
            <strong>12.11.2025 | DAV Freimann, Munich</strong>
            <div className="chat-ad-video">
              <iframe
                src="https://www.youtube.com/embed/cRkLYw0WGqU?list=TLGGGR2nbw7kTlsyNzExMjAyNQ"
                title="Edelrid video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )
    }

    return (
      <div className="prompt-ad prompt-ad--alt chat-ad">
        <div className="prompt-ad-image alt">
          <img src="/ad-karma.jpg" alt="Karma8a apparel" />
          <div className="prompt-ad-overlay">
            <span className="prompt-ad-headline karma-headline">CLIMB INTO THE HOLIDAYS</span>
            <a href="https://karma8a.com/" target="_blank" rel="noreferrer" className="prompt-link">Shop Now</a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <main className="feature-shell">
      <section className="feature-hero">
        <div className="hero-visual">
          <img src="/hero-gymchat.jpg" alt="Climbers at the wall" className="hero-image" />
        </div>
        <div className="hero-copy">
          <p className="eyebrow">Community-first</p>
          <h1 className="hero-metal">Gymchat</h1>
          <p className="lede">
            Drop into the wall you climb most, ask for beta, or find a partner without awkward DMs.
            Real-time presence, respectful vibes, and prompts that keep the conversation moving.
          </p>
          <div className="feature-actions">
            <button className="megabtn megabtn-cta" onClick={handleJoin}>Get started</button>
            <button className="megabtn megabtn-ghost" onClick={() => router.push('/partner-finder')}>Find a partner</button>
          </div>
          <div className="pill-row">
            <span>Belay-verified channels</span>
            <span>Lightweight threads</span>
            <span>Gym-specific prompts</span>
          </div>
        </div>
        {gyms.length ? (
          <div className="feature-stat stat-tall">
            <div>
              <p className="stat__label">People online in your walls</p>
              <p
                className={`stat__number ${
                  statPulse === 'up' ? 'stat-pulse-up' : statPulse === 'down' ? 'stat-pulse-down' : ''
                }`}
              >
                <span className="stat-live-dot" aria-hidden="true" />
                {liveOnline}
              </p>
              <p className="muted small">Presence-driven so you can meet people who are literally there.</p>
            </div>
            <div className="stat-walls">
              <p className="muted small">Your walls</p>
              <div className="stat-wall-row">
                {gyms.slice(0, 3).map(gym => (
                  <div className="stat-wall" key={gym.id}>
                    <img src={gym.imageUrl || '/fallback-gym.png'} alt={gym.name} />
                    <span>{gym.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </section>

      <section className="gym-chat-grid">
        <aside className="panel">
          <header className="panel-header">
            <div>
              <p className="eyebrow">Gyms</p>
              <h3>Pick your wall.</h3>
            </div>
            <span className="chip">{gyms.length} gyms</span>
          </header>
          <div className="list-stack">
            {gyms.map(gym => (
              <button
                key={gym.id}
                className={`list-row gym-card ${gym.id === activeGym?.id ? 'is-active' : ''}`}
                onClick={() => {
                  setActiveGymId(gym.id)
                  setActiveThreadId(gym.threads[0]?.id ?? null)
                }}
              >
                <div className="gym-card-top">
                  <span className={`pill ${gym.crowd.toLowerCase()}`}>{gym.crowd}</span>
                  <div className="presence">
                    <span className="presence-dot" />
                    <span className="muted small">{gym.online} online</span>
                  </div>
                </div>
                <div className="gym-card-main">
                  <img
                    src={gym.imageUrl || '/fallback-gym.png'}
                    alt={gym.name}
                    className="gym-avatar"
                    loading="lazy"
                  />
                  <div className="gym-card-body">
                    <strong>{gym.name}</strong>
                    <p className="muted small">{gym.area}</p>
                  </div>
                </div>
                <div className="busy-section">
                  <div className="busy-labels">
                    <span className="muted tiny">How busy</span>
                    <span className="muted tiny">Busiest</span>
                  </div>
                  {renderBusyMeter(gym)}
                </div>
                <div className="tagline gym-card-tags">
                  {gym.tags.map(tag => (
                    <span key={tag} className="ghost-tag">{tag}</span>
                  ))}
                </div>
              </button>
            ))}
            {!gyms.length && !loading ? (
              <p className="muted small">No gyms available yet.</p>
            ) : null}
          </div>
        </aside>

        <section className="panel thread-panel">
          <header className="panel-header">
            <div>
              <p className="eyebrow">{activeGym?.name || 'Gym'}</p>
              <h3>{activeThread?.title || 'Thread'}</h3>
              <p className="muted small">{activeThread?.vibe || 'Climber chat'} - {activeThread?.members ?? 0} people</p>
            </div>
            <button className="megabtn megabtn-ghost" onClick={handleJoin}>Join chat</button>
          </header>

          <div className="thread-tabs">
            {activeGym?.threads?.map(thread => (
              <button
                key={thread.id}
                className={`thread-tab ${thread.id === activeThread?.id ? 'active' : ''}`}
                onClick={() => setActiveThreadId(thread.id)}
              >
                {thread.unread ? <span className="pill unread">{thread.unread}</span> : null}
                <div className="row-top">
                  <span>{thread.title}</span>
                </div>
                <p className="muted small">{thread.lastMessage}</p>
              </button>
            ))}
          </div>

          <div className="chat-window">
            {visibleMessages.map(msg => (
              <div key={msg.id} className="chat-line">
                <div className="chat-bubble">
                  <div className="row-top">
                    <img
                      src={msg.avatarUrl || '/fallback-gym.png'}
                      alt={msg.author}
                      className="chat-avatar"
                      loading="lazy"
                    />
                    <strong>{msg.author}</strong>
                    <span className="muted small">{msg.handle} - {msg.time}</span>
                    {msg.role === 'admin' ? <span className="pill">Host</span> : null}
                  </div>
                  <p className="chat-text">{msg.body}</p>
                  {msg.reactions?.length ? (
                    <div className="reaction-row">
                      {msg.reactions.map(reaction => (
                        <span key={reaction} className="reaction">{reaction}</span>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
            ))}
            {!visibleMessages.length && !loading ? (
              <p className="muted small">No messages yet. Start the thread.</p>
            ) : null}
          </div>

          <footer className="chat-input-bar">
            <input
              type="text"
              placeholder="Say hi or ask for beta..."
              onFocus={handleJoin}
              readOnly
            />
            <div className="chat-actions">
              <button className="megabtn megabtn-ghost" onClick={handleJoin}>+ Clip</button>
              <button className="megabtn megabtn-cta" onClick={handleJoin}>Post</button>
            </div>
          </footer>

          {renderChatAd()}
        </section>

        <aside className="panel side-panel">
          <header className="panel-header">
            <div>
              <p className="eyebrow">Tonight&apos;s prompts</p>
              <h3>Keep it flowing.</h3>
            </div>
          </header>
          <div className="list-stack">
            {tonightPrompts.map((prompt) => (
              <div key={prompt} className="prompt-card">
                <div className="prompt-marker">
                  <span className="prompt-node" />
                  <span className="prompt-stem" />
                </div>
                <div className="prompt-content">
                  <p className="prompt-title">{prompt}</p>
                  <p className="prompt-hint">Drop it into the wall</p>
                </div>
                <button className="ghost prompt-btn" onClick={handleJoin}>Post</button>
              </div>
            ))}
            <div className="prompt-ad">
              <p className="prompt-hint">Sponsored · PETZL</p>
              <div className="prompt-ad-image">
                <img src="/ad-petzl.jpg" alt="Petzl Adjama Harness" />
              </div>
              <div className="prompt-ad-copy">
                <h4>SITTA Harness</h4>
                <div className="prompt-ad-product">
                  <img src="/sitta.jpg" alt="SITTA harness" className="prompt-product-img" />
                  <p className="muted small">For climbers and mountaineers who demand performance! The SITTA is lightweight and technical, without compromising comfort.</p>
                </div>
                <div className="prompt-ad-cta">
                  <a href="https://www.petzl.com" target="_blank" rel="noreferrer" className="prompt-link">Shop Petzl</a>
                </div>
              </div>
            </div>
          </div>
          <div className="panel card">
            <p className="eyebrow">Guidelines</p>
            <ul className="guideline-list">
              <li>Spot when people film. No shaming falls.</li>
              <li>Keep beta in threads, not in DMs.</li>
              <li>Belay requests: share device + level.</li>
              <li>Respect gym rules; we follow their lead.</li>
            </ul>
          </div>
        </aside>
      </section>
    </main>
  )
}
