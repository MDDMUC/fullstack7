'use client'

import { useState } from 'react'
import { useOnboarding } from '@/contexts/OnboardingContext'
import BackButton from '../components/BackButton'

const OPTIONS = ['Men', 'Women', 'All'] as const

export default function ShowMeStep() {
  const { data, updateData, setCurrentStep } = useOnboarding()
  const [selected, setSelected] = useState<'Men' | 'Women' | 'All' | ''>(
    data.showMe || ''
  )

  const handleSelect = (option: typeof OPTIONS[number]) => {
    setSelected(option)
    updateData({ showMe: option })
  }

  const handleContinue = () => {
    if (selected) {
      setCurrentStep(6)
    }
  }

  return (
    <div className="bg-white flex flex-col gap-4 items-center justify-center px-4 sm:px-8 md:px-16 lg:px-24 py-12 sm:py-16 md:py-20 lg:py-24 min-h-screen w-full relative">
      <BackButton />
      <p className="font-normal leading-normal text-[20px] text-black text-center max-w-2xl">
        I am looking to connect with
      </p>

      <div className="flex flex-col gap-4 w-full max-w-md">
        {OPTIONS.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => handleSelect(option)}
            className="bg-white border border-[#020202] h-14 relative rounded-[4px] w-full flex items-center justify-between px-4 hover:bg-gray-50 transition-colors"
          >
            <span className="font-normal leading-6 text-[#757575] text-base">{option}</span>
            <div className="w-6 h-6 rounded-full border-2 border-[#020202] flex items-center justify-center flex-shrink-0">
              {selected === option && (
                <div className="w-3 h-3 rounded-full bg-[#020202]"></div>
              )}
            </div>
          </button>
        ))}
      </div>

      <button
        onClick={handleContinue}
        disabled={!selected}
        className="bg-[#212121] flex items-center justify-center px-6 py-4 rounded-[4px] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#2a2a2a] transition-colors w-full max-w-md"
      >
        <span className="font-medium leading-4 text-base text-white tracking-[1.25px] uppercase">
          CONTINUE 4/7
        </span>
      </button>
    </div>
  )
}

