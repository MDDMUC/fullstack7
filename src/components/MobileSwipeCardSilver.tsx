'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { fetchProfiles, Profile as DbProfile, fetchAllGyms, fetchAllGymsWithCities, fetchGymsFromTable, Gym } from '@/lib/profiles'
import { sendSwipe } from '@/lib/swipes'
import { supabase, requireSupabase } from '@/lib/supabaseClient'

// Icon colors matching UI library tokens
// --color-text-dark: #5b687c (matches #5B687C used in Figma)
// --color-accent: #5ce1e6 (for active states)
// --color-accent2: #e68fff (for gradients)
const ICON_COLOR_DARK = '#5b687c' // var(--color-text-dark)
const ICON_COLOR_ACCENT = '#5ce1e6' // var(--color-accent)
const ICON_COLOR_ACCENT2 = '#e68fff' // var(--color-accent2)

type Profile = DbProfile & {
  distance?: string
  interest?: string
}

const FALLBACK_MALE = '/fallback-male.jpg'
const FALLBACK_FEMALE = '/fallback-female.jpg'

const fallbackAvatarFor = (profile?: Profile | null) => {
  const hint = (profile?.pronouns || (profile as any)?.gender || '').toString().toLowerCase()
  if (hint.includes('she') || hint.includes('her') || hint.includes('woman') || hint.includes('female')) {
    return FALLBACK_FEMALE
  }
  return FALLBACK_MALE
}

const firstName = (name?: string | null) => (name || '').trim().split(/\s+/)[0] || (name ?? '')

// SVG Paths from Figma - DAB Logo
const SVG_PATHS = {
  dabLeft: "M5.17392 21.8578C4.73003 21.9309 3.62841 21.3083 1.86771 19.9888L1.43464 19.6316L1.40893 19.4746C1.44141 19.0226 1.36021 18.197 1.16262 16.9966C0.981274 15.8923 0.594219 13.4197 0.000102639 9.5803C1.10037 8.77506 2.18304 7.75735 3.24947 6.52987C3.85171 5.78824 4.19952 5.4093 4.2956 5.39441C5.38369 6.03725 5.98728 6.34852 6.10908 6.32957L6.10096 6.27679C6.07389 5.67456 6.05089 5.32133 6.03465 5.21577C5.85195 4.31716 5.71661 3.60665 5.63135 3.08562L5.53662 2.83389C5.6327 2.81765 6.55027 1.8825 8.29067 0.0257135L8.44765 0C8.53021 0.504796 8.69531 1.61995 8.94298 3.34681C9.22176 4.82736 9.45724 5.82478 9.64806 6.33769C9.88219 6.2998 10.5413 5.74493 11.6253 4.67444C11.6605 4.66902 11.6808 4.68391 11.6862 4.71774C11.8797 5.90056 11.2626 7.14428 9.83483 8.45026L11.2382 17.0061C11.2653 17.1712 11.7078 17.5812 12.5645 18.2349L12.6592 18.4866L12.7107 18.7993C12.6051 18.8615 11.9163 19.5639 10.6455 20.9064L10.5927 20.9145C8.91591 19.618 8.07142 18.9359 8.0606 18.8656L5.17663 21.8564L5.17392 21.8578ZM7.76828 17.0927L7.23777 13.8582C7.05642 12.7539 6.83176 11.2733 6.56245 9.41519C5.84924 9.53158 4.73679 9.39354 3.22647 8.99836L3.17369 9.00648C3.42135 10.7333 3.62299 12.0759 3.77998 13.0313L3.88284 13.6579C4.04794 14.6661 4.29425 16.0547 4.61905 17.8235C5.48384 18.4677 6.0157 18.7735 6.21599 18.7397L6.3202 18.7221C6.55433 18.6842 7.03747 18.1402 7.76692 17.0913L7.76828 17.0927Z",
  dabRight: "M28.4378 19.0023C28.427 19.0713 27.5825 19.7547 25.9057 21.0512L25.853 21.0431C24.5822 19.7006 23.8933 18.9982 23.7878 18.9359L23.8392 18.6233L23.9339 18.3716C24.7906 17.7179 25.2331 17.3079 25.2602 17.1428L26.6636 8.58695C25.2358 7.28097 24.6174 6.03725 24.8122 4.85443C24.8177 4.81925 24.838 4.80571 24.8731 4.81113C25.9558 5.88162 26.6149 6.43649 26.8504 6.47438C27.0412 5.96147 27.2767 4.96405 27.5555 3.4835C27.8031 1.75664 27.9682 0.640131 28.0508 0.136689L28.2078 0.162402C29.9482 2.01919 30.8657 2.9557 30.9618 2.97058L30.8671 3.2223C30.7818 3.74334 30.6478 4.45384 30.4638 5.35246C30.4462 5.45667 30.4245 5.80989 30.3975 6.41348L30.3894 6.46626C30.5112 6.48656 31.1161 6.17529 32.2028 5.5311C32.2989 5.54734 32.6467 5.92493 33.249 6.66656C34.3154 7.89539 35.3981 8.91175 36.4983 9.71698C35.9042 13.5564 35.5158 16.029 35.3358 17.1333C35.1396 18.3337 35.057 19.1592 35.0895 19.6113L35.0638 19.7682L34.6307 20.1255C32.87 21.4437 31.7671 22.0662 31.3245 21.9945L28.4406 19.0036L28.4378 19.0023ZM30.1769 18.8588L30.2811 18.8764C30.4814 18.9089 31.0133 18.6044 31.878 17.9602C32.2042 16.1927 32.4491 14.8042 32.6143 13.7946L32.7171 13.168C32.8741 12.2112 33.0757 10.87 33.3234 9.14317L33.2706 9.13505C31.7589 9.53022 30.6479 9.66962 29.9346 9.55188C29.6653 11.41 29.4407 12.8906 29.2593 13.9949L28.7288 17.2294C29.4583 18.2782 29.9414 18.8209 30.1755 18.8602L30.1769 18.8588Z",
  dabCenter: "M17.9616 2.12746C19.028 2.66473 20.8604 3.81101 23.4589 5.56359H23.5644V5.66915C23.5644 5.89786 23.3005 6.1983 22.7714 6.56776C22.7714 6.60295 22.7538 6.65573 22.7186 6.72611C22.7538 10.391 22.789 12.8405 22.8241 14.0747C23.3709 14.5511 23.8459 14.7974 24.2519 14.815H24.7283L24.8339 14.7622V15.2386C24.164 16.0317 23.5644 16.5081 23.0366 16.6664C22.5169 17.3363 22.1109 17.6706 21.8213 17.6706C21.663 17.6706 20.8699 17.0886 19.4421 15.9261C19.1065 15.9261 18.4028 16.4025 17.3282 17.3539C16.9141 17.6354 16.6326 17.7761 16.4824 17.7761H15.9005C15.7678 17.7761 15.1872 17.4067 14.156 16.6664C13.3711 16.2523 12.7553 15.9884 12.306 15.8733V15.7678C12.306 15.5742 12.5171 15.2914 12.9407 14.9219C13.0463 14.1559 13.1166 13.0097 13.1518 11.4858L12.9935 5.30104C13.4252 5.02766 14.4294 4.49986 16.0074 3.71492C16.9412 2.99224 17.5759 2.46444 17.9102 2.12881H17.9629L17.9616 2.12746ZM16.3227 5.45803L16.4283 14.0747C17.4947 14.815 18.1105 15.1845 18.2783 15.1845C19.0443 14.7271 19.4679 14.497 19.5477 14.497V7.36082C18.7547 6.59483 17.8912 5.92493 16.9574 5.35247L16.7991 5.19412L16.3227 5.45803Z"
}

