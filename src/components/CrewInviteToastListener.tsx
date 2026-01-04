'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { useAuthSession } from '@/hooks/useAuthSession'
import { useToast } from '@/components/Toast'
import { fetchProfiles } from '@/lib/profiles'

type CrewInvitePayload = {
  id: string
  crew_id: string
  inviter_id: string
  invitee_id: string
  status: string
  created_at: string
}

export function CrewInviteToastListener() {
  const { session } = useAuthSession()
  const userId = session?.user?.id
  const router = useRouter()
  const pathname = usePathname()
  const { addToast } = useToast()

  useEffect(() => {
    if (!supabase || !userId) return

    const client = supabase

    const handleNewInvite = async (payload: { new: CrewInvitePayload }) => {
      console.log('🔔 CrewInviteToastListener: New invite received!', payload)
      const invite = payload.new

      // Only show toast if current user is the invitee (receiving an invite)
      if (invite.invitee_id !== userId) {
        console.log('❌ Invite not for current user. Invitee:', invite.invitee_id, 'Current user:', userId)
        return
      }

      console.log('✅ Invite is for current user')

      // Don't show if status is not pending
      if (invite.status !== 'pending') {
        console.log('❌ Invite status is not pending:', invite.status)
        return
      }

      console.log('✅ Invite status is pending')

      // Don't show if user is already on notifications page
      if (pathname === '/notifications') {
        console.log('❌ User is on notifications page, suppressing toast')
        return
      }

      console.log('✅ User is not on notifications page, showing toast')

      try {
        // Fetch inviter info
        console.log('📤 Fetching inviter profile for:', invite.inviter_id)
        const inviterProfiles = await fetchProfiles(client, [invite.inviter_id])
        const inviterName = inviterProfiles[0]?.username?.split(' ')[0] || 'Someone'
        const inviterAvatar = inviterProfiles[0]?.avatar_url || inviterProfiles[0]?.photo || null

        // Fetch crew info
        console.log('📤 Fetching crew info for:', invite.crew_id)
        const { data: crew } = await client
          .from('crews')
          .select('title')
          .eq('id', invite.crew_id)
          .single()

        const crewName = crew?.title || 'a crew'

        console.log('🎉 Displaying toast:', inviterName, 'invited you to join', crewName)

        addToast({
          type: 'success',
          title: 'Crew Invite',
          message: `${inviterName} invited you to join "${crewName}"`,
          avatarUrl: inviterAvatar,
          duration: 8000,
          onClick: () => {
            router.push('/notifications')
          },
        })

        console.log('✅ Toast displayed successfully')
      } catch (err) {
        console.error('❌ Failed to show crew invite toast:', err)
      }
    }

    // Subscribe to new crew invites
    const channelName = `toast-crew-invites-${userId}-${Date.now()}`
    const channel = client.channel(channelName)

    channel
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'crew_invites',
          filter: `invitee_id=eq.${userId}`
        },
        handleNewInvite
      )
      .subscribe((status) => {
        console.log('Crew invite subscription status:', status)
      })

    return () => {
      channel.unsubscribe()
    }
  }, [userId, addToast, router, pathname])

  // This component doesn't render anything - it's just a listener
  return null
}
