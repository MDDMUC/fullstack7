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
    <div className="bg-white flex flex-col gap-4 items-center justify-center px-4 sm:px-8 md:px-16 lg:px-24 py-12 sm:py-16 md:py-20 lg:py-24 min-h-screen w-full relative">
      <BackButton />
      <div className="flex gap-2 items-center justify-center px-4 py-0 w-full max-w-2xl">
        <h1 className="font-bold leading-[41px] text-[#020202] text-[34px] text-nowrap tracking-[0.374px]">
          Interests
        </h1>
      </div>

      <p className="font-normal leading-normal text-[20px] text-black text-center max-w-2xl">
        &ldquo;Let&rsquo;s get you climbing with new people.&rdquo;
      </p>

      <div className="flex flex-wrap gap-4 items-start justify-center w-full max-w-md">
        {INTERESTS.map((interest) => (
          <button
            key={interest}
            type="button"
            onClick={() => handleToggle(interest)}
            className={`border border-[#212121] h-12 relative rounded-[4px] px-3 transition-colors ${
              selected.includes(interest)
                ? 'bg-[#212121] text-white'
                : 'bg-white text-[#212121]'
            }`}
          >
            <span className="font-normal leading-none text-[18px] tracking-[-0.32px]">
              {interest}
            </span>
          </button>
        ))}
      </div>

      <button
        onClick={handleContinue}
        className="bg-[#212121] flex items-center justify-center px-6 py-4 rounded-[4px] hover:bg-[#2a2a2a] transition-colors w-full max-w-md"
      >
        <span className="font-medium leading-4 text-base text-white tracking-[1.25px] uppercase">
          CONTINUE 5/7
        </span>
      </button>
    </div>
  )
}

