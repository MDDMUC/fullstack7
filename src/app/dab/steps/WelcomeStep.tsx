'use client'

import { useState } from 'react'
import { useOnboarding } from '@/contexts/OnboardingContext'
import BackButton from '../components/BackButton'
import { supabase } from '@/lib/supabaseClient'

const PLEDGE = [
  {
    title: 'Respect other climbers',
    detail: 'No judgment, honor boundaries, and include all experience levels.',
  },
  {
    title: 'Community is a responsibility',
    detail: 'Support partners, call out unsafe behavior, and build trust together.',
  },
  {
    title: 'Leave no trace',
    detail: 'Care for crags and gyms—pack out, brush holds, and respect access rules.',
  },
  {
    title: 'Have f*** fun',
    detail: 'Celebrate sends, enjoy the process, and keep the stoke alive.',
  },
]

export default function WelcomeStep() {
  const { data, updateData, setCurrentStep } = useOnboarding()
  const [accepted, setAccepted] = useState<Record<string, boolean>>(
    PLEDGE.reduce<Record<string, boolean>>((acc, item) => {
      acc[item.title] = false
      return acc
    }, {})
  )
  const [status, setStatus] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [hovered, setHovered] = useState<string | null>(null)

  const allAccepted = PLEDGE.every(item => accepted[item.title])

  const handleToggle = (key: string) => {
    setAccepted(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const handleSubmit = async () => {
    if (!allAccepted) return
    setLoading(true)
    setStatus(null)
    updateData({ pledgeAccepted: true })

    try {
      if (!supabase) throw new Error('Supabase not configured')
      const { safeGetUser } = await import('@/lib/authUtils')
      const { user, error } = await safeGetUser(supabase)
      if (error || !user) throw new Error('Please sign up or log in first.')

      const { upsertOnboardingProfile, upsertPublicProfile } = await import('@/lib/profileUtils')
      const payload = { ...data, pledgeAccepted: true }
      const { error: obError } = await upsertOnboardingProfile(supabase, user.id, payload)
      if (obError) throw obError
      const { error: profileError } = await upsertPublicProfile(supabase, user.id, payload)
      if (profileError) throw profileError

      setCurrentStep(8)
    } catch (err: any) {
      setStatus(err?.message || 'Unable to save profile. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="onboard-screen flex flex-col gap-6 items-center justify-start px-4 sm:px-8 md:px-16 lg:px-24 py-10 sm:py-14 md:py-16 lg:py-20 w-full relative"
      style={{ minHeight: 'calc(100vh - 72px)' }}
    >
      <BackButton />
      <div className="onboard-card flex flex-col items-center gap-4">
        <div className="flex gap-2 items-center justify-center px-4 py-0 w-full max-w-2xl">
          <h1 className="font-bold leading-[41px] text-[34px] text-nowrap tracking-[0.374px]" style={{ color: 'var(--text)', margin: 0 }}>
            Pledge
          </h1>
        </div>
        <p className="font-normal leading-normal text-[18px] text-center max-w-2xl" style={{ color: 'var(--muted)' }}>
          Only real people. Commit to the crew before we connect you.
        </p>
        <p className="text-sm font-semibold uppercase tracking-[1px]" style={{ color: 'var(--accent)' }}>
          Select all to continue
        </p>

        <div className="flex flex-col gap-4 w-full max-w-md">
          {PLEDGE.map((item) => {
            const checked = !!accepted[item.title]
            const isHovered = hovered === item.title
            return (
              <div
                key={item.title}
                className="flex gap-4 items-start justify-center p-3 rounded-[12px]"
                style={{
                  border: `1px solid ${checked || isHovered ? 'var(--accent)' : 'var(--stroke)'}`,
                  background: checked ? 'rgba(92, 225, 230, 0.08)' : isHovered ? '#131826' : '#0f131d',
                  cursor: 'pointer',
                  boxShadow: isHovered
                    ? '0 12px 40px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.06)'
                    : '0 4px 18px rgba(0,0,0,0.28)',
                  transition: 'all 160ms ease',
                }}
                onClick={() => handleToggle(item.title)}
                role="checkbox"
                aria-checked={checked}
                onMouseEnter={() => setHovered(item.title)}
                onMouseLeave={() => setHovered(null)}
              >
                <div
                  className="mt-1 w-[18px] h-[18px] rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors"
                  style={{
                    borderColor: checked ? 'var(--accent)' : 'var(--stroke)',
                    background: checked ? 'var(--accent)' : 'transparent',
                  }}
                >
                  {checked && (
                    <div className="w-3 h-3 rounded-full" style={{ background: '#0c0e12' }}></div>
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-bold leading-normal text-[18px]" style={{ color: 'var(--text)', margin: 0 }}>
                    {item.title}
                  </p>
                  <p className="font-normal leading-normal text-[15px] mt-1" style={{ color: 'var(--muted)', margin: 0 }}>
                    {item.detail}
                  </p>
                  {!checked && (
                    <p className="text-[12px] font-semibold mt-1" style={{ color: 'var(--muted)', letterSpacing: '0.5px' }}>
                      Tap to agree (required)
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        <div className="w-full max-w-md">
          <button
            onClick={handleSubmit}
            disabled={!allAccepted || loading}
            className="cta w-full"
            style={{ padding: '10px 16px', borderRadius: '10px' }}
          >
            <span className="font-medium leading-4 text-base tracking-[1.25px] uppercase" style={{ color: '#0c0e12' }}>
              {loading ? 'Saving...' : 'Agree & Finish 7/7'}
            </span>
          </button>
          {status && <p className="form-note error" aria-live="polite">{status}</p>}
        </div>
      </div>
    </div>
  )
}
