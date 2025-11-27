'use client'

import { useState } from 'react'
import { useOnboarding } from '@/contexts/OnboardingContext'
import BackButton from '../components/BackButton'

const STYLES = [
  'Bouldering',
  'Sport',
  'Trad',
  'Alpine',
  'Ice',
  'Multipitch',
  'Training',
  'Mountaineering',
  'Comps',
  'Board',
]

export default function InterestsStep() {
  const { data, updateData, setCurrentStep } = useOnboarding()
  const [selected, setSelected] = useState<string[]>(data.styles || [])
  const [grade, setGrade] = useState(data.grade || '')
  const [bigGoal, setBigGoal] = useState(data.bigGoal || '')

  const handleToggle = (style: string) => {
    const newSelected = selected.includes(style)
      ? selected.filter(i => i !== style)
      : [...selected, style]
    setSelected(newSelected)
    updateData({ styles: newSelected })
  }

  const handleContinue = () => {
    updateData({ styles: selected, grade, bigGoal })
    setCurrentStep(4)
  }

  return (
    <div
      className="onboard-screen flex flex-col gap-6 items-center justify-start px-4 sm:px-8 md:px-16 lg:px-24 py-10 sm:py-14 md:py-16 lg:py-20 w-full relative"
      style={{ minHeight: 'calc(100vh - 72px)' }}
    >
      <BackButton />
      <div className="onboard-card flex flex-col items-center gap-4">
        <div className="flex gap-2 items-center justify-center px-4 py-0 w-full max-w-2xl">
          <h1 className="font-bold leading-[41px] text-[34px] text-nowrap tracking-[0.374px]" style={{ color: 'var(--text)' }}>
            Interests
          </h1>
        </div>

        <p className="font-normal leading-normal text-[20px] text-center max-w-2xl" style={{ color: 'var(--muted)' }}>
          Only real people. Choose your styles and grade so partners can match you accurately.
        </p>

        <div
          className="grid items-start w-full"
          style={{
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: '10px 12px',
            maxWidth: '500px',
            justifyItems: 'start',
            margin: '0 auto',
          }}
        >
          {STYLES.map((style) => {
            const isSelected = selected.includes(style)
            return (
              <button
                key={style}
                type="button"
                onClick={() => handleToggle(style)}
                className="h-12 relative rounded-[10px] px-4 transition-colors text-left"
                style={{
                  minWidth: '120px',
                  border: `1px solid ${isSelected ? 'var(--accent)' : 'var(--stroke)'}`,
                  background: isSelected ? 'rgba(92, 225, 230, 0.12)' : '#0f131d',
                  color: isSelected ? 'var(--accent)' : 'var(--text)',
                }}
              >
                <span className="font-normal leading-none text-[18px] tracking-[-0.32px]">
                  {style}
                </span>
              </button>
            )
          })}
        </div>

        <div className="w-full max-w-md">
          <div
            className="h-14 relative rounded-[12px] w-full flex items-center transition-colors"
            style={{
              background: '#0f131d',
              border: '1px solid var(--stroke)',
            }}
          >
            <input
              type="text"
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              className="w-full h-full px-4 bg-transparent border-0 outline-none text-base rounded-[12px]"
              style={{ color: 'var(--text)' }}
              placeholder="Grade focus (optional, e.g., 5.11b / V5)"
            />
          </div>
          <p className="font-normal leading-normal text-[15px] mt-2" style={{ color: 'var(--muted)' }}>
            Big goal? Let others know what you’re building toward.
          </p>
          <div
            className="h-14 relative rounded-[12px] w-full flex items-center transition-colors mt-2"
            style={{
              background: '#0f131d',
              border: '1px solid var(--stroke)',
            }}
          >
            <input
              type="text"
              value={bigGoal}
              onChange={(e) => setBigGoal(e.target.value)}
              className="w-full h-full px-4 bg-transparent border-0 outline-none text-base rounded-[12px]"
              style={{ color: 'var(--text)' }}
              placeholder="Big goal? (optional)"
            />
          </div>
        </div>

        <button
          onClick={handleContinue}
          className="cta w-full max-w-md"
          style={{ padding: '10px 16px', borderRadius: '10px' }}
        >
          <span className="font-medium leading-4 text-base tracking-[1.25px] uppercase" style={{ color: '#0c0e12' }}>
            CONTINUE 3/7
          </span>
        </button>
      </div>
    </div>
  )
}

