'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function SuccessStep() {
  const router = useRouter()
  const [countdown, setCountdown] = useState(3)

  useEffect(() => {
    // Show success page for 3 seconds, then redirect
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          router.push('/home')
          return 0
        }
        return prev - 1
      })
    }, 1000)

    // Also set a backup timeout to ensure redirect happens
    const timeout = setTimeout(() => {
      clearInterval(interval)
      router.push('/home')
    }, 3000)

    return () => {
      clearInterval(interval)
      clearTimeout(timeout)
    }
  }, [router])

  return (
    <div className="bg-white flex flex-col gap-4 items-center justify-center px-4 sm:px-8 md:px-16 lg:px-24 py-12 sm:py-16 md:py-20 lg:py-24 min-h-screen w-full">
      <div className="flex gap-2 items-center justify-center px-4 py-0 w-full max-w-2xl">
        <h1 className="font-bold leading-[41px] text-[#020202] text-[34px] text-nowrap tracking-[0.374px]">
          Success
        </h1>
      </div>
      
      <p className="font-normal leading-normal text-[20px] text-black text-center text-nowrap max-w-2xl">
        All done!
      </p>
      
      <p className="font-normal leading-normal text-[20px] text-black text-center text-nowrap max-w-2xl">
        Welcome to the crew
      </p>
    </div>
  )
}

