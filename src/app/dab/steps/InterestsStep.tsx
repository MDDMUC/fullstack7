'use client'

import { useState } from 'react'
import { useOnboarding } from '@/contexts/OnboardingContext'

/**
 * Onboarding Step 2: Climbing Stuffs
 * Figma node: 483-764
 * 
 * LAYOUT FROM FIGMA:
 * - Content: flex flex-col justify-between p-[16px]
 * - Text block: at TOP with pt-[44px] pb-[10px] gap-[8px], contains logo + title + subtitle
 * - Card: at BOTTOM, contains form elements
 */

// Climbing styles from Figma - exact order
const CLIMBING_STYLES = [
  'Bouldering',
  'Sport',
  'Comps',
  'Board',
  'Multipitch',
  'Alpine',
  'Ice',
  'Trad',
  'Training',
  'Mountaineering',
]

// Grade options from Figma
const GRADES = ['Beginner', 'Mediate', 'Advanced'] as const
type Grade = typeof GRADES[number]

export default function InterestsStep() {
  const { data, updateData, setCurrentStep } = useOnboarding()
  const [selectedStyles, setSelectedStyles] = useState<string[]>(data.styles || [])
  const [selectedGrade, setSelectedGrade] = useState<Grade | null>(
    (data.grade as Grade) || null
  )

  const handleStyleToggle = (style: string) => {
    const newSelected = selectedStyles.includes(style)
      ? selectedStyles.filter(s => s !== style)
      : [...selectedStyles, style]
    setSelectedStyles(newSelected)
  }

  const handleGradeSelect = (grade: Grade) => {
    setSelectedGrade(grade)
  }

  const handleContinue = () => {
    updateData({ 
      styles: selectedStyles, 
      grade: selectedGrade || undefined 
    })
    setCurrentStep(3)
  }

  const isValid = selectedStyles.length > 0

  return (
    <div 
      className="onb-screen"
      data-name="onboarding / step2 / climbing"
      data-node-id="483:764"
    >
      {/* BACKGROUND LAYERS */}
      <div aria-hidden="true" className="onb-bg-layers">
        <div className="onb-bg-base" />
        <video
          className="onb-bg-video onb-bg-video-step2"
          autoPlay
          loop
          muted
          playsInline
          poster="/hero-main.jpg"
        >
          <source src="/007.mp4" type="video/mp4" />
        </video>
        <div className="onb-bg-gradient" />
      </div>

      {/* CONTENT - justify-between puts text at top, card at bottom */}
      <div className="onb-content-step1-new" data-node-id="483:765">
        
        {/* TEXT BLOCK - at TOP with safe area padding */}
        <div className="onb-step1-textblock" data-node-id="529:797">
          {/* DAB Logo - 76x43px white */}
          <div className="onb-step1-logo" data-node-id="529:798">
            <img src="/dab-logo.svg" alt="DAB" className="onb-step1-logo-img" />
          </div>
          
          {/* Title - 52px Inter Extra Bold Italic var(--color-primary) */}
          <h1 className="onb-step1-title" data-node-id="529:799">
            WHAT'S YOUR DEAL?
          </h1>
          
          {/* Subtitle - 16px Inter Medium var(--color-text) */}
          <p className="onb-step1-subtitle" data-node-id="529:800">
            Three max. Be honest.
          </p>
        </div>

        {/* SIGNUP CARD - at BOTTOM */}
        <div className="onb-signup-card" data-node-id="483:766">
          <div className="onb-signup-inner">
            
            {/* Header */}
            <div className="onb-header-block" data-node-id="483:767">
              <h2 className="onb-header-title" data-node-id="483:768">Climbing Stuffs</h2>
              <p className="onb-header-subtitle" data-node-id="483:769">
                Your top styles. Grampas old boots in the basement don't count as Mountaineering.
              </p>
            </div>

            {/* Field row */}
            <div className="onb-field-row" data-node-id="483:773">
              
              {/* Climbing Style field */}
              <div className="onb-field" data-node-id="483:774">
                <label className="onb-label" data-node-id="483:775">Climbing Style</label>
                {/* Style select grid - flex-wrap with gap 6px */}
                <div className="onb-style-grid" data-node-id="483:809">
                  {CLIMBING_STYLES.map((style) => {
                    const isSelected = selectedStyles.includes(style)
                    return (
                      <button
                        key={style}
                        type="button"
                        className={`onb-style-btn ${isSelected ? 'onb-style-btn-active' : ''}`}
                        onClick={() => handleStyleToggle(style)}
                        data-node-id={`style-${style}`}
                      >
                        {style}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Grade field */}
              <div className="onb-field" data-node-id="483:777">
                <label className="onb-label" data-node-id="483:778">Grade</label>
                {/* Grade select row - 3 equal-width buttons */}
                <div className="onb-gender-select" data-node-id="483:779">
                  {GRADES.map((grade) => (
                    <button
                      key={grade}
                      type="button"
                      className={`onb-gender-btn ${selectedGrade === grade ? 'onb-gender-btn-active' : ''}`}
                      onClick={() => handleGradeSelect(grade)}
                      data-node-id={`grade-${grade}`}
                    >
                      {grade}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* CTA row */}
            <div className="onb-cta-row" data-node-id="483:783">
              <button
                type="button"
                className="onb-cta-btn"
                onClick={handleContinue}
                disabled={!isValid}
                data-node-id="483:784"
              >
                Continue 2/5
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

