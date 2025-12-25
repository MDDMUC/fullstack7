'use client'

import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { RequireAuth } from '@/components/RequireAuth'
import MobileNavbar from '@/components/MobileNavbar'
import MobileTopbar from '@/components/MobileTopbar'
import LoadingState from '@/components/LoadingState'
import EmptyState from '@/components/EmptyState'
import Modal from '@/components/Modal'
import { GymFriendsSection, GymFriendsFallback, GymFriendProfile } from '@/components/GymFriendCard'
import { supabase } from '@/lib/supabaseClient'
import { useAuthSession } from '@/hooks/useAuthSession'
import { fetchProfiles } from '@/lib/profiles'
import { ensureDirectThreadForMatch } from '@/lib/matches'
import { getBarHeightsForDay, getLiveIndicatorPosition, getDayName, getChartTimes, getCurrentOccupancy } from '@/lib/gymOccupancyData'

// Asset URLs from Figma
const IMG_ICON = 'https://www.figma.com/api/mcp/asset/819ae93e-17ef-4b2b-9423-20ebaf8b10f1'
const IMG_GYM = 'https://www.figma.com/api/mcp/asset/e8da61a5-f5b2-417e-920d-90687a9a2242'
const IMG_FRIEND1 = 'https://www.figma.com/api/mcp/asset/ce867e49-d53e-404e-8d00-baf242414fda'
const IMG_FRIEND2 = 'https://www.figma.com/api/mcp/asset/5a5f156e-e248-455b-b716-6ac083fe4823'
const IMG_FRIEND3 = 'https://www.figma.com/api/mcp/asset/daeab4b0-6fef-4fc2-9acf-a4a4015284b8'
const IMG_FRIEND4 = 'https://www.figma.com/api/mcp/asset/c46cb8da-bc47-4f56-a0a8-0c25d1886bcd'
const IMG_FRIEND5 = 'https://www.figma.com/api/mcp/asset/9814be5b-7bae-4872-8eac-7cb360de3066'
const IMG_FRIEND6 = 'https://www.figma.com/api/mcp/asset/417d9e91-64fc-4bfb-9954-20029623a2b9'
const IMG_ELLIPSE = 'https://www.figma.com/api/mcp/asset/9dca7572-05b8-4101-9472-f4384bb754b8'
const IMG_CHEVRON = 'https://www.figma.com/api/mcp/asset/06feb7b1-4969-43cc-9a43-9d214593a06a'
const IMG_PEAK = 'https://www.figma.com/api/mcp/asset/bb0a0a19-07bb-4247-b187-f805c83e7ca0'

type GymRow = {
  id: string
  name: string
  avatar_url?: string | null
  area?: string | null
}

// LocalStorage key for tracking unfollowed gyms
const UNFOLLOWED_GYMS_KEY = 'dab_unfollowed_gyms'

