'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

function AuthCallbackHandler() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState('Processing authentication...')

  useEffect(() => {
    const handleCallback = async () => {
      if (!supabase) {
        setStatus('Supabase is not configured.')
        setTimeout(() => router.push('/signup'), 2000)
        return
      }

      try {
        // Supabase handles OAuth callback automatically
        // Check for session or code in URL
        const code = searchParams.get('code')
        const errorParam = searchParams.get('error')
        
        if (errorParam) {
          const errorDescription = searchParams.get('error_description')
          setStatus(`Authentication error: ${errorDescription || errorParam}`)
          setTimeout(() => router.push('/signup'), 3000)
          return
        }

        let user = null

        if (code) {
          // Exchange the code for a session
          const { data, error } = await supabase.auth.exchangeCodeForSession(code)
          
          if (error) {
            console.error('OAuth callback error:', error)
            setStatus(`Authentication failed: ${error.message}`)
            setTimeout(() => router.push('/signup'), 3000)
            return
          }

          user = data.user
        } else {
          // Try to get existing session (in case Supabase already handled it)
          const { data: { session }, error: sessionError } = await supabase.auth.getSession()
          
          if (sessionError) {
            console.error('Session error:', sessionError)
            setStatus('No active session found. Please try signing in again.')
            setTimeout(() => router.push('/signup'), 3000)
            return
          }

          user = session?.user || null
        }

        if (!user) {
          setStatus('Authentication failed: No user data received.')
          setTimeout(() => router.push('/signup'), 3000)
          return
        }

        // Check if user already has a profile
        const { data: existingProfile, error: profileCheckError } = await supabase
          .from('onboardingprofiles')
          .select('id')
          .eq('id', user.id)
          .single()

        // If profile doesn't exist, create one
        if (!existingProfile && !profileCheckError) {
          setStatus('Creating your profile...')
          
          // Check for saved onboarding data
          const savedOnboardingData = localStorage.getItem('onboarding_data')
          let profileData: any = {}

          if (savedOnboardingData) {
            try {
              const onboardingData = JSON.parse(savedOnboardingData)
              const { onboardingDataToProfileData } = await import('@/lib/profileUtils')
              profileData = onboardingDataToProfileData(onboardingData)
              localStorage.removeItem('onboarding_data')
            } catch (e) {
              console.error('Error parsing onboarding data:', e)
            }
          }

          // If no onboarding data, create basic profile from OAuth user data
          if (!profileData.username) {
            const { signupFormDataToProfileData } = await import('@/lib/profileUtils')
            profileData = signupFormDataToProfileData({
              name: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'Climber',
              email: user.email || '',
              style: '',
              grade: '',
              availability: '',
              goals: [],
            })
          }

          // Add OAuth metadata if available
          if (user.user_metadata?.avatar_url) {
            profileData.avatar_url = user.user_metadata.avatar_url
          }
          if (user.user_metadata?.full_name || user.user_metadata?.name) {
            profileData.username = user.user_metadata.full_name || user.user_metadata.name
          }

          // Create profile
          const { createOrUpdateProfile } = await import('@/lib/profileUtils')
          const { error: createError } = await createOrUpdateProfile(supabase, user.id, profileData)

          if (createError) {
            console.error('Error creating profile:', createError)
            // Continue anyway - profile can be created later
          }
        }

        // Redirect based on whether onboarding was completed
        const hasOnboardingData = localStorage.getItem('onboarding_data')
        if (hasOnboardingData) {
          // User has onboarding data, redirect to onboarding to complete it
          setStatus('Redirecting to complete your profile...')
          setTimeout(() => router.push('/onboarding'), 1000)
        } else if (existingProfile) {
          // User already has profile, go to home
          setStatus('Welcome back! Redirecting...')
          setTimeout(() => router.push('/home'), 1000)
        } else {
          // New user, redirect to onboarding
          setStatus('Setting up your profile...')
          setTimeout(() => router.push('/onboarding'), 1000)
        }
      } catch (error: any) {
        console.error('Callback error:', error)
        setStatus(`Error: ${error.message || 'An unexpected error occurred'}`)
        setTimeout(() => router.push('/signup'), 3000)
      }
    }

    handleCallback()
  }, [router, searchParams])

  return (
    <main className="signup-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <div style={{ textAlign: 'center', maxWidth: '400px' }}>
        <div style={{ marginBottom: '24px' }}>
          <div style={{ 
            width: '48px', 
            height: '48px', 
            border: '3px solid var(--accent)',
            borderTopColor: 'transparent',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }} />
          <style jsx>{`
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
          `}</style>
        </div>
        <p style={{ color: 'var(--text)', fontSize: '18px', margin: '0' }}>{status}</p>
      </div>
    </main>
  )
}

export default function AuthCallback() {
  return (
    <Suspense fallback={
      <main className="signup-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{ textAlign: 'center', maxWidth: '400px' }}>
          <div style={{ marginBottom: '24px' }}>
            <div style={{ 
              width: '48px', 
              height: '48px', 
              border: '3px solid var(--accent)',
              borderTopColor: 'transparent',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 16px'
            }} />
            <style jsx>{`
              @keyframes spin {
                to { transform: rotate(360deg); }
              }
            `}</style>
          </div>
          <p style={{ color: 'var(--text)', fontSize: '18px', margin: '0' }}>Loading...</p>
        </div>
      </main>
    }>
      <AuthCallbackHandler />
    </Suspense>
  )
}

