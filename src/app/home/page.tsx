'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import ButtonDab from '@/components/ButtonDab'
import MobileFilterBar from '@/components/MobileFilterBar'
import MobileNavbar from '@/components/MobileNavbar'
import MobileTopbar from '@/components/MobileTopbar'
import Avatar from '@/components/Avatar'
import { RequireAuth } from '@/components/RequireAuth'
import { useAuthSession } from '@/hooks/useAuthSession'
import { fetchProfiles, Profile as DbProfile, fetchGymsFromTable, Gym } from '@/lib/profiles'
import { supabase, requireSupabase } from '@/lib/supabaseClient'
import { sendSwipe } from '@/lib/swipes'
import { checkAndCreateMatch } from '@/lib/matches'

// Figma mobile navbar - exact structure from node 628:4634
// Using exact SVG files from /public/icons/

type Profile = DbProfile & {
  distance?: string
  interest?: string
  grade?: string
}

const FIGMA_CARD_IMAGE = 'https://www.figma.com/api/mcp/asset/11d0ee86-62b7-427f-86c4-f30e4e38bbfb' // Figma node 633:14303

const ROCK_ICON = 'https://www.figma.com/api/mcp/asset/b40792a1-8803-46f4-8eda-7fffabd185d1'
const FOUNDER_ICON = 'https://www.figma.com/api/mcp/asset/678371f8-8c8a-45a5-bdfc-e9638de47c64'
const PRO_ICON = 'https://www.figma.com/api/mcp/asset/e59c8273-cc79-465c-baea-a52bc6410ee6'

