'use client'

import Link from 'next/link'
import Image from 'next/image'
import { supabase } from '@/lib/supabaseClient'
import { useEffect, useState } from 'react'

export default function Logo() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null)

  useEffect(() => {
    const checkAuth = async () => {
      if (!supabase) {
        setIsLoggedIn(false)
        return
      }
      const { data } = await supabase.auth.getUser()
      setIsLoggedIn(!!data.user)
    }
    checkAuth()
  }, [])

  const logoImage = (
    <Image
      src="/dab-logo.svg"
      alt="DAB"
      width={60}
      height={38}
      className="dab-logo-img"
      priority
    />
  )

  // Show nothing while checking to avoid flash
  if (isLoggedIn === null) {
    return (
      <div className="logo">
        {logoImage}
      </div>
    )
  }

  return (
    <Link href={isLoggedIn ? "/home" : "/"} className="logo" style={{ textDecoration: 'none' }}>
      {logoImage}
    </Link>
  )
}

