'use client'

import Link from 'next/link'
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

  // Show nothing while checking to avoid flash
  if (isLoggedIn === null) {
    return (
      <div className="logo">
        <span className="dab-logo">dab</span>
      </div>
    )
  }

  return (
    <Link href={isLoggedIn ? "/home" : "/"} className="logo" style={{ textDecoration: 'none' }}>
      <span className="dab-logo">dab</span>
    </Link>
  )
}

