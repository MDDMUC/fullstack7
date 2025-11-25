'use client'

import { useEffect, useMemo, useState } from 'react'
import { supabase, requireSupabase } from '@/lib/supabaseClient'
import { fetchProfiles, Profile as DbProfile, normalizeProfile } from '@/lib/profiles'
import { RequireAuth } from '@/components/RequireAuth'
import { sendSwipe } from '@/lib/swipes'
import { checkAndCreateMatch, listMatches, MatchWithProfiles } from '@/lib/matches'
import { listMessages, sendMessage, subscribeToMessages, Message as ChatMessage } from '@/lib/messages'

type Profile = DbProfile & {
  distance?: string
}

type MessagePreview = {
  id: string
  matchId?: string
  profileId?: string
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
  const [matchRows, setMatchRows] = useState<MatchWithProfiles[]>([])
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null)
  const [threadMessages, setThreadMessages] = useState<ChatMessage[]>([])
  const [messageInput, setMessageInput] = useState('')
  const [userId, setUserId] = useState<string | null>(null)
  const messageUnsub = useMemo(() => ({ current: null as null | (() => void) }), [])

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
        const client = supabase ?? requireSupabase()
        const { data: userData } = await client.auth.getUser()
        setUserId(userData.user?.id ?? null)

        const normalized = await fetchProfiles()
        const profiles: Profile[] = normalized.map(p => ({
          ...p,
          distance: p.distance ?? '10 km',
          avatar_url: p.avatar_url ?? FALLBACK_AVATAR,
        }))
        const filtered = userData.user?.id
          ? profiles.filter(p => p.id !== userData.user?.id)
          : profiles

        setMatches(filtered)
        setDeck(filtered.length ? filtered : [{
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
        const matchList = await listMatches().catch(err => {
          console.error('Failed to load matches', err)
          return [] as MatchWithProfiles[]
        })
        setMatchRows(matchList)
        const previews: MessagePreview[] = matchList.map(m => {
          const other = (m.profiles ?? []).find(p => p.id !== userData.user?.id)
          const resolved = other ? normalizeProfile(other) : null
          return {
            id: m.id,
            matchId: m.id,
            profileId: resolved?.id,
            name: resolved?.username ?? 'Match',
            snippet: resolved?.bio?.slice(0, 60) || 'Say hi and plan your next session.',
            avatar: resolved?.avatar_url ?? FALLBACK_AVATAR,
            age: resolved?.age,
            city: resolved?.city,
          }
        })
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

  const openMatch = async (matchId: string) => {
    const match = matchRows.find(m => m.id === matchId)
    if (!match) return
    setSelectedMatchId(matchId)
    const other = (match.profiles ?? []).find(p => p.id !== userId)
    const resolved = other ? normalizeProfile(other) : null
    setSelectedMatch(resolved)
    setSelectedMessage({
      id: matchId,
      matchId,
      profileId: resolved?.id,
      name: resolved?.username ?? 'Match',
      snippet: resolved?.bio?.slice(0, 60) || 'Say hi and plan your next session.',
      avatar: resolved?.avatar_url ?? FALLBACK_AVATAR,
      age: resolved?.age,
      city: resolved?.city,
    })
    try {
      const msgs = await listMessages(matchId)
      setThreadMessages(msgs)
    } catch (err) {
      console.error('Failed to load messages', err)
      setThreadMessages([])
    }
    if (messageUnsub.current) messageUnsub.current()
    messageUnsub.current = subscribeToMessages(matchId, msg => setThreadMessages(prev => [...prev, msg]))
  }

  useEffect(() => () => {
    if (messageUnsub.current) messageUnsub.current()
  }, [messageUnsub])

  const handleSend = async () => {
    if (!selectedMatchId || !messageInput.trim()) return
    try {
      await sendMessage(selectedMatchId, messageInput.trim())
      setMessageInput('')
    } catch (err) {
      console.error('Failed to send message', err)
    }
  }

  const handleSwipe = async (profile?: Profile, actionType: 'like' | 'pass' = 'like') => {
    if (!profile) {
      action()
      return
    }
    try {
      await sendSwipe(profile.id, actionType)
      if (actionType === 'like') {
        await checkAndCreateMatch(profile.id)
      }
    } catch (err) {
      console.error('Swipe failed', err)
    } finally {
      action()
    }
  }

  return (
    <RequireAuth>
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
              matchRows.map(match => {
                const other = (match.profiles ?? []).find(p => p.id !== userId)
                const profile = other ? normalizeProfile(other) : null
                return (
                  <button
                    key={match.id}
                    className={`match-card ${selectedMatchId === match.id ? 'is-active' : ''}`}
                    onClick={() => openMatch(match.id)}
                  >
                    <img src={profile?.avatar_url ?? FALLBACK_AVATAR} alt={profile?.username ?? 'Match'} />
                    <div className="match-meta">
                      <span className="match-name">{profile?.username ?? 'Match'}</span>
                    </div>
                  </button>
                )
              })
            )}
          </div>
        ) : (
          <div className="messages-list">
            {messages.map(msg => (
              <button
                key={msg.id}
                className={`message-row ${selectedMessage?.id === msg.id ? 'is-active' : ''}`}
                onClick={() => openMatch(msg.matchId ?? msg.id)}
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
                {threadMessages.length === 0 ? (
                  <p className="muted">Start the conversation.</p>
                ) : (
                  threadMessages.map(msg => (
                    <div key={msg.id} className="bubble-row">
                      <div className={`bubble ${msg.sender === userId ? 'you' : 'them'}`}>
                        {msg.body}
                      </div>
                      <div className="bubble-meta">
                        <span>{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        {msg.sender === userId ? <span>Sent</span> : null}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <footer className="chat-input">
              <div className="input-shell">
                <input
                  type="text"
                  placeholder="Type a message"
                  value={messageInput}
                  onChange={e => setMessageInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleSend()
                    }
                  }}
                />
                <div className="input-actions">
                  <button className="ghost">GIF</button>
                  <button className="ghost">Emoji</button>
                </div>
              </div>
              <button className="cta" onClick={handleSend}>Send</button>
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
              <button className="ghost wide" onClick={() => handleSwipe(current, 'pass')}>Pass</button>
              <button className="cta wide" onClick={() => handleSwipe(current, 'like')}><span className="dab-text">dab</span></button>
            </div>
          </div>
        </section>
      )}
    </main>
    </RequireAuth>
  )
}
