'use client'

import { FormEvent, useState } from 'react'
import { useOnboarding } from '@/contexts/OnboardingContext'
import BackButton from '../components/BackButton'

export default function NameAgeGenderStep() {
  const { data, updateData, setCurrentStep } = useOnboarding()
  const [age, setAge] = useState(data.age || '')
  const [gender, setGender] = useState<'Man' | 'Woman' | 'Other' | "Won't say" | ''>(data.gender || '')
  const [bio, setBio] = useState(data.bio || '')

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!age.trim() || !gender) return

    updateData({ age, gender: gender as 'Man' | 'Woman' | 'Other', bio })
    setCurrentStep(3)
  }

  return (
    <div
      className="onboard-screen flex flex-col gap-6 items-center justify-start px-4 sm:px-8 md:px-16 lg:px-24 py-10 sm:py-14 md:py-16 lg:py-20 w-full relative"
      style={{ minHeight: 'calc(100vh - 72px)' }}
    >
      <BackButton />
      <div className="onboard-card flex flex-col items-center gap-4">
        <h1 className="font-bold leading-[41px] text-[34px] text-nowrap tracking-[0.374px]" style={{ color: 'var(--color-text)', margin: 0 }}>
          About you
        </h1>
        <p className="font-normal leading-normal text-[20px] text-center max-w-2xl" style={{ color: 'var(--color-muted)' }}>
          Only real people. Share a few basics so matches know who you are.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 items-center justify-center w-full max-w-md">
          <div 
            className="h-14 relative rounded-[12px] w-full flex items-center transition-colors"
            style={{ 
              background: 'var(--color-panel)', 
              border: '1px solid var(--color-stroke)',
            }}
          >
            <input
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className="w-full h-full px-4 bg-transparent border-0 outline-none text-base appearance-none"
              style={{ 
                color: 'var(--color-text)',
                WebkitAppearance: 'none',
                MozAppearance: 'textfield',
              } as any}
              placeholder="Age"
              required
              min="18"
              max="100"
              onFocus={(e) => {
                e.currentTarget.style.outline = 'none'
                e.currentTarget.style.boxShadow = 'none'
                e.currentTarget.parentElement!.style.borderColor = 'var(--color-primary)'
              }}
              onBlur={(e) => {
                e.currentTarget.parentElement!.style.borderColor = 'var(--color-stroke)'
              }}
            />
          </div>

          <div className="flex gap-4 items-start justify-center w-full">
            <button
              type="button"
              onClick={() => setGender('Man')}
              className="h-14 relative rounded-[12px] flex-1 flex items-center justify-between px-4 transition-colors"
              style={{
                background: 'var(--color-panel)',
                border: `1px solid ${gender === 'Man' ? 'var(--color-primary)' : 'var(--color-stroke)'}`,
              }}
              onMouseEnter={(e) => {
                if (gender !== 'Man') e.currentTarget.style.borderColor = 'var(--color-primary)'
              }}
              onMouseLeave={(e) => {
                if (gender !== 'Man') e.currentTarget.style.borderColor = 'var(--color-stroke)'
              }}
            >
              <span className="font-normal leading-6 text-base" style={{ color: 'var(--color-text)' }}>Man</span>
              <div className="w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0" style={{ borderColor: gender === 'Man' ? 'var(--color-primary)' : 'var(--color-stroke)' }}>
                {gender === 'Man' && (
                  <div className="w-3 h-3 rounded-full" style={{ background: 'var(--color-primary)' }}></div>
                )}
              </div>
            </button>

            <button
              type="button"
              onClick={() => setGender('Woman')}
              className="h-14 relative rounded-[12px] flex-1 flex items-center justify-between px-4 transition-colors"
              style={{
                background: 'var(--color-panel)',
                border: `1px solid ${gender === 'Woman' ? 'var(--color-primary)' : 'var(--color-stroke)'}`,
              }}
              onMouseEnter={(e) => {
                if (gender !== 'Woman') e.currentTarget.style.borderColor = 'var(--color-primary)'
              }}
              onMouseLeave={(e) => {
                if (gender !== 'Woman') e.currentTarget.style.borderColor = 'var(--color-stroke)'
              }}
            >
              <span className="font-normal leading-6 text-base" style={{ color: 'var(--color-text)' }}>Woman</span>
              <div className="w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0" style={{ borderColor: gender === 'Woman' ? 'var(--color-primary)' : 'var(--color-stroke)' }}>
                {gender === 'Woman' && (
                  <div className="w-3 h-3 rounded-full" style={{ background: 'var(--color-primary)' }}></div>
                )}
              </div>
            </button>

            <button
              type="button"
              onClick={() => setGender("Won't say")}
              className="h-14 relative rounded-[12px] flex-1 flex items-center justify-between px-4 transition-colors"
              style={{
                background: 'var(--color-panel)',
                border: `1px solid ${gender === "Won't say" ? 'var(--color-primary)' : 'var(--color-stroke)'}`,
              }}
              onMouseEnter={(e) => {
                if (gender !== "Won't say") e.currentTarget.style.borderColor = 'var(--color-primary)'
              }}
              onMouseLeave={(e) => {
                if (gender !== "Won't say") e.currentTarget.style.borderColor = 'var(--color-stroke)'
              }}
            >
              <span className="font-normal leading-6 text-base" style={{ color: 'var(--color-text)' }}>Won't say</span>
              <div className="w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0" style={{ borderColor: gender === "Won't say" ? 'var(--color-primary)' : 'var(--color-stroke)' }}>
                {gender === "Won't say" && (
                  <div className="w-3 h-3 rounded-full" style={{ background: 'var(--color-primary)' }}></div>
                )}
              </div>
            </button>
          </div>

          <div 
            className="h-14 relative rounded-[12px] w-full flex items-center transition-colors"
            style={{ 
              background: 'var(--color-panel)', 
              border: '1px solid var(--color-stroke)',
            }}
          >
            <input
              type="text"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full h-full px-4 bg-transparent border-0 outline-none text-base"
              style={{ 
                color: 'var(--color-text)'
              }}
              placeholder="Short bio (optional)"
              onFocus={(e) => {
                e.currentTarget.style.outline = 'none'
                e.currentTarget.style.boxShadow = 'none'
                e.currentTarget.parentElement!.style.borderColor = 'var(--color-primary)'
              }}
              onBlur={(e) => {
                e.currentTarget.parentElement!.style.borderColor = 'var(--color-stroke)'
              }}
            />
          </div>

          <button
            type="submit"
            disabled={!age.trim() || !gender}
            className="onb-cta-btn"
          >
            Continue 2/9
          </button>
        </form>
      </div>
    </div>
  )
}


