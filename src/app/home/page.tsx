'use client'

import { useEffect, useMemo, useState } from 'react'
import { supabase, requireSupabase } from '@/lib/supabaseClient'
import { fetchProfiles, Profile as DbProfile } from '@/lib/profiles'

type Profile = DbProfile & {
  distance?: string
}

type MessagePreview = {
  id: string
  name: string
  snippet: string
  avatar: string
  age?: number
  city?: string
}

const FALLBACK_AVATAR = '/cc-moods-001.jpg'

export default function HomeScreen() {
  const [activeTab, setActiveTab] = useState<'matches' | 'messages'>('matches')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [matches, setMatches] = useState<Profile[]>([])
  const [loadingMatches, setLoadingMatches] = useState(false)
  const [deck, setDeck] = useState<Profile[]>([])
  const [messages, setMessages] = useState<MessagePreview[]>([])
  const [selectedMatch, setSelectedMatch] = useState<Profile | null>(null)
  const [selectedMessage, setSelectedMessage] = useState<MessagePreview | null>(null)

  const current = useMemo(() => deck[(currentIndex % Math.max(deck.length, 1)) || 0], [currentIndex, deck])

  const messageProfile = (msg: MessagePreview | null): Profile | null => {
    if (!msg) return null
    const found = matches.find(p => p.username.toLowerCase() === msg.name.toLowerCase())
    if (found) return found
    return {
      id: msg.id,
      username: msg.name,
      age: msg.age ?? 27,
      distance: '10 km',
      city: msg.city,
      avatar_url: msg.avatar || FALLBACK_AVATAR,
      bio: msg.snippet,
      lookingFor: 'Looking for partners',
      tags: [],
      style: '',
      availability: '',
      grade: '',
      status: 'Online',
    }
  }

  const selectedProfile = useMemo(
    () => selectedMatch ?? messageProfile(selectedMessage) ?? deck[0],
    [selectedMatch, selectedMessage, deck, matches]
  )

  const conversation = useMemo(() => {
    const msg = selectedMessage
    if (!msg) return []
    return [
      { id: `${msg.id}-1`, from: 'them' as const, text: msg.snippet || 'Hey there!', time: '10:02' },
      { id: `${msg.id}-2`, from: 'you' as const, text: 'Sounds good! Want to plan something this weekend?', time: '10:04' },
      { id: `${msg.id}-3`, from: 'them' as const, text: "Yes, let's pick a crag and time.", time: '10:06' },
    ]
  }, [selectedMessage])

  useEffect(() => {
    const load = async () => {
      setLoadingMatches(true)
      if (!supabase) {
        try {
          requireSupabase()
        } catch (err) {
          console.error('Supabase not configured', err)
          setLoadingMatches(false)
          return
        }
      }

      try {
        const normalized = await fetchProfiles()
        const profiles: Profile[] = normalized.map(p => ({
          ...p,
          distance: p.distance ?? '10 km',
          avatar_url: p.avatar_url ?? FALLBACK_AVATAR,
        }))
        setMatches(profiles)
        setDeck(profiles.length ? profiles : [{
          id: 'fallback',
          username: 'Climber',
          age: 27,
          distance: '10 km',
          city: '',
          avatar_url: FALLBACK_AVATAR,
          style: '',
          availability: '',
          grade: '',
          bio: '',
        }])
        const previews: MessagePreview[] = profiles.slice(0, 8).map(p => ({
          id: `msg-${p.id}`,
          name: p.username,
          snippet: p.bio?.slice(0, 60) || 'Say hi and plan your next session.',
          avatar: p.avatar_url ?? FALLBACK_AVATAR,
          age: p.age,
          city: p.city,
        }))
        setMessages(previews)
      } catch (err) {
        console.error('Failed to load profiles', err)
      } finally {
        setLoadingMatches(false)
      }
    }
    load()
  }, [])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedMatch(null)
        setSelectedMessage(null)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  const action = () => {
    setCurrentIndex(i => (i + 1) % Math.max(deck.length, 1))
  }

  return (
    <main className={`swipe-layout ${selectedMatch || selectedMessage ? 'has-detail' : ''}`}>
      <aside className="swipe-sidebar">
        <div className="sidebar-top">
          <div className="avatar-chip">
            <span className="avatar-dot" />
            <span>You</span>
          </div>
          <div className="sidebar-actions">
            <button title="Boost" className="pill-icon">Boost</button>
            <button title="Explore" className="pill-icon">Explore</button>
            <button title="Insights" className="pill-icon">Insights</button>
            <button title="Safety" className="pill-icon">Safety</button>
          </div>
        </div>

        <div className="sidebar-tabs">
          <button className={activeTab === 'matches' ? 'active' : ''} onClick={() => setActiveTab('matches')}>Matches</button>
          <button className={activeTab === 'messages' ? 'active' : ''} onClick={() => setActiveTab('messages')}>Messages</button>
        </div>

        {activeTab === 'matches' ? (
          <div className="sidebar-grid">
            {loadingMatches ? (
              <p className="muted" style={{ gridColumn: '1 / -1' }}>Loading matches...</p>
            ) : (
              matches.map(profile => (
                <button
                  key={profile.id}
                  className={`match-card ${selectedMatch?.id === profile.id ? 'is-active' : ''}`}
                  onClick={() => { setSelectedMatch(profile); setSelectedMessage(null) }}
                >
                  <img src={profile.avatar_url ?? FALLBACK_AVATAR} alt={profile.username} />
                  <div className="match-meta">
                    <span className="match-name">{profile.username}</span>
                  </div>
                </button>
              ))
            )}
          </div>
        ) : (
          <div className="messages-list">
            {messages.map(msg => (
              <button
                key={msg.id}
                className={`message-row ${selectedMessage?.id === msg.id ? 'is-active' : ''}`}
                onClick={() => {
                  const matchedProfile = matches.find(p => p.username.toLowerCase() === msg.name.toLowerCase()) ?? null
                  setSelectedMatch(matchedProfile)
                  setSelectedMessage(msg)
                }}
              >
                <img src={msg.avatar} alt={msg.name} className="message-avatar" />
                <div className="message-text">
                  <div className="message-title">
                    <span className="message-name">{msg.name}</span>
                  </div>
                  <p className="muted small">{msg.snippet}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </aside>

      {selectedMatch || selectedMessage ? (
        <>
          <section className="chat-pane">
            <header className="chat-header">
              <div className="chat-match-info">
                <img
                  src={selectedProfile?.avatar_url ?? FALLBACK_AVATAR}
                  alt={selectedMatch?.username ?? selectedMessage?.name ?? selectedProfile?.username ?? 'Profile'}
                  className="chat-avatar"
                />
                <div>
                  <p className="sub">You matched with {selectedMatch?.username ?? selectedMessage?.name ?? selectedProfile?.username}</p>
                  <small className="muted">1 month ago</small>
                </div>
              </div>
              <div className="chat-actions">
                <button className="ghost pill-icon" aria-label="More actions">...</button>
                <button className="ghost pill-icon" aria-label="Close conversation" onClick={() => { setSelectedMatch(null); setSelectedMessage(null) }}>x</button>
              </div>
            </header>

            <div className="chat-body">
              <div className="chat-thread">
                {conversation.map(msg => (
                  <div key={msg.id} className="bubble-row">
                    <div className={`bubble ${msg.from === 'them' ? 'them' : 'you'}`}>
                      {msg.text}
                    </div>
                    <div className="bubble-meta">
                      <span>{msg.time}</span>
                      {msg.from === 'you' ? <span>Sent</span> : null}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <footer className="chat-input">
              <div className="input-shell">
                <input type="text" placeholder="Type a message" />
                <div className="input-actions">
                  <button className="ghost">GIF</button>
                  <button className="ghost">Emoji</button>
                </div>
              </div>
              <button className="cta">Send</button>
            </footer>
          </section>

          <aside className="profile-pane">
            <div className="profile-hero" style={{ backgroundImage: `url(${selectedProfile?.avatar_url ?? FALLBACK_AVATAR})` }} />
            <div className="profile-pane-body">
              <div className="profile-pane-header">
                <h2>{selectedProfile?.username} <span>{selectedProfile?.age ?? ''}</span></h2>
                <p className="muted">Location: {selectedProfile?.distance ?? ''}{selectedProfile?.city ? `, ${selectedProfile.city}` : ''}</p>
              </div>
              <div className="profile-section">
                <p className="eyebrow">Looking for</p>
                <div className="pill-accent">{selectedProfile?.lookingFor || 'Long-term, open to short adventures'}</div>
              </div>
              <div className="profile-section">
                <p className="eyebrow">About me</p>
                <p className="muted">{selectedProfile?.bio || 'Climber and traveler. Into good coffee, morning sessions, and keeping things light but real.'}</p>
              </div>
              {selectedProfile?.tags?.length ? (
                <div className="profile-tags">
                  {selectedProfile.tags.map(tag => <span key={tag} className="tag ghost-tag">{tag}</span>)}
                </div>
              ) : null}
            </div>
          </aside>
        </>
      ) : (

        <section className="swipe-stage">
          <div className="phone-frame">
            <div className="hero-photo" style={{ backgroundImage: `url(${current?.avatar_url ?? FALLBACK_AVATAR})` }}>
              <div className="hero-overlay" />
                                          <div className="hero-meta">
                <div>
                  <h2>{current?.username} <span>{current?.age}</span></h2>
                  <p>Location: {current?.distance ?? ''}{current?.city ? `, ${current.city}` : ''}</p>
                </div>
              </div>
            </div>
            <div className="hero-actions hero-actions-wide">
              <button className="ghost wide" onClick={() => action()}>Pass</button>
              <button className="cta wide" onClick={() => action()}>Send Like</button>
            </div>
          </div>
        </section>
      )}
    </main>
  )
}
