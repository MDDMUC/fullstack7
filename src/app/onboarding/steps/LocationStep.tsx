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
        const allData = { ...data, homebase, originalFrom, distance }
        localStorage.setItem('onboarding_data', JSON.stringify(allData))
        router.push('/signup')
        return
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
        console.log('User not authenticated - saving to localStorage and redirecting to signup')
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
        
        // Show message and redirect to signup
        setError('Please sign up or log in to complete your profile. Your information has been saved and will be applied after you create an account.')
        setLoading(false)
        
        // Redirect to signup immediately
        router.push('/signup')
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

      console.log('Saving profile data:', { ...profileData, photos: profileData.photos ? 'JSON string' : null })
      
      const { data: savedData, error: profileError } = await supabase
        .from('profiles')
        .upsert(profileData, { onConflict: 'id' })
        .select()

      if (profileError) {
        console.error('Error saving profile:', profileError)
        console.error('Profile data attempted:', profileData)
        setError(`Failed to save profile: ${profileError.message}. Check console for details.`)
        setLoading(false)
        // Don't continue to success if save failed
        return
      }

      console.log('Profile saved successfully:', savedData)

      // Verify the data was actually saved
      if (!savedData || savedData.length === 0) {
        console.warn('Profile upsert returned no data - profile might not have been saved')
        setError('Profile might not have been saved. Please check your Supabase setup.')
        setLoading(false)
        return
      }

      // Clear onboarding data
      localStorage.removeItem('onboarding_data')
      
      // Navigate to success step immediately
      setCurrentStep(9)
      setLoading(false)
      return
    } catch (error) {
      console.error('Error completing onboarding:', error)
      setLoading(false)
      
      // If error occurs, still try to show success if data was saved
      // Otherwise redirect to signup if not authenticated
      const allData = { ...data, homebase, originalFrom, distance }
      localStorage.setItem('onboarding_data', JSON.stringify(allData))
      
      // Check if we have a user (data might have been saved)
      try {
        if (supabase) {
          const { data: { user } } = await supabase.auth.getUser()
          if (user) {
            // User is authenticated, go to success step
            setCurrentStep(9)
            return
          }
        }
      } catch {
        // Fall through to signup redirect
      }
      
      router.push('/signup')
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
          <div className="w-full p-4 bg-red-50 border border-red-200 rounded-[4px]">
            <p className="text-red-600 text-sm">{error}</p>
            <p className="text-red-500 text-xs mt-2">Check the browser console for more details.</p>
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

