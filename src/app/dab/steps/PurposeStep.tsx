'use client'

import { useState } from 'react'
import { useOnboarding } from '@/contexts/OnboardingContext'
import BackButton from '../components/BackButton'

const PURPOSES = [
  'Friends',
  'Partnership',
  'Community',
  'Romance',
  'Groups',
  'Training buddy',
  "Don't know yet",
]

export default function PurposeStep() {
  const { data, updateData, setCurrentStep } = useOnboarding()
  const [selected, setSelected] = useState<string[]>(data.purposes || [])

  const handleToggle = (purpose: string) => {
    const newSelected = selected.includes(purpose)
      ? selected.filter(p => p !== purpose)
      : [...selected, purpose]
    setSelected(newSelected)
    updateData({ purposes: newSelected })
  }

  const handleContinue = () => {
    if (selected.length > 0) {
      setCurrentStep(7)
    }
  }

  return (
    <div className="flex flex-col gap-6 items-center justify-center px-4 sm:px-8 md:px-16 lg:px-24 py-12 sm:py-16 md:py-20 lg:py-24 min-h-screen w-full relative" style={{ background: 'var(--bg)', color: 'var(--text)' }}>
      <BackButton />
      <p className="font-normal leading-normal text-[20px] text-center max-w-2xl" style={{ color: 'var(--muted)' }}>
        What are you looking for?
      </p>

      <div className="flex flex-col gap-4 w-full max-w-md">
        {PURPOSES.map((purpose) => {
          const isSelected = selected.includes(purpose)
          return (
            <button
              key={purpose}
              type="button"
              onClick={() => handleToggle(purpose)}
            className="h-14 relative rounded-[12px] w-full flex items-center justify-between px-4 transition-colors"
            style={{
              background: '#0f131d',
              border: `1px solid ${isSelected ? 'var(--accent)' : 'var(--stroke)'}`,
            }}
              onMouseEnter={(e) => {
                if (!isSelected) e.currentTarget.style.borderColor = 'var(--accent)'
              }}
              onMouseLeave={(e) => {
                if (!isSelected) e.currentTarget.style.borderColor = 'var(--stroke)'
              }}
            >
              <span className="font-normal leading-6 text-base" style={{ color: 'var(--text)' }}>{purpose}</span>
              <div className="w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0" style={{ borderColor: isSelected ? 'var(--accent)' : 'var(--stroke)' }}>
                {isSelected && (
                  <div className="w-3 h-3 rounded-full" style={{ background: 'var(--accent)' }}></div>
                )}
              </div>
            </button>
          )
        })}
      </div>

      <button
        onClick={handleContinue}
        disabled={selected.length === 0}
        className="cta w-full max-w-md"
        style={{ padding: '10px 16px', borderRadius: '10px' }}
      >
        <span className="font-medium leading-4 text-base tracking-[1.25px] uppercase" style={{ color: '#0c0e12' }}>
          CONTINUE 6/7
        </span>
      </button>
    </div>
  )
}

