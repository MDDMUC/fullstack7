'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { supabase, requireSupabase } from '@/lib/supabaseClient'
import { fetchProfiles, Profile as DbProfile, normalizeProfile } from '@/lib/profiles'
import { RequireAuth } from '@/components/RequireAuth'
import { sendSwipe } from '@/lib/swipes'
import { listMatches, MatchWithProfiles } from '@/lib/matches'
import { sendMessage, subscribeToThread, Message as ChatMessage, fetchMessages } from '@/lib/messages'
import MobileSwipeCardSilver from '@/components/MobileSwipeCardSilver'

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
  const messageUnsub = useMemo(() => ({ current: null as null | (() => void) }), [])

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


  // Use mobile card for both mobile and desktop - responsive sizing handled in CSS
  return (
    <RequireAuth>
      <MobileSwipeCardSilver />
    </RequireAuth>
  )
}
