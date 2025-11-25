'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function SuccessStep() {
  const router = useRouter()
  const [isFading, setIsFading] = useState(false)

  useEffect(() => {
    // Start fade after 3 seconds
    const fadeTimer = setTimeout(() => {
      setIsFading(true)
    }, 3000)

    // Redirect after fade animation completes (add 500ms for fade duration)
    const redirectTimer = setTimeout(() => {
      router.push('/home')
    }, 3500)

    return () => {
      clearTimeout(fadeTimer)
      clearTimeout(redirectTimer)
    }
  }, [router])

  return (
    <div 
      className={`onboard-screen flex flex-col gap-6 items-center justify-start px-4 sm:px-8 md:px-16 lg:px-24 py-10 sm:py-14 md:py-16 lg:py-20 w-full transition-opacity duration-500 ${
        isFading ? 'opacity-0' : 'opacity-100'
      }`}
      style={{ color: 'var(--text)', minHeight: 'calc(100vh - 72px)' }}
    >
      <div className="flex gap-2 items-center justify-center px-4 py-0 w-full max-w-2xl">
        <h1 className="font-bold leading-[41px] text-[34px] text-nowrap tracking-[0.374px]" style={{ color: 'var(--text)' }}>
          Success
        </h1>
      </div>
      
      <p className="font-normal leading-normal text-[20px] text-center text-nowrap max-w-2xl" style={{ color: 'var(--accent)' }}>
        All done!
      </p>
      
      <p className="font-normal leading-normal text-[20px] text-center text-nowrap max-w-2xl" style={{ color: 'var(--muted)' }}>
        Welcome to the crew
      </p>
    </div>
  )
}

