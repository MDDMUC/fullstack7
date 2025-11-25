'use client'

import { useState } from 'react'
import { useOnboarding } from '@/contexts/OnboardingContext'
import BackButton from '../components/BackButton'

const RULES = [
  'I agree to follow community safety guidelines',
  'I will respect other climbers and their boundaries',
  'I understand this is a platform for genuine connections',
  'I will report any inappropriate behavior',
  'I agree to the terms of service and privacy policy',
]

export default function WelcomeStep() {
  const { data, updateData, setCurrentStep } = useOnboarding()
  const [accepted, setAccepted] = useState<boolean[]>(
    data.rulesAccepted || RULES.map(() => false)
  )

  const handleToggle = (index: number) => {
    const newAccepted = [...accepted]
    newAccepted[index] = !newAccepted[index]
    setAccepted(newAccepted)
    updateData({ rulesAccepted: newAccepted })
  }

  const handleContinue = () => {
    if (accepted.every(Boolean)) {
      updateData({ rulesAccepted: accepted })
      setCurrentStep(3)
    }
  }

  const allAccepted = accepted.every(Boolean)

  return (
    <div className="flex flex-col gap-6 items-center justify-center px-4 sm:px-8 md:px-16 lg:px-24 py-12 sm:py-16 md:py-20 lg:py-24 min-h-screen w-full relative" style={{ background: 'var(--bg)', color: 'var(--text)' }}>
      <BackButton />
      <div className="flex gap-2 items-center justify-center px-4 py-0 w-full max-w-2xl">
        <h1 className="font-bold leading-[41px] text-[34px] text-nowrap tracking-[0.374px]" style={{ color: 'var(--text)' }}>
          Welcome
        </h1>
      </div>

      <div className="h-[200px] w-[200px] rounded-[10px] flex items-center justify-center" style={{ border: '1px solid var(--stroke)', background: '#0f131d' }}>
        <span className="text-sm" style={{ color: 'var(--muted)' }}>Image placeholder</span>
      </div>

      <p className="font-normal leading-normal text-[20px] text-center max-w-2xl" style={{ color: 'var(--muted)' }}>
        Rules and Safety
      </p>

      <div className="flex flex-col gap-4 w-full max-w-md">
        {RULES.map((rule, index) => (
          <div key={index} className="flex gap-4 items-start justify-center">
            <button
              type="button"
              onClick={() => handleToggle(index)}
              className="mt-1 w-[18px] h-[18px] rounded-[4px] border-2 flex items-center justify-center flex-shrink-0 transition-colors"
              style={{
                borderColor: accepted[index] ? 'var(--accent)' : 'var(--stroke)',
                background: accepted[index] ? 'var(--accent)' : 'transparent',
              }}
            >
              {accepted[index] && (
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="#0c0e12" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
            <p className="font-normal leading-normal text-[20px] text-left flex-1" style={{ color: 'var(--text)' }}>
              {rule}
            </p>
          </div>
        ))}
      </div>

      <button
        onClick={handleContinue}
        disabled={!allAccepted}
        className="cta w-full max-w-md"
        style={{ padding: '10px 16px', borderRadius: '10px' }}
      >
        <span className="font-medium leading-4 text-base tracking-[1.25px] uppercase" style={{ color: '#0c0e12' }}>
          CONTINUE 1/7
        </span>
      </button>
    </div>
  )
}

