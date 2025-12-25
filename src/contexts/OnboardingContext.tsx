'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

export type OnboardingData = {
  // Contact
  phone?: string

  // Identity
  username?: string
  age?: string
  gender?: 'Man' | 'Woman' | 'Other' | "Won't say"
  pronouns?: string
  bio?: string
  photo?: string

  // Climbing profile
  styles?: string[]
  grade?: string
  bigGoal?: string
  availability?: string[]
  purposes?: string[]
  interest?: 'Women' | 'Men' | 'All'
  photos?: (File | string)[]

  // Location
  homebase?: string
  radiusKm?: number
  gym?: string[] // Selected gym IDs from onboarding

  // Agreements
  pledgeAccepted?: boolean
}

type OnboardingContextType = {
  data: OnboardingData
  updateData: (updates: Partial<OnboardingData>) => void
  currentStep: number
  setCurrentStep: (step: number) => void
  startTime: number
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
  const [startTime] = useState<number>(Date.now())

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
      photos: [],
    })
    setCurrentStep(1)
  }

  return (
    <OnboardingContext.Provider value={{ data, updateData, currentStep, setCurrentStep, startTime, reset }}>
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


