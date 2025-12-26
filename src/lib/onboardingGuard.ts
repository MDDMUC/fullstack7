import { requireSupabase } from './supabaseClient'

/**
 * Check if the current user has completed onboarding
 * Returns true if onboarding is complete, false otherwise
 */
export async function hasCompletedOnboarding(): Promise<boolean> {
  const supabase = requireSupabase()

  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return false
    }

    // Check if user has a profile in onboardingprofiles
    const { data: profile, error: profileError } = await supabase
      .from('onboardingprofiles')
      .select('id, username, photo, gym')
      .eq('id', user.id)
      .maybeSingle()

    if (profileError) {
      console.error('Error checking onboarding status:', profileError)
      return false
    }

    // User has completed onboarding if they have a profile with required fields
    if (!profile) {
      return false
    }

    // Check if essential onboarding fields are filled
    const hasUsername = !!profile.username
    const hasPhoto = !!profile.photo
    const hasGym = !!profile.gym

    return hasUsername && hasPhoto && hasGym
  } catch (error) {
    console.error('Error in hasCompletedOnboarding:', error)
    return false
  }
}

/**
 * Get the user's onboarding completion status and redirect if needed
 * Use this in page components to protect routes
 */
export async function checkOnboardingAndRedirect(): Promise<{
  isComplete: boolean
  redirectTo: string | null
}> {
  const supabase = requireSupabase()

  const { data: { user } } = await supabase.auth.getUser()

  // Not authenticated - redirect to signup
  if (!user) {
    return {
      isComplete: false,
      redirectTo: '/dab'
    }
  }

  // Check onboarding completion
  const isComplete = await hasCompletedOnboarding()

  if (!isComplete) {
    return {
      isComplete: false,
      redirectTo: '/dab'
    }
  }

  return {
    isComplete: true,
    redirectTo: null
  }
}
