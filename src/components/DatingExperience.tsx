'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import SignupForm from './SignupForm'
import { fetchProfiles, Profile } from '@/lib/profiles'
import Eyebrow from './Eyebrow'

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

type Filters = {
  location: string
  style: string
  availability: string
  sort: 'recent' | 'grade' | 'name'
}

const _toArray = (value: any): string[] => {
  if (!value) return []
  if (Array.isArray(value)) return value.filter(Boolean).map(String)
  if (typeof value === 'string') return value.split(',').map(v => v.trim()).filter(Boolean)
  return []
}

const stripPrivateTags = (tags?: string[]) =>
  (tags || []).filter(tag => {
    const lower = (tag || '').toLowerCase()
    if (lower.startsWith('gender:')) return false
    if (lower.startsWith('pref:')) return false
    return true
  })

const _normalizeProfile = (profile: any): Profile => ({
  id: profile.id ?? crypto.randomUUID(),
  username: profile.username ?? profile.name ?? 'Climber',
  age: profile.age ?? profile.age_range ?? undefined,
  city: profile.city ?? profile.home ?? profile.location ?? '',
  style: profile.style ?? (Array.isArray(profile.styles) ? profile.styles.join(' • ') : profile.primary_style) ?? '',
  availability: profile.availability ?? profile.schedule ?? '',
  grade: profile.grade ?? profile.grade_focus ?? profile.level ?? '',
  bio: profile.bio ?? profile.about ?? '',
  avatar_url: profile.avatar_url ?? profile.photo_url ?? null,
  created_at: profile.created_at,
  pronouns: profile.pronouns ?? profile.pronoun ?? '',
  tags: _toArray(profile.tags ?? profile.traits),
  status: profile.status ?? profile.state ?? '',
  goals: profile.goals ?? profile.intent ?? '',
})

const gradeRank = (grade?: string) => {
  if (!grade) return -1
  const upper = grade.toUpperCase()
  if (upper.startsWith('V')) {
    const num = parseInt(upper.replace(/[^0-9]/g, ''), 10)
    return Number.isNaN(num) ? -1 : num + 100
  }
  const sport = upper.match(/5\.(\d{1,2})([ABCD+-]?)/)
  if (sport) {
    const base = parseInt(sport[1], 10)
    const letter = sport[2] ?? ''
    const letterScore = { '': 0, '-': -1, '+': 1, A: 0, B: 1, C: 2, D: 3 } as const
    return base * 10 + (letterScore[letter as keyof typeof letterScore] ?? 0)
  }
  return -1
}

const unique = (list: (string | undefined)[]) =>
  Array.from(new Set(list.filter(Boolean) as string[]))

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

const isSpecialChip = (tag: string): boolean => {
  const lower = tag.toLowerCase()
  return lower.includes('founder') || lower.includes('crew') || lower.includes('belay') || lower.includes('certified')
}

const getChipClass = (tag: string): string => {
  const lower = tag.toLowerCase()
  let chipClass = 'featured-chip'
  if (lower.includes('founder')) chipClass += ' founder'
  if (lower.includes('crew')) chipClass += ' crew'
  if (lower.includes('belay') || lower.includes('certified')) chipClass += ' belay-certified'
  return chipClass
}

const organizeTagsAndChips = (profile: Profile) => {
  // Tags: style and grade
  const styleTags = profile.style ? profile.style.split(/[\\/,]/).map(s => s.trim()).filter(Boolean).slice(0, 2) : []
  const gradeTag = profile.grade ? [profile.grade] : []
  const tags = [...styleTags, ...gradeTag]
  
  // Chips: everything else from tags array
  const allChips = stripPrivateTags(profile.tags) || []
  const specialChips: string[] = []
  const standardChips: string[] = []
  
  allChips.forEach(chip => {
    if (isSpecialChip(chip)) {
      specialChips.push(chip)
    } else {
      standardChips.push(chip)
    }
  })
  
  return { tags, specialChips, standardChips }
}

type StatusState = { label: string; variant: 'live' | 'offline' | 'new' | 'omw' | 'dab' | 'climb'; live: boolean }

