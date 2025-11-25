'use client'

import { FormEvent, useState } from 'react'
import { useOnboarding } from '@/contexts/OnboardingContext'
import BackButton from '../components/BackButton'

export default function NameAgeGenderStep() {
  const { data, updateData, setCurrentStep } = useOnboarding()
  const [name, setName] = useState(data.name || '')
  const [age, setAge] = useState(data.age || '')
  const [gender, setGender] = useState<'Man' | 'Woman' | 'Other' | ''>(data.gender || '')
  const [bio, setBio] = useState(data.bio || '')

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!name.trim() || !age.trim() || !gender) return

    updateData({ name, age, gender: gender as 'Man' | 'Woman' | 'Other', bio })
    setCurrentStep(3)
  }

  return (
    <div className="flex flex-col gap-6 items-center justify-center px-4 sm:px-8 md:px-16 lg:px-24 py-12 sm:py-16 md:py-20 lg:py-24 min-h-screen w-full relative" style={{ background: 'var(--bg)', color: 'var(--text)' }}>
      <BackButton />
      <p className="font-normal leading-normal text-[20px] text-center max-w-2xl" style={{ color: 'var(--muted)' }}>
        My Name is
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 items-center justify-center w-full max-w-md">
        <div 
          className="h-14 relative rounded-[12px] w-full flex items-center transition-colors"
          style={{ 
            background: '#0f131d', 
            border: '1px solid var(--stroke)',
          }}
        >
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full h-full px-4 bg-transparent border-0 outline-none text-base"
            style={{ 
              color: 'var(--text)'
            }}
            placeholder="Name"
            required
            onFocus={(e) => {
              e.currentTarget.style.outline = 'none'
              e.currentTarget.style.boxShadow = 'none'
              e.currentTarget.parentElement!.style.borderColor = 'var(--accent)'
            }}
            onBlur={(e) => {
              e.currentTarget.parentElement!.style.borderColor = 'var(--stroke)'
            }}
          />
        </div>

        <div 
          className="h-14 relative rounded-[12px] w-full flex items-center transition-colors"
          style={{ 
            background: '#0f131d', 
            border: '1px solid var(--stroke)',
          }}
        >
          <input
            type="number"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            className="w-full h-full px-4 bg-transparent border-0 outline-none text-base"
            style={{ 
              color: 'var(--text)'
            }}
            placeholder="Age"
            required
            min="18"
            max="100"
            onFocus={(e) => {
              e.currentTarget.style.outline = 'none'
              e.currentTarget.style.boxShadow = 'none'
              e.currentTarget.parentElement!.style.borderColor = 'var(--accent)'
            }}
            onBlur={(e) => {
              e.currentTarget.parentElement!.style.borderColor = 'var(--stroke)'
            }}
          />
        </div>

        <div className="flex gap-4 items-start justify-center w-full">
          <button
            type="button"
            onClick={() => setGender('Man')}
            className="h-14 relative rounded-[12px] flex-1 flex items-center justify-between px-4 transition-colors"
            style={{
              background: '#0f131d',
              border: `1px solid ${gender === 'Man' ? 'var(--accent)' : 'var(--stroke)'}`,
            }}
            onMouseEnter={(e) => {
              if (gender !== 'Man') e.currentTarget.style.borderColor = 'var(--accent)'
            }}
            onMouseLeave={(e) => {
              if (gender !== 'Man') e.currentTarget.style.borderColor = 'var(--stroke)'
            }}
          >
            <span className="font-normal leading-6 text-base" style={{ color: 'var(--text)' }}>Man</span>
            <div className="w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0" style={{ borderColor: gender === 'Man' ? 'var(--accent)' : 'var(--stroke)' }}>
              {gender === 'Man' && (
                <div className="w-3 h-3 rounded-full" style={{ background: 'var(--accent)' }}></div>
              )}
            </div>
          </button>

          <button
            type="button"
            onClick={() => setGender('Woman')}
            className="h-14 relative rounded-[12px] flex-1 flex items-center justify-between px-4 transition-colors"
            style={{
              background: '#0f131d',
              border: `1px solid ${gender === 'Woman' ? 'var(--accent)' : 'var(--stroke)'}`,
            }}
            onMouseEnter={(e) => {
              if (gender !== 'Woman') e.currentTarget.style.borderColor = 'var(--accent)'
            }}
            onMouseLeave={(e) => {
              if (gender !== 'Woman') e.currentTarget.style.borderColor = 'var(--stroke)'
            }}
          >
            <span className="font-normal leading-6 text-base" style={{ color: 'var(--text)' }}>Woman</span>
            <div className="w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0" style={{ borderColor: gender === 'Woman' ? 'var(--accent)' : 'var(--stroke)' }}>
              {gender === 'Woman' && (
                <div className="w-3 h-3 rounded-full" style={{ background: 'var(--accent)' }}></div>
              )}
            </div>
          </button>
        </div>

        <div 
          className="h-14 relative rounded-[12px] w-full flex items-center transition-colors"
          style={{ 
            background: '#0f131d', 
            border: '1px solid var(--stroke)',
          }}
        >
          <input
            type="text"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="w-full h-full px-4 bg-transparent border-0 outline-none text-base"
            style={{ 
              color: 'var(--text)'
            }}
            placeholder="Short bio (optional)"
            onFocus={(e) => {
              e.currentTarget.style.outline = 'none'
              e.currentTarget.style.boxShadow = 'none'
              e.currentTarget.parentElement!.style.borderColor = 'var(--accent)'
            }}
            onBlur={(e) => {
              e.currentTarget.parentElement!.style.borderColor = 'var(--stroke)'
            }}
          />
        </div>

        <button
          type="submit"
          disabled={!name.trim() || !age.trim() || !gender}
          className="cta w-full"
          style={{ padding: '10px 16px', borderRadius: '10px' }}
        >
          <span className="font-medium leading-4 text-base tracking-[1.25px] uppercase" style={{ color: '#0c0e12' }}>
          CONTINUE 2/7
        </span>
      </button>
      </form>
    </div>
  )
}

