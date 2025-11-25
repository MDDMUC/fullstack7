'use client'

import { useState } from 'react'
import { useOnboarding } from '@/contexts/OnboardingContext'
import BackButton from '../components/BackButton'

const INTERESTS = [
  'Alpine',
  'Trad',
  'Sport',
  'Hangout',
  'Training',
  'Trips',
  'Ice',
  'Mixed',
  'Bouldering',
  'Groups',
]

export default function InterestsStep() {
  const { data, updateData, setCurrentStep } = useOnboarding()
  const [selected, setSelected] = useState<string[]>(data.interests || [])

  const handleToggle = (interest: string) => {
    const newSelected = selected.includes(interest)
      ? selected.filter(i => i !== interest)
      : [...selected, interest]
    setSelected(newSelected)
    updateData({ interests: newSelected })
  }

  const handleContinue = () => {
    setCurrentStep(7)
  }

  return (
    <div className="flex flex-col gap-6 items-center justify-center px-4 sm:px-8 md:px-16 lg:px-24 py-12 sm:py-16 md:py-20 lg:py-24 min-h-screen w-full relative" style={{ background: 'var(--bg)', color: 'var(--text)' }}>
      <BackButton />
      <div className="flex gap-2 items-center justify-center px-4 py-0 w-full max-w-2xl">
        <h1 className="font-bold leading-[41px] text-[34px] text-nowrap tracking-[0.374px]" style={{ color: 'var(--text)' }}>
          Interests
        </h1>
      </div>

      <p className="font-normal leading-normal text-[20px] text-center max-w-2xl" style={{ color: 'var(--muted)' }}>
        &ldquo;Let&rsquo;s get you climbing with new people.&rdquo;
      </p>

      <div className="flex flex-wrap gap-4 items-start justify-center w-full max-w-md">
        {INTERESTS.map((interest) => {
          const isSelected = selected.includes(interest)
          return (
            <button
              key={interest}
              type="button"
              onClick={() => handleToggle(interest)}
              className="h-12 relative rounded-[10px] px-3 transition-colors"
              style={{
                border: `1px solid ${isSelected ? 'var(--accent)' : 'var(--stroke)'}`,
                background: isSelected ? 'rgba(92, 225, 230, 0.12)' : '#0f131d',
                color: isSelected ? 'var(--accent)' : 'var(--text)',
              }}
            >
              <span className="font-normal leading-none text-[18px] tracking-[-0.32px]">
                {interest}
              </span>
            </button>
          )
        })}
      </div>

      <button
        onClick={handleContinue}
        className="cta w-full max-w-md"
        style={{ padding: '10px 16px', borderRadius: '10px' }}
      >
        <span className="font-medium leading-4 text-base tracking-[1.25px] uppercase" style={{ color: '#0c0e12' }}>
          CONTINUE 5/7
        </span>
      </button>
    </div>
  )
}

