'use client'

import { FormEvent, useState } from 'react'
import { useOnboarding } from '@/contexts/OnboardingContext'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import BackButton from '../components/BackButton'

export default function LocationStep() {
  const { data, updateData, setCurrentStep } = useOnboarding()
  const router = useRouter()
  const [homebase, setHomebase] = useState('')
  const [originalFrom, setOriginalFrom] = useState('')
  const [distance, setDistance] = useState(100)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleIncrement = () => {
    setDistance(prev => Math.min(prev + 10, 500))
  }

  const handleDecrement = () => {
    setDistance(prev => Math.max(prev - 10, 10))
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!homebase.trim()) return

    setLoading(true)
    setError(null)
    
    try {
      // Check Supabase configuration
      if (!supabase) {
        console.error('Supabase is not configured')
        setError('Supabase is not configured. Please check your environment variables.')
        setLoading(false)
        // Save data but DON'T redirect - let user see the error
        const allData = { ...data, homebase, originalFrom, distance }
        localStorage.setItem('onboarding_data', JSON.stringify(allData))
        return // STAY ON PAGE - don't navigate
      }

      console.log('Checking user authentication...')
      
      // Try to get user, but handle the case where they're not authenticated
      let user = null
      let userError = null
      
      try {
        const authResult = await supabase.auth.getUser()
        user = authResult.data?.user
        userError = authResult.error
      } catch (err: any) {
        console.warn('Auth check failed (user likely not logged in):', err)
        userError = err
      }
      
      if (userError || !user) {
        console.log('User not authenticated - saving to localStorage')
        // Save all onboarding data to localStorage (without File objects which can't be serialized)
        const allData = {
          ...data,
          homebase,
          originalFrom,
          distance,
          // Store photo metadata (File objects can't be stored in localStorage)
          photosMetadata: data.photos?.map((photo, idx) => ({
            name: photo.name,
            size: photo.size,
            type: photo.type,
            index: idx
          })) || []
        }
        localStorage.setItem('onboarding_data', JSON.stringify(allData))
        
        // Show message but DON'T redirect - let user see the error and decide what to do
        setError('Please sign up or log in to complete your profile. Your information has been saved and will be applied after you create an account.')
        setLoading(false)
        
        // DON'T redirect automatically - stay on page so user can see the message
        return
      }

      console.log('User authenticated:', user.id)

      // Upload photos to Supabase storage (if configured)
      let photoUrls: string[] = []
      if (data.photos && data.photos.length > 0) {
        try {
          // Check if storage bucket exists
          const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()
          
          if (bucketsError) {
            console.error('Error checking storage buckets:', bucketsError)
          } else {
            const avatarsBucket = buckets?.find(b => b.id === 'avatars')
            
            if (!avatarsBucket) {
              console.warn('Avatars bucket not found. Photos will not be uploaded.')
              console.warn('Please create the "avatars" bucket in Supabase Storage and make it public.')
            } else {
              // Upload each photo to Supabase storage
              for (let i = 0; i < data.photos.length; i++) {
                const photo = data.photos[i]
                const fileExt = photo.name.split('.').pop() || 'jpg'
                const timestamp = Date.now()
                const randomId = Math.random().toString(36).substring(7)
                // File path: user-id/timestamp_random.ext
                const filePath = `${user.id}/${timestamp}_${randomId}.${fileExt}`

                const { error: uploadError } = await supabase.storage
                  .from('avatars')
                  .upload(filePath, photo, {
                    cacheControl: '3600',
                    upsert: false
                  })

                if (uploadError) {
                  console.error(`Error uploading photo ${i + 1}:`, uploadError)
                  // Continue with other photos even if one fails
                } else {
                  const { data: { publicUrl } } = supabase.storage
                    .from('avatars')
                    .getPublicUrl(filePath)
                  photoUrls.push(publicUrl)
                  console.log(`Successfully uploaded photo ${i + 1}:`, publicUrl)
                }
              }
            }
          }
        } catch (uploadErr) {
          console.error('Error uploading photos:', uploadErr)
          // Continue without photos if upload fails
        }
      }

      // Save profile to database
      const profileData = {
        id: user.id,
        username: data.name || user.email?.split('@')[0] || 'Climber',
        age: data.age ? parseInt(data.age) : undefined,
        city: homebase,
        style: data.interests?.join(', ') || '',
        grade: '',
        bio: data.bio || '',
        availability: '',
        tags: data.interests || [],
        goals: data.purposes?.join(', ') || data.purpose || '',
        lookingFor: data.showMe || '',
        avatar_url: photoUrls[0] || null,
        // Store all photo URLs as a JSON array in a text field (can be parsed later)
        // Or you could create a separate photos table for multiple images
        photos: photoUrls.length > 0 ? JSON.stringify(photoUrls) : null,
        status: 'New member',
        phone_number: data.phoneNumber ? `${data.countryCode}${data.phoneNumber}` : null,
        pronouns: data.gender || '',
        distance: `${distance} km`,
        original_from: originalFrom || null,
      }

      console.log('Saving profile data:', { 
        ...profileData, 
        photos: profileData.photos ? 'JSON string' : null,
        tags: profileData.tags 
      })
      
      // Try to insert/update the profile
      // Note: If you get a schema cache error, the table exists but PostgREST needs to refresh
      let savedData = null
      let profileError = null
      
      // First attempt
      const result = await supabase
        .from('onboardingprofiles')
        .upsert(profileData, { 
          onConflict: 'id',
          ignoreDuplicates: false 
        })
        .select()
      
      savedData = result.data
      profileError = result.error
      
      // If schema cache error, wait and retry once
      if (profileError && (profileError.code === '42P01' || profileError.message?.includes('schema cache'))) {
        console.warn('Schema cache issue detected, waiting 2 seconds and retrying...')
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        // Retry the upsert
        const retryResult = await supabase
          .from('onboardingprofiles')
          .upsert(profileData, { 
            onConflict: 'id',
            ignoreDuplicates: false 
          })
          .select()
        
        savedData = retryResult.data
        profileError = retryResult.error
      }

      if (profileError) {
        // Log error details for debugging (only in development)
        if (process.env.NODE_ENV === 'development') {
          console.error('❌ Error saving profile:', profileError)
          console.error('Error details:', {
            message: profileError.message,
            details: profileError.details,
            hint: profileError.hint,
            code: profileError.code
          })
          console.error('Profile data attempted:', JSON.stringify(profileData, null, 2))
        }
        
        // Check error type and provide specific guidance
        const errorCode = profileError.code || ''
        const errorMessage = profileError.message || 'Unknown error'
        
        if (errorCode === '42501' || errorMessage.includes('policy') || errorMessage.includes('permission denied') || errorMessage.includes('row-level security')) {
          setError(`Permission denied by Row Level Security. Error: ${errorMessage}. Make sure you've created the RLS policies. Run supabase/setup_policies.sql in Supabase SQL Editor.`)
        } else if (errorCode === '42P01' || errorMessage.includes('schema cache') || errorMessage.includes('does not exist')) {
          // This error can occur even if table exists - usually a schema cache issue
          setError(`Schema cache issue: ${errorMessage}. The table exists but Supabase needs to refresh its cache. Try: 1) Wait a few seconds and retry, 2) Check if table is in 'public' schema, 3) Verify your Supabase connection settings.`)
        } else if (errorMessage.includes('JWT') || errorMessage.includes('token') || errorMessage.includes('authentication')) {
          setError(`Authentication error: ${errorMessage}. Check your Supabase API keys in .env.local file.`)
        } else {
          // Show the actual error message and code for debugging
          setError(`Failed to save profile: ${errorMessage}${errorCode ? ` (Error Code: ${errorCode})` : ''}. Check browser console for full details.`)
        }
        setLoading(false)
        // Don't continue to success if save failed
        return
      }

      // CRITICAL: Verify the save actually worked before proceeding
      let verifiedProfile = savedData?.[0]
      
      if (!verifiedProfile) {
        console.warn('⚠️ Upsert returned no data - verifying with select query...')
        
        // Wait a moment for the database to update
        await new Promise(resolve => setTimeout(resolve, 500))
        
        // Try to fetch the profile to verify it was saved
        const { data: verifyData, error: verifyError } = await supabase
          .from('onboardingprofiles')
          .select('*')
          .eq('id', user.id)
          .single()
        
        if (verifyError) {
          if (process.env.NODE_ENV === 'development') {
            console.error('❌ Profile verification failed:', verifyError)
          }
          setError(`Profile save verification failed: ${verifyError.message}. Check Supabase setup.`)
          setLoading(false)
          return // STAY ON PAGE - don't navigate
        }
        
        if (!verifyData) {
          if (process.env.NODE_ENV === 'development') {
            console.error('❌ Profile not found in database after save')
          }
          setError('Profile was not saved to database. Check RLS policies and table setup.')
          setLoading(false)
          return // STAY ON PAGE - don't navigate
        }
        
        verifiedProfile = verifyData
        console.log('✅ Profile verified in database:', verifiedProfile)
      } else {
        console.log('✅ Profile saved successfully:', verifiedProfile)
      }

      // FINAL CHECK: Only proceed to success if we have verified profile data
      if (!verifiedProfile || !verifiedProfile.id) {
        if (process.env.NODE_ENV === 'development') {
          console.error('❌ Cannot proceed - no verified profile data')
        }
        setError('Profile save could not be verified. Please try again.')
        setLoading(false)
        return // STAY ON PAGE - don't navigate
      }

      // Only clear localStorage and navigate if we have confirmed success
      localStorage.removeItem('onboarding_data')
      
      // Navigate to success step ONLY if everything succeeded
      setCurrentStep(9)
      setLoading(false)
      return
    } catch (error) {
      // Only log detailed errors in development
      if (process.env.NODE_ENV === 'development') {
        console.error('Error completing onboarding:', error)
      }
      
      setLoading(false)
      
      // If error occurs, stay on location step and show error message
      // Don't navigate to success - let user see the error and try again
      const errorMessage = error instanceof Error 
        ? error.message 
        : typeof error === 'string' 
          ? error 
          : 'An unexpected error occurred. Please try again.'
      
      setError(errorMessage)
      
      // Save data to localStorage as backup, but don't navigate away
      const allData = { ...data, homebase, originalFrom, distance }
      localStorage.setItem('onboarding_data', JSON.stringify(allData))
      
      // Don't navigate to success or signup - stay on location step so user can see error
      return
    }
  }

  return (
    <div className="bg-white flex flex-col gap-4 items-center justify-center px-4 sm:px-8 md:px-16 lg:px-24 py-12 sm:py-16 md:py-20 lg:py-24 min-h-screen w-full relative">
      <BackButton />
      <div className="flex gap-2 items-center justify-center px-4 py-0 w-full max-w-2xl">
        <h1 className="font-bold leading-[41px] text-[#020202] text-[34px] text-nowrap tracking-[0.374px]">
          Location
        </h1>
      </div>

      <p className="font-normal leading-normal text-[20px] text-black text-center max-w-2xl">
        My homebase is
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 items-center justify-center w-full max-w-md">
        <div className="bg-white border border-[#020202] h-14 relative rounded-[4px] w-full flex items-center">
          <input
            type="text"
            value={homebase}
            onChange={(e) => setHomebase(e.target.value)}
            className="w-full h-full px-4 bg-transparent border-none outline-none text-[#757575] text-base placeholder:text-[#757575]"
            placeholder="Homebase"
            required
          />
        </div>

        <div className="bg-white border border-[#020202] h-14 relative rounded-[4px] w-full flex items-center">
          <input
            type="text"
            value={originalFrom}
            onChange={(e) => setOriginalFrom(e.target.value)}
            className="w-full h-full px-4 bg-transparent border-none outline-none text-[#757575] text-base placeholder:text-[#757575]"
            placeholder="Original from"
          />
        </div>

        <div className="border border-[#020202] rounded-[4px] w-full flex items-center">
          <button
            type="button"
            onClick={handleDecrement}
            className="bg-white p-3 flex items-center justify-center hover:bg-gray-50 transition-colors"
          >
            <svg className="w-6 h-6 text-[#020202]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
          </button>
          
          <div className="flex-1 flex items-center justify-center py-[13px] px-0 min-h-px">
            <span className="font-normal text-[24px] text-black text-center tracking-[-0.32px]">
              {distance} km
            </span>
          </div>
          
          <button
            type="button"
            onClick={handleIncrement}
            className="bg-white p-3 flex items-center justify-center hover:bg-gray-50 transition-colors"
          >
            <svg className="w-6 h-6 text-[#020202]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="w-full max-w-md p-4 bg-red-50 border-2 border-red-400 rounded-[4px] shadow-sm">
            <p className="text-red-700 text-base font-medium">{error}</p>
            {error.includes('sign up or log in') ? (
              <div className="mt-4 flex flex-col gap-2">
                <p className="text-red-600 text-sm">Your information has been saved. Please sign up or log in to complete your profile.</p>
                <div className="flex gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => router.push('/signup')}
                    className="flex-1 bg-[#212121] text-white px-4 py-2 rounded-[4px] hover:bg-[#2a2a2a] transition-colors text-sm font-medium"
                  >
                    Sign Up
                  </button>
                  <button
                    type="button"
                    onClick={() => router.push('/login')}
                    className="flex-1 bg-white border border-[#020202] text-[#020202] px-4 py-2 rounded-[4px] hover:bg-gray-50 transition-colors text-sm font-medium"
                  >
                    Log In
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-red-600 text-sm mt-2">Please fix the issue and try again. Check the browser console for more details.</p>
            )}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !homebase.trim()}
          className="bg-[#212121] flex items-center justify-center px-6 py-4 rounded-[4px] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#2a2a2a] transition-colors w-full"
        >
          <span className="font-medium leading-4 text-base text-white tracking-[1.25px] uppercase">
            {loading ? 'SAVING...' : 'CONTINUE 7/7'}
          </span>
        </button>
      </form>
    </div>
  )
}