// Get unfollowed gym IDs from localStorage
const getUnfollowedGyms = (): string[] => {
  if (typeof window === 'undefined') return []
  try {
    const stored = localStorage.getItem(UNFOLLOWED_GYMS_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

// Save unfollowed gym ID to localStorage
const addUnfollowedGym = (gymId: string) => {
  if (typeof window === 'undefined') return
  try {
    const unfollowed = getUnfollowedGyms()
    if (!unfollowed.includes(gymId)) {
      unfollowed.push(gymId)
      localStorage.setItem(UNFOLLOWED_GYMS_KEY, JSON.stringify(unfollowed))
    }
  } catch (err) {
    console.error('Failed to save unfollowed gym', err)
  }
}

// Remove gym ID from unfollowed list (when re-adding)
const removeUnfollowedGym = (gymId: string) => {
  if (typeof window === 'undefined') return
  try {
    const unfollowed = getUnfollowedGyms()
    const filtered = unfollowed.filter(id => id !== gymId)
    localStorage.setItem(UNFOLLOWED_GYMS_KEY, JSON.stringify(filtered))
  } catch (err) {
    console.error('Failed to remove unfollowed gym', err)
  }
}

export default function GymsScreen() {
  const router = useRouter()
  const { session } = useAuthSession()
  const userId = session?.user?.id
  const [gyms, setGyms] = React.useState<GymRow[]>([])
  const [allGyms, setAllGyms] = React.useState<GymRow[]>([])
  const [loading, setLoading] = React.useState(false)
  const [addGymOpen, setAddGymOpen] = React.useState(false)
  const [dropdownPosition, setDropdownPosition] = React.useState<{ top: number; left: number } | null>(null)
  const addGymRef = React.useRef<HTMLDivElement | null>(null)
  const buttonRef = React.useRef<HTMLButtonElement | null>(null)

  // Friends (matches) per gym - keyed by gym ID
  const [friendsByGym, setFriendsByGym] = React.useState<Record<string, GymFriendProfile[]>>({})
  const [matchesLoading, setMatchesLoading] = React.useState(false)

  // Unfollow confirmation modal state
  const [unfollowModalOpen, setUnfollowModalOpen] = React.useState(false)
  const [gymToUnfollow, setGymToUnfollow] = React.useState<GymRow | null>(null)

  React.useEffect(() => {
    const loadGyms = async () => {
      if (!supabase) return
      setLoading(true)
      try {
        // Load user's gyms (for now, same as all gyms)
        const { data, error } = await supabase
          .from('gyms')
          .select('id,name,avatar_url,area')
          .order('name', { ascending: true })

        if (error) {
          console.error('Failed to load gyms', error)
          setGyms([])
          setAllGyms([])
        } else {
          // Get unfollowed gym IDs from localStorage
          const unfollowedGymIds = getUnfollowedGyms()
          
          // Filter out unfollowed gyms from user's gyms list
          const userGyms = (data || []).filter(g => !unfollowedGymIds.includes(g.id))
          setGyms(userGyms)
          
          // Load all available gyms for the dropdown
          // Filter to Munich if area is available, otherwise show all gyms
          // NOTE: Don't filter unfollowed gyms from dropdown - users should be able to re-add them
          if (data && data.length > 0) {
            const munichGyms = data.filter(g => {
              if (!g.area) return true // Include if no area set
              const areaLower = g.area.toLowerCase()
              return areaLower.includes('munich')
            })
            // If we have Munich gyms, use those; otherwise show all
            const gymsToShow = munichGyms.length > 0 ? munichGyms : data
            setAllGyms(gymsToShow)
            console.log('Loaded gyms for dropdown:', gymsToShow.length, gymsToShow)
          } else {
            setAllGyms([])
            console.log('No gyms found in database')
          }
        }
      } catch (err) {
        console.error('Failed to load gyms', err)
        setGyms([])
        setAllGyms([])
      } finally {
        setLoading(false)
      }
    }
    loadGyms()
  }, [])

  // Fetch matches and group by gym
  React.useEffect(() => {
    const loadMatchedFriends = async () => {
      if (!supabase || !userId || gyms.length === 0) {
        setFriendsByGym({})
        return
      }

      setMatchesLoading(true)
      try {
        // Get all matches where current user is involved
        const { data: matches, error: matchError } = await supabase
          .from('matches')
          .select('user_a,user_b')
          .or(`user_a.eq.${userId},user_b.eq.${userId}`)

        if (matchError) {
          console.error('Failed to load matches', matchError)
          setFriendsByGym({})
          return
        }

        if (!matches || matches.length === 0) {
          setFriendsByGym({})
          return
        }

        // Extract matched user IDs (the other person in each match)
        const matchedUserIds = matches.map(m =>
          m.user_a === userId ? m.user_b : m.user_a
        ).filter(Boolean) as string[]

        if (matchedUserIds.length === 0) {
          setFriendsByGym({})
          return
        }

        // Fetch profiles for matched users
        const profiles = await fetchProfiles(supabase, matchedUserIds)

        // Group profiles by gym ID
        const gymFriendsMap: Record<string, GymFriendProfile[]> = {}

        // Debug: log current user's gyms
        console.log('[Friends Debug] Current user gyms:', gyms.map(g => ({ id: g.id, name: g.name })))

        for (const profile of profiles) {
          // Profile.gym is an array of gym IDs
          const profileGyms = Array.isArray(profile.gym) ? profile.gym : []

          // Debug: log matched user's gyms
          console.log(`[Friends Debug] User ${profile.username} has gyms:`, profileGyms)

          for (const gymId of profileGyms) {
            if (!gymId) continue

            // Convert to string for comparison (gym IDs might be UUIDs)
            const gymIdStr = String(gymId).toLowerCase()

            // Check if this gym is in user's gym list
            const matchingGym = gyms.find(g => g.id.toLowerCase() === gymIdStr)

            // Debug: log matching attempt
            console.log(`[Friends Debug] Checking gym "${gymIdStr}" -> match:`, matchingGym?.name || 'NO MATCH')

            if (matchingGym) {
              if (!gymFriendsMap[matchingGym.id]) {
                gymFriendsMap[matchingGym.id] = []
              }

              // Add profile if not already added
              if (!gymFriendsMap[matchingGym.id].some(p => p.id === profile.id)) {
                gymFriendsMap[matchingGym.id].push({
                  id: profile.id,
                  username: profile.username,
                  avatar_url: profile.avatar_url,
                  style: profile.style || null,
                  availability: profile.availability || null,
                  lookingFor: profile.lookingFor || null,
                })
              }
            }
          }
        }

        // Debug: log final result
        console.log('[Friends Debug] Final friendsByGym:', Object.entries(gymFriendsMap).map(([gymId, friends]) => ({
          gymId,
          gymName: gyms.find(g => g.id === gymId)?.name,
          friendCount: friends.length,
          friends: friends.map(f => f.username)
        })))

        setFriendsByGym(gymFriendsMap)
      } catch (err) {
        console.error('Failed to load matched friends', err)
        setFriendsByGym({})
      } finally {
        setMatchesLoading(false)
      }
    }

    loadMatchedFriends()
  }, [userId, gyms])

  // Handle inviting a friend to climb
  const handleInviteFriend = async (profile: GymFriendProfile, gymName: string) => {
    if (!userId) return

    try {
      // Get or create direct thread with this user
      const threadId = await ensureDirectThreadForMatch(userId, profile.id)

      if (threadId) {
        // Navigate to chat with pre-filled message context
        // The message will be composed in the chat page
        const inviteMessage = encodeURIComponent(`Hey! I'm at ${gymName} today. Want to climb together?`)
        router.push(`/chats/${threadId}?invite=${inviteMessage}`)
      }
    } catch (err) {
      console.error('Failed to invite friend', err)
    }
  }

  // Handle messaging a friend
  const handleMessageFriend = async (profile: GymFriendProfile) => {
    if (!userId) return

    try {
      // Get or create direct thread with this user
      const threadId = await ensureDirectThreadForMatch(userId, profile.id)

      if (threadId) {
        router.push(`/chats/${threadId}`)
      }
    } catch (err) {
      console.error('Failed to open chat', err)
    }
  }

  // Handle click outside to close dropdown
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!addGymRef.current) return
      if (!addGymRef.current.contains(e.target as Node)) {
        setAddGymOpen(false)
        setDropdownPosition(null)
      }
    }
    if (addGymOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [addGymOpen])

  // Recalculate position on window resize
  React.useEffect(() => {
    const handleResize = () => {
      if (addGymOpen && buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect()
        const dropdownWidth = Math.min(400, window.innerWidth - 48) // 48px = space-xl * 2
        const leftPosition = (window.innerWidth - dropdownWidth) / 2
        setDropdownPosition({
          top: rect.bottom + 4,
          left: leftPosition,
        })
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [addGymOpen])

  const handleAddGymClick = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      // Position dropdown centered on screen, below button
      // space-xl = 24px, so 24 * 2 = 48px total padding
      const dropdownWidth = Math.min(400, window.innerWidth - 48)
      const leftPosition = (window.innerWidth - dropdownWidth) / 2
      setDropdownPosition({
        top: rect.bottom + 4,
        left: leftPosition,
      })
    }
    setAddGymOpen(!addGymOpen)
  }

  const handleAddGym = (gymId: string) => {
    // Find the gym in allGyms list
    const gymToAdd = allGyms.find(g => g.id === gymId)
    if (gymToAdd) {
      // Check if gym is already in the list
      const isAlreadyAdded = gyms.some(g => g.id === gymId)
      if (!isAlreadyAdded) {
        // Remove from unfollowed list when re-adding
        removeUnfollowedGym(gymId)
        // Add gym to user's gyms list
        setGyms(prev => [...prev, gymToAdd].sort((a, b) => a.name.localeCompare(b.name)))
      }
    }
    setAddGymOpen(false)
    setDropdownPosition(null)
  }

  return (
    <RequireAuth>
      <div className="gyms-screen" data-name="/ gyms">
        <div className="gyms-content">
          <MobileTopbar breadcrumb="Gyms" />
          <div className="gyms-card custom-scrollbar">
            <div className="gyms-header">
              <p className="gyms-title">My Gyms</p>
              <div className="gyms-add-wrapper" ref={addGymRef}>
                <button
                  ref={buttonRef}
                  className="gyms-add-button"
                  type="button"
                  onClick={handleAddGymClick}
                  aria-expanded={addGymOpen}
                >
                  <p>Add Gym</p>
                </button>
                {addGymOpen && dropdownPosition && (
                  <div
                    className="gyms-add-dropdown mh-silver-dropdown-menu"
                    style={{
                      top: `${dropdownPosition.top}px`,
                      left: `${dropdownPosition.left}px`,
                    }}
                  >
                    {allGyms.length === 0 ? (
                      <div className="mh-silver-dropdown-empty">
                        <p>No gyms available</p>
                      </div>
                    ) : (
                      allGyms.map(gym => (
                        <GymSelectTile
                          key={gym.id}
                          gym={gym}
                          onClick={() => handleAddGym(gym.id)}
                        />
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>
            {loading && <LoadingState message="Loading gyms…" />}
            {!loading && gyms.length === 0 && (
              <EmptyState message="No gyms found" />
            )}
            {!loading &&
              gyms.map(gym => (
                <GymDetailCard
                  key={gym.id}
                  gym={gym}
                  onUnfollow={() => {
                    // Show confirmation modal
                    setGymToUnfollow(gym)
                    setUnfollowModalOpen(true)
                  }}
                  onJoinChat={() => {
                    // Navigate to chats page where gym threads are listed
                    router.push('/chats')
                  }}
                  friends={friendsByGym[gym.id] || []}
                  onInviteFriend={(profile) => handleInviteFriend(profile, gym.name)}
                  onMessageFriend={handleMessageFriend}
                />
              ))}
          </div>
          <MobileNavbar />
        </div>
      </div>

      {/* Unfollow Confirmation Modal */}
      <Modal
        open={unfollowModalOpen}
        onClose={() => {
          setUnfollowModalOpen(false)
          setGymToUnfollow(null)
        }}
        title="Unfollow Gym"
        size="md"
        closeOnOverlayClick={false}
        footer={
          <>
            <button
              type="button"
              className="button-ghost"
              onClick={() => {
                setUnfollowModalOpen(false)
                setGymToUnfollow(null)
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              className="button-cta"
              onClick={() => {
                if (gymToUnfollow) {
                  // Remove from UI
                  setGyms(prev => prev.filter(g => g.id !== gymToUnfollow.id))
                  // Save to localStorage for persistence
                  addUnfollowedGym(gymToUnfollow.id)
                }
                setUnfollowModalOpen(false)
                setGymToUnfollow(null)
              }}
            >
              Unfollow
            </button>
          </>
        }
      >
        <p style={{ color: 'var(--color-text)', margin: 0, fontSize: 'var(--font-size-md)', lineHeight: '1.5' }}>
          Are you sure you want to unfollow <strong>{gymToUnfollow?.name}</strong>? You can always re-add it later from the gym list.
        </p>
      </Modal>
    </RequireAuth>
  )
}

// Gym Select Tile component - exact Figma implementation with 3 states
function GymSelectTile({
  gym,
  onClick,
}: {
  gym: GymRow
  onClick: () => void
}) {
  const [isFocused, setIsFocused] = React.useState(false)

  // Split gym name: "Boulderwelt Ost" -> "Boulderwelt" / "Ost"
  const nameParts = gym.name?.trim().split(' ') || []
  const gymName = nameParts[0] || gym.name || ''
  const gymLocation = nameParts.slice(1).join(' ') || ''
  const gymCity = gym.area || 'Munich'

  return (
    <button
      type="button"
      className={`gym-select-tile ${isFocused ? 'gym-select-tile-focus' : ''}`}
      onClick={onClick}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      data-name="cont"
      data-node-id="484:1226"
    >
      <div className="gym-select-tile-left" data-name="left" data-node-id="484:1227">
        <div className="gym-select-tile-img" data-name="img" data-node-id="484:1228">
          <img
            src={gym.avatar_url || IMG_GYM}
            alt={gym.name}
            className="gym-select-tile-img-el"
          />
        </div>
      </div>
      <div className="gym-select-tile-right" data-name="right" data-node-id="484:1229">
        <div className="gym-select-tile-name" data-node-id="484:1230">
          <p>{gymName}</p>
        </div>
        {gymLocation && (
          <div className="gym-select-tile-location" data-node-id="484:1231">
            <p>{gymLocation}</p>
          </div>
        )}
        <div className="gym-select-tile-city" data-node-id="484:1232">
          <p>{gymCity}</p>
        </div>
      </div>
    </button>
  )
}

// GymDetailCard component - exact Figma implementation
function GymDetailCard({
  gym,
  onUnfollow,
  onJoinChat,
  friends,
  onInviteFriend,
  onMessageFriend,
}: {
  gym: GymRow
  onUnfollow: () => void
  onJoinChat: () => void
  friends: GymFriendProfile[]
  onInviteFriend: (profile: GymFriendProfile) => void
  onMessageFriend: (profile: GymFriendProfile) => void
}) {
  const [selectedDay, setSelectedDay] = React.useState<number | null>(null) // null = today
  const [dayDropdownOpen, setDayDropdownOpen] = React.useState(false)
  const dayDropdownRef = React.useRef<HTMLDivElement | null>(null)
  
  // Get real occupancy data for Einstein Boulderhalle, or use default heights
  const realBarHeights = getBarHeightsForDay(gym.name, selectedDay)
  const barHeights = realBarHeights || [
    18, 18, 21, 32, 44, 50, 50, 44, 32, 24, 44, 58, 50, 44, 32, 28,
    26, 30, 36, 40
  ]
  
  // Calculate live indicator position based on current time
  // Only show for Einstein Boulderhalle or if we have occupancy data, and only if showing today (current weekday)
  const isToday = selectedDay === null
  const liveIndicatorPosition = (realBarHeights && isToday) ? getLiveIndicatorPosition(gym.name) : null
  
  // Get display text for selected day
  const displayDay = selectedDay === null ? 'Today' : getDayName(selectedDay)
  
  // Get chart times for selected day (for legend)
  const chartDay = selectedDay === null ? new Date().getDay() : selectedDay
  const { startHour, endHour } = getChartTimes(chartDay, gym.name)
  
  // Get current occupancy to determine pill state
  const currentOccupancy = getCurrentOccupancy(gym.name)
  let pillState: 'chill' | 'busy' | 'peaking' = 'peaking' // default
  let pillText = 'Peaking'
  
  if (currentOccupancy !== null) {
    if (currentOccupancy < 50) {
      // 0-49%: Chill
      pillState = 'chill'
      pillText = 'Chill'
    } else if (currentOccupancy >= 50 && currentOccupancy <= 75) {
      // 50-75%: Busy
      pillState = 'busy'
      pillText = 'Busy'
    } else {
      // Above 75%: Peaking
      pillState = 'peaking'
      pillText = 'Peaking'
    }
  }
  
  // Format time for legend (convert 24h to 12h with am/pm)
  const formatTime = (hour: number): string => {
    if (hour === 0) return '12am'
    if (hour < 12) return `${hour}am`
    if (hour === 12) return '12pm'
    return `${hour - 12}pm`
  }
  
  // Handle click outside to close dropdown
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!dayDropdownRef.current) return
      if (!dayDropdownRef.current.contains(e.target as Node)) {
        setDayDropdownOpen(false)
      }
    }
    if (dayDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [dayDropdownOpen])
  
  // Weekday options (Sunday = 0 to Saturday = 6)
  const weekdays = [
    { value: 0, label: 'Sunday' },
    { value: 1, label: 'Monday' },
    { value: 2, label: 'Tuesday' },
    { value: 3, label: 'Wednesday' },
    { value: 4, label: 'Thursday' },
    { value: 5, label: 'Friday' },
    { value: 6, label: 'Saturday' },
  ]

  return (
    <div className="gym-detail-card" data-name="gym-detail-card" data-node-id="769:3192">
      {/* Top Row: Peaking pill and Online indicator */}
      <div className="gym-card-toprow" data-name="toprow" data-node-id="769:2938">
        <div className="gym-card-button-pill" data-name="button-pill" data-node-id="769:2919">
          <div 
            className={`gym-card-occupancy-pill gym-card-occupancy-pill-${pillState}`}
            data-name="button.cta.default" 
            data-node-id="I769:2919;769:2933"
          >
            {pillState === 'busy' && (
              <div className="gym-card-occupancy-pill-busy-border" aria-hidden="true" />
            )}
            <p className="gym-card-occupancy-text" data-node-id="I769:2919;769:2934">{pillText}</p>
          </div>
        </div>
        <div className="gym-card-live-indicator" data-name="live-indicator" data-node-id="769:2940">
          <div className="gym-card-live-dot" data-node-id="769:2939" />
          <div className="gym-card-online-text" data-node-id="769:2937">
            <p>{currentOccupancy !== null ? `${currentOccupancy}% full` : 'Closed'}</p>
          </div>
        </div>
      </div>

      {/* Gym Info Tile */}
      <div className="gym-card-info-tile" data-name="gym-info-tile" data-node-id="769:2951">
        <div className="gym-card-info-left" data-name="left" data-node-id="769:2952">
          <div className="gym-card-info-img" data-name="img" data-node-id="769:2953">
            <img
              src={gym.avatar_url || IMG_GYM}
              alt={gym.name}
              className="gym-card-info-img-el"
            />
          </div>
        </div>
        <div className="gym-card-info-right" data-name="right" data-node-id="769:2954">
          <div className="gym-card-info-name" data-node-id="769:2955">
            <p>{gym.name.split(' ')[0] || gym.name}</p>
          </div>
          <div className="gym-card-info-location" data-node-id="769:2956">
            <p>{gym.name.split(' ').slice(1).join(' ') || gym.area || ''}</p>
          </div>
          <div className="gym-card-info-city" data-node-id="769:2957">
            <p>{gym.area || 'Munich, Germany'}</p>
          </div>
        </div>
      </div>

      {/* Busy Indicator */}
      <div className="gym-card-busy-indicator" data-name="busy-indicator" data-node-id="769:2958">
        <div className="gym-card-dayselector" data-name="dayselector" data-node-id="769:3152">
          <div className="gym-card-popular-times" data-node-id="769:2964">
            <p>Popular times</p>
          </div>
          <div className="gym-card-button-field" data-name="button-field" data-node-id="769:3153" ref={dayDropdownRef}>
            <button
              type="button"
              className="gym-card-field-button"
              data-name="button.field"
              data-node-id="769:3154"
              onClick={() => setDayDropdownOpen(!dayDropdownOpen)}
              aria-expanded={dayDropdownOpen}
            >
              <div className="gym-card-field-text" data-node-id="769:3155">
                <p>{displayDay}</p>
              </div>
              <div className="gym-card-chevron" data-name="chevron-down" data-node-id="769:3156">
                <div className="gym-card-chevron-inner" data-name="Icon" data-node-id="I769:3156;633:6299">
                  <img src={IMG_CHEVRON} alt="" className="gym-card-chevron-img" />
                </div>
              </div>
            </button>
            {dayDropdownOpen && (
              <div className="gym-card-day-dropdown mh-silver-dropdown-menu">
                <button
                  type="button"
                  className={`mh-silver-dropdown-item ${selectedDay === null ? 'active' : ''}`}
                  onClick={() => {
                    setSelectedDay(null)
                    setDayDropdownOpen(false)
                  }}
                >
                  <p>Today</p>
                </button>
                {weekdays.map(day => (
                  <button
                    key={day.value}
                    type="button"
                    className={`mh-silver-dropdown-item ${selectedDay === day.value ? 'active' : ''}`}
                    onClick={() => {
                      setSelectedDay(day.value)
                      setDayDropdownOpen(false)
                    }}
                  >
                    <p>{day.label}</p>
                  </button>
                ))}
              </div>
            )}
          </div>
          {isToday && (
            <div className="gym-card-live-chip" data-name="button.chip" data-node-id="769:3158">
              <div className="gym-card-live-chip-cont" data-name="cont" data-node-id="I769:3158;769:2966">
                <div className="gym-card-live-chip-text" data-node-id="I769:3158;769:3065">
                  <p>LIVE</p>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="gym-card-barchart-wrapper" data-name="barchart" data-node-id="769:3085">
          <div className="gym-card-barchart-main" data-name="main" data-node-id="769:2961">
            <div className="gym-card-peakindicator" data-name="peakindicator" data-node-id="769:3073">
              <img src={IMG_PEAK} alt="" className="gym-card-peak-img" />
            </div>
            <div className="gym-card-barchart" data-name="barchart" data-node-id="769:3074">
              {barHeights.map((height, idx) => (
                <div
                  key={idx}
                  className="gym-card-bar"
                  style={{ height: `${height}px` }}
                  data-node-id={`769:${3067 + idx}`}
                />
              ))}
            </div>
            {liveIndicatorPosition !== null && liveIndicatorPosition >= 0 && (
              <div 
                className="gym-card-liveindicator" 
                data-name="liveindicator" 
                data-node-id="769:3163"
                style={{ left: `${liveIndicatorPosition}px` }}
              />
            )}
          </div>
        </div>
        <div className="gym-card-legend" data-name="legendtime" data-node-id="769:3096">
          <div className="gym-card-legend-item" data-node-id="769:3091">
            <p>{formatTime(startHour)}</p>
          </div>
          <div className="gym-card-legend-item" data-node-id="769:3093">
            <p>{formatTime(Math.round(startHour + (endHour - startHour) * 0.33))}</p>
          </div>
          <div className="gym-card-legend-item" data-node-id="769:3094">
            <p>{formatTime(Math.round(startHour + (endHour - startHour) * 0.67))}</p>
          </div>
          <div className="gym-card-legend-item" data-node-id="769:3095">
            <p>{formatTime(endHour)}</p>
          </div>
        </div>
      </div>

      {/* Friends at this Gym */}
      <GymFriendsSection
        friends={friends}
        gymName={gym.name}
        onInvite={onInviteFriend}
        onMessage={onMessageFriend}
      />

      {/* CTA Row */}
      <div className="gym-card-ctarow" data-name="ctarow" data-node-id="769:3279">
        <button
          type="button"
          className="gym-card-button-ghost"
          data-name="button-ghost"
          data-node-id="769:3280"
          onClick={onUnfollow}
        >
          <div className="gym-card-ghost-cont" data-name="cont" data-node-id="I769:3280;475:11242">
            <div className="gym-card-ghost-text" data-node-id="I769:3280;475:11243">
              <p>Unfollow</p>
            </div>
          </div>
        </button>
        <button
          type="button"
          className="gym-card-button-ghost"
          data-name="button-ghost"
          data-node-id="769:3304"
          onClick={onJoinChat}
        >
          <div className="gym-card-ghost-cont" data-name="cont" data-node-id="I769:3304;475:11242">
            <div className="gym-card-ghost-text" data-node-id="I769:3304;475:11243">
              <p>Join Chat</p>
            </div>
          </div>
        </button>
      </div>
    </div>
  )
}


