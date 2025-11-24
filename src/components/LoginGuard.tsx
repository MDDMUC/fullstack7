"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthSession } from '@/hooks/useAuthSession'

export default function LoginGuard({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuthSession()
  const router = useRouter()

  useEffect(() => {
    if (loading) return
    if (session) router.replace('/home')
  }, [loading, session, router])

  if (session) return null
  return <>{children}</>
}
