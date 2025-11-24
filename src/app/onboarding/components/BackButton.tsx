'use client'

import { useOnboarding } from '@/contexts/OnboardingContext'
import { useRouter } from 'next/navigation'

export default function BackButton() {
  const { currentStep, setCurrentStep } = useOnboarding()
  const router = useRouter()

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    } else {
      // If on first step, go back to previous page
      router.back()
    }
  }

  if (currentStep === 1) {
    // On first step, still show back button but it goes to previous page
    return (
      <button
        onClick={handleBack}
        className="absolute top-4 left-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
        aria-label="Go back"
      >
        <svg
          className="w-6 h-6 text-[#020202]"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
    )
  }

  return (
    <button
      onClick={handleBack}
      className="absolute top-4 left-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
      aria-label="Go back"
    >
      <svg
        className="w-6 h-6 text-[#020202]"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
      </svg>
    </button>
  )
}