const statusForProfile = (profile: Profile): StatusState => {
  const raw = (profile.status || '').toLowerCase()
  const city = profile.city || 'your gym'

  if (raw.includes('offline')) return { label: 'Offline', variant: 'offline', live: false }
  if (raw.includes('climbing')) return { label: 'Climbing now', variant: 'climb', live: true }
  if (raw.includes('omw') || raw.includes('heading')) return { label: 'OMW', variant: 'omw', live: true }
  if (raw.includes('dab')) return { label: 'DAB me', variant: 'dab', live: true }
  if (raw.includes('online')) return { label: 'Online now', variant: 'live', live: true }

  const created = profile.created_at ? Date.parse(profile.created_at) : 0
  const hours = created ? (Date.now() - created) / 3600000 : 999
  if (hours <= 24) return { label: 'Just joined', variant: 'new', live: true }
  if (hours <= 24 * 7) return { label: 'Just joined', variant: 'new', live: false }

  if (profile.availability) return { label: 'OMW', variant: 'omw', live: false }

  return { label: 'Online now', variant: 'live', live: true }
}

export default function DatingExperience() {
  const router = useRouter()
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [filters, setFilters] = useState<Filters>({
    location: '',
    style: '',
    availability: '',
    sort: 'recent',
  })
  const [passModal, setPassModal] = useState<{ name: string } | null>(null)
  const [likeModal, setLikeModal] = useState<{ name: string } | null>(null)

  useEffect(() => {
    const loadProfiles = async () => {
      try {
        if (!supabase) {
          setProfiles([])
          setError('Supabase is not configured.')
          setLoading(false)
          return
        }

        const normalized = await fetchProfiles(supabase)
        setProfiles(normalized)
      } catch (err) {
        console.error('Failed to load profiles', err)
        setError('Unable to load climbers right now.')
        setProfiles([])
      } finally {
        setLoading(false)
      }
    }
    loadProfiles()
  }, [])

  useEffect(() => {
    if (!toast) return
    const id = setTimeout(() => setToast(null), 3200)
    return () => clearTimeout(id)
  }, [toast])

  useEffect(() => {
    if (!passModal) return
    const id = setTimeout(() => setPassModal(null), 3000)
    return () => clearTimeout(id)
  }, [passModal])

  useEffect(() => {
    if (!likeModal) return
    const id = setTimeout(() => setLikeModal(null), 3600)
    return () => clearTimeout(id)
  }, [likeModal])

  const locationOptions = useMemo(
    () => unique(profiles.map(p => p.city)),
    [profiles]
  )

  const styleOptions = useMemo(
    () =>
      unique(
        profiles
          .map(p => p.style?.split(/[•,/]/).map(s => s.trim()) ?? [])
          .flat()
      ),
    [profiles]
  )

  const filteredProfiles = useMemo(() => {
    let list = [...profiles]

    if (filters.location) {
      list = list.filter(
        p => (p.city ?? '').toLowerCase() === filters.location.toLowerCase()
      )
    }

    if (filters.style) {
      list = list.filter(p =>
        (p.style ?? '').toLowerCase().includes(filters.style.toLowerCase())
      )
    }

    if (filters.availability) {
      list = list.filter(p =>
        (p.availability ?? '')
          .toLowerCase()
          .includes(filters.availability.toLowerCase())
      )
    }

    if (filters.sort === 'name') {
      list.sort((a, b) => (a.username || '').localeCompare(b.username || ''))
    } else if (filters.sort === 'grade') {
      list.sort((a, b) => gradeRank(b.grade) - gradeRank(a.grade))
    } else {
      list.sort((a, b) => {
        const aDate = a.created_at ? Date.parse(a.created_at) : 0
        const bDate = b.created_at ? Date.parse(b.created_at) : 0
        return bDate - aDate
      })
    }

    return list
  }, [profiles, filters])

  // Supabase already returns profiles ordered by created_at desc; take the first as the newest join.
  const featured = useMemo(() => (profiles.length ? profiles[0] : undefined), [profiles])
  const matchesCount = filteredProfiles.length

  const handleReset = () => {
    setFilters({ location: '', style: '', availability: '', sort: 'recent' })
  }

  const handlePass = (name?: string) => {
    setPassModal({ name: name || 'this climber' })
  }

  const handleLike = (name?: string) => {
    setLikeModal({ name: name || 'this climber' })
  }

  return (
    <>
      <main>
        <section className="hero">
          <div className="hero__copy">
            <Eyebrow>Crewed up or clueless.</Eyebrow>
            <h1>See who&apos;s dropping by the wall tonight</h1>
            <p className="lede">
              DAB isn’t for everyone. It’s for the ones who chase the set. Drop in, see who’s there, throw a dab. You’re not climbing alone anymore.
            </p>
            <div className="hero__actions">
              <button className="cta" onClick={() => router.push('/signup')}>Get started</button>
              <button className="ghost" onClick={() => document.getElementById('profiles')?.scrollIntoView({ behavior: 'smooth' })}>Browse climbers</button>
            </div>
            <div className="badges">
              <span>Boulder, sport, trad, ice</span>
              <span>Local gyms &amp; crags</span>
              <span>Built for stoke, not spam</span>
            </div>
          </div>
          {featured ? (
            <div className="hero__card">
              <div className="hero__card-inner featured-climber-card">
                <div className="featured-card-top">
                  <div className="featured-pill joined-pill">
                    {formatJoinedAgo(featured.created_at).toLowerCase()}
                  </div>
                  {(() => {
                    const status = statusForProfile(featured)
                    const live = status.live
                    const showDot = status.variant !== 'offline' && status.variant !== 'new'
                    return (
                      <div className={`featured-pill status-pill-featured ${status.variant === 'live' ? 'online' : ''}`}>
                        {showDot ? (
                          <span className={`status-dot status-dot-${status.variant} ${live ? 'is-live' : ''}`} />
                        ) : null}
                        {status.label}
                      </div>
                    )
                  })()}
                </div>
                <div className="featured-card-content">
                  <div className="featured-image-wrapper">
                    <img
                      src={featured.avatar_url ?? fallbackAvatarFor(featured)}
                      alt={firstName(featured.username)}
                      className="featured-image"
                    />
                  </div>
                  <div className="featured-info-wrapper">
                    <div className="featured-tags-row">
                      {(() => {
                        const { tags, specialChips, standardChips } = organizeTagsAndChips(featured)
                        return (
                          <>
                            {/* Tags first: style and grade */}
                            {tags.map((tag, idx) => {
                              const isGrade = idx >= tags.length - 1 && featured.grade && tag === featured.grade
                              return (
                                <span key={`tag-${idx}`} className={isGrade ? 'featured-tag featured-tag-grade' : 'featured-tag'}>
                                  {tag}
                                </span>
                              )
                            })}
                            {/* Special chips next */}
                            {specialChips.map(chip => {
                              const chipClass = getChipClass(chip)
                              return (
                                <span key={`special-${chip}`} className={chipClass}>
                                  {chip}
                                </span>
                              )
                            })}
                            {/* Standard chips last */}
                            {standardChips.slice(0, 8).map(chip => (
                              <span key={`standard-${chip}`} className="featured-chip">
                                {chip}
                              </span>
                            ))}
                          </>
                        )
                      })()}
                    </div>
                    <div className="featured-info-bottom">
                      <div className="featured-name-row">
                        <span className="featured-name">{firstName(featured.username)}</span>
                        {featured.age ? <span className="featured-age">{featured.age}</span> : null}
                      </div>
                      <div className="featured-location">{featured.city || 'Somewhere craggy'}</div>
                      <div className="featured-goal">
                        Goal: {featured.goals || featured.lookingFor || 'Join more comps and start training seriously this winter.'}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="featured-bio">
                  <p>{featured.bio || 'Looking for people to hit me up. Always keen to just hang and give a belay if neccessary. Let me know when you have time and hit me up xx.'}</p>
                </div>
                <div className="featured-actions">
                  <button className="ghost featured-pass" aria-label="pass" onClick={() => handlePass(firstName(featured.username))}>Pass</button>
                  <button className="cta featured-dab" aria-label="send a like" onClick={() => handleLike(firstName(featured.username))}>
                    <span className="dab-text">DAB</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="hero__card">
              <div className="hero__card-inner">
                <div className="card-header">
                  <div className="card-top">
                    <p className="label pill">No climbers yet</p>
                  </div>
                </div>
                <div className="card-body sticky-actions">
                  <div className="card-text">
                    <p className="muted">We'll show new climbers as soon as they join.</p>
                  </div>
                  <div className="card-actions">
                    <button className="cta" onClick={() => router.push('/signup')}>Invite friends</button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>

        <section id="filters" className="filters">
          <div className="filters__header">
            <div>
              <p className="eyebrow">Filters</p>
              <h2>Find your perfect climbing partner.</h2>
              <p className="lede">Dial in by location, style, and grade range. Your next project partner is a click away.</p>
            </div>
            <div className="filters__meta">
              <div className="filter-controls">
                <label className="field">
                  <span>Location</span>
                  <select
                    value={filters.location}
                    onChange={e => setFilters(prev => ({ ...prev, location: e.target.value }))}
                  >
                    <option value="">Anywhere</option>
                    {locationOptions.map(loc => (
                      <option key={loc}>{loc}</option>
                    ))}
                  </select>
                </label>
                <label className="field">
                  <span>Style</span>
                  <select
                    value={filters.style}
                    onChange={e => setFilters(prev => ({ ...prev, style: e.target.value }))}
                  >
                    <option value="">Any style</option>
                    {styleOptions.map(style => (
                      <option key={style}>{style}</option>
                    ))}
                  </select>
                </label>
                <label className="field">
                  <span>Availability</span>
                  <select
                    value={filters.availability}
                    onChange={e => setFilters(prev => ({ ...prev, availability: e.target.value }))}
                  >
                    <option value="">Anytime</option>
                    <option value="Weeknights">Weeknights</option>
                    <option value="Weekends">Weekends</option>
                    <option value="Dawn">Dawn patrol</option>
                  </select>
                </label>
                <label className="field">
                  <span>Sort by</span>
                  <select
                    value={filters.sort}
                    onChange={e => setFilters(prev => ({ ...prev, sort: e.target.value as Filters['sort'] }))}
                  >
                    <option value="recent">Most recent</option>
                    <option value="grade">Grade focus</option>
                    <option value="name">Name</option>
                  </select>
                </label>
                <button className="ghost" onClick={handleReset}>Reset</button>
              </div>
              <p id="filter-count" className="filter-count" aria-live="polite">
                {loading ? 'Loading climbers…' : `${matchesCount} match${matchesCount === 1 ? '' : 'es'} available`}
                {error ? ` — ${error}` : ''}
              </p>
            </div>
          </div>
          <div id="profiles" className="profiles">
            {filteredProfiles.length ? (
              filteredProfiles.map(profile => {
                const { tags, specialChips, standardChips } = organizeTagsAndChips(profile)
                const status = statusForProfile(profile)
                const live = status.live
                const showDot = status.variant !== 'offline' && status.variant !== 'new'
                return (
                  <article key={profile.id} className="profile-card featured-climber-card">
                    <div className="featured-card-top">
                      <div className="featured-pill joined-pill">
                        {formatJoinedAgo(profile.created_at).toLowerCase()}
                      </div>
                      <div className={`featured-pill status-pill-featured ${status.variant === 'live' ? 'online' : ''}`}>
                        {showDot ? (
                          <span className={`status-dot status-dot-${status.variant} ${live ? 'is-live' : ''}`} />
                        ) : null}
                        {status.label}
                      </div>
                    </div>
                    <div className="featured-card-content">
                      <div className="featured-image-wrapper">
                        <img
                          src={profile.avatar_url ?? fallbackAvatarFor(profile)}
                          alt={firstName(profile.username)}
                          className="featured-image"
                        />
                      </div>
                      <div className="featured-info-wrapper">
                        <div className="featured-tags-row">
                          {tags.map((tag, idx) => {
                            const isGrade = idx >= tags.length - 1 && profile.grade && tag === profile.grade
                            return (
                              <span key={`tag-${idx}`} className={isGrade ? 'featured-tag featured-tag-grade' : 'featured-tag'}>
                                {tag}
                              </span>
                            )
                          })}
                          {specialChips.map(chip => {
                            const chipClass = getChipClass(chip)
                            return (
                              <span key={`special-${chip}`} className={chipClass}>
                                {chip}
                              </span>
                            )
                          })}
                          {standardChips.slice(0, 8).map(chip => (
                            <span key={`standard-${chip}`} className="featured-chip">
                              {chip}
                            </span>
                          ))}
                        </div>
                        <div className="featured-info-bottom">
                          <div className="featured-name-row">
                            <span className="featured-name">{firstName(profile.username)}</span>
                            {profile.age ? <span className="featured-age">{profile.age}</span> : null}
                          </div>
                          <div className="featured-location">{profile.city || 'Anywhere'}</div>
                          <div className="featured-goal">
                            Goal: {profile.goals || profile.lookingFor || 'Join more comps and start training seriously this winter.'}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="featured-bio">
                      <p>{profile.bio || 'Ready for a safe catch and good beta.'}</p>
                    </div>
                    <div className="featured-actions">
                      <button className="ghost featured-pass" aria-label="pass" onClick={() => handlePass(firstName(profile.username))}>Pass</button>
                      <button className="cta featured-dab" aria-label="send a like" onClick={() => handleLike(firstName(profile.username))}>
                        <span className="dab-text">DAB</span>
                      </button>
                    </div>
                  </article>
                )
              })
            ) : (
              <p className="profile-body">No matches found.</p>
            )}
          </div>
        </section>

        <section className="cta-panel" id="join">
          <div className="cta-panel__content">
            <h3>Ready to clip in together?</h3>
            <p>Start with your account details. We’ll collect climbing preferences right after.</p>
            <SignupForm compact heading="Create your account" subheading="Next: quick onboarding" />
          </div>
          <div className="cta-panel__stats">
            <div className="stat">
              <span className="stat__number" id="stat-count">{Math.max(matchesCount, profiles.length)}</span>
              <span className="stat__label">climbers matched today</span>
            </div>
            <ul className="stat-list" id="stat-list">
              <li>{locationOptions.length || 1} active areas right now</li>
              <li>{styleOptions.length || 1} climbing styles represented</li>
              <li>{profiles.filter(p => p.availability).length || profiles.length} climbers shared their schedule</li>
            </ul>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div>
          <div className="logo"><span className="dab-logo">dab</span></div>
          <p>Built by climbers, for climbers. Keep your rope-bag organized and your matches even better.</p>
        </div>
        <div className="footer-links">
          <a href="#">Safety tips</a>
          <a href="#">Community guidelines</a>
          <a href="mailto:hello@dab.com">Contact</a>
        </div>
      </footer>

      <div className={`toast ${toast ? 'is-visible' : ''}`} role="status" aria-live="polite">
        {toast}
      </div>

      {passModal ? (
        <div className="modal-backdrop" role="status" aria-live="polite">
          <div className="modal-card">
            <button className="modal-close" aria-label="Close" onClick={() => setPassModal(null)}>×</button>
            <p className="label">Pass recorded</p>
            <h3>You passed on {passModal.name}</h3>
          </div>
        </div>
      ) : null}

      {likeModal ? (
        <div className="modal-backdrop" role="status" aria-live="polite">
          <div className="modal-card like-modal">
            <div className="confetti" aria-hidden="true">
              {Array.from({ length: 14 }).map((_, i) => (
                <span key={i} className="confetti-piece" />
              ))}
            </div>
            <button className="modal-close" aria-label="Close" onClick={() => setLikeModal(null)}>×</button>
            <p className="label">Wow!</p>
            <h3>You dabbed {likeModal.name}</h3>
          </div>
        </div>
      ) : null}
    </>
  )
}





