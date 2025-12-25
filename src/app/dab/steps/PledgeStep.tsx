'use client'

import { useState } from 'react'
import { useOnboarding } from '@/contexts/OnboardingContext'
import { supabase } from '@/lib/supabaseClient'
import { upsertOnboardingProfile, uploadImageToStorage } from '@/lib/profileUtils'
import { logSignupEvent } from '@/lib/analytics'

/**
 * Onboarding Step 4: Pledge
 * Figma node: 484-1266
 * 
 * LAYOUT FROM FIGMA:
 * - Content: flex flex-col justify-between p-[16px]
 * - Card contains: logo, headline, subtitle, pledge cards, CTA
 * - Logo is INSIDE the card (not outside like other steps)
 * - Headline: "LAST STEP!" (40px Inter Extra Bold Italic, cyan)
 * - Subtitle: "Commit to the crew." / "You are what you create." (16px Inter Medium)
 */

type PledgeItem = {
  id: string
  title: string
  description: string
}

const PLEDGES: PledgeItem[] = [
  {
    id: 'fun',
    title: 'Have F*** fun',
    description: 'We are about Stoke. Be helpful. Be Awesome. Be someone you\'d want to climb with. Be the crew. Have F*** fun!',
  },
  {
    id: 'respect',
    title: 'Respect other climbers',
    description: 'Respect for the wall, the crew, and the vibe. No judgment, honor boundaries, and include all experience levels.',
  },
  {
    id: 'notrash',
    title: 'No trash',
    description: 'No trash, no ego, no ghosting. Just good climbs and good people. Pack it in, pack it out. Spot your partner. Listen to locals. Respect the crew.',
  },
]

export default function PledgeStep() {
  const { data, updateData, setCurrentStep, startTime } = useOnboarding()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const handleContinue = async () => {
    if (!supabase) {
      setSubmitError('Supabase not configured')
      return
    }

    // Validate required fields
    if (!data.homebase || data.homebase.trim() === '') {
      setSubmitError('Homebase is required')
      return
    }

    setIsSubmitting(true)
    setSubmitError(null)

    try {
      // Get current user
      const { safeGetUser } = await import('@/lib/authUtils')
      const { user, error: userError } = await safeGetUser(supabase)
      
      if (userError || !user) {
        setSubmitError('Please sign in to continue')
        setIsSubmitting(false)
        return
      }

      // Upload image if there's a file
      let photoUrl = data.photo
      if (data.photos && data.photos.length > 0) {
        const firstPhoto = data.photos[0]
        if (firstPhoto instanceof File) {
          const uploadedUrl = await uploadImageToStorage(supabase, user.id, firstPhoto)
          if (uploadedUrl) {
            photoUrl = uploadedUrl
            // Update photos array with uploaded URL
            const updatedPhotos = [uploadedUrl, ...data.photos.slice(1).filter((p): p is string => typeof p === 'string')]
            updateData({ photo: uploadedUrl, photos: updatedPhotos })
          }
        } else if (typeof firstPhoto === 'string') {
          photoUrl = firstPhoto
        }
      }

      // Prepare final data with uploaded photo
      const finalData = {
        ...data,
        photo: photoUrl,
        pledgeAccepted: true,
      }

      // Submit to Supabase
      const { error } = await upsertOnboardingProfile(supabase, user.id, finalData)

      if (error) {
        console.error('Error saving profile:', error)
        setSubmitError(error.message || 'Failed to save profile')
        setIsSubmitting(false)
        return
      }

      // Log analytics event
      try {
        const completionTimeMs = Date.now() - startTime
        const completionTimeSeconds = Math.floor(completionTimeMs / 1000)
        
        await logSignupEvent(user.id, {
          onboarding_step: 4,
          completion_time_seconds: completionTimeSeconds,
          acquisition_source: 'organic', // Default for now
          gyms_count: data.gym?.filter(id => id !== 'outside').length || 0,
          climbing_styles: data.styles || [],
          looking_for: data.purposes || [],
          // Metadata for Phase 1 as requested in TICKET-ONB-001
          ...({
            onboarding_version: 'v2-optimized',
            total_duration_ms: completionTimeMs,
          } as any)
        })
      } catch (analyticsError) {
        console.warn('Failed to log signup event:', analyticsError)
      }

      // Update context and proceed to success step
      updateData({ pledgeAccepted: true })
      setCurrentStep(5) // Go to Success step
    } catch (error: any) {
      console.error('Error submitting onboarding:', error)
      setSubmitError(error.message || 'An error occurred')
      setIsSubmitting(false)
    }
  }

  return (
    <div
      className="onb-screen"
      data-name="onboarding / step4 / pledge"
      data-node-id="484:1266"
    >
      {/* BACKGROUND LAYERS - Static background only (video removed for FCP) */}
      <div aria-hidden="true" className="onb-bg-layers">
        <div className="onb-bg-base" />
        <div className="onb-bg-gradient" />
      </div>

      {/* CONTENT - card floats to bottom */}
      <div className="onb-content-step1-new onb-content-step5" data-node-id="484:1267">
        
        {/* CARD - contains logo, headline, subtitle, pledges, CTA */}
        <div className="onb-signup-card" data-node-id="484:1268">
          <div className="onb-signup-inner onb-pledge-inner-container">
            
            {/* DAB Logo - INSIDE card, 76x43px white */}
            <div className="onb-step1-logo" data-node-id="534:815">
              <img src="/dab-logo.svg" alt="DAB" className="onb-step1-logo-img" />
            </div>
            
            {/* Header - text-center py-[10px] gap-[8px] */}
            <div className="onb-pledge-header" data-node-id="484:1269">
              {/* Headline - 40px Inter Extra Bold Italic var(--color-primary) */}
              <h2 className="onb-pledge-headline" data-node-id="484:1270">LAST STEP!</h2>
              {/* Subtitle - 16px Inter Medium var(--color-text) */}
              <p className="onb-pledge-subtitle" data-node-id="484:1271">
                Commit to the crew.<br />
                You are what you create.
              </p>
            </div>

            {/* Pledge content - display all pledges as text */}
            <div className="onb-pledge-list" style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-md)'
            }}>
              {PLEDGES.map((pledge) => (
                <div key={pledge.id} style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--space-xs)'
                }}>
                  <h3 className="onb-pledge-item-title" data-node-id={`title-${pledge.id}`}>
                    {pledge.title}
                  </h3>
                  <p className="onb-pledge-item-desc" data-node-id={`desc-${pledge.id}`}>
                    {pledge.description}
                  </p>
                </div>
              ))}
            </div>

            {/* Error message */}
            {submitError && (
              <div className="onb-error-message" style={{ color: 'var(--color-red)', fontSize: 'var(--font-size-md)', textAlign: 'center', marginTop: 'var(--space-sm)' }}>
                {submitError}
              </div>
            )}

            {/* Agreement text */}
            <p className="onb-header-subtitle" style={{ 
              marginTop: 'var(--space-md)', 
              textAlign: 'center',
              fontSize: 'var(--font-size-xs)'
            }}>
              By continuing, you agree to commit to the crew and these community values.
            </p>

            {/* CTA row - Single tap opt-in */}
            <div className="onb-cta-row" data-node-id="484:1287">
              <button
                type="button"
                className="onb-cta-btn"
                onClick={handleContinue}
                disabled={isSubmitting}
                data-node-id="484:1288"
              >
                {isSubmitting ? 'Saving...' : 'I Agree & Finish'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

