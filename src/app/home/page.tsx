'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import ButtonDab from '@/components/ButtonDab'
import { RequireAuth } from '@/components/RequireAuth'
import { useAuthSession } from '@/hooks/useAuthSession'
import { fetchProfiles, Profile as DbProfile } from '@/lib/profiles'
import { supabase, requireSupabase } from '@/lib/supabaseClient'

// Figma mobile navbar - exact structure from node 628:4634
// Using exact SVG files from /public/icons/

type Profile = DbProfile & {
  distance?: string
  interest?: string
  grade?: string
}

const FALLBACK_MALE = '/fallback-male.jpg'
const FALLBACK_FEMALE = '/fallback-female.jpg'
const FIGMA_CARD_IMAGE = 'https://www.figma.com/api/mcp/asset/11d0ee86-62b7-427f-86c4-f30e4e38bbfb' // Figma node 633:14303

const FILTER_LABELS = ['city', 'style', 'gym', 'time']

const FALLBACK_PROFILE: Profile = {
  id: 'figma-demo',
  username: 'Jared',
  age: 20,
  city: 'Hamburg',
  bio: 'Always up for a board session or some bouldering. Looking for people to climb at Kochel on the weekends.',
  avatar_url: FIGMA_CARD_IMAGE,
  tags: ['Boulder', 'Sport', 'grade:Advanced', 'Belay Certified', 'Edelrid Ohm', 'Host'],
}

const chipsFromTags = (tags?: string[]) =>
  (tags ?? []).filter(t => !t.toLowerCase().startsWith('grade:') && !['boulder', 'sport', 'lead', 'trad'].includes(t.toLowerCase()))

// Extract styles from profile.style field (comma-separated string or array)
const getStylesFromProfile = (profile: Profile): string[] => {
  if (!profile.style) return []
  // If it's already an array, return it
  if (Array.isArray(profile.style)) {
    return profile.style.map(s => s.trim()).filter(Boolean)
  }
  // If it's a string, split by comma
  if (typeof profile.style === 'string') {
    return profile.style.split(',').map(s => s.trim()).filter(Boolean)
  }
  return []
}

// Get grade from profile.grade field
const getGradeFromProfile = (profile: Profile): string | undefined => {
  return profile.grade?.trim() || undefined
}

const fallbackAvatarFor = (profile?: Profile | null) => {
  const hint = (profile?.pronouns || (profile as any)?.gender || '').toString().toLowerCase()
  if (hint.includes('she') || hint.includes('her') || hint.includes('woman') || hint.includes('female')) {
    return FALLBACK_FEMALE
  }
  return FALLBACK_MALE
}

