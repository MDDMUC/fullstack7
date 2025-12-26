'use client'

import { useEffect, useMemo, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { GymRoom, loadGymRooms } from '@/lib/communityData'
import { getBarHeightsForDay, getChartTimes, getLiveIndicatorPosition } from '@/lib/gymOccupancyData'

// Asset URLs for gym cards
const IMG_GYM = '/placeholder-gym.svg'
const IMG_CHEVRON = '/icons/chevron-down.svg'
const IMG_PEAK = '/icons/peak-indicator.svg'

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
            <button className="button-navlink button-navlink-hover" onClick={handleJoin}>Get started</button>
            <button className="button-navlink" onClick={() => router.push('/partner-finder')}>Find a partner</button>
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
                    <img src={gym.imageUrl || '/placeholder-gym.svg'} alt={gym.name} />
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
              <GymDetailCardComponent
                key={gym.id}
                gym={gym}
                isActive={gym.id === activeGym?.id}
                currentHour={currentHour}
                onSelect={() => {
                  setActiveGymId(gym.id)
                  setActiveThreadId(gym.threads[0]?.id ?? null)
                }}
                onJoin={handleJoin}
              />
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
            <button className="button-navlink" onClick={handleJoin}>Join chat</button>
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
                      src={msg.avatarUrl || '/placeholder-avatar.svg'}
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
              <button className="button-navlink" onClick={handleJoin}>+ Clip</button>
              <button className="button-navlink button-navlink-hover" onClick={handleJoin}>Post</button>
            </div>
          </footer>

          <ChatAdComponent activeGymId={activeGym?.id || null} />
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

// Gym Detail Card Component
function GymDetailCardComponent({
  gym,
  isActive,
  currentHour,
  onSelect,
  onJoin,
}: {
  gym: GymRoom
  isActive: boolean
  currentHour: number
  onSelect: () => void
  onJoin: () => void
}) {
  const [selectedDay, setSelectedDay] = useState<number | null>(null)
  const [dayDropdownOpen, setDayDropdownOpen] = useState(false)
  const dayDropdownRef = useRef<HTMLDivElement | null>(null)

    // Calculate percentage full from liveLevel (0-10 scale)
    const percentFull = gym.liveLevel ? Math.round((gym.liveLevel / 10) * 100) : null

    // Determine pill state from crowd or calculate from percentFull
    let pillState: 'chill' | 'busy' | 'peaking' = gym.crowd.toLowerCase() as 'chill' | 'busy' | 'peaking'
    let pillText = gym.crowd

    // Get real bar heights from gym occupancy data (matches /gyms page logic)
    const realBarHeights = getBarHeightsForDay(gym.name, selectedDay)
    const barHeights = realBarHeights || [
      18, 18, 21, 32, 44, 50, 50, 44, 32, 24, 44, 58, 50, 44, 32, 28,
      26, 30, 36, 40
    ]

    // Check if today and calculate live indicator position
    const isToday = selectedDay === null
    const liveIndicatorPosition = (realBarHeights && isToday) ? getLiveIndicatorPosition(gym.name) : null
    const displayDay = selectedDay === null ? 'Today' : ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][selectedDay]

    // Get chart times for selected day (for legend) - matches /gyms page logic
    const chartDay = selectedDay === null ? new Date().getDay() : selectedDay
    const { startHour, endHour } = getChartTimes(chartDay, gym.name)

    // Format time for legend
    const formatTime = (hour: number): string => {
      if (hour === 0) return '12am'
      if (hour < 12) return `${hour}am`
      if (hour === 12) return '12pm'
      return `${hour - 12}pm`
    }

    return (
      <div
        className={`gym-detail-card ${isActive ? 'is-active' : ''}`}
        data-name="gym-detail-card"
        onClick={onSelect}
      >
        {/* Top Row: Occupancy pill and percentage indicator */}
        <div className="gym-card-toprow" data-name="toprow">
          <div className="gym-card-button-pill" data-name="button-pill">
            <div className={`gym-card-occupancy-pill gym-card-occupancy-pill-${pillState}`}>
              {pillState === 'busy' && (
                <div className="gym-card-occupancy-pill-busy-border" aria-hidden="true" />
              )}
              <p className="gym-card-occupancy-text">{pillText}</p>
            </div>
          </div>
          <div className="gym-card-live-indicator" data-name="live-indicator">
            <div className="gym-card-live-dot" />
            <div className="gym-card-online-text">
              <p>{percentFull !== null ? `${percentFull}% full` : `${gym.online} online`}</p>
            </div>
          </div>
        </div>

        {/* Gym Info Tile */}
        <div className="gym-card-info-tile" data-name="gym-info-tile">
          <div className="gym-card-info-left" data-name="left">
            <div className="gym-card-info-img" data-name="img">
              <img
                src={gym.imageUrl || IMG_GYM}
                alt={gym.name}
                className="gym-card-info-img-el"
              />
            </div>
          </div>
          <div className="gym-card-info-right" data-name="right">
            <div className="gym-card-info-name">
              <p>{gym.name.split(' ')[0] || gym.name}</p>
            </div>
            <div className="gym-card-info-location">
              <p>{gym.name.split(' ').slice(1).join(' ') || ''}</p>
            </div>
            <div className="gym-card-info-city">
              <p>{gym.area || 'Munich, Germany'}</p>
            </div>
          </div>
        </div>

        {/* Busy Indicator with bar chart */}
        <div className="gym-card-busy-indicator" data-name="busy-indicator">
          <div className="gym-card-dayselector" data-name="dayselector">
            <div className="gym-card-popular-times">
              <p>Popular times</p>
            </div>
            <div className="gym-card-button-field" data-name="button-field" ref={dayDropdownRef}>
              <button
                type="button"
                className="gym-card-field-button"
                onClick={(e) => {
                  e.stopPropagation()
                  setDayDropdownOpen(!dayDropdownOpen)
                }}
              >
                <div className="gym-card-field-text">
                  <p>{displayDay}</p>
                </div>
                <div className="gym-card-chevron" data-name="chevron-down">
                  <div className="gym-card-chevron-inner">
                    <img src={IMG_CHEVRON} alt="" className="gym-card-chevron-img" />
                  </div>
                </div>
              </button>
              {dayDropdownOpen && (
                <div className="gym-card-day-dropdown mh-silver-dropdown-menu">
                  <button
                    type="button"
                    className={`mh-silver-dropdown-item ${selectedDay === null ? 'active' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedDay(null)
                      setDayDropdownOpen(false)
                    }}
                  >
                    <p>Today</p>
                  </button>
                  {[0, 1, 2, 3, 4, 5, 6].map(day => (
                    <button
                      key={day}
                      type="button"
                      className={`mh-silver-dropdown-item ${selectedDay === day ? 'active' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedDay(day)
                        setDayDropdownOpen(false)
                      }}
                    >
                      <p>{['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][day]}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>
            {isToday && (
              <div className="gym-card-live-chip">
                <div className="gym-card-live-chip-cont">
                  <div className="gym-card-live-chip-text">
                    <p>LIVE</p>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="gym-card-barchart-wrapper" data-name="barchart">
            <div className="gym-card-barchart-main" data-name="main">
              <div className="gym-card-peakindicator" data-name="peakindicator">
                <img src={IMG_PEAK} alt="" className="gym-card-peak-img" />
              </div>
              <div className="gym-card-barchart" data-name="barchart">
                {barHeights.map((height, idx) => (
                  <div
                    key={idx}
                    className="gym-card-bar"
                    style={{ height: `${height}px` }}
                  />
                ))}
              </div>
              {liveIndicatorPosition !== null && liveIndicatorPosition >= 0 && (
                <div
                  className="gym-card-liveindicator"
                  style={{ left: `${liveIndicatorPosition}px` }}
                />
              )}
            </div>
          </div>
          <div className="gym-card-legend" data-name="legendtime">
            <div className="gym-card-legend-item">
              <p>{formatTime(startHour)}</p>
            </div>
            <div className="gym-card-legend-item">
              <p>{formatTime(Math.round(startHour + (endHour - startHour) * 0.33))}</p>
            </div>
            <div className="gym-card-legend-item">
              <p>{formatTime(Math.round(startHour + (endHour - startHour) * 0.67))}</p>
            </div>
            <div className="gym-card-legend-item">
              <p>{formatTime(endHour)}</p>
            </div>
          </div>
        </div>

        {/* CTA Row */}
        <div className="gym-card-ctarow" data-name="ctarow">
          <button
            type="button"
            className="gym-card-button-ghost"
            onClick={(e) => {
              e.stopPropagation()
              onJoin()
            }}
          >
            <div className="gym-card-ghost-cont">
              <div className="gym-card-ghost-text">
                <p>Join Chat</p>
              </div>
            </div>
          </button>
        </div>
      </div>
    )
}

// Chat Ad Component
function ChatAdComponent({ activeGymId }: { activeGymId: string | null }) {
  if (activeGymId === 'thalkirchen') {
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

  if (activeGymId === 'freimann') {
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
