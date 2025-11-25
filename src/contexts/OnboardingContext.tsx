'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

export type OnboardingData = {
  // Contact
  phone?: string

  // Identity
  age?: string
  gender?: 'Man' | 'Woman' | 'Other'
  pronouns?: string
  bio?: string

  // Climbing profile
  styles?: string[]
  grade?: string
  bigGoal?: string
  availability?: string[]
  purposes?: string[]
  photos?: File[]

  // Location
  homebase?: string
  radiusKm?: number

  // Agreements
  pledgeAccepted?: boolean
}

type OnboardingContextType = {
  data: OnboardingData
  updateData: (updates: Partial<OnboardingData>) => void
  currentStep: number
  setCurrentStep: (step: number) => void
  reset: () => void
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined)

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<OnboardingData>({
    styles: [],
    availability: [],
    purposes: [],
    radiusKm: 100,
    pledgeAccepted: false,
    photos: [],
  })
  const [currentStep, setCurrentStep] = useState(1)

  const updateData = (updates: Partial<OnboardingData>) => {
    setData(prev => ({ ...prev, ...updates }))
  }

  const reset = () => {
    setData({
      styles: [],
      availability: [],
      purposes: [],
      radiusKm: 100,
      pledgeAccepted: false,
    })
    setCurrentStep(1)
  }

  return (
    <OnboardingContext.Provider value={{ data, updateData, currentStep, setCurrentStep, reset }}>
      {children}
    </OnboardingContext.Provider>
  )
}

export function useOnboarding() {
  const context = useContext(OnboardingContext)
  if (!context) {
    throw new Error('useOnboarding must be used within OnboardingProvider')
  }
  return context
}