// Helper functions
const stripPrivateTags = (tags?: string[]) =>
  (tags || []).filter(tag => {
    const lower = (tag || '').toLowerCase()
    if (lower.startsWith('gender:')) return false
    if (lower.startsWith('pref:')) return false
    return true
  })

const isSpecialChip = (tag: string): boolean => {
  const lower = tag.toLowerCase()
  return lower.includes('founder') || lower.includes('crew') || lower.includes('belay') || lower.includes('certified')
}

const organizeTagsAndChips = (profile: Profile) => {
  const styleTag = profile.style ? profile.style.split(/[\\/,]/).map(s => s.trim()).filter(Boolean).slice(0, 2) : []
  const gradeTag = profile.grade && profile.grade !== 'Pro' ? [profile.grade] : []
  const tags = [...styleTag, ...gradeTag]
  
  const allChips = stripPrivateTags(profile.tags) || []
  const specialChips: string[] = []
  const standardChips: string[] = []
  
  const styleValues = profile.style ? profile.style.split(/[\\/,]/).map(s => s.trim().toLowerCase()).filter(Boolean) : []
  const gradeValue = profile.grade ? profile.grade.toLowerCase() : null
  
  allChips.forEach(chip => {
    const chipLower = chip.toLowerCase()
    if (styleValues.includes(chipLower) || (gradeValue && chipLower === gradeValue)) return
    if (isSpecialChip(chip)) {
      specialChips.push(chip)
    } else {
      standardChips.push(chip)
    }
  })
  
  return { tags, specialChips, standardChips }
}


// DAB Header Logo - Gradient fill
function DabLogoHeader({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" preserveAspectRatio="none" viewBox="0 0 37 22">
      <defs>
        <linearGradient id="dabGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={ICON_COLOR_ACCENT} />
          <stop offset="100%" stopColor={ICON_COLOR_ACCENT2} />
        </linearGradient>
      </defs>
      <g>
        <path d={SVG_PATHS.dabLeft} fill="url(#dabGradient)" />
        <path d={SVG_PATHS.dabRight} fill="url(#dabGradient)" />
        <path d={SVG_PATHS.dabCenter} fill="url(#dabGradient)" />
      </g>
    </svg>
  )
}

