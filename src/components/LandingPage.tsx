'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import ButtonDab from './ButtonDab'
import { fetchProfiles, Profile } from '@/lib/profiles'
import { supabase } from '@/lib/supabaseClient'

const FALLBACK_MALE = '/fallback-male.jpg'
const FALLBACK_FEMALE = '/fallback-female.jpg'
const FALLBACK_DEFAULT = FALLBACK_MALE

const fallbackAvatarFor = (profile?: Profile | null) => {
  const hint = (profile?.pronouns || profile?.bio || '').toLowerCase()
  if (hint.includes('she ') || hint.includes(' her') || hint.includes('woman') || hint.includes('female')) {
    return FALLBACK_FEMALE
  }
  return FALLBACK_DEFAULT
}

const formatJoinedAgo = (iso?: string) => {
  if (!iso) return 'Joined recently'
  const diffMs = Date.now() - Date.parse(iso)
  const minutes = Math.max(1, Math.floor(diffMs / 60000))
  if (minutes < 60) return `Joined ${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `Joined ${hours}h ago`
  const days = Math.floor(hours / 24)
  return `Joined ${days}d ago`
}

const firstName = (name?: string | null) => (name || '').trim().split(/\s+/)[0] || (name ?? '')

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

const getChipClass = (tag: string): string => {
  const lower = tag.toLowerCase()
  if (lower.includes('founder')) return 'founder'
  if (lower.includes('crew')) return 'crew'
  if (lower.includes('belay') || lower.includes('certified')) return 'belay-certified'
  return ''
}

const organizeTagsAndChips = (profile: Profile) => {
  // Only show ONE style tag (first one)
  const styleTag = profile.style ? profile.style.split(/[\\/,]/).map(s => s.trim()).filter(Boolean).slice(0, 1) : []
  // Only show ONE grade tag (exclude "Pro" since it's shown as a chip)
  const gradeTag = profile.grade && profile.grade !== 'Pro' ? [profile.grade] : []
  const tags = [...styleTag, ...gradeTag]
  
  const allChips = stripPrivateTags(profile.tags) || []
  const specialChips: string[] = []
  const standardChips: string[] = []
  
  // Filter out style and grade from chips to avoid duplicates
  const styleValues = profile.style ? profile.style.split(/[\\/,]/).map(s => s.trim().toLowerCase()).filter(Boolean) : []
  const gradeValue = profile.grade ? profile.grade.toLowerCase() : null
  
  allChips.forEach(chip => {
    const chipLower = chip.toLowerCase()
    // Skip if this chip is a style or grade (already shown as tag)
    if (styleValues.includes(chipLower) || (gradeValue && chipLower === gradeValue)) {
      return
    }
    
    if (isSpecialChip(chip)) {
      specialChips.push(chip)
    } else {
      standardChips.push(chip)
    }
  })
  
  // Add "Outdoorclimber" chip if user has 'outside' in their gym array
  // It should appear right after Belay Certified
  const hasOutside = Array.isArray(profile.gym) && profile.gym.includes('outside')
  if (hasOutside) {
    // Find Belay Certified index
    const belayIndex = specialChips.findIndex(chip => 
      chip.toLowerCase().includes('belay') || chip.toLowerCase().includes('certified')
    )
    if (belayIndex >= 0) {
      // Insert right after Belay Certified
      specialChips.splice(belayIndex + 1, 0, 'Outdoorclimber')
    } else {
      // If no Belay Certified, add at the end of special chips
      specialChips.push('Outdoorclimber')
    }
  }
  
  return { tags, specialChips, standardChips }
}

type StatusState = { label: string; variant: 'live' | 'offline' | 'new' | 'omw' | 'dab' | 'climb' | 'herenow'; live: boolean }

const statusForProfile = (profile: Profile): StatusState => {
  const raw = (profile.status || '').toLowerCase()
  const city = profile.city || 'your gym'

  if (raw.includes('offline')) return { label: 'Offline', variant: 'offline', live: false }
  if (raw.includes('climbing')) return { label: 'Climbing now', variant: 'climb', live: true }
  if (raw.includes('omw') || raw.includes('heading')) return { label: 'OMW', variant: 'omw', live: true }
  if (raw.includes('dab')) return { label: 'DAB me', variant: 'dab', live: true }
  if (raw.includes('online')) return { label: 'Online now', variant: 'live', live: true }
  if (raw.includes('here') || raw.includes('at gym')) return { label: 'Here now', variant: 'herenow', live: true }

  const created = profile.created_at ? Date.parse(profile.created_at) : 0
  const hours = created ? (Date.now() - created) / 3600000 : 999
  if (hours <= 24) return { label: 'Just joined', variant: 'new', live: true }
  if (hours <= 24 * 7) return { label: 'Just joined', variant: 'new', live: false }

  if (profile.availability) return { label: 'OMW', variant: 'omw', live: false }

  return { label: 'Online now', variant: 'live', live: true }
}

export function FeaturedClimberCard({ profile, onPass, onDab }: { profile: Profile; onPass?: () => void; onDab?: () => void }) {
  const { tags, specialChips, standardChips } = organizeTagsAndChips(profile)
  const status = statusForProfile(profile)
  const live = status.live
  const showDot = status.variant !== 'offline' && status.variant !== 'new'
  // Only show chips from Supabase, no fallback
  const effectiveChips = standardChips

  return (
    <div className="fc-card">
      <div className="fc-inner">
        {/* Pills Row */}
        <div className="fc-pills-row">
          <div className="fc-pill fc-pill-joined">
            {formatJoinedAgo(profile.created_at).toLowerCase()}
          </div>
          <div className={`fc-pill fc-pill-status ${
            status.variant === 'live' || status.variant === 'herenow' ? 'fc-pill-online' : 
            status.variant === 'offline' ? 'fc-pill-offline' :
            status.variant === 'climb' ? 'fc-pill-climb' : ''
          }`}>
            {showDot && (
              <span className={`fc-status-dot ${
                live ? 'fc-status-dot-live' : 
                status.variant === 'climb' ? 'fc-status-dot-climb' : ''
              }`} />
            )}
            {status.label}
          </div>
        </div>

        {/* Content Row: Image + Tags */}
        <div className="fc-content-row">
          {/* Left: Image with gradient overlay */}
          <div className="fc-image-wrapper">
            <img
              src={profile.avatar_url ?? fallbackAvatarFor(profile)}
              alt={firstName(profile.username)}
              className="fc-image"
            />
            <div className="fc-image-overlay">
              <div className="fc-info-row">
                <span className="fc-name">{firstName(profile.username)}</span>
                {profile.age ? <span className="fc-age">{profile.age}</span> : null}
              </div>
              <div className="fc-location-row">
                <span className="fc-location">{profile.city || 'Somewhere craggy'}</span>
              </div>
            </div>
          </div>

          {/* Right: Tags and Chips */}
          <div className="fc-tags-wrapper">
            <div className="fc-tags-row">
              {/* All tags - style tags are accent, grade tag is accent2 */}
              {tags.map((tag, idx) => {
                const isGrade = profile.grade && tag === profile.grade
                return (
                  <span 
                    key={`tag-${idx}`} 
                    className={`fc-tag ${isGrade ? 'fc-tag-grade' : 'fc-tag-style'}`}
                  >
                    {tag}
                  </span>
                )
              })}
              {/* Pro chip - check grade column */}
              {profile.grade === 'Pro' && (
                <span className="fc-chip fc-chip-pro">
                  🔥 PRO
                </span>
              )}
              {/* Special chips (Founder, Belay Certified, Outdoorclimber) */}
              {specialChips.map(chip => {
                const lowerChip = chip.toLowerCase()
                let chipClass = 'fc-chip'
                const isFounder = lowerChip.includes('founder')
                const isCrew = lowerChip.includes('crew')
                const isBelay = lowerChip.includes('belay') || lowerChip.includes('certified')
                const isOutdoor = lowerChip.includes('outdoorclimber') || lowerChip.includes('outdoor')
                
                if (isFounder) chipClass += ' fc-chip-founder'
                else if (isCrew) chipClass += ' fc-chip-crew'
                else if (isBelay || isOutdoor) chipClass += ' fc-chip-belay'
                
                // Add emoji for founder/crew
                const displayText = (isFounder || isCrew) ? `🤘${chip}` : chip
                const needsGradient = isFounder || isCrew
                
                return (
                  <span key={`special-${chip}`} className={chipClass}>
                    {needsGradient ? (
                      <span className="fc-chip-text">{displayText}</span>
                    ) : displayText}
                  </span>
                )
              })}
              {/* Standard chips */}
              {effectiveChips.slice(0, 6).map(chip => (
                <span key={`standard-${chip}`} className="fc-chip fc-chip-standard">
                  {chip}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Bio */}
        <div className="fc-bio">
          <p>{profile.bio || 'Looking for people to hit me up. Always keen to just hang and give a belay if neccessary. Let me know when you have time and hit me up xx.'}</p>
        </div>

        {/* CTA Row */}
        <div className="fc-cta-row" style={{ gap: 'var(--space-md)' }}>
          <div className="fc-cta-wrapper" style={{ flex: 1 }}>
            <button className="button-navlink" style={{ width: '100%', height: 'var(--btn-height-lg)' }} onClick={onPass} aria-label="pass">
              Pass
            </button>
          </div>
          <div className="fc-cta-wrapper" style={{ flex: 1 }}>
            <ButtonDab onClick={onDab} aria-label="send a like" />
          </div>
        </div>
      </div>
    </div>
  )
}

function Hero({ featured }: { featured?: Profile }) {
  if (!featured) return null

  return (
    <section className="landing-hero">
      <div className="landing-hero-content">
        <div className="landing-hero-left">
          <div className="landing-eyebrow">Crewed up or clueless</div>
          <h1 className="landing-hero-title">See who's dropping by the wall tonight</h1>
          <p className="landing-hero-description">
            DAB isn't for everyone. It's for the ones who chase the set. Drop in, see who's there, throw a dab. You're not climbing alone anymore.
          </p>
          <div className="landing-hero-actions">
            <button className="button-navlink button-navlink-hover">Get Started</button>
            <button className="button-navlink">Browse Climbers</button>
          </div>
          <div className="landing-hero-badges">
            <span>Stoke</span>
            <span>Machine</span>
            <span>Community</span>
            <span>Slab Queen</span>
            <span>Beast</span>
            <span>Cookies</span>
          </div>
        </div>
        <div className="landing-hero-right">
          <FeaturedClimberCard profile={featured} />
        </div>
      </div>
    </section>
  )
}

export function GridProfileCard({ profile, onPass, onDab }: { profile: Profile; onPass?: () => void; onDab?: () => void }) {
  const { tags, specialChips, standardChips } = organizeTagsAndChips(profile)
  const status = statusForProfile(profile)
  const live = status.live
  const showDot = status.variant !== 'offline' && status.variant !== 'new'
  // Only show chips from Supabase, no fallback
  const effectiveChips = standardChips

  return (
    <div className="gpc">
      <div className="gpc-inner">
        {/* Content Row: Image (left) + Tags/Chips (right) */}
        <div className="gpc-content">
          {/* Left: Image with Name/Age/Location Overlay */}
          <div className="gpc-left">
            <img
              src={profile.avatar_url ?? fallbackAvatarFor(profile)}
              alt={firstName(profile.username)}
              className="gpc-image"
            />
            {/* Gradient overlay with name/age/location */}
            <div className="gpc-overlay">
              <div className="gpc-info-row">
                <span className="gpc-name">{firstName(profile.username)}</span>
                {profile.age ? <span className="gpc-age">{profile.age}</span> : null}
              </div>
              <div className="gpc-location">{profile.city || 'Somewhere craggy'}</div>
            </div>
          </div>
          
          {/* Right: Status pill + Tags + Chips */}
          <div className="gpc-right">
            {/* Status Pill at top */}
            <div className="gpc-pill-row">
              <div className={`gpc-pill ${
                status.variant === 'live' || status.variant === 'herenow' ? 'online' : 
                status.variant === 'offline' ? 'offline' :
                status.variant === 'climb' ? 'climb' : ''
              }`}>
                {showDot ? (
                  <span className={`gpc-dot ${
                    live ? 'is-live' : 
                    status.variant === 'climb' ? 'climb' : ''
                  }`} />
                ) : null}
                {status.label}
              </div>
            </div>
            {/* Tags and Chips */}
            <div className="gpc-tags">
              {tags.map((tag, idx) => {
                const isGrade = idx >= tags.length - 1 && profile.grade && tag === profile.grade
                return (
                  <span key={`tag-${idx}`} className={`gpc-tag ${isGrade ? 'grade' : 'style'}`}>
                    {tag}
                  </span>
                )
              })}
              {/* Pro chip - check grade column */}
              {profile.grade === 'Pro' && (
                <span className="gpc-chip pro">
                  🔥 PRO
                </span>
              )}
              {specialChips.map(chip => {
                const lowerChip = chip.toLowerCase()
                const isFounder = lowerChip.includes('founder')
                const isCrew = lowerChip.includes('crew')
                const isBelay = lowerChip.includes('belay') || lowerChip.includes('certified')
                const isOutdoor = lowerChip.includes('outdoorclimber') || lowerChip.includes('outdoor')
                const isFounderOrCrew = isFounder || isCrew
                const displayText = isFounderOrCrew ? `🤘${chip}` : chip
                let chipClass = 'gpc-chip'
                if (isFounder) chipClass += ' founder'
                else if (isCrew) chipClass += ' crew'
                else if (isBelay || isOutdoor) chipClass += ' belay'
                return (
                  <span key={`special-${chip}`} className={chipClass}>
                    {isFounderOrCrew ? <span>{displayText}</span> : displayText}
                  </span>
                )
              })}
              {effectiveChips.slice(0, 8).map(chip => (
                <span key={`standard-${chip}`} className="gpc-chip">
                  {chip}
                </span>
              ))}
            </div>
          </div>
        </div>
        
        {/* Bio */}
        <div className="gpc-bio">
          <p>{profile.bio || 'Ready for a safe catch and good beta.'}</p>
        </div>
        
        {/* CTA Row */}
        <div className="gpc-cta" style={{ gap: 'var(--space-md)' }}>
          <div className="fc-cta-wrapper" style={{ flex: 1 }}>
            <button className="button-navlink" style={{ width: '100%', height: 'var(--btn-height-lg)' }} onClick={onPass} aria-label="pass">Pass</button>
          </div>
          <div className="fc-cta-wrapper" style={{ flex: 1 }}>
            <ButtonDab onClick={onDab} aria-label="send a like" />
          </div>
        </div>
      </div>
    </div>
  )
}

// Chevron icon for dropdown
function ChevronDown({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

// Filter dropdown component
function FilterDropdown({
  label,
  value,
  options,
  onChange,
  isOpen,
  onToggle,
  onClose
}: {
  label: string
  value: string
  options: string[]
  onChange: (value: string) => void
  isOpen: boolean
  onToggle: () => void
  onClose: () => void
}) {
  return (
    <div className="grid-filter-field-new">
      <label className="grid-filter-label-new">{label}</label>
      <button 
        className={`grid-filter-button-new ${isOpen ? 'open' : ''}`}
        onClick={onToggle}
        type="button"
      >
        <span>{value}</span>
        <ChevronDown className="grid-filter-chevron" />
      </button>
      <div className={`grid-filter-dropdown ${isOpen ? 'open' : ''}`}>
        {options.map(option => (
          <button
            key={option}
            className={`grid-filter-option ${value === option ? 'selected' : ''}`}
            onClick={() => {
              onChange(option)
              onClose()
            }}
            type="button"
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  )
}

function GridProfilesRow({ profiles }: { profiles: Profile[] }) {
  const [filters, setFilters] = useState({
    location: 'All',
    style: 'All',
    availability: 'All',
    gym: 'All'
  })
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)

  // Extract unique filter options from profiles
  const filterOptions = useMemo(() => {
    const locations = new Set<string>(['All'])
    const styles = new Set<string>(['All'])
    const availabilities = new Set<string>(['All'])

    profiles.forEach(profile => {
      if (profile.city) locations.add(profile.city)
      if (profile.homebase && profile.homebase !== profile.city) locations.add(profile.homebase)
      if (profile.style) {
        // Split comma-separated styles
        profile.style.split(',').forEach(s => {
          const trimmed = s.trim()
          if (trimmed) styles.add(trimmed)
        })
      }
      if (profile.availability) {
        profile.availability.split(',').forEach(a => {
          const trimmed = a.trim()
          if (trimmed) availabilities.add(trimmed)
        })
      }
    })

    return {
      locations: Array.from(locations),
      styles: Array.from(styles),
      availabilities: Array.from(availabilities),
      gyms: Array.from(new Set(['All', ...profiles.map(p => p.homebase).filter(Boolean) as string[]]))
    }
  }, [profiles])

  // Filter and sort profiles
  const filteredProfiles = useMemo(() => {
    let result = [...profiles]

    // Filter by location
    if (filters.location !== 'All') {
      result = result.filter(p => 
        p.city === filters.location || p.homebase === filters.location
      )
    }

    // Filter by style
    if (filters.style !== 'All') {
      result = result.filter(p => 
        p.style?.toLowerCase().includes(filters.style.toLowerCase())
      )
    }

    // Filter by availability
    if (filters.availability !== 'All') {
      result = result.filter(p => 
        p.availability?.toLowerCase().includes(filters.availability.toLowerCase())
      )
    }

    // Filter by gym
    if (filters.gym !== 'All') {
      result = result.filter(p => p.homebase === filters.gym)
    }

    // Sort by most recent
    result.sort((a, b) => {
      const dateA = a.created_at ? new Date(a.created_at).getTime() : 0
      const dateB = b.created_at ? new Date(b.created_at).getTime() : 0
      return dateB - dateA
    })

    return result.slice(0, 6)
  }, [profiles, filters])

  const handleDropdownToggle = (name: string) => {
    setOpenDropdown(openDropdown === name ? null : name)
  }

  const handleDropdownClose = () => {
    setOpenDropdown(null)
  }

  const handleReset = () => {
    setFilters({
      location: 'All',
      style: 'All',
      availability: 'All',
      gym: 'All'
    })
    setOpenDropdown(null)
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target.closest('.grid-filter-field-new')) {
        setOpenDropdown(null)
      }
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

  return (
    <section className="grid-profiles-section-new">
      <div className="grid-profiles-container-new">
        {/* Grid Profiles Block */}
        <div className="grid-profiles-block-new">
          {/* Left: Text Filter Section */}
          <div className="grid-profiles-text-filter-new">
            <div className="grid-profiles-text-block-new">
              <p className="grid-profiles-eyebrow-new">Crewed up or clueless</p>
              <h2 className="grid-profiles-title-new">See who's dropping by the wall tonight</h2>
              <p className="grid-profiles-description-new">
                DAB isn't for everyone. It's for the ones who chase the set. Drop in, see who's there, throw a dab. You're not climbing alone anymore.
              </p>
            </div>
            <div className="grid-profiles-filters-row-new">
              <FilterDropdown
                label="Location"
                value={filters.location}
                options={filterOptions.locations}
                onChange={(v) => setFilters(prev => ({ ...prev, location: v }))}
                isOpen={openDropdown === 'location'}
                onToggle={() => handleDropdownToggle('location')}
                onClose={handleDropdownClose}
              />
              <FilterDropdown
                label="Style"
                value={filters.style}
                options={filterOptions.styles}
                onChange={(v) => setFilters(prev => ({ ...prev, style: v }))}
                isOpen={openDropdown === 'style'}
                onToggle={() => handleDropdownToggle('style')}
                onClose={handleDropdownClose}
              />
              <FilterDropdown
                label="Availability"
                value={filters.availability}
                options={filterOptions.availabilities}
                onChange={(v) => setFilters(prev => ({ ...prev, availability: v }))}
                isOpen={openDropdown === 'availability'}
                onToggle={() => handleDropdownToggle('availability')}
                onClose={handleDropdownClose}
              />
              <FilterDropdown
                label="Gym"
                value={filters.gym}
                options={filterOptions.gyms}
                onChange={(v) => setFilters(prev => ({ ...prev, gym: v }))}
                isOpen={openDropdown === 'gym'}
                onToggle={() => handleDropdownToggle('gym')}
                onClose={handleDropdownClose}
              />
              <button 
                className="grid-filter-reset-new" 
                onClick={handleReset}
                type="button"
              >
                Reset
              </button>
            </div>
          </div>
          {/* Right: DABs Card */}
          <div className="grid-profiles-right-new">
            <div className="grid-dabs-wrapper-new">
              <div className="grid-dabs-card-new">
                <div className="grid-dabs-content-wrapper-new">
                  <div className="grid-dabs-section-new">
                    <div className="grid-dabs-stat-new">
                      <span className="grid-dabs-number-new">9</span>
                      <span className="grid-dabs-label-new">DABs</span>
                      <span className="grid-dabs-text-new">available</span>
                    </div>
                    <div className="grid-dabs-location-row-new">
                      <p className="grid-dabs-location-new">Your homebase: Munich</p>
                    </div>
                  </div>
                  <div className="grid-dabs-separator-new">
                    <div className="grid-dabs-separator-line-new"></div>
                  </div>
                  <div className="grid-dabs-section-new">
                    <div className="grid-dabs-stat-new">
                      <span className="grid-dabs-number-new">9</span>
                      <span className="grid-dabs-label-new">DABs</span>
                      <span className="grid-dabs-text-new">available</span>
                    </div>
                    <div className="grid-dabs-location-row-new">
                      <p className="grid-dabs-location-new">Your homebase: Munich</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Grid Profiles Grid */}
        <div className="grid-profiles-grid-new">
          {filteredProfiles.map(profile => (
            <GridProfileCard key={profile.id} profile={profile} />
          ))}
          {filteredProfiles.length === 0 && (
            <div className="grid-profile-empty">
              <p>No climbers match your filters. Try adjusting your criteria.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

// Activity feed messages pool
const ACTIVITY_MESSAGES = [
  "Steve 23, just joined in Berlin",
  "3 new sessions just formed",
  "9 climbers shared their schedule",
  "1 climber just threw a dab at the gym",
  "5 climbers just checked in",
  "2 partner requests just got accepted",
  "1 New thread @Boulderwelt West, Munich",
  "New event just created: \"Moonboard Afterwork\"",
  "6 active areas right now",
  "Maya 27, just DABed in Munich",
  "4 climbers are looking for partners",
  "New check-in at Boulderwelt East",
  "12 sessions happening right now",
  "Alex 31, just joined in Hamburg",
  "2 new events created today",
  "8 climbers matched this hour",
]

interface ActivityItem {
  id: number
  message: string
  state: 'entering' | 'active' | 'exiting' | 'hidden'
}

function AnimatedActivityFeed() {
  const [items, setItems] = useState<ActivityItem[]>([])
  const [messageIndex, setMessageIndex] = useState(0)
  const [dabCount, setDabCount] = useState(9)
  const maxVisible = 6

  useEffect(() => {
    // Initialize with first few items
    const initialItems: ActivityItem[] = ACTIVITY_MESSAGES.slice(0, maxVisible).map((msg, i) => ({
      id: Date.now() + i,
      message: msg,
      state: 'active' as const,
    }))
    setItems(initialItems)
    setMessageIndex(maxVisible)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      // Get next message
      const nextMessage = ACTIVITY_MESSAGES[messageIndex % ACTIVITY_MESSAGES.length]
      const newItem: ActivityItem = {
        id: Date.now(),
        message: nextMessage,
        state: 'entering',
      }

      setItems(prev => {
        // Add new item at the top
        const updated = [newItem, ...prev]
        
        // Mark bottom item as exiting if we have too many
        if (updated.length > maxVisible) {
          updated[updated.length - 1] = { ...updated[updated.length - 1], state: 'exiting' }
        }
        
        return updated
      })

      // Update dab count randomly
      setDabCount(prev => Math.max(1, prev + Math.floor(Math.random() * 5) - 2))
      setMessageIndex(prev => prev + 1)

      // Transition entering item to active after animation
      setTimeout(() => {
        setItems(prev => prev.map(item => 
          item.state === 'entering' ? { ...item, state: 'active' } : item
        ))
      }, 600)

      // Remove exiting items after animation
      setTimeout(() => {
        setItems(prev => prev.filter(item => item.state !== 'exiting'))
      }, 800)

    }, 3000) // New item every 3 seconds

    return () => clearInterval(interval)
  }, [messageIndex])

  return (
    <div className="landing-activity-feed">
      <div className="landing-activity-feed-inner">
        {/* Stat Header */}
        <div className="landing-activity-header">
          <span className="landing-activity-number">{dabCount}</span>
          <span className="landing-activity-label">climbers just DABed</span>
        </div>
        {/* Content Block */}
        <div className="landing-activity-content">
          <h3>Activity feed</h3>
          <p>See what's going on right now</p>
        </div>
        {/* Activity List */}
        <div className="landing-activity-list">
          {items.slice(0, maxVisible).map((item) => (
            <div 
              key={item.id} 
              className={`landing-activity-item landing-activity-item--${item.state}`}
            >
              {item.message}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Google Logo SVG - Reusable component
const GoogleLogo = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.616z" fill="#4285F4"/>
    <path d="M9 18c2.43 0 4.467-.806 5.965-2.184l-2.908-2.258c-.806.54-1.837.86-3.057.86-2.35 0-4.34-1.587-5.053-3.72H.957v2.332C2.438 15.983 5.482 18 9 18z" fill="#34A853"/>
    <path d="M3.947 10.698c-.18-.54-.282-1.117-.282-1.698s.102-1.158.282-1.698V4.97H.957C.348 6.173 0 7.548 0 9s.348 2.827.957 4.03l2.99-2.332z" fill="#FBBC05"/>
    <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.582C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.97L3.947 7.302C4.66 5.167 6.65 3.58 9 3.58z" fill="#EA4335"/>
  </svg>
)

// Unified Signup Form - Using onb-* classes from /signup page
function LandingSignupForm() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirm: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleChange = (field: keyof typeof formData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }))
    setError(null)
  }

  const handleGoogleSignIn = async () => {
    if (!supabase) {
      setError('Authentication not configured')
      return
    }
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=/dab`,
        },
      })
      if (error) throw error
    } catch (err: any) {
      setError(err?.message || 'Google sign-in failed')
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!formData.fullName.trim()) {
      setError('Please enter your name')
      return
    }
    if (!formData.email.trim()) {
      setError('Please enter your email')
      return
    }
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }
    if (formData.password !== formData.confirm) {
      setError('Passwords do not match')
      return
    }

    if (!supabase) {
      setError('Authentication not configured')
      return
    }

    setLoading(true)
    try {
      const { error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            name: formData.fullName,
          },
        },
      })

      if (signUpError) throw signUpError
      // Redirect to onboarding after successful signup
      router.push('/dab')
    } catch (err: any) {
      setError(err?.message || 'Sign up failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="onb-signup-card">
      <div className="onb-signup-inner">
        {/* Header text block */}
        <div className="onb-header-block">
          <h2 className="onb-header-title">Create your account</h2>
          <p className="onb-header-subtitle">We only share data that you agreed to.</p>
        </div>

        {/* Field row - Google + form fields */}
        <div className="onb-field-row">
          {/* Google button wrapper */}
          <div className="onb-google-wrapper">
            <button 
              type="button" 
              className="onb-google-btn"
              onClick={handleGoogleSignIn}
              disabled={loading}
            >
              <GoogleLogo />
              <span>Sign in with Google</span>
            </button>
          </div>

          {/* Divider "or" */}
          <div className="onb-divider">
            <div className="onb-divider-line" />
            <span className="onb-divider-text">or</span>
            <div className="onb-divider-line" />
          </div>

          {/* Full Name field */}
          <div className="onb-field">
            <label className="onb-label">Full Name</label>
            <div className="onb-input-wrapper">
              <input
                type="text"
                className="onb-input"
                placeholder="(we only display your first name)"
                value={formData.fullName}
                onChange={handleChange('fullName')}
                autoComplete="name"
              />
            </div>
          </div>

          {/* Email field */}
          <div className="onb-field">
            <label className="onb-label">Email</label>
            <div className="onb-input-wrapper">
              <input
                type="email"
                className="onb-input"
                placeholder="you@dab.com"
                value={formData.email}
                onChange={handleChange('email')}
                autoComplete="email"
              />
            </div>
          </div>

          {/* Password row */}
          <div className="onb-pw-row">
            <div className="onb-field onb-field-half">
              <label className="onb-label">Password</label>
              <div className="onb-input-wrapper">
                <input
                  type="password"
                  className="onb-input"
                  placeholder="8+ characters"
                  value={formData.password}
                  onChange={handleChange('password')}
                  autoComplete="new-password"
                />
              </div>
            </div>
            <div className="onb-field onb-field-half">
              <label className="onb-label">Confirm</label>
              <div className="onb-input-wrapper">
                <input
                  type="password"
                  className="onb-input"
                  placeholder="Repeat password"
                  value={formData.confirm}
                  onChange={handleChange('confirm')}
                  autoComplete="new-password"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Error message */}
        {error && <p className="onb-error">{error}</p>}

        {/* CTA row */}
        <div className="onb-cta-row">
          <button 
            type="button"
            className="onb-cta-btn"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? 'Creating...' : "Let's Go"}
          </button>
        </div>
      </div>
    </div>
  )
}

