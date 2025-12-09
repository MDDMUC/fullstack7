'use client'

import { useEffect, useMemo, useState } from 'react'
import { ChevronDownIcon } from '@heroicons/react/24/outline'
import { RequireAuth } from '@/components/RequireAuth'
import { fetchProfiles, Profile as DbProfile } from '@/lib/profiles'

// Figma mobile navbar - exact structure from node 628:4634
// Using exact SVG files from /public/icons/

type Profile = DbProfile & {
  distance?: string
  interest?: string
  grade?: string
}

const FALLBACK_MALE = '/fallback-male.jpg'
const FALLBACK_FEMALE = '/fallback-female.jpg'
const FIGMA_CARD_IMAGE = 'http://localhost:3845/assets/104b4ede10b02efcc011650409ddff69e359dddd.png' // Figma node 633:14303

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

const gradeFromTags = (tags?: string[]) =>
  tags?.find(t => t.toLowerCase().startsWith('grade:'))?.split(':')[1] ?? undefined

const chipsFromTags = (tags?: string[]) =>
  (tags ?? []).filter(t => !t.toLowerCase().startsWith('grade:') && !['boulder', 'sport', 'lead', 'trad'].includes(t.toLowerCase()))

const stylesFromTags = (tags?: string[]) =>
  (tags ?? []).filter(t => ['boulder', 'sport', 'trad', 'lead'].includes(t.toLowerCase()))

const fallbackAvatarFor = (profile?: Profile | null) => {
  const hint = (profile?.pronouns || (profile as any)?.gender || '').toString().toLowerCase()
  if (hint.includes('she') || hint.includes('her') || hint.includes('woman') || hint.includes('female')) {
    return FALLBACK_FEMALE
  }
  return FALLBACK_MALE
}

export default function HomeScreen() {
  const [deck, setDeck] = useState<Profile[]>([])

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
    const styles = stylesFromTags(current.tags)
    const grade = gradeFromTags(current.tags)
    return { styles, grade }
  }, [current])

  const chips = useMemo(() => chipsFromTags(current.tags), [current])

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
                <ChevronDownIcon className="filter-pill-icon" />
              </button>
            ))}
          </div>

          <div className="home-card" data-name="usercard-mobile">
            <div className="home-card-header">
              <span className="megabtn megabtn-chip megabtn-chip-pro">🔥 PRO</span>
              <span className="megabtn megabtn-pill megabtn-pill-online">Online</span>
            </div>

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
                    {tags.styles.map((style, idx) => (
                      <span key={`style-${style}-${idx}`} className="megabtn megabtn-tag">
                        {style}
                      </span>
                    ))}
                    {tags.grade && (
                      <span className="megabtn megabtn-tag megabtn-tag-grade">{tags.grade}</span>
                    )}
                    {chips.map((chip, idx) => (
                      <span
                        key={`chip-${chip}-${idx}`}
                        className="megabtn megabtn-chip megabtn-chip-muted megabtn-chip-card-bg"
                      >
                        {chip}
                      </span>
                    ))}
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

            <div className="home-cta-row">
              <button type="button" className="home-btn-next" onClick={handleNext}>
                Next
              </button>
              <button type="button" className="home-btn-dab">
                <img src="/dab-logo.svg" alt="DAB" className="home-dab-logo" />
              </button>
            </div>
          </div>

          {/* Mobile Navbar - Exact from Figma node 628:4634 */}
          <div className="home-bottom-nav" data-name="state=Default">
            <div className="home-bottom-row" data-name="links">
              {/* Profile */}
              <div className="home-bottom-item" data-name="profile">
                <div className="home-bottom-icon-container">
                  <div className="home-nav-icon-wrapper" data-name="face-content">
                    <div className="home-nav-icon-inner-face">
                      <img src="/icons/face-content.svg" alt="" className="home-nav-icon-img" />
                    </div>
                  </div>
                </div>
                <span className="home-bottom-label">profile</span>
              </div>
              {/* Events */}
              <div className="home-bottom-item" data-name="events">
                <div className="home-bottom-icon-container">
                  <div className="home-nav-icon-wrapper" data-name="announcement-01">
                    <div className="home-nav-icon-inner-announcement">
                      <img src="/icons/announcement-01.svg" alt="" className="home-nav-icon-img" />
                    </div>
                  </div>
                </div>
                <span className="home-bottom-label">events</span>
              </div>
              {/* Chats */}
              <div className="home-bottom-item home-bottom-item-chat" data-name="chats">
                <div className="home-bottom-icon-container">
                  <div className="home-nav-icon-wrapper" data-name="message-chat-square">
                    <div className="home-nav-icon-inner-message">
                      <img src="/icons/message-chat-square.svg" alt="" className="home-nav-icon-img" />
                    </div>
                  </div>
                  <div className="home-bottom-dot" />
                </div>
                <span className="home-bottom-label">chats</span>
              </div>
              {/* Dab */}
              <div className="home-bottom-item home-bottom-active" data-name="dab">
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
              </div>
            </div>
          </div>
        </div>
      </div>
    </RequireAuth>
  )
}

