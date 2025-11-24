'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

export type OnboardingData = {
  // Step 1: Phone
  phoneNumber?: string
  countryCode?: string
  
  // Step 2: Rules (checkboxes)
  rulesAccepted?: boolean[]
  
  // Step 3: Name, Age, Gender
  name?: string
  age?: string
  gender?: 'Man' | 'Woman' | 'Other'
  bio?: string
  
  // Step 4: Purpose
  purpose?: string
  purposes?: string[] // Multiple selections
  
  // Step 5: Show Me
  showMe?: 'Men' | 'Women' | 'All'
  
  // Step 6: Interests
  interests?: string[]
  
  // Step 7: Photos
  photos?: File[]
  
  // Step 8: Location
  homebase?: string
  originalFrom?: string
  distance?: number
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
    countryCode: '+1',
    rulesAccepted: [],
    interests: [],
    photos: [],
  })
  const [currentStep, setCurrentStep] = useState(1)

  const updateData = (updates: Partial<OnboardingData>) => {
    setData(prev => ({ ...prev, ...updates }))
  }

  const reset = () => {
    setData({
      countryCode: '+1',
      rulesAccepted: [],
      interests: [],
      photos: [],
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

