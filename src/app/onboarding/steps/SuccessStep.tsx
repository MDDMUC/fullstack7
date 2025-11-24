'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function SuccessStep() {
  const router = useRouter()

  useEffect(() => {
    // Auto-redirect to home after 5 seconds
    const timer = setTimeout(() => {
      router.push('/home')
    }, 5000)

    return () => clearTimeout(timer)
  }, [router])

  const handleContinue = () => {
    router.push('/home')
  }

  return (
    <div className="bg-white flex flex-col gap-4 items-center justify-center px-4 sm:px-8 md:px-16 lg:px-24 py-12 sm:py-16 md:py-20 lg:py-24 min-h-screen w-full">
      <div className="flex flex-col gap-6 items-center justify-center w-full max-w-md text-center">
        {/* Success Icon */}
        <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center">
          <svg
            className="w-12 h-12 text-green-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={3}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        {/* Success Message */}
        <div className="flex flex-col gap-2">
          <h1 className="font-bold leading-[41px] text-[#020202] text-[34px] tracking-[0.374px]">
            Welcome to Crux Connections!
          </h1>
          <p className="font-normal leading-normal text-[20px] text-black">
            Your profile has been created successfully. Start matching with climbers near you!
          </p>
        </div>

        {/* Action Button */}
        <button
          onClick={handleContinue}
          className="bg-[#212121] flex items-center justify-center px-6 py-4 rounded-[4px] hover:bg-[#2a2a2a] transition-colors w-full mt-4"
        >
          <span className="font-medium leading-4 text-base text-white tracking-[1.25px] uppercase">
            Start Matching
          </span>
        </button>

        {/* Auto-redirect notice */}
        <p className="text-sm text-[#757575] mt-2">
          Redirecting automatically in a few seconds...
        </p>
      </div>
    </div>
  )
}

