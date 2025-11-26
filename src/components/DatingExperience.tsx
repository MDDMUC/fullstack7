'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import SignupForm from './SignupForm'
import { fetchProfiles, Profile } from '@/lib/profiles'

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

  const featured = useMemo(() => {
    if (!profiles.length) return undefined
    const sorted = [...profiles].sort((a, b) => {
      const aDate = a.created_at ? Date.parse(a.created_at) : 0
      const bDate = b.created_at ? Date.parse(b.created_at) : 0
      return bDate - aDate
    })
    return sorted[0]
  }, [profiles])
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
            <p className="eyebrow">Dating for people who think in grades.</p>
            <h1>Meet climbers who love the same sends you do.</h1>
            <p className="lede">
              Swipe through climbers near you, match on style and schedule, and plan your next multi-pitch date without explaining what a cam is.
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
                  <div className="hero__card-inner">
                <div className="card-header">
                  <div className="card-top">
                    <p className="label pill joined-label">{formatJoinedAgo(featured.created_at).toLowerCase()}</p>
                  </div>
                  <div className="featured-body">
                    <img
                      src={featured.avatar_url ?? fallbackAvatarFor(featured)}
                      alt={featured.username}
                      className="featured-avatar"
                    />
                    <div>
                      <h3>{featured.username}{featured.age ? `, ${featured.age}` : ''}</h3>
                      <p className="sub">{featured.style || 'Climber'}</p>
                      <p className="sub">{featured.city || 'Somewhere craggy'}</p>
                      <div className="featured-tags">
                        {featured.grade ? <span className="tag grade">{featured.grade}</span> : null}
                        {featured.style ? <span className="subtle-tag">{featured.style}</span> : null}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="card-body sticky-actions">
                  <div className="card-text">
                    <p>{featured.bio || 'Seeking partners who love long approaches and clean chains.'}</p>
                    <ul className="traits">
                      {((Array.isArray(featured.tags) && featured.tags.length)
                        ? featured.tags
                        : ['Belays soft', 'Weekend warrior', 'Training on 4x4s']
                      ).map(tag => (
                        <li key={tag}>{tag}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="card-actions">
                    <button className="ghost" aria-label="pass" onClick={() => handlePass(featured.username)}>Pass</button>
                    <button className="cta" aria-label="send a like" onClick={() => handleLike(featured.username)}><span className="dab-text">dab</span></button>
                  </div>
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
                    <p className="muted">We’ll show new climbers as soon as they join.</p>
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
              filteredProfiles.map(profile => (
                <article key={profile.id} className="profile-card">
                  <header>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <img
                        src={profile.avatar_url ?? fallbackAvatarFor(profile)}
                        alt={profile.username}
                        className="profile-avatar"
                      />
                      <div>
                        <h3>{profile.username}{profile.age ? `, ${profile.age}` : ''}</h3>
                        <p className="profile-meta">{profile.city || 'Anywhere'} • {profile.availability || 'Flexible'}</p>
                      </div>
                    </div>
                    <div className="tags-column">
                      {profile.grade ? <span className="tag grade">{profile.grade}</span> : null}
                      {profile.style ? <span className="subtle-tag">{profile.style}</span> : null}
                    </div>
                  </header>
                  <div className="profile-body sticky-actions">
                    <div className="card-text">
                      <p>{profile.bio || 'Ready for a safe catch and good beta.'}</p>
                      <div className="badge-row">
                        {(profile.tags?.length ? profile.tags : ['Belays soft', 'Down for laps', 'Gear organized']).map(tag => (
                          <span key={tag}>{tag}</span>
                        ))}
                      </div>
                    </div>
                    <div className="actions">
                      <button className="ghost" onClick={() => handlePass(profile.username)}>Pass</button>
                      <button className="cta" onClick={() => handleLike(profile.username)}><span className="dab-text">dab</span></button>
                    </div>
                  </div>
                </article>
              ))
            ) : (
              <p className="profile-body">No matches found.</p>
            )}
          </div>
        </section>

        <section className="cta-panel" id="join">
          <div className="cta-panel__content">
            <h2>Ready to clip in together?</h2>
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
