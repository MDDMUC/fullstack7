'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { GymRoom, loadGymRooms } from '@/lib/communityData'

const tonightPrompts = [
  "Who's in tonight?",
  'Outdoor trip this weekend?',
  'Beta for the blue comp set?',
  'Who needs a belay?',
]

export default function GymChatPage() {
  const router = useRouter()
  const [gyms, setGyms] = useState<GymRoom[]>([])
  const [loading, setLoading] = useState(true)
  const [activeGymId, setActiveGymId] = useState<string | null>(null)
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null)

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

  const handleJoin = () => router.push('/signup')

  return (
    <main className="feature-shell">
      <section className="feature-hero">
        <div>
          <p className="eyebrow">Community-first</p>
          <h1>Gym-based group chats.</h1>
          <p className="lede">
            Drop into the wall you climb most, ask for beta, or find a partner without awkward DMs.
            Real-time presence, respectful vibes, and prompts that keep the conversation moving.
          </p>
          <div className="feature-actions">
            <button className="cta" onClick={handleJoin}>Get started</button>
            <button className="ghost" onClick={() => router.push('/partner-finder')}>Find a partner</button>
          </div>
          <div className="pill-row">
            <span>Belay-verified channels</span>
            <span>Lightweight threads</span>
            <span>Gym-specific prompts</span>
          </div>
        </div>
        {gyms.length ? (
          <div className="feature-stat">
            <p className="stat__label">People online in your walls</p>
            <p className="stat__number">{gyms.reduce((sum, g) => sum + g.online, 0)}</p>
            <p className="muted small">Presence-driven so you can meet people who are literally there.</p>
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
                className={`list-row ${gym.id === activeGym?.id ? 'is-active' : ''}`}
                onClick={() => {
                  setActiveGymId(gym.id)
                  setActiveThreadId(gym.threads[0]?.id ?? null)
                }}
              >
                <div>
                  <div className="row-top">
                    <strong>{gym.name}</strong>
                    <span className={`pill ${gym.crowd.toLowerCase()}`}>{gym.crowd}</span>
                  </div>
                  <p className="muted small">{gym.area}</p>
                  <div className="tagline">
                    {gym.tags.map(tag => (
                      <span key={tag} className="ghost-tag">{tag}</span>
                    ))}
                  </div>
                </div>
                <div className="presence">
                  <span className="presence-dot" />
                  <span className="muted small">{gym.online} online</span>
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
            <button className="ghost" onClick={handleJoin}>Join chat</button>
          </header>

          <div className="thread-tabs">
            {activeGym?.threads?.map(thread => (
              <button
                key={thread.id}
                className={`thread-tab ${thread.id === activeThread?.id ? 'active' : ''}`}
                onClick={() => setActiveThreadId(thread.id)}
              >
                <div className="row-top">
                  <span>{thread.title}</span>
                  {thread.unread ? <span className="pill unread">{thread.unread}</span> : null}
                </div>
                <p className="muted small">{thread.lastMessage}</p>
              </button>
            ))}
          </div>

          <div className="chat-window">
            {visibleMessages.map(msg => (
              <div key={msg.id} className="chat-line">
                <div className="chat-avatar">{msg.author.slice(0, 2)}</div>
                <div className="chat-bubble">
                  <div className="row-top">
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
              <button className="ghost" onClick={handleJoin}>+ Clip</button>
              <button className="cta" onClick={handleJoin}>Post</button>
            </div>
          </footer>
        </section>

        <aside className="panel side-panel">
          <header className="panel-header">
            <div>
              <p className="eyebrow">Tonight&apos;s prompts</p>
              <h3>Keep it flowing.</h3>
            </div>
          </header>
          <div className="list-stack">
            {tonightPrompts.map(prompt => (
              <div key={prompt} className="prompt-card">
                <p>{prompt}</p>
                <button className="ghost" onClick={handleJoin}>Post</button>
              </div>
            ))}
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
