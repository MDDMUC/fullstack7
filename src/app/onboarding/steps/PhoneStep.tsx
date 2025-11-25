'use client'

import { FormEvent, useState } from 'react'
import { useOnboarding } from '@/contexts/OnboardingContext'
import BackButton from '../components/BackButton'

export default function PhoneStep() {
  const { data, updateData, setCurrentStep } = useOnboarding()
  const [phoneNumber, setPhoneNumber] = useState(data.phoneNumber || '')
  const [countryCode, setCountryCode] = useState(data.countryCode || '+1')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!phoneNumber.trim()) return

    setLoading(true)
    updateData({ phoneNumber, countryCode })
    
    // Simulate phone verification
    setTimeout(() => {
      setLoading(false)
      setCurrentStep(2)
    }, 500)
  }

  return (
    <div className="flex flex-col gap-6 items-center justify-center px-4 sm:px-8 md:px-16 lg:px-24 py-12 sm:py-16 md:py-20 lg:py-24 min-h-screen w-full relative" style={{ background: 'var(--bg)', color: 'var(--text)' }}>
      <BackButton />
      <div className="flex gap-2 items-center justify-center px-4 py-0 w-full max-w-2xl">
        <h1 className="font-bold leading-[41px] text-[34px] text-nowrap tracking-[0.374px]" style={{ color: 'var(--text)' }}>
          My number is
        </h1>
      </div>
      
      <p className="font-normal leading-normal text-[20px] text-center max-w-2xl" style={{ color: 'var(--muted)' }}>
        &ldquo;Let&rsquo;s get you climbing with new people.&rdquo;
      </p>
      
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 items-center justify-center w-full max-w-md">
        <div className="flex gap-4 items-start justify-center w-full">
          <div className="h-14 relative rounded-[10px] w-[120px] flex items-center" style={{ background: '#0f131d', border: '1px solid var(--stroke)' }}>
            <input
              type="text"
              value={countryCode}
              onChange={(e) => setCountryCode(e.target.value)}
              className="w-full h-full px-4 bg-transparent border-none outline-none text-base"
              style={{ color: 'var(--text)' }}
              placeholder="+1"
            />
          </div>
          
          <div className="h-14 relative rounded-[10px] flex-1 flex items-center" style={{ background: '#0f131d', border: '1px solid var(--stroke)' }}>
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full h-full px-4 bg-transparent border-none outline-none text-base"
              style={{ color: 'var(--text)' }}
              placeholder="Phone"
              required
            />
          </div>
        </div>
        
        <button
          type="submit"
          disabled={loading || !phoneNumber}
          className="cta w-full"
          style={{ padding: '10px 16px', borderRadius: '10px' }}
        >
          <span className="font-medium leading-4 text-base tracking-[1.25px] uppercase" style={{ color: '#0c0e12' }}>
            {loading ? 'SENDING...' : 'LETS GO'}
          </span>
        </button>
      </form>
    </div>
  )
}

