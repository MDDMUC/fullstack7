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
    <div className="bg-white flex flex-col gap-4 items-center justify-center px-4 sm:px-8 md:px-16 lg:px-24 py-12 sm:py-16 md:py-20 lg:py-24 min-h-screen w-full relative">
      <BackButton />
      <div className="flex gap-2 items-center justify-center px-4 py-0 w-full max-w-2xl">
        <h1 className="font-bold leading-[41px] text-[#020202] text-[34px] text-nowrap tracking-[0.374px]">
          My number is
        </h1>
      </div>
      
      <p className="font-normal leading-normal text-[20px] text-black text-center max-w-2xl">
        &ldquo;Let&rsquo;s get you climbing with new people.&rdquo;
      </p>
      
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 items-center justify-center w-full max-w-md">
        <div className="flex gap-4 items-start justify-center w-full">
          <div className="bg-white border border-[#020202] h-14 relative rounded-[4px] w-[120px] flex items-center">
            <input
              type="text"
              value={countryCode}
              onChange={(e) => setCountryCode(e.target.value)}
              className="w-full h-full px-4 bg-transparent border-none outline-none text-[#757575] text-base placeholder:text-[#757575]"
              placeholder="+1"
            />
          </div>
          
          <div className="bg-white border border-[#020202] h-14 relative rounded-[4px] flex-1 flex items-center">
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full h-full px-4 bg-transparent border-none outline-none text-[#757575] text-base placeholder:text-[#757575]"
              placeholder="Phone"
              required
            />
          </div>
        </div>
        
        <button
          type="submit"
          disabled={loading || !phoneNumber}
          className="bg-[#212121] flex items-center justify-center px-6 py-4 rounded-[4px] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#2a2a2a] transition-colors w-full"
        >
          <span className="font-medium leading-4 text-base text-white tracking-[1.25px] uppercase">
            {loading ? 'SENDING...' : 'LETS GO'}
          </span>
        </button>
      </form>
    </div>
  )
}

