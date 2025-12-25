'use client'

import { useEffect, useRef, useState } from 'react'
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

// Looking for options (what user wants from the app)
// Product constraint: never explicitly position as "dating" to the user.
const LOOKING_FOR_OPTIONS = ['Climbing Partner', 'Crew', 'Meet Climbers'] as const

export default function InterestsStep() {
  const { data, updateData, setCurrentStep } = useOnboarding()
  const [selectedStyles, setSelectedStyles] = useState<string[]>(data.styles || [])
  const [selectedGrade, setSelectedGrade] = useState<Grade | null>(
    (data.grade as Grade) || null
  )
  const [gender, setGender] = useState<'Man' | 'Woman' | 'Other' | null>(
    data.gender === 'Man' || data.gender === 'Woman' || data.gender === 'Other' 
      ? data.gender 
      : null
  )
  const [selectedPurposes, setSelectedPurposes] = useState<string[]>(data.purposes || [])
  const [styleLimitHit, setStyleLimitHit] = useState(false)
  const styleLimitTimerRef = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (styleLimitTimerRef.current !== null) {
        window.clearTimeout(styleLimitTimerRef.current)
      }
    }
  }, [])

  const handleStyleToggle = (style: string) => {
    if (selectedStyles.includes(style)) {
      // Always allow deselection
      setSelectedStyles(selectedStyles.filter(s => s !== style))
    } else {
      // Only allow selection if less than 3 styles are selected
      if (selectedStyles.length < 3) {
        setSelectedStyles([...selectedStyles, style])
        setStyleLimitHit(false)
        if (styleLimitTimerRef.current !== null) {
          window.clearTimeout(styleLimitTimerRef.current)
          styleLimitTimerRef.current = null
        }
      }
      // Show feedback if already at max (3 styles)
      if (selectedStyles.length >= 3) {
        setStyleLimitHit(true)
        if (styleLimitTimerRef.current !== null) {
          window.clearTimeout(styleLimitTimerRef.current)
        }
        styleLimitTimerRef.current = window.setTimeout(() => {
          setStyleLimitHit(false)
          styleLimitTimerRef.current = null
        }, 1500)
      }
    }
  }

  const handleGradeSelect = (grade: Grade) => {
    setSelectedGrade(grade)
  }

  const handleGenderSelect = (value: 'Man' | 'Woman' | 'Other') => {
    setGender(value)
  }

  const handlePurposeToggle = (purpose: string) => {
    setSelectedPurposes(prev =>
      prev.includes(purpose)
        ? prev.filter(p => p !== purpose)
        : [...prev, purpose]
    )
  }

  const handleContinue = () => {
    updateData({
      styles: selectedStyles,
      grade: selectedGrade || undefined,
      gender: gender || undefined,
      purposes: selectedPurposes
    })
    setCurrentStep(3)
  }

  const isValid = selectedStyles.length > 0 && selectedPurposes.length > 0 && gender !== null

  return (
    <div 
      className="onb-screen"
      data-name="onboarding / step2 / climbing"
      data-node-id="483:764"
    >
      {/* BACKGROUND LAYERS - Static background only */}
      <div aria-hidden="true" className="onb-bg-layers">
        <div className="onb-bg-base" />
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
              
              {/* Gender field */}
              <div className="onb-field" data-node-id="gender-field">
                <label className="onb-label">Gender</label>
                <div className="onb-gender-select" data-node-id="gender-select">
                  <button
                    type="button"
                    className={`onb-gender-btn ${gender === 'Man' ? 'onb-gender-btn-active' : ''}`}
                    onClick={() => handleGenderSelect('Man')}
                  >
                    Male
                  </button>
                  <button
                    type="button"
                    className={`onb-gender-btn ${gender === 'Woman' ? 'onb-gender-btn-active' : ''}`}
                    onClick={() => handleGenderSelect('Woman')}
                  >
                    Female
                  </button>
                  <button
                    type="button"
                    className={`onb-gender-btn ${gender === 'Other' ? 'onb-gender-btn-active' : ''}`}
                    onClick={() => handleGenderSelect('Other')}
                  >
                    Other
                  </button>
                </div>
              </div>

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
                {styleLimitHit && (
                  <p className="onb-header-subtitle" style={{ color: 'var(--color-red)', marginTop: 'var(--space-xxs)' }}>
                    Max 3 styles.
                  </p>
                )}
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

              {/* Looking for field */}
              <div className="onb-field" data-node-id="looking-for-field">
                <label className="onb-label">Looking for</label>
                <p className="onb-header-subtitle" style={{ marginTop: 'var(--space-xxs)' }}>
                  What brings you here? Select all that apply.
                </p>
                {/* Looking for select grid - flex-wrap with gap 6px */}
                <div className="onb-style-grid" data-node-id="looking-for-grid">
                  {LOOKING_FOR_OPTIONS.map((purpose) => {
                    const isSelected = selectedPurposes.includes(purpose)
                    return (
                      <button
                        key={purpose}
                        type="button"
                        className={`onb-style-btn ${isSelected ? 'onb-style-btn-active' : ''}`}
                        onClick={() => handlePurposeToggle(purpose)}
                        data-node-id={`purpose-${purpose}`}
                      >
                        {purpose}
                      </button>
                    )
                  })}
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
                Continue 2/4
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
