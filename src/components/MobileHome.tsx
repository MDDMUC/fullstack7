'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { fetchProfiles, Profile as DbProfile } from '@/lib/profiles'
import { sendSwipe } from '@/lib/swipes'
import { supabase, requireSupabase } from '@/lib/supabaseClient'

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

// SVG Paths from Figma translation
const SVG_PATHS = {
  // DAB Logo paths
  dabLeft: "M5.17392 21.8578C4.73003 21.9309 3.62841 21.3083 1.86771 19.9888L1.43464 19.6316L1.40893 19.4746C1.44141 19.0226 1.36021 18.197 1.16262 16.9966C0.981274 15.8923 0.594219 13.4197 0.000102639 9.5803C1.10037 8.77506 2.18304 7.75735 3.24947 6.52987C3.85171 5.78824 4.19952 5.4093 4.2956 5.39441C5.38369 6.03725 5.98728 6.34852 6.10908 6.32957L6.10096 6.27679C6.07389 5.67456 6.05089 5.32133 6.03465 5.21577C5.85195 4.31716 5.71661 3.60665 5.63135 3.08562L5.53662 2.83389C5.6327 2.81765 6.55027 1.8825 8.29067 0.0257135L8.44765 0C8.53021 0.504796 8.69531 1.61995 8.94298 3.34681C9.22176 4.82736 9.45724 5.82478 9.64806 6.33769C9.88219 6.2998 10.5413 5.74493 11.6253 4.67444C11.6605 4.66902 11.6808 4.68391 11.6862 4.71774C11.8797 5.90056 11.2626 7.14428 9.83483 8.45026L11.2382 17.0061C11.2653 17.1712 11.7078 17.5812 12.5645 18.2349L12.6592 18.4866L12.7107 18.7993C12.6051 18.8615 11.9163 19.5639 10.6455 20.9064L10.5927 20.9145C8.91591 19.618 8.07142 18.9359 8.0606 18.8656L5.17663 21.8564L5.17392 21.8578ZM7.76828 17.0927L7.23777 13.8582C7.05642 12.7539 6.83176 11.2733 6.56245 9.41519C5.84924 9.53158 4.73679 9.39354 3.22647 8.99836L3.17369 9.00648C3.42135 10.7333 3.62299 12.0759 3.77998 13.0313L3.88284 13.6579C4.04794 14.6661 4.29425 16.0547 4.61905 17.8235C5.48384 18.4677 6.0157 18.7735 6.21599 18.7397L6.3202 18.7221C6.55433 18.6842 7.03747 18.1402 7.76692 17.0913L7.76828 17.0927Z",
  dabRight: "M28.4378 19.0023C28.427 19.0713 27.5825 19.7547 25.9057 21.0512L25.853 21.0431C24.5822 19.7006 23.8933 18.9982 23.7878 18.9359L23.8392 18.6233L23.9339 18.3716C24.7906 17.7179 25.2331 17.3079 25.2602 17.1428L26.6636 8.58695C25.2358 7.28097 24.6174 6.03725 24.8122 4.85443C24.8177 4.81925 24.838 4.80571 24.8731 4.81113C25.9558 5.88162 26.6149 6.43649 26.8504 6.47438C27.0412 5.96147 27.2767 4.96405 27.5555 3.4835C27.8031 1.75664 27.9682 0.640131 28.0508 0.136689L28.2078 0.162402C29.9482 2.01919 30.8657 2.9557 30.9618 2.97058L30.8671 3.2223C30.7818 3.74334 30.6478 4.45384 30.4638 5.35246C30.4462 5.45667 30.4245 5.80989 30.3975 6.41348L30.3894 6.46626C30.5112 6.48656 31.1161 6.17529 32.2028 5.5311C32.2989 5.54734 32.6467 5.92493 33.249 6.66656C34.3154 7.89539 35.3981 8.91175 36.4983 9.71698C35.9042 13.5564 35.5158 16.029 35.3358 17.1333C35.1396 18.3337 35.057 19.1592 35.0895 19.6113L35.0638 19.7682L34.6307 20.1255C32.87 21.4437 31.7671 22.0662 31.3245 21.9945L28.4406 19.0036L28.4378 19.0023ZM30.1769 18.8588L30.2811 18.8764C30.4814 18.9089 31.0133 18.6044 31.878 17.9602C32.2042 16.1927 32.4491 14.8042 32.6143 13.7946L32.7171 13.168C32.8741 12.2112 33.0757 10.87 33.3234 9.14317L33.2706 9.13505C31.7589 9.53022 30.6479 9.66962 29.9346 9.55188C29.6653 11.41 29.4407 12.8906 29.2593 13.9949L28.7288 17.2294C29.4583 18.2782 29.9414 18.8209 30.1755 18.8602L30.1769 18.8588Z",
  dabCenter: "M17.9616 2.12746C19.028 2.66473 20.8604 3.81101 23.4589 5.56359H23.5644V5.66915C23.5644 5.89786 23.3005 6.1983 22.7714 6.56776C22.7714 6.60295 22.7538 6.65573 22.7186 6.72611C22.7538 10.391 22.789 12.8405 22.8241 14.0747C23.3709 14.5511 23.8459 14.7974 24.2519 14.815H24.7283L24.8339 14.7622V15.2386C24.164 16.0317 23.5644 16.5081 23.0366 16.6664C22.5169 17.3363 22.1109 17.6706 21.8213 17.6706C21.663 17.6706 20.8699 17.0886 19.4421 15.9261C19.1065 15.9261 18.4028 16.4025 17.3282 17.3539C16.9141 17.6354 16.6326 17.7761 16.4824 17.7761H15.9005C15.7678 17.7761 15.1872 17.4067 14.156 16.6664C13.3711 16.2523 12.7553 15.9884 12.306 15.8733V15.7678C12.306 15.5742 12.5171 15.2914 12.9407 14.9219C13.0463 14.1559 13.1166 13.0097 13.1518 11.4858L12.9935 5.30104C13.4252 5.02766 14.4294 4.49986 16.0074 3.71492C16.9412 2.99224 17.5759 2.46444 17.9102 2.12881H17.9629L17.9616 2.12746ZM16.3227 5.45803L16.4283 14.0747C17.4947 14.815 18.1105 15.1845 18.2783 15.1845C19.0443 14.7271 19.4679 14.497 19.5477 14.497V7.36082C18.7547 6.59483 17.8912 5.92493 16.9574 5.35247L16.7991 5.19412L16.3227 5.45803Z",
  // Nav flame icon
  flame: "M13.5 1.58449C13.5 0.00402662 11.5844 -0.591637 10.7406 0.718557C3 12.7401 14 13.2813 14 19.125C14 21.4911 12.1806 23.4056 9.94687 23.3743C7.74875 23.3445 6 21.3974 6 19.0619V13.3835C6 11.9425 4.34562 11.2433 3.41062 12.2878C1.7375 14.1552 0 17.354 0 21.25C0 28.2804 5.38312 34 12 34C18.6169 34 24 28.2804 24 21.25C24 9.94171 13.5 8.43363 13.5 1.58449Z"
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
  const styleTag = profile.style ? profile.style.split(/[\\/,]/).map(s => s.trim()).filter(Boolean).slice(0, 1) : []
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

// DAB Logo SVG Component
function DabLogoSvg({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" preserveAspectRatio="none" viewBox="0 0 37 22">
      <g id="Group 1">
        <path d={SVG_PATHS.dabLeft} fill="#0C0E12" id="Vector" />
        <path d={SVG_PATHS.dabRight} fill="#0C0E12" id="Vector_2" />
        <path d={SVG_PATHS.dabCenter} fill="#0C0E12" id="Vector_3" />
      </g>
    </svg>
  )
}

// Flame Icon SVG Component
function FlameIcon({ color = '#8EA0BD' }: { color?: string }) {
  return (
    <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 34">
      <path d={SVG_PATHS.flame} fill={color} id="Vector" />
    </svg>
  )
}


export default function MobileHome() {
  const [deck, setDeck] = useState<Profile[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const [dabGlow, setDabGlow] = useState(false)
  const [dabToast, setDabToast] = useState(false)
  const [loading, setLoading] = useState(true)

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
        setDeck([...profiles].sort(() => Math.random() - 0.5))
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

  if (loading) return <div className="mh-loading"><p>Loading...</p></div>
  if (!current) return <div className="mh-empty"><p>No more profiles</p></div>

  const { tags, specialChips, standardChips } = organizeTagsAndChips(current)

  return (
    <div className="mh-container" data-name="mainhome / mobile">
      <div className="mh-content" data-name="content">
        <div className="mh-content-inner">
          <div className="mh-content-wrapper">
            {/* Grid Profile Card - bg-[#e9eef7] */}
            <div className={`mh-card ${isAnimating ? 'mh-card-exiting' : ''}`} data-name="grid-profile-mobile">
              <div className="mh-card-inner">
                <div className="mh-card-content-wrapper">
                  {/* Content */}
                  <div className="mh-card-content" data-name="content">
                    {/* Top - Image Section */}
                    <div className="mh-card-top" data-name="top">
                      <img 
                        src={current.avatar_url ?? fallbackAvatarFor(current)} 
                        alt={firstName(current.username)}
                        className="mh-card-image"
                      />
                      <div className="mh-card-top-inner">
                        {/* Pill Row */}
                        <div className="mh-pill-row" data-name="pill">
                          <div className="mh-pill-content">
                            {/* Pro Chip */}
                            {current.grade === 'Pro' && (
                              <div className="mh-chip-pro" data-name="megabutton">
                                <div className="mh-chip-pro-inner">
                                  <div className="mh-chip-pro-border" />
                                  <div className="mh-chip-pro-text">🔥 PRO</div>
                                </div>
                              </div>
                            )}
                            {/* Online Status */}
                            <div className="mh-status-online" data-name="megabutton">
                              <div className="mh-status-online-inner">
                                <div className="mh-status-online-border" />
                                <span className="mh-status-online-text">Online</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Bottom Overlay */}
                        <div className="mh-card-overlay" data-name="bottom">
                          <div className="mh-overlay-content">
                            {/* Info Row - 32px text */}
                            <div className="mh-info-row" data-name="info row">
                              <div className="mh-name">{firstName(current.username)}</div>
                              {current.age && <div className="mh-age">{current.age}</div>}
                            </div>
                            {/* Location */}
                            <div className="mh-location-row" data-name="info row 2">
                              <div className="mh-location">{current.city || 'Somewhere craggy'}</div>
                            </div>
                            {/* Tags inside overlay */}
                            <div className="mh-chips-tags" data-name="chips tags">
                              <div className="mh-tag-row" data-name="tag row">
                                {tags.map((tag, idx) => {
                                  const isGrade = current.grade && tag === current.grade
                                  return (
                                    <div key={`tag-${idx}`} className="mh-tag-wrapper">
                                      <div className={`mh-tag ${isGrade ? 'mh-tag-grade' : 'mh-tag-style'}`}>
                                        <div className="mh-tag-inner"><p>{tag}</p></div>
                                      </div>
                                    </div>
                                  )
                                })}
                                {specialChips.filter(c => {
                                  const lower = c.toLowerCase()
                                  return lower.includes('belay') || lower.includes('certified') || lower.includes('outdoorclimber') || lower.includes('outdoor')
                                }).map(chip => (
                                  <div key={`chip-${chip}`} className="mh-chip-belay">
                                    <div className="mh-chip-belay-inner">
                                      <div className="mh-chip-belay-border" />
                                      <div className="mh-chip-belay-text">{chip}</div>
                                    </div>
                                  </div>
                                ))}
                                {standardChips.slice(0, 2).map(chip => (
                                  <div key={`chip-${chip}`} className="mh-chip-standard">
                                    <div className="mh-chip-standard-inner">
                                      <div className="mh-chip-standard-border" />
                                      <div className="mh-chip-standard-text">{chip}</div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      {/* Image border overlay */}
                      <div className="mh-card-top-border" />
                    </div>
                    
                  </div>
                  
                  {/* CTA Buttons Row */}
                  <div className="mh-cta-row" data-name="cta row">
                    <div className="mh-btn-next-wrapper" data-name="megabutton">
                      <button
                        type="button"
                        className="mh-btn-next"
                        onClick={handleNext}
                        disabled={isAnimating || currentIndex >= deck.length - 1}
                        data-name="button.navlink"
                      >
                        <div className="mh-btn-next-text">Next</div>
                      </button>
                    </div>
                    
                    <div className={`mh-btn-dab-wrapper ${dabGlow ? 'mh-btn-dab-glow' : ''}`} data-name="megabutton">
                      <button
                        type="button"
                        className="mh-btn-dab"
                        onClick={handleDab}
                        disabled={isAnimating}
                        data-name="button.dab"
                      >
                        <div className="mh-btn-dab-inner">
                          <div className="mh-btn-dab-icon">
                            <DabLogoSvg className="block size-full" />
                          </div>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              {/* Card border overlay */}
              <div className="mh-card-border" />
            </div>
            
            {/* Mobile Navbar */}
            <MobileNavbar />
          </div>
        </div>
      </div>
      
      {/* DAB Toast */}
      {dabToast && <div className="mh-toast"><p>DAB sent! 🔥</p></div>}
    </div>
  )
}

function MobileNavbar() {
  const [activeNav, setActiveNav] = useState<'events' | 'partners' | 'gymchat' | 'checkin'>('partners')

  return (
    <div className="mh-navbar" data-name="mobile-navbar">
      <div className="mh-navbar-frame" data-name="frame">
        <div className="mh-navbar-border" />
        <div className="mh-navbar-inner">
          <div className="mh-navbar-content">
            {/* Links */}
            <div className="mh-navbar-links" data-name="links">
              {(['events', 'partners', 'gymchat', 'checkin'] as const).map((item) => (
                <button
                  key={item}
                  type="button"
                  className={`mh-nav-item ${activeNav === item ? 'active' : ''}`}
                  onClick={() => setActiveNav(item)}
                >
                  <div className="mh-nav-icon-wrapper">
                    <div className={`mh-nav-icon ${activeNav === item ? 'mh-nav-icon-active' : ''}`}>
                      <FlameIcon color={activeNav === item ? '#5CE1E6' : '#8EA0BD'} />
                    </div>
                  </div>
                  <div className="mh-nav-label">{item}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
