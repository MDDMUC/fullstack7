'use client'

import { useState } from 'react'
import { useOnboarding } from '@/contexts/OnboardingContext'

/**
 * Onboarding Step 4: Availability Vibe
 * Figma node: 483-928
 * 
 * LAYOUT FROM FIGMA:
 * - Content: flex flex-col justify-between p-[16px]
 * - Text block: at TOP with pt-[44px] pb-[10px] gap-[8px], contains logo + title + subtitle
 * - Card: at BOTTOM, contains form elements
 * 
 * EXACT VALUES FROM FIGMA:
 * - Time buttons: gap-[4px] (space/xxs), min-w-[100px]
 * - Day buttons: gap-[6px] (space/xs)
 */

const TIME_OPTIONS = ['Early', 'Morning', 'Midday', 'Afternoon', 'Evening', 'Night'] as const
const DAY_OPTIONS = ['Weekend', 'Weekday'] as const

export default function AvailabilityStep() {
  const { data, updateData, setCurrentStep } = useOnboarding()
  const [selectedTimes, setSelectedTimes] = useState<string[]>(
    data.availability?.filter(a => TIME_OPTIONS.includes(a as typeof TIME_OPTIONS[number])) || []
  )
  const [selectedDays, setSelectedDays] = useState<string[]>(
    data.availability?.filter(a => DAY_OPTIONS.includes(a as typeof DAY_OPTIONS[number])) || []
  )

  const handleTimeToggle = (time: string) => {
    setSelectedTimes(prev =>
      prev.includes(time)
        ? prev.filter(t => t !== time)
        : [...prev, time]
    )
  }

  const handleDayToggle = (day: string) => {
    setSelectedDays(prev =>
      prev.includes(day)
        ? prev.filter(d => d !== day)
        : [...prev, day]
    )
  }

  const handleContinue = () => {
    // Combine times and days into availability array
    updateData({ availability: [...selectedTimes, ...selectedDays] })
    setCurrentStep(5)
  }

  return (
    <div
      className="onb-screen"
      data-name="onboarding / step4 / availability vibe"
      data-node-id="483:928"
    >
      {/* BACKGROUND LAYERS */}
      <div aria-hidden="true" className="onb-bg-layers">
        <div className="onb-bg-base" />
        <video
          className="onb-bg-video onb-bg-video-step4"
          autoPlay
          loop
          muted
          playsInline
          poster="/hero-main.jpg"
        >
          <source src="/010.mp4" type="video/mp4" />
        </video>
        <div className="onb-bg-gradient" />
      </div>

      {/* CONTENT - justify-between puts text at top, card at bottom */}
      <div className="onb-content-step1-new" data-node-id="483:929">
        
        {/* TEXT BLOCK - at TOP with safe area padding */}
        <div className="onb-step1-textblock" data-node-id="529:805">
          {/* DAB Logo - 76x43px white */}
          <div className="onb-step1-logo" data-node-id="529:806">
            <img src="/dab-logo.svg" alt="DAB" className="onb-step1-logo-img" />
          </div>
          
          {/* Title - 52px Inter Extra Bold Italic var(--color-primary) */}
          <h1 className="onb-step1-title" data-node-id="529:807">
            MAKE IT EASY!
          </h1>
          
          {/* Subtitle - 16px Inter Medium var(--color-text) */}
          <p className="onb-step1-subtitle" data-node-id="529:808">
            ... for others to know when you go.
          </p>
        </div>

        {/* SIGNUP CARD - at BOTTOM */}
        <div className="onb-signup-card" data-node-id="483:930">
          <div className="onb-signup-inner">
            
            {/* Header */}
            <div className="onb-header-block" data-node-id="483:931">
              <h2 className="onb-header-title" data-node-id="483:932">Availability</h2>
              <p className="onb-header-subtitle" data-node-id="483:933">
                Your top times. Easier to connect when people know when you usually go.
              </p>
            </div>

            {/* Field row */}
            <div className="onb-field-row" data-node-id="483:934">
              
              {/* Time of day field */}
              <div className="onb-field" data-node-id="483:935">
                <label className="onb-label" data-node-id="483:936">Time of day</label>
                {/* Select grid - flex-wrap gap-[4px] min-w-[100px] */}
                <div className="onb-time-grid" data-node-id="483:937">
                  {TIME_OPTIONS.map((time) => {
                    const isSelected = selectedTimes.includes(time)
                    return (
                      <button
                        key={time}
                        type="button"
                        className={`onb-time-btn ${isSelected ? 'onb-time-btn-active' : ''}`}
                        onClick={() => handleTimeToggle(time)}
                        data-node-id={`time-${time}`}
                      >
                        {time}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Days field */}
              <div className="onb-field" data-node-id="483:944">
                <label className="onb-label" data-node-id="483:945">Days</label>
                {/* Select row - flex gap-[6px] */}
                <div className="onb-days-grid" data-node-id="483:946">
                  {DAY_OPTIONS.map((day) => {
                    const isSelected = selectedDays.includes(day)
                    return (
                      <button
                        key={day}
                        type="button"
                        className={`onb-day-btn ${isSelected ? 'onb-day-btn-active' : ''}`}
                        onClick={() => handleDayToggle(day)}
                        data-node-id={`day-${day}`}
                      >
                        {day}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* CTA row */}
            <div className="onb-cta-row" data-node-id="483:949">
              <button
                type="button"
                className="onb-cta-btn"
                onClick={handleContinue}
                data-node-id="483:950"
              >
                Continue 4/5
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