// Nav Icons from Figma
function AnnouncementIcon({ color = ICON_COLOR_DARK }: { color?: string }) {
  return (
    <svg className="block size-full" viewBox="0 0 26 26" fill="none">
      <path 
        d="M19.5 8.125C20.9497 8.125 22.125 6.94975 22.125 5.5C22.125 4.05025 20.9497 2.875 19.5 2.875C18.0503 2.875 16.875 4.05025 16.875 5.5C16.875 6.94975 18.0503 8.125 19.5 8.125Z" 
        stroke={color} strokeWidth="1.625" strokeLinecap="round" strokeLinejoin="round"
      />
      <path 
        d="M14.625 4.875H8.125C5.84683 4.875 4 6.72183 4 9V17.875C4 20.1532 5.84683 22 8.125 22H17C19.2782 22 21.125 20.1532 21.125 17.875V11.375" 
        stroke={color} strokeWidth="1.625" strokeLinecap="round" strokeLinejoin="round"
      />
      <path 
        d="M9.75 12.25H16.25M9.75 16.25H13" 
        stroke={color} strokeWidth="1.625" strokeLinecap="round" strokeLinejoin="round"
      />
    </svg>
  )
}

function ChatIcon({ color = ICON_COLOR_DARK }: { color?: string }) {
  return (
    <svg className="block size-full" viewBox="0 0 26 26" fill="none">
      <path 
        d="M3.25 13C3.25 8.02944 7.27944 4 12.25 4H13.75C18.7206 4 22.75 8.02944 22.75 13V13C22.75 17.9706 18.7206 22 13.75 22H6.5C4.70507 22 3.25 20.5449 3.25 18.75V13Z" 
        stroke={color} strokeWidth="1.625" strokeLinecap="round" strokeLinejoin="round"
      />
      <path 
        d="M9.75 11.375H16.25M9.75 15.375H13" 
        stroke={color} strokeWidth="1.625" strokeLinecap="round" strokeLinejoin="round"
      />
    </svg>
  )
}

function FaceIcon({ color = ICON_COLOR_DARK }: { color?: string }) {
  return (
    <svg className="block size-full" viewBox="0 0 26 26" fill="none">
      <circle cx="13" cy="13" r="9.75" stroke={color} strokeWidth="1.625" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9.75 10.5625V10.5625" stroke={color} strokeWidth="2.4375" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M16.25 10.5625V10.5625" stroke={color} strokeWidth="2.4375" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9.75 15.8125C10.3953 16.9219 11.6172 17.6875 13 17.6875C14.3828 17.6875 15.6047 16.9219 16.25 15.8125" stroke={color} strokeWidth="1.625" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function FlashIcon({ color = ICON_COLOR_ACCENT }: { color?: string }) {
  return (
    <svg className="block size-full" viewBox="0 0 26 26" fill="none">
      <path 
        d="M14.625 3.25L5.6875 14.625H13L11.375 22.75L20.3125 11.375H13L14.625 3.25Z" 
        fill={color}
      />
    </svg>
  )
}

// CTA Icons from Figma - Rebuilt from scratch using exact Figma structure
// Converting Tailwind classes to inline styles exactly as shown in Figma

// X Icon - Cancel Button (588-2946)
// Figma exact structure:
// - Outer: className="relative shrink-0 size-[24px]" data-node-id="I588:2946;603:2247"
// - Inner: className="relative size-full" data-node-id="603:2247"
// - img: className="block max-w-none size-full"
function XCircleIcon({ className }: { className?: string }) {
  return (
    <div 
      className={className} 
      data-name="x" 
      data-node-id="I588:2946;603:2247"
      style={{ 
        position: 'relative', 
        flexShrink: 0, 
        width: '24px', 
        height: '24px' 
      }}
    >
      {/* Figma: className="relative size-full" data-node-id="603:2247" */}
      <div 
        className="relative" 
        data-name="x" 
        data-node-id="603:2247"
        style={{ 
          width: '100%', 
          height: '100%' 
        }}
      >
        {/* Figma: className="block max-w-none size-full" - replaced img with SVG */}
        <svg 
          className="block" 
          style={{ 
            maxWidth: 'none', 
            width: '100%', 
            height: '100%' 
          }} 
          viewBox="0 0 24 24" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Simple X - no circle */}
          <path d="M18 6L6 18M6 6L18 18" stroke={ICON_COLOR_ACCENT} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
    </div>
  )
}

// UserPlus Icon - AddFriend Button (591-1346)
// Figma exact code from 571:4255:
// function UserPlus({ className }: { className?: string }) {
//   return (
//     <div className={className} data-name="user-plus-01" data-node-id="571:4255">
//       <div className="absolute inset-[12.5%_8.33%]" data-name="Icon" data-node-id="571:4256">
//         <div className="absolute inset-[-5.56%_-5%]">
//           <img alt="" className="block max-w-none size-full" src={imgIcon} />
//         </div>
//       </div>
//     </div>
//   );
// }

