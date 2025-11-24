'use client'

import { useState } from 'react'
import { useOnboarding } from '@/contexts/OnboardingContext'

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
    <div className="bg-white flex flex-col gap-4 items-center justify-center px-4 sm:px-8 md:px-16 lg:px-24 py-12 sm:py-16 md:py-20 lg:py-24 min-h-screen w-full">
      <div className="flex gap-2 items-center justify-center px-4 py-0 w-full max-w-2xl">
        <h1 className="font-bold leading-[41px] text-[#020202] text-[34px] text-nowrap tracking-[0.374px]">
          Welcome
        </h1>
      </div>

      <div className="border border-[#212121] h-[200px] w-[200px] rounded-[4px] flex items-center justify-center bg-gray-50">
        <span className="text-[#757575] text-sm">Image placeholder</span>
      </div>

      <p className="font-normal leading-normal text-[20px] text-black text-center max-w-2xl">
        Rules and Safety
      </p>

      <div className="flex flex-col gap-4 w-full max-w-md">
        {RULES.map((rule, index) => (
          <div key={index} className="flex gap-4 items-start justify-center">
            <button
              type="button"
              onClick={() => handleToggle(index)}
              className={`mt-1 w-[18px] h-[18px] rounded-[2px] border-2 border-[#020202] flex items-center justify-center flex-shrink-0 ${
                accepted[index] ? 'bg-[#020202]' : 'bg-white'
              }`}
            >
              {accepted[index] && (
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
            <p className="font-normal leading-normal text-[20px] text-black text-left flex-1">
              {rule}
            </p>
          </div>
        ))}
      </div>

      <button
        onClick={handleContinue}
        disabled={!allAccepted}
        className="bg-[#212121] flex items-center justify-center px-6 py-4 rounded-[4px] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#2a2a2a] transition-colors w-full max-w-md"
      >
        <span className="font-medium leading-4 text-base text-white tracking-[1.25px] uppercase">
          CONTINUE 1/7
        </span>
      </button>
    </div>
  )
}

