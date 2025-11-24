import { SupabaseClient } from '@supabase/supabase-js'

export type OnboardingDataFromStorage = {
  phoneNumber?: string
  countryCode?: string
  rulesAccepted?: boolean[]
  name?: string
  age?: string
  gender?: 'Man' | 'Woman' | 'Other'
  bio?: string
  purpose?: string
  purposes?: string[]
  showMe?: 'Men' | 'Women' | 'All'
  interests?: string[]
  photosMetadata?: Array<{
    name: string
    size: number
    type: string
    index: number
  }>
  homebase?: string
  originalFrom?: string
  distance?: number
}

export async function applyOnboardingDataToProfile(
  client: SupabaseClient,
  userId: string,
  onboardingData: OnboardingDataFromStorage
) {
  const profileData = {
    id: userId,
    username: onboardingData.name || 'Climber',
    age: onboardingData.age ? parseInt(onboardingData.age) : undefined,
    city: onboardingData.homebase || '',
    original_from: onboardingData.originalFrom || null,
    distance: onboardingData.distance ? `${onboardingData.distance} km` : null,
    style: onboardingData.interests?.join(', ') || '',
    grade: '',
    bio: onboardingData.bio || '',
    availability: '',
    tags: onboardingData.interests || [],
    goals: onboardingData.purposes?.join(', ') || onboardingData.purpose || '',
    lookingFor: onboardingData.showMe || '',
    phone_number: onboardingData.phoneNumber 
      ? `${onboardingData.countryCode || '+1'}${onboardingData.phoneNumber}` 
      : null,
    pronouns: onboardingData.gender || '',
    avatar_url: null,
    photos: null,
    status: 'New member',
  }

  const { data, error } = await client
    .from('profiles')
    .upsert(profileData, { onConflict: 'id' })
    .select()

  if (error) {
    console.error('Error applying onboarding data:', error)
    throw error
  }

  console.log('Onboarding data applied to profile:', data)
  return data
}

