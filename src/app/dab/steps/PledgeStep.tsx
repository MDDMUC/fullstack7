'use client'

import { useState } from 'react'
import { useOnboarding } from '@/contexts/OnboardingContext'
import { supabase } from '@/lib/supabaseClient'
import { upsertOnboardingProfile, uploadImageToStorage } from '@/lib/profileUtils'

/**
 * Onboarding Step 5: Pledge
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
  const { data, updateData, setCurrentStep } = useOnboarding()
  const [agreedPledges, setAgreedPledges] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const handlePledgeToggle = (pledgeId: string) => {
    setAgreedPledges(prev =>
      prev.includes(pledgeId)
        ? prev.filter(id => id !== pledgeId)
        : [...prev, pledgeId]
    )
  }

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

      // Update context and proceed to success step
      updateData({ pledgeAccepted: true })
      setCurrentStep(6) // Go to Success step
    } catch (error: any) {
      console.error('Error submitting onboarding:', error)
      setSubmitError(error.message || 'An error occurred')
      setIsSubmitting(false)
    }
  }

  const allAgreed = agreedPledges.length === PLEDGES.length

  return (
    <div
      className="onb-screen"
      data-name="onboarding / step5 / pledge"
      data-node-id="484:1266"
    >
      {/* BACKGROUND LAYERS */}
      <div aria-hidden="true" className="onb-bg-layers">
        <div className="onb-bg-base" />
        <video
          className="onb-bg-video"
          autoPlay
          loop
          muted
          playsInline
          poster="/hero-main.jpg"
        >
          <source src="/001.mp4" type="video/mp4" />
        </video>
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
              {/* Headline - 40px Inter Extra Bold Italic #5ce1e6 */}
              <h2 className="onb-pledge-headline" data-node-id="484:1270">LAST STEP!</h2>
              {/* Subtitle - 16px Inter Medium #e9eef7 */}
              <p className="onb-pledge-subtitle" data-node-id="484:1271">
                Commit to the crew.<br />
                You are what you create.
              </p>
            </div>

            {/* Pledge cards */}
            {PLEDGES.map((pledge) => {
              const isAgreed = agreedPledges.includes(pledge.id)
              return (
                <button
                  key={pledge.id}
                  type="button"
                  className={`onb-pledge-card ${isAgreed ? 'onb-pledge-card-active' : ''}`}
                  onClick={() => handlePledgeToggle(pledge.id)}
                  data-node-id={`pledge-${pledge.id}`}
                >
                  <div className="onb-pledge-inner">
                    {/* Checkbox circle */}
                    <div className="onb-pledge-checkbox" data-node-id={`checkbox-${pledge.id}`}>
                      <svg
                        width="20"
                        height="44"
                        viewBox="0 0 20 44"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <circle
                          cx="10"
                          cy="22"
                          r="9"
                          stroke={isAgreed ? 'var(--color-primary)' : 'var(--color-stroke)'}
                          strokeWidth="2"
                          fill={isAgreed ? 'rgba(92, 225, 230, 0.1)' : 'transparent'}
                        />
                        {isAgreed && (
                          <path
                            d="M6 22L9 25L14 19"
                            stroke="var(--color-primary)"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        )}
                      </svg>
                    </div>
                    
                    {/* Right content - py-[10px] gap-[8px] */}
                    <div className="onb-pledge-content" data-node-id={`content-${pledge.id}`}>
                      <h3 className="onb-pledge-item-title" data-node-id={`title-${pledge.id}`}>
                        {pledge.title}
                      </h3>
                      <p className="onb-pledge-item-desc" data-node-id={`desc-${pledge.id}`}>
                        {pledge.description}
                      </p>
                      <span className="onb-pledge-tap" data-node-id={`tap-${pledge.id}`}>
                        Tap to agree (required)
                      </span>
                    </div>
                  </div>
                </button>
              )
            })}

            {/* Error message */}
            {submitError && (
              <div className="onb-error-message" style={{ color: 'var(--color-red)', fontSize: 'var(--font-size-md)', textAlign: 'center', marginTop: 'var(--space-sm)' }}>
                {submitError}
              </div>
            )}

            {/* CTA row */}
            <div className="onb-cta-row" data-node-id="484:1287">
              <button
                type="button"
                className="onb-cta-btn"
                onClick={handleContinue}
                disabled={!allAgreed || isSubmitting}
                data-node-id="484:1288"
              >
                {isSubmitting ? 'Saving...' : 'Continue 5/5'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
