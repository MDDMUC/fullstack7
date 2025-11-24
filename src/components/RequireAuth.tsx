// src/components/RequireAuth.tsx
'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthSession } from '@/hooks/useAuthSession'

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { session, loading } = useAuthSession()

  useEffect(() => {
    if (loading) return
    if (!session) router.replace('/login')
  }, [session, loading, router])

  if (!session) return null
  return <>{children}</>
}
