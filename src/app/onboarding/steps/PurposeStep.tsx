'use client'

import { useState } from 'react'
import { useOnboarding } from '@/contexts/OnboardingContext'

const PURPOSES = [
  'Partnership',
  'Friendship',
  'Community',
  'Only Climbing',
  "Don't know yet",
]

export default function PurposeStep() {
  const { data, updateData, setCurrentStep } = useOnboarding()
  const [selected, setSelected] = useState(data.purpose || '')

  const handleSelect = (purpose: string) => {
    setSelected(purpose)
    updateData({ purpose })
  }

  const handleContinue = () => {
    if (selected) {
      setCurrentStep(5)
    }
  }

  return (
    <div className="bg-white flex flex-col gap-4 items-center justify-center px-4 sm:px-8 md:px-16 lg:px-24 py-12 sm:py-16 md:py-20 lg:py-24 min-h-screen w-full">
      <p className="font-normal leading-normal text-[20px] text-black text-center max-w-2xl">
        I am here for
      </p>

      <div className="flex flex-col gap-4 w-full max-w-md">
        {PURPOSES.map((purpose) => (
          <button
            key={purpose}
            type="button"
            onClick={() => handleSelect(purpose)}
            className={`bg-white border border-[#020202] h-14 relative rounded-[4px] w-full flex items-center px-4 transition-colors ${
              selected === purpose ? 'bg-gray-50 border-2' : ''
            }`}
          >
            <span className="font-normal leading-6 text-[#757575] text-base">{purpose}</span>
          </button>
        ))}
      </div>

      <button
        onClick={handleContinue}
        disabled={!selected}
        className="bg-[#212121] flex items-center justify-center px-6 py-4 rounded-[4px] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#2a2a2a] transition-colors w-full max-w-md"
      >
        <span className="font-medium leading-4 text-base text-white tracking-[1.25px] uppercase">
          CONTINUE 3/7
        </span>
      </button>
    </div>
  )
}

