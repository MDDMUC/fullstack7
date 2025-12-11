'use client'

import { useState } from 'react'
import { useOnboarding } from '@/contexts/OnboardingContext'
import BackButton from '../components/BackButton'

const AVAILABILITY = [
  'Mornings',
  'Middays',
  'Afternoons',
  'Evenings',
  'Weekdays',
  'Weekends',
  'Flexible',
  'Always',
  'Spontaneous',
] as const

const availabilityIcon = (option: string) => {
  const common = { width: 14, height: 14, viewBox: '0 0 24 24', fill: 'none', strokeWidth: 2 }
  switch (option) {
    case 'Mornings':
      return (
        <svg {...common} stroke="var(--color-primary)">
          <circle cx="12" cy="12" r="4" />
          <path strokeLinecap="round" d="M12 2v3m0 14v3m10-10h-3M5 12H2m15.5-6.5-2.1 2.1M8.6 17.4l-2.1 2.1m0-13.6 2.1 2.1m8.8 9.4-2.1-2.1" />
        </svg>
      )
    case 'Middays':
      return (
        <svg {...common} stroke="var(--color-yellow)">
          <circle cx="12" cy="12" r="5" />
          <path strokeLinecap="round" d="M12 3v2m0 14v2m9-9h-2M5 12H3m13.5-6.5-1.5 1.5M9.9 17.6 8.4 19m0-14.6 1.5 1.5m7.6 9.7-1.5-1.5" />
        </svg>
      )
    case 'Afternoons':
      return (
        <svg {...common} stroke="var(--color-special)">
          <path strokeLinecap="round" d="M4 16c2.5-3 6.5-4 10-2.5 1.5.6 3 1.7 4 2.5" />
          <path strokeLinecap="round" d="M7 14a5 5 0 0 1 10 0" />
        </svg>
      )
    case 'Evenings':
      return (
        <svg {...common} stroke="color-mix(in srgb, var(--color-primary) 35%, var(--color-text) 65%)">
          <path strokeLinecap="round" d="M16 4a6 6 0 1 0 4 10 7 7 0 1 1-4-10Z" />
          <path strokeLinecap="round" d="M5 19h14" />
        </svg>
      )
    case 'Weekdays':
      return (
        <svg {...common} stroke="var(--color-primary)">
          <rect x="4" y="6" width="16" height="12" rx="2" />
          <path strokeLinecap="round" d="M8 4v4m8-4v4" />
          <path d="M7 12h2m3 0h5" />
        </svg>
      )
    case 'Weekends':
      return (
        <svg {...common} stroke="var(--color-secondary)">
          <path strokeLinecap="round" d="M7 6v6" />
          <path strokeLinecap="round" d="M11 6v8" />
          <path strokeLinecap="round" d="M15 8v6" />
          <path strokeLinecap="round" d="M7 12c0 4 2 6 5 6s5-2 5-6V8" />
          <path strokeLinecap="round" d="M9 6c0-1 .8-2 2-2s2 1 2 2" />
        </svg>
      )
    case 'Flexible':
      return (
        <svg {...common} stroke="color-mix(in srgb, var(--color-primary) 40%, var(--color-yellow) 60%)">
          <path strokeLinecap="round" d="M6 8c2-3 10-3 12 2-4 0-6 2-6 6-3 0-5-2-6-4" />
          <circle cx="8" cy="16" r="1" />
          <circle cx="16" cy="10" r="1" />
        </svg>
      )
    case 'Always':
      return (
        <svg {...common} stroke="var(--color-primary)">
          <circle cx="12" cy="12" r="7" />
          <path strokeLinecap="round" d="M12 8v4l3 2" />
        </svg>
      )
    case 'Spontaneous':
      return (
        <svg {...common} stroke="var(--color-yellow)">
          <path strokeLinecap="round" d="m7 10 2 2-2 2m4-4 2 2-2 2m4-4 2 2-2 2" />
          <path strokeLinecap="round" d="M5 6h14" />
        </svg>
      )
    default:
      return null
  }
}

export default function ShowMeStep() {
  const { data, updateData, setCurrentStep } = useOnboarding()
  const [selected, setSelected] = useState<string[]>(data.availability || [])

  const handleToggle = (option: string) => {
    const next = selected.includes(option)
      ? selected.filter(v => v !== option)
      : [...selected, option]
    setSelected(next)
    updateData({ availability: next })
  }

  const handleContinue = () => {
    if (selected.length) {
      setCurrentStep(5)
    }
  }

  return (
    <div
      className="onboard-screen flex flex-col gap-6 items-center justify-start px-4 sm:px-8 md:px-16 lg:px-24 py-10 sm:py-14 md:py-16 lg:py-20 w-full relative"
      style={{ minHeight: 'calc(100vh - 72px)' }}
    >
      <BackButton />
      <div className="onboard-card flex flex-col items-center gap-4">
        <h1 className="font-bold leading-[41px] text-[34px] text-nowrap tracking-[0.374px]" style={{ color: 'var(--color-text)', margin: 0 }}>
          Availability
        </h1>
        <p className="font-normal leading-normal text-[20px] text-center max-w-2xl" style={{ color: 'var(--color-muted)' }}>
          Only real people. When are you usually available to climb?
        </p>

        <div
          className="grid items-start w-full"
          style={{
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: '10px 12px',
            maxWidth: '520px',
            justifyItems: 'start',
            margin: '0 auto',
          }}
        >
          {AVAILABILITY.map(option => {
            const isSelected = selected.includes(option)
            return (
              <button
                key={option}
                type="button"
                onClick={() => handleToggle(option)}
                aria-pressed={isSelected}
                className="h-12 relative rounded-[10px] px-4 transition-colors text-left"
                style={{
                  minWidth: '140px',
                  width: '100%',
                  border: `1px solid ${isSelected ? 'var(--color-primary)' : 'var(--color-stroke)'}`,
                  background: isSelected ? 'rgba(92, 225, 230, 0.12)' : 'var(--color-panel)',
                  color: isSelected ? 'var(--color-primary)' : 'var(--color-text)',
                }}
              >
                <span className="font-normal leading-none text-[16px] tracking-[-0.2px] w-full text-center block flex items-center justify-center gap-2">
                  {availabilityIcon(option)}
                  <span>{option}</span>
                </span>
              </button>
            )
          })}
        </div>

        <button
          onClick={handleContinue}
          disabled={!selected.length}
          className="onb-cta-btn"
          style={{ maxWidth: '400px' }}
        >
          Continue 4/9
        </button>
      </div>
    </div>
  )
}

