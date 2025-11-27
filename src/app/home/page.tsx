'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { supabase, requireSupabase } from '@/lib/supabaseClient'
import { fetchProfiles, Profile as DbProfile, normalizeProfile } from '@/lib/profiles'
import { RequireAuth } from '@/components/RequireAuth'
import { sendSwipe } from '@/lib/swipes'
import { listMatches, MatchWithProfiles } from '@/lib/matches'
import { sendMessage, subscribeToThread, Message as ChatMessage, fetchMessages } from '@/lib/messages'
import SwipeCard from '@/components/SwipeCard'

type Profile = DbProfile & {
  distance?: string
  interest?: string
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

const FALLBACK_MALE = '/fallback-male.jpg'
const FALLBACK_FEMALE = '/fallback-female.jpg'

export default function HomeScreen() {
  const [activeTab, setActiveTab] = useState<'matches' | 'messages'>('matches')
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
  const [viewerHome, setViewerHome] = useState<string | null>(null)
  const [swipeMeta, setSwipeMeta] = useState<{ direction: -1 | 0 | 1; kind: 'none' | 'pass' | 'like' | 'match' }>({
    direction: 0,
    kind: 'none',
  })
  const messageUnsub = useMemo(() => ({ current: null as null | (() => void) }), [])

  const current = useMemo(() => deck[0], [deck])
  const nextProfile = useMemo(() => deck[1], [deck])

  const fallbackAvatarFor = (profile?: Profile | null) => {
    const hint = (profile?.pronouns || (profile as any)?.gender || '').toString().toLowerCase()
    if (hint.includes('she') || hint.includes('her') || hint.includes('woman') || hint.includes('female')) {
      return FALLBACK_FEMALE
    }
    return FALLBACK_MALE
  }

  const extractGender = (profile?: Profile | null) => {
    const direct = (profile?.gender || '').toString().toLowerCase()
    if (direct) return direct
    const tagGender = profile?.tags?.find?.(t => t.toLowerCase().startsWith('gender:'))?.split(':')[1]?.toLowerCase()
    if (tagGender) return tagGender
    const pronoun = (profile?.pronouns || '').toLowerCase()
    if (pronoun.includes('she') || pronoun.includes('her') || pronoun.includes('woman') || pronoun.includes('female')) return 'woman'
    if (pronoun.includes('he') || pronoun.includes('him') || pronoun.includes('man') || pronoun.includes('male')) return 'man'
    return 'unknown'
  }

  const extractPreference = (profile?: Profile | null) => {
    const direct = (profile?.interest || '').toString()
    if (direct) return direct as 'Women' | 'Men' | 'All'
    const prefTag = profile?.tags?.find?.(t => t.toLowerCase().startsWith('pref:'))?.split(':')[1]
    if (!prefTag) return 'All'
    const normalized = prefTag.toLowerCase()
    if (normalized === 'women' || normalized === 'woman') return 'Women'
    if (normalized === 'men' || normalized === 'man') return 'Men'
    return 'All'
  }

  const messageProfile = useCallback((msg: MessagePreview | null): Profile | null => {
    if (!msg) return null
    const found = matches.find(p => p.username.toLowerCase() === msg.name.toLowerCase())
    if (found) return found
    return null
  }, [matches])

  const selectedProfile = useMemo(
    () => selectedMatch ?? (selectedMessage ? messageProfile(selectedMessage) : null) ?? deck[0],
    [selectedMatch, selectedMessage, deck, messageProfile]
  )
  const shortName = (profile?: Profile | null) =>
    (profile?.username?.split?.(' ')?.[0] || profile?.username || 'Match')
  const formatLocation = (profile?: Profile | null, viewerCity?: string | null) => {
    const city = profile?.city || ''
    if (!city) return ''
    const same = viewerCity && city.toLowerCase() === viewerCity.toLowerCase()
    if (same) return `${city}, 0 km`
    if (profile?.distance) return `${city}, ${profile.distance}`
    return city
  }
  // Animation handled inside SwipeCard

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
          avatar_url: p.avatar_url ?? fallbackAvatarFor(p),
        }))

        const me = profiles.find(p => p.id === userData.user?.id)
        setViewerHome(me?.city ?? null)
        const preference = extractPreference(me)

    const filtered = profiles
      .filter(p => p.id !== userData.user?.id)
      .filter(p => {
        const gender = extractGender(p)
        const normalized = gender?.toLowerCase()
        if (preference === 'All') return true
        if (preference === 'Women') return normalized === 'woman'
        if (preference === 'Men') return normalized === 'man'
        return true
      })

    const shuffled = [...filtered].sort(() => Math.random() - 0.5)
    const safeDeck = shuffled.length >= 2 ? shuffled : [...shuffled, ...shuffled].slice(0, 2)
    setMatches(safeDeck)
    setDeck(safeDeck)
        const matchList = await listMatches().catch(err => {
          console.error('Failed to load matches', err)
          return [] as MatchWithProfiles[]
        })
        const resolvedMatches = matchList.map(m => ({
          ...m,
          profiles: (m.profiles ?? []).map(p => ({
            ...p,
            avatar_url: p?.avatar_url ?? fallbackAvatarFor(p as Profile),
          })),
        }))

        const fallbackMatches = safeDeck.slice(0, 2).map((profile, idx) => ({
          id: `fallback-match-${idx}`,
          created_at: new Date().toISOString(),
          user_a: userData.user?.id ?? 'demo-user',
          user_b: profile.id,
          profiles: [profile],
        }))

        const matchesForUI = resolvedMatches.length ? resolvedMatches : fallbackMatches
        setMatchRows(matchesForUI)

        const previews: MessagePreview[] = matchesForUI.map(m => {
          const other = (m.profiles ?? []).find(p => p.id !== userData.user?.id)
          const resolved = other ? normalizeProfile(other) : null
          return {
            id: m.id,
            matchId: m.id,
            profileId: resolved?.id,
            name: resolved?.username ?? 'Match',
            snippet: resolved?.bio?.slice(0, 60) || 'Say hi and plan your next session.',
            avatar: resolved?.avatar_url ?? fallbackAvatarFor(resolved),
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
      avatar: resolved?.avatar_url ?? fallbackAvatarFor(resolved),
      age: resolved?.age,
      city: resolved?.city,
    })
    try {
      const msgs = await fetchMessages(matchId)
      setThreadMessages(msgs as unknown as ChatMessage[])
    } catch (err) {
      console.warn('Failed to load messages', err)
      setThreadMessages([])
    }
    if (messageUnsub.current) {
      try { (messageUnsub.current as any)?.unsubscribe?.() } catch (_) {}
      messageUnsub.current = null as any
    }
    const channel = subscribeToThread(matchId, msg => setThreadMessages(prev => [...prev, msg as unknown as ChatMessage]))
    messageUnsub.current = () => {
      try { (channel as any)?.unsubscribe?.() } catch (_) {}
    }
  }

  useEffect(() => () => {
    if (messageUnsub.current) {
      try { (messageUnsub.current as any)() } catch (_) {}
    }
  }, [messageUnsub])

  const handleSend = async () => {
    if (!selectedMatchId || !messageInput.trim()) return
    // Allow demo matches to behave locally without hitting the API
    if (selectedMatchId.startsWith('demo-match')) {
      setThreadMessages(prev => [...prev, {
        id: crypto.randomUUID(),
        match_id: selectedMatchId,
        body: messageInput.trim(),
        thread_id: selectedMatchId,
        user_id: userId ?? 'me',
        created_at: new Date().toISOString(),
      } as ChatMessage])
      setMessageInput('')
      return
    }
    try {
      await sendMessage(selectedMatchId, messageInput.trim())
      setMessageInput('')
    } catch (err) {
      console.error('Failed to send message', err)
    }
  }

  const recordSwipe = useCallback(async (profile?: Profile, actionType: 'like' | 'pass' = 'like') => {
    if (!supabase || !profile) return
    try {
      await sendSwipe(profile.id, actionType)
    } catch (err) {
      console.warn('Swipe failed', err)
    }
  }, [])

  const handleSwipe = (actionType: 'like' | 'pass' = 'like') => {
    if (!current) return
    const profile = current
    const direction = actionType === 'pass' ? -1 : 1
    const kind = actionType === 'like' ? 'match' : 'pass'
    setSwipeMeta({ direction, kind })
    setDeck(prev => {
      if (!prev.length) return prev
      const [first, ...rest] = prev
      return [...rest, first]
    })
    setTimeout(() => setSwipeMeta({ direction: 0, kind: 'none' }), 180)
    recordSwipe(profile, actionType)
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
            ) : !matchRows.length ? (
              <p className="muted" style={{ gridColumn: '1 / -1' }}>No matches yet.</p>
            ) : (
              matchRows.map(match => {
                const other = (match.profiles ?? []).find(p => p.id !== userId)
                const profile = other ? normalizeProfile(other) : null
                const shortName = profile?.username?.split?.(' ')?.[0] || profile?.username || 'Match'
                return (
                  <button
                    key={match.id}
                    className={`match-card ${selectedMatchId === match.id ? 'is-active' : ''}`}
                    onClick={() => openMatch(match.id)}
                  >
                    <img src={profile?.avatar_url ?? fallbackAvatarFor(profile)} alt={profile?.username ?? 'Match'} />
                    <div className="match-meta">
                      <span className="match-name">{shortName}</span>
                    </div>
                  </button>
                )
              })
            )}
          </div>
        ) : (
          <div className="messages-list">
            {!messages.length ? (
              <p className="muted">No messages yet.</p>
            ) : (
              messages.map(msg => (
                <button
                  key={msg.id}
                  className={`message-row ${selectedMessage?.id === msg.id ? 'is-active' : ''}`}
                  onClick={() => openMatch(msg.matchId ?? msg.id)}
                >
                  <img src={msg.avatar} alt={msg.name} className="message-avatar" />
                  <div className="message-text">
                    <div className="message-title">
                      <span className="message-name">{msg.name.split(' ')[0] || msg.name}</span>
                    </div>
                    <p className="muted small">{msg.snippet}</p>
                  </div>
                </button>
              ))
            )}
          </div>
        )}
      </aside>

      {selectedMatch || selectedMessage ? (
        <>
          <section className="chat-pane">
            <header className="chat-header">
              <div className="chat-match-info">
                <img
                  src={selectedProfile?.avatar_url ?? fallbackAvatarFor(selectedProfile)}
                  alt={shortName(selectedProfile)}
                  className="chat-avatar"
                />
                <div>
                  <p className="sub">You matched with {shortName(selectedProfile)}</p>
                  <small className="muted">Recently</small>
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
                      <div className={`bubble ${msg.user_id === userId ? 'you' : 'them'}`}>
                        {msg.body}
                      </div>
                      <div className="bubble-meta">
                        <span>{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        {msg.user_id === userId ? <span>Sent</span> : null}
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
            <div className="profile-hero" style={{ backgroundImage: `url(${selectedProfile?.avatar_url ?? fallbackAvatarFor(selectedProfile)})` }} />
            <div className="profile-pane-body">
              <div className="profile-pane-header">
                <h2>{shortName(selectedProfile)} <span>{selectedProfile?.age ?? ''}</span></h2>
                <p className="muted">{formatLocation(selectedProfile, viewerHome)}</p>
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
            {nextProfile ? (
              <div
                className="hero-photo hero-photo-next"
                style={{ backgroundImage: `url(${nextProfile.avatar_url ?? fallbackAvatarFor(nextProfile)})` }}
              >
                <div className="hero-overlay" />
              </div>
            ) : null}
            <AnimatePresence mode="popLayout">
              {current ? (
                <SwipeCard
                  key={current.id}
                  swipeMeta={swipeMeta}
                  onSwipeLeft={() => handleSwipe('pass')}
                  onSwipeRight={() => handleSwipe('like')}
                  >
                  <div
                    className="hero-photo"
                    style={{ backgroundImage: `url(${current.avatar_url ?? fallbackAvatarFor(current)})` }}
                  >
                    <div className="hero-overlay" />
                    <div className="hero-meta">
                      <div>
                        <h2>{shortName(current)} <span>{current?.age}</span></h2>
                        <p>{formatLocation(current, viewerHome)}</p>
                      </div>
                    </div>
                  </div>
                </SwipeCard>
              ) : null}
            </AnimatePresence>
            <div className="hero-actions hero-actions-wide">
              <button className="ghost wide" onClick={() => handleSwipe('pass')}>Pass</button>
              <button className="cta wide" onClick={() => handleSwipe('like')}><span className="dab-text">dab</span></button>
            </div>
          </div>
        </section>
      )}
    </main>
    </RequireAuth>
  )
}