// Top Nav Icons
function ArrowLeftIcon({ color = ICON_COLOR_DARK }: { color?: string }) {
  return (
    <svg className="block size-full" viewBox="0 0 26 26" fill="none">
      <path d="M16.25 6.5L9.75 13L16.25 19.5" stroke={color} strokeWidth="1.625" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function UserIcon({ color = ICON_COLOR_DARK }: { color?: string }) {
  return (
    <svg className="block size-full" viewBox="0 0 26 26" fill="none">
      <circle cx="13" cy="9.75" r="3.25" stroke={color} strokeWidth="1.625" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6.5 21.125C6.5 17.2275 9.60254 14.125 13.5 14.125H14.5C18.3975 14.125 21.5 17.2275 21.5 21.125" stroke={color} strokeWidth="1.625" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}


export default function MobileSwipeCardSilver() {
  const [allProfiles, setAllProfiles] = useState<Profile[]>([])
  const [deck, setDeck] = useState<Profile[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const [dabGlow, setDabGlow] = useState(false)
  const [dabToast, setDabToast] = useState(false)
  const [loading, setLoading] = useState(true)
  const [selectedCity, setSelectedCity] = useState<string | null>(null)
  const [selectedGym, setSelectedGym] = useState<string | null>(null) // Store gym ID, not name
  const [showCityDropdown, setShowCityDropdown] = useState(false)
  const [showGymDropdown, setShowGymDropdown] = useState(false)

  // Extract unique cities from all profiles
  const availableCities = useMemo(() => {
    const cities = new Set<string>()
    allProfiles.forEach(p => {
      if (p.city) cities.add(p.city)
    })
    return Array.from(cities).sort()
  }, [allProfiles])

  // Fetch gyms from gyms table
  const [availableGyms, setAvailableGyms] = useState<Gym[]>([])
  const [loadingGyms, setLoadingGyms] = useState(false)

  // Load gyms from gyms table, filtered by selected city (area)
  useEffect(() => {
    const loadGyms = async () => {
      setLoadingGyms(true)
      try {
        if (!supabase) {
          try {
            requireSupabase()
          } catch {
            console.warn('Supabase not available for gym loading')
            setAvailableGyms([])
            setLoadingGyms(false)
            return
          }
        }
        const client = supabase ?? requireSupabase()
        // Fetch gyms from gyms table, filtered by area (city) if selected
        const gyms = await fetchGymsFromTable(client, selectedCity || undefined)
        setAvailableGyms(gyms)
        console.log('Loaded gyms from gyms table:', gyms.length, 'gyms' + (selectedCity ? ` for area: ${selectedCity}` : ' (all areas)'))
      } catch (err) {
        console.error('Failed to load gyms from table - exception:', err)
        setAvailableGyms([])
      } finally {
        setLoadingGyms(false)
      }
    }
    
    loadGyms()
  }, [selectedCity]) // Reload when city selection changes

  // Filter profiles based on city and gym selection
  useEffect(() => {
    let filtered = [...allProfiles]
    
    console.log('=== FILTERING DEBUG ===')
    console.log('Total profiles:', allProfiles.length)
    console.log('Selected city:', selectedCity)
    console.log('Selected gym ID:', selectedGym)
    
    if (selectedCity) {
      const beforeCity = filtered.length
      filtered = filtered.filter(p => {
        const matches = p.city?.toLowerCase() === selectedCity.toLowerCase()
        if (!matches && filtered.length < 5) {
          console.log(`Profile ${p.username} city "${p.city}" doesn't match "${selectedCity}"`)
        }
        return matches
      })
      console.log(`After city filter (${selectedCity}): ${beforeCity} -> ${filtered.length} profiles`)
    }
    
    if (selectedGym) {
      const beforeGym = filtered.length
      const selectedGymName = availableGyms.find(g => g.id === selectedGym)?.name || selectedGym
      console.log(`Filtering by gym ID: "${selectedGym}" (${selectedGymName})`)
      console.log('Available gyms:', availableGyms.map(g => `${g.name} (${g.id})`))
      
      // Debug: Show sample profiles before gym filter
      if (filtered.length > 0) {
        console.log('Sample profiles before gym filter:')
        filtered.slice(0, 3).forEach((p, idx) => {
          console.log(`  Profile ${idx + 1} (${p.username}): gym =`, p.gym, 'type:', typeof p.gym, 'isArray:', Array.isArray(p.gym))
        })
      }
      
      filtered = filtered.filter(p => {
        // Check gym array from onboardingprofiles.gym column (contains gym IDs)
        if (!p.gym || !Array.isArray(p.gym) || p.gym.length === 0) {
          if (filtered.length < 5) {
            console.log(`Profile ${p.username} has no gym array or empty gym array`)
          }
          return false
        }
        
        // Match by gym ID - check if any gym ID in the array matches the selected gym ID
        const selectedId = String(selectedGym).trim().toLowerCase()
        const matches = p.gym.some(g => {
          if (!g) return false
          
          let gymId: string
          
          // Handle case where gym is stored as a JSON string array (e.g., '["uuid"]')
          const gStr = String(g).trim()
          if (gStr.startsWith('[') && gStr.endsWith(']')) {
            try {
              // Try to parse as JSON array
              const parsed = JSON.parse(gStr)
              if (Array.isArray(parsed) && parsed.length > 0) {
                // If it's an array, get the first element
                gymId = String(parsed[0]).trim().toLowerCase()
              } else {
                gymId = gStr.toLowerCase()
              }
            } catch {
              // If parsing fails, use the string as-is
              gymId = gStr.toLowerCase()
            }
          } else {
            // Normal case: gym ID is directly in the array
            gymId = gStr.toLowerCase()
          }
          
          const match = gymId === selectedId
          
          if (filtered.length < 5 && beforeGym < 10) {
            console.log(`  Comparing gym ID: "${gymId}" === "${selectedId}" = ${match} (original: "${gStr}")`)
          }
          return match
        })
        
        if (!matches && filtered.length < 5) {
          console.log(`Profile ${p.username} gym IDs [${p.gym.join(', ')}] don't match "${selectedGym}"`)
        }
        
        return matches
      })
      
      console.log(`After gym filter: ${beforeGym} -> ${filtered.length} profiles found`)
      if (filtered.length > 0) {
        console.log('Sample profile after gym filter:', {
          username: filtered[0].username,
          gym: filtered[0].gym,
          city: filtered[0].city
        })
      } else {
        console.warn('No profiles matched gym filter!')
        console.log('Selected gym ID:', selectedGym, 'type:', typeof selectedGym)
        if (allProfiles.length > 0) {
          const sampleProfile = allProfiles[0]
          console.log('Sample profile gym data:', {
            username: sampleProfile.username,
            gym: sampleProfile.gym,
            gymStringified: JSON.stringify(sampleProfile.gym),
            gymType: typeof sampleProfile.gym,
            isArray: Array.isArray(sampleProfile.gym),
            gymLength: sampleProfile.gym?.length,
            firstGymItem: sampleProfile.gym?.[0],
            firstGymItemType: typeof sampleProfile.gym?.[0],
            firstGymItemString: String(sampleProfile.gym?.[0])
          })
          
          // Check all profiles to see their gym IDs
          console.log('All profiles gym IDs:')
          allProfiles.slice(0, 5).forEach((p, idx) => {
            console.log(`  Profile ${idx + 1} (${p.username}):`, {
              gym: p.gym,
              gymString: p.gym?.map(g => String(g)).join(', '),
              matches: p.gym?.some(g => String(g).trim() === String(selectedGym).trim())
            })
          })
        }
      }
    }
    
    console.log('Final filtered count:', filtered.length)
    console.log('=== END FILTERING DEBUG ===')
    
    // Reset to first card when filters change
    setDeck(filtered)
    setCurrentIndex(0)
  }, [allProfiles, selectedCity, selectedGym, availableGyms])

  const current = useMemo(() => deck[currentIndex], [deck, currentIndex])

  useEffect(() => {
    const load = async () => {
      if (!supabase) {
        try { requireSupabase() } catch { setLoading(false); return }
      }
      try {
        const client = supabase ?? requireSupabase()
        const { data: userData } = await client.auth.getUser()
        const normalized = await fetchProfiles()
        const profiles: Profile[] = normalized
          .filter(p => p.id !== userData.user?.id)
          .map(p => ({ ...p, distance: p.distance ?? '10 km', avatar_url: p.avatar_url ?? fallbackAvatarFor(p) }))
        setAllProfiles([...profiles].sort(() => Math.random() - 0.5))
      } catch (err) { console.error('Failed to load profiles', err) }
      finally { setLoading(false) }
    }
    load()
  }, [])

  const handleNext = useCallback(() => {
    if (isAnimating || currentIndex >= deck.length - 1) return
    setIsAnimating(true)
    setTimeout(() => {
      setCurrentIndex(prev => prev + 1)
      setTimeout(() => setIsAnimating(false), 50)
    }, 250)
  }, [currentIndex, deck.length, isAnimating])

  const handleDab = useCallback(async () => {
    if (!current || isAnimating) return
    setDabGlow(true)
    setTimeout(() => setDabGlow(false), 800)
    setDabToast(true)
    setTimeout(() => setDabToast(false), 3000)
    try { await sendSwipe(current.id, 'like') } catch {}
    setTimeout(handleNext, 500)
  }, [current, isAnimating, handleNext])

  if (loading) return <div className="mh-silver-loading"><p>Loading...</p></div>

  const { tags, specialChips, standardChips } = current ? organizeTagsAndChips(current) : { tags: [], specialChips: [], standardChips: [] }

  return (
    <div className="mh-silver-container" data-name="mainhome / mobile / card2-topnavi">
      {/* Top Navigation Bar */}
      <TopNavigationBar 
        selectedCity={selectedCity}
        selectedGym={selectedGym}
        availableCities={availableCities}
        availableGyms={availableGyms}
        showCityDropdown={showCityDropdown}
        showGymDropdown={showGymDropdown}
        loadingGyms={loadingGyms}
        onCityToggle={() => {
          setShowCityDropdown(!showCityDropdown)
          setShowGymDropdown(false)
        }}
        onGymToggle={() => {
          setShowGymDropdown(!showGymDropdown)
          setShowCityDropdown(false)
        }}
        onCitySelect={(city) => {
          setSelectedCity(city)
          setSelectedGym(null) // Clear gym when city changes
        }}
        onGymSelect={(gym) => {
          setSelectedGym(gym)
        }}
        onCityClear={() => {
          setSelectedCity(null)
          setSelectedGym(null) // Clear gym when city is cleared
        }}
        onGymClear={() => {
          setSelectedGym(null)
        }}
      />
      
      <div className="mh-silver-content" data-name="content">
        {!current ? (
          /* Empty State - No profiles match filters */
          <div className="mh-silver-empty-state">
            <p>No profiles found matching your filters</p>
          </div>
        ) : (
          /* Silver Card */
          <div className={`mh-silver-card ${isAnimating ? 'mh-silver-card-exiting' : ''}`} data-name="card2">
            
            {/* Header Row - Status Only (no DAB logo) */}
            <div className="mh-silver-header" data-name="top">
              {/* Status Row - using megabutton system */}
              <div className="mh-silver-status-row" data-name="status">
                {/* Pro Chip - megabtn-chip megabtn-chip-pro */}
                {current.grade === 'Pro' && (
                  <span className="megabtn megabtn-chip megabtn-chip-pro">🔥 PRO</span>
                )}
                {/* Online Status - megabtn-pill megabtn-pill-online */}
                <span className="megabtn megabtn-pill megabtn-pill-online">Online</span>
              </div>
            </div>

          {/* Main Content Area */}
          <div className="mh-silver-main" data-name="main">
            {/* Image Section */}
            <div className="mh-silver-image-section" data-name="top">
              <div className="mh-silver-image-wrapper" data-name="img">
                <img 
                  src={current.avatar_url ?? fallbackAvatarFor(current)} 
                  alt={firstName(current.username)}
                  className="mh-silver-image"
                />
                
                {/* Gradient Overlay with Info */}
                <div className="mh-silver-image-overlay" data-name="chips">
                  {/* Name Row */}
                  <div className="mh-silver-name-row" data-name="name">
                    <div className="mh-silver-name">{firstName(current.username)}</div>
                    {current.age && <div className="mh-silver-age">{current.age}</div>}
                  </div>
                  
                  {/* Location */}
                  <div className="mh-silver-location-row" data-name="homembase">
                    <div className="mh-silver-location">{current.city || 'Somewhere craggy'}</div>
                  </div>
                  
                  {/* Chips Row - using megabutton system */}
                  <div className="mh-silver-chips-section" data-name="chipsrow">
                    <div className="mh-silver-chips-row" data-name="tag row">
                      {/* Style Tags (Boulder, Sport) - megabtn-tag */}
                      {tags.filter(t => t !== current.grade).map((tag, idx) => (
                        <span key={`tag-${idx}`} className="megabtn megabtn-tag">{tag}</span>
                      ))}
                      
                      {/* Grade Tag (Advanced) - megabtn-tag megabtn-tag-grade */}
                      {current.grade && current.grade !== 'Pro' && (
                        <span className="megabtn megabtn-tag megabtn-tag-grade">{current.grade}</span>
                      )}
                      
                      {/* Belay Certified Chip - megabtn-chip megabtn-chip-accent */}
                      {specialChips.filter(c => {
                        const lower = c.toLowerCase()
                        return lower.includes('belay') || lower.includes('certified')
                      }).map(chip => (
                        <span key={`chip-belay-${chip}`} className="megabtn megabtn-chip megabtn-chip-accent">{chip}</span>
                      ))}
                      
                      {/* Standard Chips - megabtn-chip megabtn-chip-muted */}
                      {standardChips.slice(0, 2).map(chip => (
                        <span key={`chip-std-${chip}`} className="megabtn megabtn-chip megabtn-chip-muted">{chip}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bio Section */}
            <div className="mh-silver-bio" data-name="bottom">
              <div className="mh-silver-bio-text" data-name="bio">
                {current.bio || 'Always up for a board session or some bouldering. Looking for people to climb at Kochel on the weekends.'}
              </div>
              {/* Inset Shadow */}
              <div className="mh-silver-bio-shadow" />
            </div>
          </div>

          {/* CTA Row - 3 icon buttons + DAB button */}
          <div className="fc-cta-row" data-name="cta row">
            {/* Icon Buttons Row - Figma: gap-[12px], each button wrapped in basis-0 grow container */}
            <div className="mh-silver-cta-icons">
              {/* Cancel Button - wrapped in basis-0 grow container */}
              <div className="mh-silver-cta-button-wrapper">
                <button
                  type="button"
                  className="megabtn megabtn-cardaction megabtn-cardaction-cancel"
                  onClick={handleNext}
                  disabled={isAnimating || currentIndex >= deck.length - 1}
                  data-name="button.cardaction.cancel"
                >
                  <XCircleIcon className="overflow-clip relative shrink-0" />
                </button>
              </div>
              
              {/* AddFriend Button - wrapped in basis-0 grow container */}
              <div className="mh-silver-cta-button-wrapper">
                <button
                  type="button"
                  className="megabtn megabtn-cardaction megabtn-cardaction-addfriend"
                  onClick={() => {/* TODO: Add friend functionality */}}
                  disabled={isAnimating}
                  data-name="button.cardaction.addfriend"
                >
                  <img src="/addfriend-icon.svg" alt="Add friend" style={{ width: '28px', height: '28px', display: 'block' }} />
                </button>
              </div>
              
              {/* Message Button - wrapped in basis-0 grow container */}
              <div className="mh-silver-cta-button-wrapper">
                <button
                  type="button"
                  className="megabtn megabtn-cardaction megabtn-cardaction-message"
                  onClick={() => {/* TODO: Message functionality */}}
                  disabled={isAnimating}
                  data-name="button.cardaction.message"
                >
                  <img src="/message-icon.svg" alt="Message" style={{ width: '28px', height: '28px', display: 'block' }} />
                </button>
              </div>
            </div>
            
            {/* DAB Button - megabtn-dab-filled (gradient variant from landing page), flex: 1 0 0 */}
            <div className={`fc-cta-wrapper ${dabGlow ? 'megabtn-dab-glow' : ''}`} style={{ flex: '1 0 0', minWidth: 0 }}>
              <button
                type="button"
                className="megabtn megabtn-dab-filled"
                onClick={handleDab}
                disabled={isAnimating}
                data-name="button.dab"
              >
                <img src="/dab-logo.svg" alt="DAB" />
              </button>
            </div>
          </div>
        </div>
        )}
        
        {/* Mobile Navbar - Always visible */}
        <SilverMobileNavbar />
      </div>
      
      {/* DAB Toast */}
      {dabToast && <div className="mh-silver-toast"><p>DAB sent! 🔥</p></div>}
    </div>
  )
}

// Dropdown Component
function DropdownMenu({ 
  isOpen, 
  onClose, 
  options, 
  onSelect, 
  position 
}: { 
  isOpen: boolean
  onClose: () => void
  options: string[]
  onSelect: (value: string) => void
  position: 'left' | 'right'
}) {
  useEffect(() => {
    if (!isOpen) return
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target.closest('.mh-silver-dropdown-container')) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <>
      <div className="mh-silver-dropdown-overlay" onClick={onClose} />
      <div className={`mh-silver-dropdown-menu mh-silver-dropdown-${position}`}>
        {options.length === 0 ? (
          <div className="mh-silver-dropdown-item mh-silver-dropdown-empty">
            No options available
          </div>
        ) : (
          options.map((option, idx) => (
            <button
              key={idx}
              type="button"
              className="mh-silver-dropdown-item"
              onClick={() => {
                onSelect(option)
                onClose()
              }}
            >
              {option}
            </button>
          ))
        )}
      </div>
    </>
  )
}

// Dropdown Component for gyms (displays name, returns ID)
function GymDropdownMenu({ 
  isOpen, 
  onClose, 
  gyms, 
  onSelect, 
  position 
}: { 
  isOpen: boolean
  onClose: () => void
  gyms: Gym[]
  onSelect: (gymId: string) => void
  position: 'left' | 'right'
}) {
  useEffect(() => {
    if (!isOpen) return
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target.closest('.mh-silver-dropdown-container')) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <>
      <div className="mh-silver-dropdown-overlay" onClick={onClose} />
      <div className={`mh-silver-dropdown-menu mh-silver-dropdown-${position}`}>
        {gyms.length === 0 ? (
          <div className="mh-silver-dropdown-item mh-silver-dropdown-empty">
            No gyms available
          </div>
        ) : (
          gyms.map((gym) => (
            <button
              key={gym.id}
              type="button"
              className="mh-silver-dropdown-item"
              onClick={() => {
                onSelect(gym.id) // Pass gym ID, not name
                onClose()
              }}
            >
              {gym.name} {/* Display gym name */}
            </button>
          ))
        )}
      </div>
    </>
  )
}

// Top Navigation Bar Component
function TopNavigationBar({ 
  selectedCity, 
  selectedGym, 
  availableCities,
  availableGyms,
  showCityDropdown,
  showGymDropdown,
  loadingGyms,
  onCityToggle,
  onGymToggle,
  onCitySelect,
  onGymSelect,
  onCityClear,
  onGymClear
}: { 
  selectedCity: string | null
  selectedGym: string | null // Gym ID
  availableCities: string[]
  availableGyms: Gym[] // Array of gym objects with id and name
  showCityDropdown: boolean
  showGymDropdown: boolean
  loadingGyms: boolean
  onCityToggle: () => void
  onGymToggle: () => void
  onCitySelect: (city: string) => void
  onGymSelect: (gymId: string) => void // Receives gym ID
  onCityClear: () => void
  onGymClear: () => void
}) {
  return (
    <div className="mh-silver-topnav" data-name="topnav">
      {/* Back Arrow */}
      <button
        type="button"
        className="mh-silver-topnav-back"
        onClick={() => window.history.back()}
        data-name="arrow-block-left"
      >
        <ArrowLeftIcon color={ICON_COLOR_DARK} />
      </button>
      
      {/* City Field */}
      <div className="mh-silver-topnav-field-wrapper mh-silver-dropdown-container">
        <button
          type="button"
          className={`onb-gym-dropdown-toggle ${showCityDropdown ? 'onb-gym-dropdown-toggle-open' : ''}`}
          onClick={(e) => {
            e.stopPropagation()
            onCityToggle()
          }}
          data-name="button.field.city"
        >
          <span className="onb-gym-dropdown-text">{selectedCity || 'City'}</span>
          <span className={`onb-gym-dropdown-arrow ${showCityDropdown ? 'onb-gym-dropdown-arrow-open' : ''}`}>▼</span>
        </button>
        {selectedCity && (
          <button
            type="button"
            className="mh-silver-filter-clear"
            onClick={(e) => {
              e.stopPropagation()
              onCityClear()
            }}
            aria-label="Clear city filter"
          >
            ×
          </button>
        )}
        <DropdownMenu
          isOpen={showCityDropdown}
          onClose={onCityToggle}
          options={availableCities}
          onSelect={onCitySelect}
          position="left"
        />
      </div>
      
      {/* Gymselect Field */}
      <div className="mh-silver-topnav-field-wrapper mh-silver-dropdown-container">
        <button
          type="button"
          className={`onb-gym-dropdown-toggle ${showGymDropdown ? 'onb-gym-dropdown-toggle-open' : ''}`}
          onClick={(e) => {
            e.stopPropagation()
            // Gymselect shows all gyms, but when city is selected, only gyms from that city are selectable
            onGymToggle()
          }}
          data-name="button.field.gym"
        >
          <span className="onb-gym-dropdown-text">{selectedGym ? availableGyms.find(g => g.id === selectedGym)?.name || 'Gym' : 'Gym'}</span>
          <span className={`onb-gym-dropdown-arrow ${showGymDropdown ? 'onb-gym-dropdown-arrow-open' : ''}`}>▼</span>
        </button>
        {selectedGym && (
          <button
            type="button"
            className="mh-silver-filter-clear"
            onClick={(e) => {
              e.stopPropagation()
              onGymClear()
            }}
            aria-label="Clear gym filter"
          >
            ×
          </button>
        )}
        <GymDropdownMenu
          isOpen={showGymDropdown}
          onClose={onGymToggle}
          gyms={availableGyms}
          onSelect={onGymSelect}
          position="right"
        />
        {loadingGyms && availableGyms.length === 0 && (
          <div className="mh-silver-dropdown-loading">Loading gyms...</div>
        )}
      </div>
      
      {/* User Icon */}
      <button
        type="button"
        className="mh-silver-topnav-user"
        onClick={() => {/* TODO: Open user menu */}}
        data-name="user-01"
      >
        <UserIcon color={ICON_COLOR_DARK} />
      </button>
    </div>
  )
}

function SilverMobileNavbar() {
  const [activeNav, setActiveNav] = useState<'events' | 'gymchat' | 'checkin' | 'partners'>('partners')

  const navItems = [
    { key: 'events' as const, label: 'events', icon: AnnouncementIcon },
    { key: 'gymchat' as const, label: 'gymchat', icon: ChatIcon },
    { key: 'checkin' as const, label: 'checkin', icon: FaceIcon },
    { key: 'partners' as const, label: 'partners', icon: FlashIcon },
  ]

  return (
    <div className="mh-silver-navbar" data-name="mobile-navbar">
      <div className="mh-silver-navbar-frame" data-name="frame">
        <div className="mh-silver-navbar-links" data-name="links">
          {navItems.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              type="button"
              className={`mh-silver-nav-item ${activeNav === key ? 'active' : ''}`}
              onClick={() => setActiveNav(key)}
              data-name={key}
            >
              <div className="mh-silver-nav-icon-wrapper">
                <div className="mh-silver-nav-icon">
                  <Icon color={activeNav === key ? ICON_COLOR_ACCENT : ICON_COLOR_DARK} />
                </div>
              </div>
              <span className="mh-silver-nav-label">{label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

