'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import ButtonDab from '@/components/ButtonDab'
import MobileFilterBar from '@/components/MobileFilterBar'
import MobileNavbar from '@/components/MobileNavbar'
import MobileTopbar from '@/components/MobileTopbar'
import Avatar from '@/components/Avatar'
import ActionMenu from '@/components/ActionMenu'
import ReportModal from '@/components/ReportModal'
import { RequireOnboarding } from '@/components/RequireOnboarding'
import { useAuthSession } from '@/hooks/useAuthSession'
import { fetchProfiles, Profile as DbProfile, fetchGymsFromTable, Gym } from '@/lib/profiles'
import { supabase, requireSupabase } from '@/lib/supabaseClient'
import { sendSwipe } from '@/lib/swipes'
import { checkAndCreateMatch } from '@/lib/matches'
import { blockUser, getBlockedUsers } from '@/lib/blocks'

// Figma mobile navbar - exact structure from node 628:4634
// Using exact SVG files from /public/icons/

type Profile = DbProfile & {
  distance?: string
  interest?: string
  grade?: string
}

const FIGMA_CARD_IMAGE = 'https://www.figma.com/api/mcp/asset/11d0ee86-62b7-427f-86c4-f30e4e38bbfb' // Figma node 633:14303

const ROCK_ICON = '/icons/rocknrollhand.svg'
const FOUNDER_ICON = '/icons/founder-badge.svg'
const PRO_ICON = '/icons/pro-badge.svg'

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
  const [blockedUserIds, setBlockedUserIds] = useState<string[]>([])
  const [cardMenuOpen, setCardMenuOpen] = useState(false)
  const [reportModalOpen, setReportModalOpen] = useState(false)
  const [blocking, setBlocking] = useState(false)
  const [transitioning, setTransitioning] = useState(false)

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

        // Fetch blocked users (both directions: users I blocked AND users who blocked me)
        let blocked: string[] = []
        try {
          const { data: userData } = await client.auth.getUser()
          const currentUserId = userData.user?.id

          if (currentUserId) {
            const { data: blocksData } = await client
              .from('blocks')
              .select('blocker_id, blocked_id')
              .or(`blocker_id.eq.${currentUserId},blocked_id.eq.${currentUserId}`)

            if (blocksData) {
              const blockedSet = new Set<string>()
              blocksData.forEach(block => {
                // Add users I blocked
                if (block.blocker_id === currentUserId) {
                  blockedSet.add(block.blocked_id)
                }
                // Add users who blocked me
                if (block.blocked_id === currentUserId) {
                  blockedSet.add(block.blocker_id)
                }
              })
              blocked = Array.from(blockedSet)
            }
          }

          setBlockedUserIds(blocked)
        } catch {
          // Ignore if blocks table doesn't exist yet
        }

        const normalized = await fetchProfiles(client)
        const profiles: Profile[] = normalized
          .filter(p => !blocked.includes(p.id)) // Filter out blocked users (both directions)
          .map(p => ({
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

  // Get current user's gyms and styles for matching
  const currentUserGyms = useMemo(() => {
    if (!currentUserProfile?.gym) return new Set<string>()
    const gyms = Array.isArray(currentUserProfile.gym) ? currentUserProfile.gym : []
    return new Set(gyms.map(g => String(g).toLowerCase()))
  }, [currentUserProfile])

  const currentUserStyles = useMemo(() => {
    return new Set(getStylesFromProfile(currentUserProfile).map(s => s.toLowerCase()))
  }, [currentUserProfile])

  // Calculate match score for a profile (higher = better match)
  const getMatchScore = (profile: Profile): number => {
    let score = 0

    // +2 points for each mutual gym
    const profileGyms = Array.isArray(profile.gym) ? profile.gym : []
    profileGyms.forEach(g => {
      if (currentUserGyms.has(String(g).toLowerCase())) score += 2
    })

    // +1 point for each mutual style
    const profileStyles = getStylesFromProfile(profile).map(s => s.toLowerCase())
    profileStyles.forEach(s => {
      if (currentUserStyles.has(s)) score += 1
    })

    return score
  }

  const filteredDeck = useMemo(() => {
    const filtered = deck.filter(p => {
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

    // Sort by match score (suggested partners first), then by created_at (already in order)
    return filtered.sort((a, b) => getMatchScore(b) - getMatchScore(a))
  }, [deck, filters, currentUserProfile, gymMap, currentUserGyms, currentUserStyles])

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

  // Preload next 3 profile images for instant transitions
  useEffect(() => {
    if (!filteredDeck || filteredDeck.length <= 1) return

    const preloadImages = filteredDeck.slice(1, 4).map(profile => {
      const avatarUrl = profile?.avatar_url ?? (profile as any)?.photo
      if (!avatarUrl) return null

      const img = new Image()
      img.src = avatarUrl
      return img
    }).filter(Boolean)

    // Cleanup function
    return () => {
      preloadImages.forEach(img => {
        if (img) img.src = ''
      })
    }
  }, [filteredDeck])

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
    if (transitioning) return // Prevent rapid clicks

    setTransitioning(true)
    setDeck(prev => {
      if (prev.length <= 1) return prev
      const [first, ...rest] = prev
      return [...rest, first]
    })

    // Reset transitioning state after a brief delay
    setTimeout(() => setTransitioning(false), 100)
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

  const handleBlock = async () => {
    if (!current) return
    setBlocking(true)
    try {
      await blockUser(current.id)
      setBlockedUserIds(prev => [...prev, current.id])
      // Remove blocked user from deck
      setDeck(prev => prev.filter(p => p.id !== current.id))
      setCardMenuOpen(false)
    } catch (err) {
      console.error('block failed', err)
    }
    setBlocking(false)
  }

  const handleOpenReport = () => {
    setCardMenuOpen(false)
    setReportModalOpen(true)
  }

  return (
    <RequireOnboarding>
      <div className="home-screen" data-name="/home-mobile">
        {!loadingProfiles && current && (
          <>
            <MobileTopbar breadcrumb="DAB" />
            <MobileFilterBar
              filters={filters}
              filterOptions={filterOptions}
              onFilterChange={(key, val) => setFilters(prev => ({ ...prev, [key]: val }))}
              filterKeys={FILTER_LABELS}
            />
          </>
        )}
        <div className="home-content">
          {loadingProfiles ? (
            <div className="home-loading" role="status" aria-label="Loading profiles">
              <span className="home-loading-dot" />
              <span className="home-loading-text">Loading…</span>
            </div>
          ) : !current ? (
            <div className="home-empty">No profiles available.</div>
          ) : (
            <>
              <div className="home-card" data-name="usercard-mobile">
                {showStatusRow && (
                  <div className="home-card-header">
                    <div className="home-card-header-left">
                      <button
                        type="button"
                        className="home-card-menu-btn"
                        aria-label="More options"
                        onClick={() => setCardMenuOpen(!cardMenuOpen)}
                      >
                        <img src="/icons/dots.svg" alt="" width={24} height={24} />
                      </button>
                      <ActionMenu
                        open={cardMenuOpen}
                        onClose={() => setCardMenuOpen(false)}
                        items={[
                          {
                            label: 'Block user',
                            onClick: handleBlock,
                            loading: blocking,
                            loadingLabel: 'Blocking...',
                            danger: true,
                          },
                          {
                            label: 'Report user',
                            onClick: handleOpenReport,
                          },
                        ]}
                      />
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
                  <div className="home-image-wrapper animated-gradient-border">
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
                          const iconSrc = ROCK_ICON // All special chips use rock and roll hand
                          const needsGradient = isPro || isFounder || isCrew
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
                      loading="eager"
                      fetchPriority="high"
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

                          const needsGradient = isPro || isFounder || isCrew
                          const showIcon = isPro || isFounder || isCrew
                          const iconSrc = ROCK_ICON // All special chips use rock and roll hand

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

              <ReportModal
                open={reportModalOpen}
                onClose={() => setReportModalOpen(false)}
                reportedUserId={current?.id || ''}
                reportedUserName={current?.username?.split(' ')[0] || 'User'}
              />
            </>
          )}
        </div>
        {/* Mobile Navbar - Exact from Figma node 628:4634 */}
        <MobileNavbar active="dab" />
      </div>
    </RequireOnboarding>
  )
}

