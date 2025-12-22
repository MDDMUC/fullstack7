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
      router.push('/signup')
    }
  }

  const buttonStyle = {
    position: 'absolute' as const,
    top: '16px',
    left: '16px',
    padding: '8px',
    borderRadius: '50%',
    background: 'rgba(15, 19, 29, 0.8)',
    border: '1px solid var(--color-stroke)',
    color: 'var(--color-text)',
    cursor: 'pointer',
    transition: 'all 120ms ease',
  }

  const hoverStyle = {
    borderColor: 'var(--color-primary)',
    color: 'var(--color-primary)',
  }

  if (currentStep === 1) {
    // On first step, still show back button but it goes to previous page
    return (
      <button
        onClick={handleBack}
        style={buttonStyle}
        onMouseEnter={(e) => Object.assign(e.currentTarget.style, hoverStyle)}
        onMouseLeave={(e) => Object.assign(e.currentTarget.style, buttonStyle)}
        aria-label="Go back"
      >
        <svg
          className="w-6 h-6"
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
      style={buttonStyle}
      onMouseEnter={(e) => Object.assign(e.currentTarget.style, hoverStyle)}
      onMouseLeave={(e) => Object.assign(e.currentTarget.style, buttonStyle)}
      aria-label="Go back"
    >
      <svg
        className="w-6 h-6"
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


