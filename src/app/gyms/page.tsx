'use client'

import React from 'react'
import Link from 'next/link'
import { RequireAuth } from '@/components/RequireAuth'
import MobileNavbar from '@/components/MobileNavbar'
import MobileTopbar from '@/components/MobileTopbar'
import { supabase } from '@/lib/supabaseClient'

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
  const [gyms, setGyms] = React.useState<GymRow[]>([])
  const [allGyms, setAllGyms] = React.useState<GymRow[]>([])
  const [loading, setLoading] = React.useState(false)
  const [addGymOpen, setAddGymOpen] = React.useState(false)
  const [dropdownPosition, setDropdownPosition] = React.useState<{ top: number; left: number } | null>(null)
  const addGymRef = React.useRef<HTMLDivElement | null>(null)
  const buttonRef = React.useRef<HTMLButtonElement | null>(null)

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
            {loading && <p className="gyms-loading">Loading gyms…</p>}
            {!loading && gyms.length === 0 && (
              <p className="gyms-empty">No gyms found</p>
            )}
            {!loading &&
              gyms.map(gym => (
                <GymDetailCard
                  key={gym.id}
                  gym={gym}
                  onUnfollow={() => {
                    // Show confirmation dialog
                    if (window.confirm('Are you sure you want to unfollow this gym?')) {
                      // Remove from UI
                      setGyms(prev => prev.filter(g => g.id !== gym.id))
                      // Save to localStorage for persistence
                      addUnfollowedGym(gym.id)
                    }
                  }}
                />
              ))}
          </div>
          <MobileNavbar />
        </div>
      </div>
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
function GymDetailCard({ gym, onUnfollow }: { gym: GymRow; onUnfollow: () => void }) {
  // Bar chart heights - exact from Figma
  const barHeights = [18, 18, 21, 32, 44, 50, 50, 44, 32, 24, 44, 58, 50, 44, 32, 28]

  return (
    <div className="gym-detail-card" data-name="gym-detail-card" data-node-id="769:3192">
      {/* Top Row: Peaking pill and Online indicator */}
      <div className="gym-card-toprow" data-name="toprow" data-node-id="769:2938">
        <div className="gym-card-button-pill" data-name="button-pill" data-node-id="769:2919">
          <div className="gym-card-peaking-pill" data-name="button.cta.default" data-node-id="I769:2919;769:2933">
            <p className="gym-card-peaking-text" data-node-id="I769:2919;769:2934">Peaking</p>
          </div>
        </div>
        <div className="gym-card-live-indicator" data-name="live-indicator" data-node-id="769:2940">
          <div className="gym-card-live-dot" data-node-id="769:2939">
            <img src={IMG_ELLIPSE} alt="" className="gym-card-live-dot-img" />
          </div>
          <div className="gym-card-online-text" data-node-id="769:2937">
            <p>42 online</p>
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
          <div className="gym-card-button-field" data-name="button-field" data-node-id="769:3153">
            <div className="gym-card-field-button" data-name="button.field" data-node-id="769:3154">
              <div className="gym-card-field-text" data-node-id="769:3155">
                <p>Today</p>
              </div>
              <div className="gym-card-chevron" data-name="chevron-down" data-node-id="769:3156">
                <div className="gym-card-chevron-inner" data-name="Icon" data-node-id="I769:3156;633:6299">
                  <img src={IMG_CHEVRON} alt="" className="gym-card-chevron-img" />
                </div>
              </div>
            </div>
          </div>
          <div className="gym-card-live-chip" data-name="button.chip" data-node-id="769:3158">
            <div className="gym-card-live-chip-cont" data-name="cont" data-node-id="I769:3158;769:2966">
              <div className="gym-card-live-chip-text" data-node-id="I769:3158;769:3065">
                <p>LIVE</p>
              </div>
            </div>
          </div>
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
          </div>
        </div>
        <div className="gym-card-legend" data-name="legendtime" data-node-id="769:3096">
          <div className="gym-card-legend-item" data-node-id="769:3091">
            <p>6am</p>
          </div>
          <div className="gym-card-legend-item" data-node-id="769:3093">
            <p>1pm</p>
          </div>
          <div className="gym-card-legend-item" data-node-id="769:3094">
            <p>6pm</p>
          </div>
          <div className="gym-card-legend-item" data-node-id="769:3095">
            <p>12pm</p>
          </div>
        </div>
        <div className="gym-card-liveindicator" data-name="liveindicator" data-node-id="769:3163" />
      </div>

      {/* Friends Climbing */}
      <div className="gym-card-friends" data-name="friends-climbing" data-node-id="769:3164">
        <div className="gym-card-friend" data-name="friend1" data-node-id="769:3165">
          <div className="gym-card-friend-bg" aria-hidden="true">
            <div className="gym-card-friend-img-wrapper">
              <img src={IMG_FRIEND1} alt="" className="gym-card-friend-img gym-card-friend-img-1" />
            </div>
            <div className="gym-card-friend-overlay" />
          </div>
          <div className="gym-card-friend-name" data-node-id="769:3181">
            <p>Anna</p>
          </div>
        </div>
        <div className="gym-card-friend" data-name="friend1" data-node-id="769:3182">
          <div className="gym-card-friend-bg" aria-hidden="true">
            <div className="gym-card-friend-img-wrapper">
              <img src={IMG_FRIEND2} alt="" className="gym-card-friend-img gym-card-friend-img-2" />
            </div>
            <div className="gym-card-friend-overlay" />
          </div>
          <div className="gym-card-friend-name" data-node-id="769:3183">
            <p>Marco</p>
          </div>
        </div>
        <div className="gym-card-friend" data-name="friend1" data-node-id="769:3184">
          <div className="gym-card-friend-bg" aria-hidden="true">
            <div className="gym-card-friend-img-wrapper">
              <img src={IMG_FRIEND3} alt="" className="gym-card-friend-img gym-card-friend-img-3" />
            </div>
            <div className="gym-card-friend-overlay" />
          </div>
          <div className="gym-card-friend-name" data-node-id="769:3185">
            <p>Yara</p>
          </div>
        </div>
        <div className="gym-card-friend" data-name="friend1" data-node-id="769:3186">
          <div className="gym-card-friend-bg" aria-hidden="true">
            <div className="gym-card-friend-img-wrapper">
              <img src={IMG_FRIEND4} alt="" className="gym-card-friend-img gym-card-friend-img-4" />
            </div>
            <div className="gym-card-friend-overlay" />
          </div>
          <div className="gym-card-friend-name" data-node-id="769:3187">
            <p>Finn</p>
          </div>
        </div>
        <div className="gym-card-friend" data-name="friend1" data-node-id="769:3188">
          <div className="gym-card-friend-bg" aria-hidden="true">
            <div className="gym-card-friend-img-wrapper">
              <img src={IMG_FRIEND5} alt="" className="gym-card-friend-img gym-card-friend-img-5" />
            </div>
            <div className="gym-card-friend-overlay" />
          </div>
          <div className="gym-card-friend-name" data-node-id="769:3189">
            <p>Lena</p>
          </div>
        </div>
        <div className="gym-card-friend" data-name="friend1" data-node-id="769:3190">
          <div className="gym-card-friend-bg" aria-hidden="true">
            <div className="gym-card-friend-img-wrapper">
              <img src={IMG_FRIEND6} alt="" className="gym-card-friend-img gym-card-friend-img-6" />
            </div>
            <div className="gym-card-friend-overlay" />
          </div>
          <div className="gym-card-friend-name" data-node-id="769:3191">
            <p>Max</p>
          </div>
        </div>
      </div>

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
        <div className="gym-card-button-ghost" data-name="button-ghost" data-node-id="769:3304">
          <div className="gym-card-ghost-cont" data-name="cont" data-node-id="I769:3304;475:11242">
            <div className="gym-card-ghost-text" data-node-id="I769:3304;475:11243">
              <p>Join Chat</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

