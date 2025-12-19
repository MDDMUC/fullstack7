'use client'

import { useState, useRef } from 'react'
import { useOnboarding } from '@/contexts/OnboardingContext'

/**
 * Onboarding Step 1: Basic Profile
 * Figma node: 482-1122
 * 
 * LAYOUT FROM FIGMA:
 * - Content: flex flex-col justify-between p-[16px]
 * - Text block: at TOP with pt-[44px] pb-[10px] gap-[8px], contains logo + title + subtitle
 * - Card: at BOTTOM, contains form elements
 */

export default function BasicProfileStep() {
  const { data, updateData, setCurrentStep } = useOnboarding()
  const [name, setName] = useState(data.username || '')
  const [age, setAge] = useState(data.age || '')
  const [gender, setGender] = useState<'Man' | 'Woman' | 'Other' | null>(
    data.gender === 'Man' || data.gender === 'Woman' || data.gender === 'Other' 
      ? data.gender 
      : null
  )
  const [imagePreview, setImagePreview] = useState<string | null>(
    typeof data.photo === 'string' ? data.photo : null
  )
  const [imageFile, setImageFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageClick = () => {
    fileInputRef.current?.click()
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onload = (ev) => {
        setImagePreview(ev.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleGenderSelect = (value: 'Man' | 'Woman' | 'Other') => {
    setGender(value)
  }

  const handleContinue = () => {
    updateData({
      username: name.trim(),
      age: age,
      gender: gender || undefined,
      photo: imagePreview || undefined,
      photos: imageFile ? [imageFile, ...(data.photos || [])] : data.photos,
    })
    setCurrentStep(2)
  }

  const isValid = name.trim() !== '' && age.trim() !== '' && gender !== null && imagePreview !== null

  return (
    <div 
      className="onb-screen"
      data-name="onboarding / step1 / basic profile"
      data-node-id="482:1122"
    >
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageChange}
        style={{ display: 'none' }}
      />

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

      {/* CONTENT - justify-between puts text at top, card at bottom */}
      <div className="onb-content-step1-new" data-node-id="482:1124">
        
        {/* TEXT BLOCK - at TOP with safe area padding */}
        <div className="onb-step1-textblock" data-node-id="516:238">
          {/* DAB Logo - 76x43px white */}
          <div className="onb-step1-logo" data-node-id="528:784">
            <img src="/dab-logo.svg" alt="DAB" className="onb-step1-logo-img" />
          </div>
          
          {/* Title - 52px Inter Extra Bold Italic #5ce1e6 - TWO LINES */}
          <h1 className="onb-step1-title" data-node-id="516:239">
            LET'S<br />GOOOO!
          </h1>
          
          {/* Subtitle - 16px Inter Medium #e9eef7 */}
          <p className="onb-step1-subtitle" data-node-id="528:789">
            Only takes one minute.
          </p>
        </div>

        {/* SIGNUP CARD - at BOTTOM */}
        <div className="onb-signup-card" data-node-id="482:1308">
          <div className="onb-signup-inner">
            
            {/* Header */}
            <div className="onb-header-block" data-node-id="482:1309">
              <h2 className="onb-header-title" data-node-id="482:1310">The Basics</h2>
              <p className="onb-header-subtitle" data-node-id="482:1311">We only share data that you agreed to.</p>
            </div>

            {/* Avatar Upload */}
            <div 
              className="onb-avatar-upload"
              onClick={handleImageClick}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && handleImageClick()}
              data-node-id="482:1254"
            >
              <div className="onb-avatar-upload-inner">
                {imagePreview ? (
                  <img src={imagePreview} alt="Profile" className="onb-avatar-preview" />
                ) : (
                  <div className="onb-avatar-placeholder" data-node-id="482:1351">
                    <span className="onb-avatar-text" data-node-id="I486:1591;475:11343">
                      Upload an Image
                    </span>
                  </div>
                )}
              </div>
              <div className="onb-avatar-shadow" />
            </div>

            {/* Field row */}
            <div className="onb-field-row" data-node-id="482:1312">
              
              {/* Name and Age row - side by side */}
              <div className="onb-name-age-row" data-node-id="540:831">
                {/* Name field */}
                <div className="onb-field onb-field-half" data-node-id="482:1318">
                  <label className="onb-label" data-node-id="482:1319">Name</label>
                  <div className="onb-input-wrapper" data-node-id="482:1320">
                    <input
                      type="text"
                      className="onb-input"
                      placeholder="Your name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      data-node-id="I482:1320;475:11322"
                    />
                  </div>
                </div>

                {/* Age field */}
                <div className="onb-field onb-field-half" data-node-id="540:826">
                  <label className="onb-label" data-node-id="540:827">Age</label>
                  <div className="onb-input-wrapper" data-node-id="540:828">
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      className="onb-input"
                      placeholder="Your age"
                      value={age}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '').slice(0, 2)
                        setAge(val)
                      }}
                      data-node-id="I540:828;475:11322"
                    />
                  </div>
                </div>
              </div>

              {/* Gender field */}
              <div className="onb-field" data-node-id="482:1321">
                <label className="onb-label" data-node-id="482:1322">Gender</label>
                <div className="onb-gender-select" data-node-id="483:763">
                  <button
                    type="button"
                    className={`onb-gender-btn ${gender === 'Man' ? 'onb-gender-btn-active' : ''}`}
                    onClick={() => handleGenderSelect('Man')}
                    data-node-id="482:1323"
                  >
                    Male
                  </button>
                  <button
                    type="button"
                    className={`onb-gender-btn ${gender === 'Woman' ? 'onb-gender-btn-active' : ''}`}
                    onClick={() => handleGenderSelect('Woman')}
                    data-node-id="483:755"
                  >
                    Female
                  </button>
                  <button
                    type="button"
                    className={`onb-gender-btn ${gender === 'Other' ? 'onb-gender-btn-active' : ''}`}
                    onClick={() => handleGenderSelect('Other')}
                    data-node-id="483:759"
                  >
                    Other
                  </button>
                </div>
              </div>
            </div>

            {/* CTA row */}
            <div className="onb-cta-row" data-node-id="482:1331">
              <button
                type="button"
                className="onb-cta-btn"
                onClick={handleContinue}
                disabled={!isValid}
                data-node-id="482:1332"
              >
                Continue 1/5
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
