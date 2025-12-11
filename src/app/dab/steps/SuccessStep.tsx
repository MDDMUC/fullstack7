'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useOnboarding } from '@/contexts/OnboardingContext'
import { supabase } from '@/lib/supabaseClient'

/**
 * Onboarding Step 6 (Final): Success / Welcome to the Crew
 * Figma node: 484-1457
 * 
 * Features:
 * - Celebratory animations for headline
 * - Confetti effect
 * - Auto-redirect after 5 seconds to /home
 */

export default function SuccessStep() {
  const router = useRouter()
  const { reset } = useOnboarding()
  const [confetti, setConfetti] = useState<Array<{
    id: number
    x: number
    y: number
    color: string
    delay: number
    drift: number
  }>>([])

  // Create confetti on mount
  useEffect(() => {
    const colors = [
      'var(--color-primary)',
      'var(--color-secondary)',
      'var(--color-text-white)',
      'color-mix(in srgb, var(--color-text-white) 70%, transparent)',
    ]
    const confettiPieces = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: -10,
      color: colors[Math.floor(Math.random() * colors.length)],
      delay: Math.random() * 0.5,
      drift: (Math.random() - 0.5) * 2, // -1 to 1 for left/right drift
    }))
    setConfetti(confettiPieces)
  }, [])

  // Auto-redirect after 5 seconds
  useEffect(() => {
    const timer = setTimeout(async () => {
      // Ensure user is logged in before redirecting
      if (supabase) {
        const { safeGetUser } = await import('@/lib/authUtils')
        const { user } = await safeGetUser(supabase)
        
        if (user) {
          reset()
          router.push('/home')
        } else {
          // If not logged in, redirect to signup
          reset()
          router.push('/signup')
        }
      } else {
        reset()
        router.push('/home')
      }
    }, 5000)

    return () => clearTimeout(timer)
  }, [router, reset])

  const handleContinue = () => {
    reset()
    router.push('/home')
  }

  return (
    <div
      className="onb-screen"
      data-name="onboarding / step7 / success"
      data-node-id="484:1457"
    >
      {/* BACKGROUND LAYERS */}
      <div aria-hidden="true" className="onb-bg-layers">
        <div className="onb-bg-base" />
        <video
          className="onb-bg-video onb-bg-video-success"
          autoPlay
          loop
          muted
          playsInline
          poster="/hero-main.jpg"
        >
          <source src="/008.mp4" type="video/mp4" />
        </video>
        <div className="onb-bg-gradient" />
      </div>

      {/* Confetti */}
      <div className="onb-confetti-container" aria-hidden="true">
        {confetti.map((piece) => (
          <div
            key={piece.id}
            className="onb-confetti-piece"
            style={{
              left: `${piece.x}%`,
              backgroundColor: piece.color,
              animationDelay: `${piece.delay}s`,
              '--drift': piece.drift,
            } as React.CSSProperties}
          />
        ))}
      </div>

      {/* CONTENT - gap-[44px] justify-end */}
      <div className="onb-content-success-new" data-node-id="484:1458">
        
        {/* Headline section - pt-[60px] gap-[12px] items-center */}
        <div className="onb-success-headline-new" data-node-id="486:1639">
          {/* DAB Logo - 80x45px white (slightly larger) */}
          <div className="onb-success-logo onb-success-logo-animate" data-node-id="486:1625">
            <img src="/dab-logo.svg" alt="DAB" className="onb-success-logo-img" />
          </div>
          
          {/* Headline - 52px Inter Extra Bold Italic #5ce1e6 */}
          <h1 className="onb-success-title onb-success-title-animate" data-node-id="484:1461">
            WELCOME TO THE CREW
          </h1>
          
          {/* Subtitle - 16px Inter Medium #E0E0E0 (greys/300) */}
          <p className="onb-success-subtitle-new onb-success-subtitle-animate" data-node-id="484:1462">
            Hell Yeah.
          </p>
        </div>

        {/* CTA Card at bottom */}
        <div className="onb-signup-card onb-success-card-animate" data-node-id="484:1459">
          <div className="onb-signup-inner">
            <div className="onb-cta-row" data-node-id="484:1466">
              <button
                type="button"
                className="onb-cta-btn"
                onClick={handleContinue}
                data-node-id="484:1467"
              >
                YAY!
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
