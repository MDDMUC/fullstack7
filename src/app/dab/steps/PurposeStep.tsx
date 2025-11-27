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

const INTEREST_OPTIONS: Array<'Women' | 'Men' | 'All'> = ['Women', 'Men', 'All']

export default function PurposeStep() {
  const { data, updateData, setCurrentStep } = useOnboarding()
  const [selected, setSelected] = useState<string[]>(data.purposes || [])
  const [interest, setInterest] = useState<'Women' | 'Men' | 'All' | ''>(data.interest || '')

  const handleToggle = (purpose: string) => {
    const newSelected = selected.includes(purpose)
      ? selected.filter(p => p !== purpose)
      : [...selected, purpose]
    setSelected(newSelected)
    updateData({ purposes: newSelected })
  }

  const handleContinue = () => {
    if (selected.length > 0 && interest) {
      updateData({ purposes: selected, interest: interest as 'Women' | 'Men' | 'All' })
      setCurrentStep(7)
    }
  }

  return (
    <div
      className="onboard-screen flex flex-col gap-6 items-center justify-start px-4 sm:px-8 md:px-16 lg:px-24 py-10 sm:py-14 md:py-16 lg:py-20 w-full relative"
      style={{ minHeight: 'calc(100vh - 72px)' }}
    >
      <BackButton />
      <div className="onboard-card flex flex-col items-center gap-4">
        <h1 className="font-bold leading-[41px] text-[34px] text-nowrap tracking-[0.374px]" style={{ color: 'var(--text)', margin: 0 }}>
          What are you looking for?
        </h1>
        <p className="font-normal leading-normal text-[20px] text-center max-w-2xl" style={{ color: 'var(--muted)' }}>
          Only real people. Pick the reasons you&apos;re here so we can match on intent.
        </p>

        <div
          className="grid items-start w-full"
          style={{
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: '10px 12px',
            maxWidth: '520px',
            justifyItems: 'start',
            margin: '0 auto',
          }}
        >
          {PURPOSES.map((purpose) => {
            const isSelected = selected.includes(purpose)
            return (
              <button
                key={purpose}
                type="button"
                onClick={() => handleToggle(purpose)}
                aria-pressed={isSelected}
                className="h-12 relative rounded-[10px] px-4 transition-colors text-left"
                style={{
                  minWidth: '140px',
                  width: '100%',
                  border: `1px solid ${isSelected ? 'var(--accent)' : 'var(--stroke)'}`,
                  background: isSelected ? 'rgba(92, 225, 230, 0.12)' : '#0f131d',
                  color: isSelected ? 'var(--accent)' : 'var(--text)',
                }}
              >
                <span className="font-normal leading-none text-[16px] tracking-[-0.2px] w-full text-center block">
                  {purpose}
                </span>
              </button>
            )
          })}
        </div>

        <div className="w-full max-w-md flex flex-col gap-3">
          <p className="font-normal leading-normal text-[18px]" style={{ color: 'var(--text)', margin: 0 }}>
            I am interested in:
          </p>
          <div
            className="grid items-start w-full"
            style={{
              gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
              gap: '10px 12px',
            }}
          >
            {INTEREST_OPTIONS.map(option => {
              const isSelected = interest === option
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => setInterest(option)}
                  aria-pressed={isSelected}
                  className="h-12 relative rounded-[10px] px-4 transition-colors text-center"
                  style={{
                    minWidth: '140px',
                    border: `1px solid ${isSelected ? 'var(--accent)' : 'var(--stroke)'}`,
                    background: isSelected ? 'rgba(92, 225, 230, 0.12)' : '#0f131d',
                    color: isSelected ? 'var(--accent)' : 'var(--text)',
                  }}
                >
                  <span className="font-normal leading-none text-[16px] tracking-[-0.2px]">
                    {option}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        <button
          onClick={handleContinue}
          disabled={selected.length === 0 || !interest}
          className="cta w-full max-w-md"
          style={{ padding: '10px 16px', borderRadius: '10px' }}
        >
          <span className="font-medium leading-4 text-base tracking-[1.25px] uppercase" style={{ color: '#0c0e12' }}>
            CONTINUE 6/7
          </span>
        </button>
      </div>
    </div>
  )
}

