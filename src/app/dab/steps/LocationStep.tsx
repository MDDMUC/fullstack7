'use client'

import { FormEvent, useState } from 'react'
import { useOnboarding } from '@/contexts/OnboardingContext'
import BackButton from '../components/BackButton'

export default function LocationStep() {
  const { data, updateData, setCurrentStep } = useOnboarding()
  const [homebase, setHomebase] = useState(data.homebase || '')
  const [radius, setRadius] = useState<number>(data.radiusKm || 100)
  const [homeFocused, setHomeFocused] = useState(false)

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!homebase.trim()) return
    updateData({ homebase, radiusKm: radius })
    setCurrentStep(6)
  }

  return (
    <div
      className="onboard-screen flex flex-col gap-6 items-center justify-start px-4 sm:px-8 md:px-16 lg:px-24 py-10 sm:py-14 md:py-16 lg:py-20 w-full relative"
      style={{ minHeight: 'calc(100vh - 72px)' }}
    >
      <BackButton />
      <div className="onboard-card flex flex-col items-center gap-4">
        <div className="flex gap-2 items-center justify-center px-4 py-0 w-full max-w-2xl">
          <h1 className="font-bold leading-[41px] text-[34px] text-nowrap tracking-[0.374px]" style={{ color: 'var(--text)' }}>
            Where do you climb?
          </h1>
        </div>

        <p className="font-normal leading-normal text-[20px] text-center max-w-2xl" style={{ color: 'var(--muted)' }}>
          Only real people. Set your home base and search radius so we can suggest nearby climbers.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 items-center justify-center w-full max-w-md">
          <div
            className="h-14 relative rounded-[12px] w-full flex items-center transition-colors"
            style={{
              background: '#0f131d',
              border: `1px solid ${homeFocused ? 'var(--accent)' : 'var(--stroke)'}`,
              boxShadow: homeFocused ? '0 0 0 3px rgba(92,225,230,0.12)' : 'none',
            }}
          >
            <input
              type="text"
              value={homebase}
              onChange={(e) => setHomebase(e.target.value)}
              className="w-full h-full px-4 bg-transparent border-0 outline-none text-base rounded-[12px]"
              style={{ color: 'var(--text)' }}
              placeholder="City or home crag"
              onFocus={() => setHomeFocused(true)}
              onBlur={() => setHomeFocused(false)}
              required
            />
          </div>

          <div className="w-full">
            <label className="flex justify-between text-sm mb-2" style={{ color: 'var(--muted)' }}>
              <span>Search radius</span>
              <span style={{ color: 'var(--accent)' }}>{radius} km</span>
            </label>
            <input
              type="range"
              min={10}
              max={300}
              step={10}
              value={radius}
              onChange={(e) => setRadius(Number(e.target.value))}
              style={{
                width: '100%',
                accentColor: 'transparent',
                background: 'linear-gradient(120deg, var(--accent), var(--accent-2))',
                height: '6px',
                borderRadius: '999px',
                outline: 'none'
              }}
              className="range-gradient"
            />
          </div>

          <button
            type="submit"
            className="cta w-full"
            style={{ padding: '10px 16px', borderRadius: '10px' }}
          >
            <span className="font-medium leading-4 text-base tracking-[1.25px] uppercase" style={{ color: '#0c0e12' }}>
              CONTINUE 5/7
            </span>
          </button>
        </form>
      </div>
    </div>
  )
}