function LandingpageSignup() {
  return (
    <section className="landing-signup">
      <div className="landing-signup-content">
        {/* Left Side */}
        <div className="landing-signup-left">
          {/* Text Block */}
          <div className="landing-signup-text-block">
            <div className="landing-signup-text">
              <p className="landing-signup-eyebrow">No subscription. just connect and climb</p>
              <h2 className="landing-signup-title">Ready to catch each other</h2>
              <p className="landing-signup-description">
                Only takes a minute and you can see what's going on in your area.
              </p>
            </div>
          </div>
          {/* Unified Signup Form - Using onb-* classes from /signup */}
          <div className="landing-signup-form-wrapper">
            <LandingSignupForm />
          </div>
        </div>
        {/* Right Side - Activity Feed */}
        <div className="landing-signup-right">
          <AnimatedActivityFeed />
        </div>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="landing-footer">
      <div className="landing-footer-content">
        <div className="landing-footer-logo">
          <img src="/dab-logo.svg" alt="DAB" className="footer-logo-img" />
        </div>
        <div className="landing-footer-text">
          <p>Built by climbers for climbers. Finding your crew made easy.</p>
        </div>
        <div className="landing-footer-links">
          <a href="#">Community Guidelines</a>
          <a href="#">Safety tips</a>
          <a href="#">Contact</a>
        </div>
      </div>
    </footer>
  )
}

export default function LandingPage() {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadProfiles = async () => {
      try {
        const data = await fetchProfiles()
        setProfiles(data || [])
      } catch (err) {
        console.error('Failed to load profiles:', err)
      } finally {
        setLoading(false)
      }
    }
    loadProfiles()
  }, [])

  const featured = useMemo(() => (profiles.length ? profiles[0] : undefined), [profiles])

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="landing-page">
      {/* Third gradient overlay from Figma */}
      <div className="landing-bg-gradient" aria-hidden="true" />
      <div className="landing-content">
        <Hero featured={featured} />
        <GridProfilesRow profiles={profiles} />
        <LandingpageSignup />
      </div>
      <Footer />
    </div>
  )
}