const FILTER_LABELS = ['city', 'style', 'gym'] as const
type FilterKey = (typeof FILTER_LABELS)[number]

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
// Also checks the raw styles array from onboardingprofiles if available
const getStylesFromProfile = (profile?: Profile | null): string[] => {
  if (!profile) return []
  
  // First, check if there's a raw styles array (from onboardingprofiles)
  const rawStyles = (profile as any).styles || (profile as any).onboardingprofiles?.[0]?.styles
  if (Array.isArray(rawStyles) && rawStyles.length > 0) {
    return rawStyles.map(s => String(s).trim()).filter(Boolean)
  }
  
  // Otherwise, check the normalized style field
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
const getGradeFromProfile = (profile?: Profile | null): string | undefined => {
  if (!profile) return undefined
  return profile.grade?.trim() || undefined
}

export default function HomeScreen() {
  const { session } = useAuthSession()
  const [deck, setDeck] = useState<Profile[]>([])
  const [currentUserProfile, setCurrentUserProfile] = useState<Profile | null>(null)
  const [loadingProfiles, setLoadingProfiles] = useState(true)
  const [celebrate, setCelebrate] = useState(false)
  const [celebrateName, setCelebrateName] = useState<string | null>(null)
  const [filters, setFilters] = useState<Record<FilterKey, string>>({
    city: 'All',
    style: 'All',
    gym: 'All',
  })
  const [gyms, setGyms] = useState<Gym[]>([])

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
      setLoadingProfiles(true)
      try {
        const client = supabase ?? requireSupabase()
        const normalized = await fetchProfiles(client)
        const profiles: Profile[] = normalized.map(p => ({
          ...p,
          distance: p.distance ?? '10 km',
        }))
        setDeck(profiles)
        
        // Fetch gyms from the gyms table
        const gymsList = await fetchGymsFromTable(client)
        setGyms(gymsList)
      } catch (err) {
        console.error('Failed to load profiles', err)
        setDeck([])
      }
      setLoadingProfiles(false)
    }
    load()
  }, [])

  // Create a map of gym ID to gym name for filtering
  const gymMap = useMemo(() => {
    const map = new Map<string, string>()
    gyms.forEach(gym => {
      if (gym.id && gym.name) {
        map.set(gym.id, gym.name)
      }
    })
    return map
  }, [gyms])

  const filterOptions = useMemo(() => {
    const cities = new Set<string>(['All'])
    const styles = new Set<string>(['All'])
    const gymNames = new Set<string>(['All'])

    // Extract cities from profiles (check both city and homebase)
    deck.forEach(p => {
      const city = p.city || p.homebase
      if (city) cities.add(city)
      getStylesFromProfile(p).forEach(s => styles.add(s))
    })

    // Extract gym names from the gyms table
    gyms.forEach(gym => {
      if (gym.name) gymNames.add(gym.name)
    })

    return {
      city: Array.from(cities).sort(),
      style: Array.from(styles).sort(),
      gym: Array.from(gymNames).sort(),
    }
  }, [deck, gyms])

  const filteredDeck = useMemo(() => {
    return deck.filter(p => {
      // Exclude current user's own profile
      if (currentUserProfile?.id && p.id === currentUserProfile.id) return false
      
      // Filter by city - case-insensitive match
      if (filters.city !== 'All') {
        const profileCity = (p.city || p.homebase || '').trim().toLowerCase()
        const filterCity = filters.city.trim().toLowerCase()
        if (profileCity !== filterCity) {
          return false
        }
      }
      
      // Filter by climbing style - case-insensitive match
      if (filters.style !== 'All') {
        const profileStyles = getStylesFromProfile(p).map(s => s.trim().toLowerCase())
        const filterStyle = filters.style.trim().toLowerCase()
        if (!profileStyles.includes(filterStyle)) {
          return false
        }
      }
      
      // Filter by gym - check if profile's gym array includes the selected gym
      // The gym array may contain gym IDs (UUIDs) or gym names, so we check both
      if (filters.gym !== 'All') {
        const profileGyms = Array.isArray(p.gym) ? p.gym : []
        if (profileGyms.length === 0) return false
        
        // Find the gym ID that matches the selected gym name
        const selectedGymId = Array.from(gymMap.entries()).find(
          ([_, name]) => name.trim().toLowerCase() === filters.gym.trim().toLowerCase()
        )?.[0]
        
        // Check if profile has the gym by ID or by name (handles both cases)
        const hasGym = profileGyms.some(g => {
          if (!g || typeof g !== 'string') return false
          const trimmed = g.trim().toLowerCase()
          const filterGym = filters.gym.trim().toLowerCase()
          // Match by ID (UUID format) or by name
          return trimmed === selectedGymId?.toLowerCase() || trimmed === filterGym
        })
        
        if (!hasGym) return false
      }
      
      return true
    })
  }, [deck, filters, currentUserProfile, gymMap])

  const current = useMemo(() => filteredDeck[0] ?? deck[0] ?? null, [filteredDeck, deck])

  const tags = useMemo(() => {
    // Get styles and grade from database fields, not from tags
    const styles = getStylesFromProfile(current)
    const grade = getGradeFromProfile(current)
    return { styles, grade }
  }, [current])

  const chips = useMemo(() => chipsFromTags(current?.tags ?? []), [current])
  const specialTopChips = useMemo(() => {
    return chips.filter(chip => {
      const lower = chip.toLowerCase()
      return lower.includes('pro') || lower.includes('founder') || lower.includes('crew')
    })
  }, [chips])

  const remainingChips = useMemo(() => {
    const specials = new Set(specialTopChips)
    return chips.filter(chip => !specials.has(chip))
  }, [chips, specialTopChips])

  const currentAvatar = current?.avatar_url ?? (current as any)?.photo ?? null

  // Check if the displayed profile is the logged-in user
  const isCurrentUser = useMemo(() => {
    return currentUserProfile && current?.id && currentUserProfile.id === current.id
  }, [currentUserProfile, current])

  const showOnlinePill = useMemo(() => {
    if (!current) return false
    if (isCurrentUser && session) return true
    // Default on when unauthenticated so layout remains consistent with the Figma component.
    return !session
  }, [isCurrentUser, session])

  const showStatusRow = showOnlinePill

  const handleNext = () => {
    setDeck(prev => {
      if (prev.length <= 1) return prev
      const [first, ...rest] = prev
      return [...rest, first]
    })
  }

  const handleDab = async () => {
    if (!current) return
    setCelebrateName(current.username?.split(' ')[0] || current.username || 'This climber')
    setCelebrate(true)
    try {
      await sendSwipe(current.id, 'like')
      await checkAndCreateMatch(current.id)
    } catch (err) {
      console.error('dab action failed', err)
    }
    setTimeout(() => setCelebrate(false), 2200)
  }

  return (
    <RequireAuth>
      <div className="home-screen" data-name="/home-mobile">
        <div className="home-content">
          {loadingProfiles ? (
            <>
              <div className="home-loading" role="status" aria-label="Loading profiles">
                <span className="home-loading-dot" />
                <span className="home-loading-text">Loading…</span>
              </div>
              <MobileNavbar active="dab" />
            </>
          ) : !current ? (
            <>
              <div className="home-empty">No profiles available.</div>
              <MobileNavbar active="dab" />
            </>
          ) : (
            <>
              <MobileTopbar breadcrumb="DAB" />
              <MobileFilterBar
                filters={filters}
                filterOptions={filterOptions}
                onFilterChange={(key, val) => setFilters(prev => ({ ...prev, [key]: val }))}
                filterKeys={FILTER_LABELS}
              />

              <div className="home-card" data-name="usercard-mobile">
                {showStatusRow && (
                  <div className="home-card-header">
                    <div className="home-card-header-left" />
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
                    {specialTopChips.length > 0 && (
                      <div className="home-special-chips">
                        {specialTopChips.map(chip => {
                          const lower = chip.toLowerCase()
                          const isPro = lower.includes('pro')
                          const isFounder = lower.includes('founder')
                          const isCrew = lower.includes('crew')
                          let chipClass = 'fc-chip'
                          if (isPro) chipClass += ' fc-chip-pro'
                          else if (isFounder) chipClass += ' fc-chip-founder'
                          else if (isCrew) chipClass += ' fc-chip-crew'
                          const iconSrc = isPro ? PRO_ICON : isFounder ? FOUNDER_ICON : ROCK_ICON
                          const needsGradient = isFounder || isCrew
                          return (
                            <span key={`special-top-${chip}`} className={chipClass}>
                              <img src={iconSrc} alt="" className="fc-chip-icon" />
                              {needsGradient ? <span className="fc-chip-text">{chip}</span> : chip}
                            </span>
                          )
                        })}
                      </div>
                    )}
                    <Avatar
                      src={currentAvatar}
                      alt={current?.username || 'Profile'}
                      className="home-image"
                      showPlaceholder={false}
                    />
                    <div className="home-image-overlay">
                      <div className="home-name-row">
                        <div className="home-name">{current.username?.split(' ')[0] || '—'}</div>
                        {current.age && <div className="home-age">{current.age}</div>}
                      </div>
                      <div className="home-location">{current.city || current.homebase || '—'}</div>
                      <div className="home-chips-row">
                        {tags.styles.length > 0 &&
                          tags.styles.map((style, idx) => (
                            <span key={`style-${style}-${idx}`} className="button-tag">
                              {style}
                            </span>
                          ))}
                        {tags.grade && <span className="button-tag button-tag-grade">{tags.grade}</span>}
                        {remainingChips.map((chip, idx) => {
                          const chipLower = chip.toLowerCase()
                          const isPro = chipLower.includes('pro') && !chipLower.includes('founder') && !chipLower.includes('crew')
                          const isFounder = chipLower.includes('founder')
                          const isCrew = chipLower.includes('crew')
                          const isBelayCertified = chipLower.includes('belay')

                          let chipClass = 'fc-chip'
                          if (isPro) chipClass += ' fc-chip-pro'
                          else if (isFounder) chipClass += ' fc-chip-founder'
                          else if (isCrew) chipClass += ' fc-chip-crew'
                          else if (isBelayCertified) chipClass += ' fc-chip-belay'
                          else chipClass += ' fc-chip-standard'

                          const needsGradient = isFounder || isCrew
                          const showIcon = isPro || isFounder || isCrew
                          const iconSrc = isPro ? PRO_ICON : isFounder ? FOUNDER_ICON : ROCK_ICON

                          return (
                            <span key={`chip-${chip}-${idx}`} className={chipClass}>
                              {showIcon && <img src={iconSrc} alt="" className="fc-chip-icon" />}
                              {needsGradient ? <span className="fc-chip-text">{chip}</span> : chip}
                            </span>
                          )
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="home-bio">
                    <p className="home-bio-text">
                      {current.bio || ''}
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
                    <ButtonDab
                      type="button"
                      data-name="Property 1=dab, Property 2=default"
                      data-node-id="476:13447"
                      onClick={handleDab}
                    />
                  </div>
                </div>
              </div>

              {/* Mobile Navbar - Exact from Figma node 628:4634 */}
              <MobileNavbar active="dab" />

              {celebrate && (
                <div className="home-dab-toast" role="status">
                  <div className="home-dab-confetti-burst" aria-hidden="true" />
                  <div className="home-dab-confetti-orbs" aria-hidden="true">
                    <span className="home-dab-orb orb-1" />
                    <span className="home-dab-orb orb-2" />
                    <span className="home-dab-orb orb-3" />
                  </div>
                  <div className="home-dab-sparkles" aria-hidden="true" />
                  <div className="home-dab-thumb" aria-hidden="true">👍</div>
                  <div className="home-dab-text">
                    <div className="home-dab-title">You have dabbed!</div>
                    {celebrateName && <div className="home-dab-subtitle">{celebrateName}</div>}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </RequireAuth>
  )
}
