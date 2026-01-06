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

    // Listen for custom event when someone accepts the user's crew invite
    const handleCustomAcceptedEvent = async (event: Event) => {
      const customEvent = event as CustomEvent
      const { inviterId, inviteeId, crewId } = customEvent.detail

      // Only show toast if current user is the inviter (crew owner)
      if (inviterId !== userId) {
        console.log('❌ Custom event: Not for current user. Inviter:', inviterId, 'Current user:', userId)
        return
      }

      console.log('✅ Custom event: Current user is the inviter')

      // Don't show if user is already on notifications page or crew detail page
      if (pathname === '/notifications' || pathname?.startsWith('/crew/detail')) {
        console.log('❌ Custom event: User is on notifications or crew detail page, suppressing toast')
        return
      }

      console.log('✅ Custom event: Showing toast')

      try {
        // Fetch invitee info
        console.log('📤 Custom event: Fetching invitee profile for:', inviteeId)
        const inviteeProfiles = await fetchProfiles(client, [inviteeId])
        const inviteeName = inviteeProfiles[0]?.username?.split(' ')[0] || 'Someone'
        const inviteeAvatar = inviteeProfiles[0]?.avatar_url || inviteeProfiles[0]?.photo || null

        // Fetch crew info
        console.log('📤 Custom event: Fetching crew info for:', crewId)
        const { data: crew } = await client
          .from('crews')
          .select('title')
          .eq('id', crewId)
          .single()

        const crewName = crew?.title || 'your crew'

        console.log('🎉 Custom event: Displaying toast:', inviteeName, 'joined', crewName)

        addToast({
          type: 'success',
          title: 'Member Joined',
          message: `${inviteeName} joined "${crewName}"`,
          avatarUrl: inviteeAvatar,
          duration: 8000,
          onClick: () => {
            router.push(`/crew/detail?crewId=${crewId}`)
          },
        })

        console.log('✅ Custom event: Toast displayed successfully')
      } catch (err) {
        console.error('❌ Custom event: Failed to show crew member joined toast:', err)
      }
    }

    window.addEventListener('crew-invite-accepted', handleCustomAcceptedEvent)

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

    const handleAcceptedInvite = async (payload: any) => {
      console.log('🔔 CrewInviteToastListener: Invite status updated!', payload)
      const invite = payload.new as CrewInvitePayload
      const oldInvite = payload.old as CrewInvitePayload | undefined

      // Only show toast if current user is the inviter (crew owner)
      if (invite.inviter_id !== userId) {
        console.log('❌ Invite not from current user. Inviter:', invite.inviter_id, 'Current user:', userId)
        return
      }

      console.log('✅ Current user is the inviter')

      // Only show if status is accepted (and it wasn't already accepted)
      if (invite.status !== 'accepted') {
        console.log('❌ New status is not accepted:', invite.status)
        return
      }

      if (oldInvite && oldInvite.status === 'accepted') {
        console.log('❌ Status was already accepted. Old:', oldInvite.status)
        return
      }

      console.log('✅ Status changed to accepted')

      // Don't show if user is already on notifications page or crew detail page
      if (pathname === '/notifications' || pathname?.startsWith('/crew/detail')) {
        console.log('❌ User is on notifications or crew detail page, suppressing toast')
        return
      }

      console.log('✅ User is not on notifications or crew detail page, showing toast')

      try {
        // Fetch invitee info
        console.log('📤 Fetching invitee profile for:', invite.invitee_id)
        const inviteeProfiles = await fetchProfiles(client, [invite.invitee_id])
        const inviteeName = inviteeProfiles[0]?.username?.split(' ')[0] || 'Someone'
        const inviteeAvatar = inviteeProfiles[0]?.avatar_url || inviteeProfiles[0]?.photo || null

        // Fetch crew info
        console.log('📤 Fetching crew info for:', invite.crew_id)
        const { data: crew } = await client
          .from('crews')
          .select('title')
          .eq('id', invite.crew_id)
          .single()

        const crewName = crew?.title || 'your crew'

        console.log('🎉 Displaying toast:', inviteeName, 'joined', crewName)

        addToast({
          type: 'success',
          title: 'Member Joined',
          message: `${inviteeName} joined "${crewName}"`,
          avatarUrl: inviteeAvatar,
          duration: 8000,
          onClick: () => {
            router.push(`/crew/detail?crewId=${invite.crew_id}`)
          },
        })

        console.log('✅ Toast displayed successfully')
      } catch (err) {
        console.error('❌ Failed to show crew member joined toast:', err)
      }
    }

    // Subscribe to new crew invites (when user receives an invite)
    const inviteChannelName = `toast-crew-invites-new-${userId}-${Date.now()}`
    const inviteChannel = client.channel(inviteChannelName)

    inviteChannel
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
        console.log('Crew invite (new) subscription status:', status)
      })

    // Subscribe to accepted invites (when someone accepts user's invite)
    const acceptedChannelName = `toast-crew-invites-accepted-${userId}-${Date.now()}`
    const acceptedChannel = client.channel(acceptedChannelName)

    // Use type assertion for the entire subscription to work around TypeScript issues
    ;(acceptedChannel as any)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'crew_invites',
          filter: `inviter_id=eq.${userId}`
        },
        handleAcceptedInvite
      )
      .subscribe((status: any) => {
        console.log('Crew invite (accepted) subscription status:', status)
      })

    return () => {
      window.removeEventListener('crew-invite-accepted', handleCustomAcceptedEvent)
      inviteChannel.unsubscribe()
      acceptedChannel.unsubscribe()
    }
  }, [userId, addToast, router, pathname])

  // This component doesn't render anything - it's just a listener
  return null
}