export default function HomeScreen() {
  const { session } = useAuthSession()
  const [deck, setDeck] = useState<Profile[]>([])
  const [currentUserProfile, setCurrentUserProfile] = useState<Profile | null>(null)

  // Fetch current user's profile to check for pro status
  useEffect(() => {
    const loadCurrentUser = async () => {
      if (!session) {
        setCurrentUserProfile(null)
        return
      }
      try {
        const client = supabase ?? requireSupabase()
        const { data: userData } = await client.auth.getUser()
        if (!userData.user) {
          setCurrentUserProfile(null)
          return
        }
        const profiles = await fetchProfiles(client, [userData.user.id])
        if (profiles.length > 0) {
          setCurrentUserProfile(profiles[0])
        } else {
          setCurrentUserProfile(null)
        }
      } catch (err) {
        console.error('Failed to load current user profile', err)
        setCurrentUserProfile(null)
      }
    }
    loadCurrentUser()
  }, [session])

  useEffect(() => {
    const load = async () => {
      try {
        const normalized = await fetchProfiles()
        const profiles: Profile[] = normalized.map(p => ({
          ...p,
          distance: p.distance ?? '10 km',
          avatar_url: p.avatar_url ?? fallbackAvatarFor(p),
        }))
        const safeDeck = profiles.length ? profiles : [FALLBACK_PROFILE]
        setDeck(safeDeck)
      } catch (err) {
        console.error('Failed to load profiles', err)
        setDeck([FALLBACK_PROFILE])
      }
    }
    load()
  }, [])

  const current = useMemo(() => deck[0] ?? FALLBACK_PROFILE, [deck])

  const tags = useMemo(() => {
    // Get styles and grade from database fields, not from tags
    const styles = getStylesFromProfile(current)
    const grade = getGradeFromProfile(current)
    return { styles, grade }
  }, [current])

  const chips = useMemo(() => chipsFromTags(current.tags), [current])

  // Check if the displayed profile is the logged-in user
  const isCurrentUser = useMemo(() => {
    return currentUserProfile && current?.id && currentUserProfile.id === current.id
  }, [currentUserProfile, current])

  // Status row visibility: always render to mirror the Figma reference; prefer live data when present.
  const showProChip = useMemo(() => {
    const normalizedStatus = (currentUserProfile?.status ?? (current as any)?.status ?? '').toString().toLowerCase()
    if (normalizedStatus.includes('pro')) return true
    // Default to showing the pro chip to stay faithful to the Figma reference when no status is present.
    return !currentUserProfile
  }, [currentUserProfile, current])

  const showOnlinePill = useMemo(() => {
    if (isCurrentUser && session) return true
    // Default on when unauthenticated so layout remains consistent with the Figma component.
    return !session
  }, [isCurrentUser, session])

  const showStatusRow = showProChip || showOnlinePill

  const handleNext = () => {
    setDeck(prev => {
      if (prev.length <= 1) return prev
      const [first, ...rest] = prev
      return [...rest, first]
    })
  }

  return (
    <RequireAuth>
      <div className="home-screen" data-name="/home-mobile">
        <div className="home-content">
          <div className="home-filters">
            {FILTER_LABELS.map(label => (
              <button key={label} type="button" className="filter-pill">
                <span className="filter-pill-label">{label}</span>
                <img src="/icons/Color.svg" alt="" className="filter-pill-icon" />
              </button>
            ))}
          </div>

          <div className="home-card" data-name="usercard-mobile">
            {showStatusRow && (
              <div className="home-card-header">
                <div className="home-card-header-left">
                  {showProChip && (
                    <span className="button-chip button-chip-pro">
                      <img src="/icons/pro.svg" alt="" className="button-chip-pro-icon" />
                      PRO
                    </span>
                  )}
                </div>
                <div className="home-card-header-right">
                  {showOnlinePill && (
                    <span className="button-pill button-pill-focus button-pill-online-now">
                      <span className="button-pill-dot" />
                      Online now
                    </span>
                  )}
                </div>
              </div>
            )}

            <div className="home-card-main">
              <div className="home-image-wrapper">
                <img
                  src={current.avatar_url || FIGMA_CARD_IMAGE}
                  alt={current.username || 'Profile'}
                  className="home-image"
                />
                <div className="home-image-overlay">
                  <div className="home-name-row">
                    <div className="home-name">{current.username?.split(' ')[0] || 'Climber'}</div>
                    {current.age && <div className="home-age">{current.age}</div>}
                  </div>
                  <div className="home-location">{current.city || 'Somewhere craggy'}</div>
                  <div className="home-chips-row">
                    {/* Always display styles from database */}
                    {tags.styles.length > 0 ? (
                      tags.styles.map((style, idx) => (
                        <span key={`style-${style}-${idx}`} className="button-tag">
                          {style}
                        </span>
                      ))
                    ) : null}
                    {/* Always display grade from database if available */}
                    {tags.grade && (
                      <span className="button-tag button-tag-grade">{tags.grade}</span>
                    )}
                    {chips.map((chip, idx) => {
                      const chipLower = chip.toLowerCase();
                      // Check for special chips that have unique styling
                      const isPro = chipLower.includes('pro') && !chipLower.includes('founder') && !chipLower.includes('crew');
                      const isFounder = chipLower.includes('founder');
                      const isCrew = chipLower.includes('crew');
                      const isBelayCertified = chipLower.includes('belay');
                      
                      // Determine chip class based on special types
                      let chipClass = 'button-chip';
                      if (isPro) {
                        chipClass += ' button-chip-pro';
                      } else if (isFounder) {
                        chipClass += ' button-chip-founder';
                      } else if (isCrew) {
                        chipClass += ' button-chip-crew';
                      } else if (isBelayCertified) {
                        chipClass += ' button-chip-belay';
                      } else {
                        // First chip uses focus state, rest use default
                        const isFirst = idx === 0;
                        if (isFirst) chipClass += ' button-chip-focus';
                      }
                      
                      // For founder and crew, wrap text in span for gradient
                      const needsGradient = isFounder || isCrew;
                      
                      return (
                        <span
                          key={`chip-${chip}-${idx}`}
                          className={chipClass}
                        >
                          {needsGradient ? <span>{chip}</span> : chip}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="home-bio">
                <p className="home-bio-text">
                  {current.bio ||
                    'Always up for a board session or some bouldering. Looking for people to climb at Kochel on the weekends.'}
                </p>
                <div className="home-bio-shadow" />
              </div>
            </div>

            <div className="button-row" data-name="cta row" data-node-id="634:16494">
              <div className="button-row-wrapper" data-name="button-mainnav" data-node-id="634:16495">
                <button type="button" className="button-navlink button-navlink-hover" onClick={handleNext}>
                  Next
                </button>
              </div>
              <div className="button-row-wrapper" data-name="button-dab" data-node-id="634:16496">
                <ButtonDab type="button" data-name="Property 1=dab, Property 2=default" data-node-id="476:13447" />
              </div>
            </div>
          </div>

          {/* Mobile Navbar - Exact from Figma node 628:4634 */}
          <div className="home-bottom-nav" data-name="state=Default">
            <div className="home-bottom-row" data-name="links">
              {/* Profile */}
              <Link href="/profile" className="home-bottom-item" data-name="profile">
                <div className="home-bottom-icon-container">
                  <div className="home-nav-icon-wrapper" data-name="face-content">
                    <div className="home-nav-icon-inner-face">
                      <img src="/icons/face-content.svg" alt="" className="home-nav-icon-img" />
                    </div>
                  </div>
                </div>
                <span className="home-bottom-label">profile</span>
              </Link>
              {/* Events */}
              <Link href="/events" className="home-bottom-item" data-name="events">
                <div className="home-bottom-icon-container">
                  <div className="home-nav-icon-wrapper" data-name="announcement-01">
                    <div className="home-nav-icon-inner-announcement">
                      <img src="/icons/announcement-01.svg" alt="" className="home-nav-icon-img" />
                    </div>
                  </div>
                </div>
                <span className="home-bottom-label">events</span>
              </Link>
              {/* Chats */}
              <Link href="/chats" className="home-bottom-item home-bottom-item-chat" data-name="chats">
                <div className="home-bottom-icon-container">
                  <div className="home-nav-icon-wrapper" data-name="message-chat-square">
                    <div className="home-nav-icon-inner-message">
                      <img src="/icons/message-chat-square.svg" alt="" className="home-nav-icon-img" />
                    </div>
                  </div>
                  <div className="home-bottom-dot" />
                </div>
                <span className="home-bottom-label">chats</span>
              </Link>
              {/* Dab */}
              <Link href="/home" className="home-bottom-item home-bottom-active" data-name="dab">
                <div className="home-bottom-icon-container">
                  <div className="home-nav-icon-wrapper" data-name="flash">
                    <div className="home-nav-icon-inner-flash" data-name="Icon">
                      <div className="home-nav-icon-inner-flash-2">
                        <img src="/icons/flash.svg" alt="" className="home-nav-icon-img" />
                      </div>
                    </div>
                  </div>
                </div>
                <span className="home-bottom-label">dab</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </RequireAuth>
  )
}
