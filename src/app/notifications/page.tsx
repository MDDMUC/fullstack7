'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { RequireAuth } from '@/components/RequireAuth'
import MobileTopbar from '@/components/MobileTopbar'
import MobileNavbar from '@/components/MobileNavbar'
import LoadingState from '@/components/LoadingState'
import EmptyState from '@/components/EmptyState'
import Avatar from '@/components/Avatar'
import { useAuthSession } from '@/hooks/useAuthSession'
import { fetchProfiles } from '@/lib/profiles'
import { supabase } from '@/lib/supabaseClient'

// LocalStorage key for dismissed notifications
const DISMISSED_NOTIFICATIONS_KEY = 'dab_dismissed_notifications'

// Helper to get dismissed notification IDs from localStorage
const getDismissedNotifications = (): Set<string> => {
  if (typeof window === 'undefined') return new Set()
  try {
    const stored = localStorage.getItem(DISMISSED_NOTIFICATIONS_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      return new Set(Array.isArray(parsed) ? parsed : [])
    }
  } catch (err) {
    console.error('Error reading dismissed notifications:', err)
  }
  return new Set()
}

// Helper to save dismissed notification IDs to localStorage
const saveDismissedNotifications = (ids: Set<string>) => {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(DISMISSED_NOTIFICATIONS_KEY, JSON.stringify(Array.from(ids)))
    // Dispatch custom event to notify MobileTopbar on the same page
    window.dispatchEvent(new CustomEvent('notifications-updated'))
  } catch (err) {
    console.error('Error saving dismissed notifications:', err)
  }
}

type NotificationItem = {
  id: string
  type: 'message' | 'dab' | 'crew_invite'
  text: string
  time?: string
  link?: string
  userId?: string
  avatarUrl?: string
  inviteId?: string
  crewId?: string
  crewName?: string
  inviterName?: string
}

const formatTimeAgo = (dateString?: string | null): string => {
  if (!dateString) return ''
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString()
}

export default function NotificationsPage() {
  const { session } = useAuthSession()
  const router = useRouter()
  const userId = session?.user?.id
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [loading, setLoading] = useState(true)
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set())
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(() => getDismissedNotifications())
  const [errorIds, setErrorIds] = useState<Record<string, string>>({}) // inviteId -> error message

  useEffect(() => {
    const loadNotifications = async () => {
      if (!userId || !supabase) {
        setLoading(false)
        return
      }
      
      try {
        const client = supabase
        const allNotifications: NotificationItem[] = []

        // 1. Fetch recent messages (from threads where user is a participant)
        const { data: directThreads } = await client
          .from('threads')
          .select('id,user_a,user_b,type')
          .or(`user_a.eq.${userId},user_b.eq.${userId}`)

        const { data: participantThreads } = await client
          .from('thread_participants')
          .select('thread_id,threads!inner(id,type)')
          .eq('user_id', userId)

        const threadIds = new Set<string>()
        directThreads?.forEach(t => t.id && threadIds.add(t.id))
        participantThreads?.forEach(p => p.thread_id && threadIds.add(p.thread_id))

        if (threadIds.size > 0) {
          const { data: recentMessages } = await client
            .from('messages')
            .select('id,thread_id,body,created_at,sender_id')
            .in('thread_id', Array.from(threadIds))
            .neq('sender_id', userId)
            .order('created_at', { ascending: false })
            .limit(10)

          if (recentMessages && recentMessages.length > 0) {
            const senderIds = Array.from(new Set(recentMessages.map(m => m.sender_id).filter(Boolean) as string[]))
            let senderProfilesMap: Record<string, { username: string; avatar_url?: string }> = {}
            if (senderIds.length > 0) {
              const profiles = await fetchProfiles(client, senderIds)
              senderProfilesMap = profiles.reduce<Record<string, { username: string; avatar_url?: string }>>((acc, p) => {
                acc[p.id] = { username: p.username, avatar_url: p.avatar_url ?? undefined }
                return acc
              }, {})
            }

            for (const msg of recentMessages) {
              const sender = senderProfilesMap[msg.sender_id]
              const firstName = sender?.username?.trim().split(/\s+/)[0] || 'Someone'
              const timeAgo = formatTimeAgo(msg.created_at)
              allNotifications.push({
                id: `msg-${msg.id}`,
                type: 'message',
                text: `${firstName} sent you a message`,
                time: timeAgo,
                link: `/chats/${msg.thread_id}`,
                userId: msg.sender_id,
                avatarUrl: sender?.avatar_url,
              })
            }
          }
        }

        // 2a. Fetch crew invites TO user (where user is invitee)
        const { data: crewInvitesToUser } = await client
          .from('crew_invites')
          .select(`
            id,
            crew_id,
            inviter_id,
            created_at,
            crews!inner(id, title, created_by)
          `)
          .eq('invitee_id', userId)
          .eq('status', 'pending')
          .order('created_at', { ascending: false })
          .limit(10)

        if (crewInvitesToUser && crewInvitesToUser.length > 0) {
          const inviterIds = crewInvitesToUser.map(inv => inv.inviter_id).filter(Boolean)
          let inviterProfiles: Record<string, { username: string; avatar_url?: string }> = {}
          if (inviterIds.length > 0) {
            const profiles = await fetchProfiles(client, inviterIds)
            inviterProfiles = profiles.reduce<Record<string, { username: string; avatar_url?: string }>>((acc, p) => {
              acc[p.id] = { username: p.username || 'User', avatar_url: p.avatar_url ?? undefined }
              return acc
            }, {})
          }

          for (const invite of crewInvitesToUser) {
            const crew = invite.crews as any
            const inviterProfile = inviterProfiles[invite.inviter_id]
            const inviterName = inviterProfile?.username?.trim().split(/\s+/)[0] || 'Someone'
            const crewName = crew?.title || 'a crew'
            const timeAgo = formatTimeAgo(invite.created_at)

            allNotifications.push({
              id: `crew-invite-${invite.id}`,
              type: 'crew_invite',
              text: `${inviterName} invited you to join "${crewName}"`,
              time: timeAgo,
              link: `/crew/detail?crewId=${crew.id}`,
              inviteId: invite.id,
              crewId: crew.id,
              crewName: crewName,
              inviterName: inviterName,
              avatarUrl: inviterProfile?.avatar_url,
            })
          }
        }

        // 2b. Fetch crew invite requests FROM users (where user is inviter/owner who needs to approve)
        // Also deduplicate by invitee+crew combo to prevent showing duplicates
        const { data: crewInviteRequests } = await client
          .from('crew_invites')
          .select(`
            id,
            crew_id,
            invitee_id,
            inviter_id,
            created_at,
            status,
            crews!inner(id, title, created_by)
          `)
          .eq('inviter_id', userId)
          .eq('status', 'pending')
          .order('created_at', { ascending: false })
          .limit(20) // Fetch more to allow for deduplication

        if (crewInviteRequests && crewInviteRequests.length > 0) {
          // Deduplicate by invitee+crew combo (keep only the most recent)
          const seenCombos = new Set<string>()
          const uniqueRequests = crewInviteRequests.filter((inv: any) => {
            const key = `${inv.invitee_id}:${inv.crew_id}`
            if (seenCombos.has(key)) return false
            seenCombos.add(key)
            return true
          }).slice(0, 10)

          const inviteeIds = uniqueRequests.map((inv: any) => inv.invitee_id).filter(Boolean)
          let inviteeProfilesMap: Record<string, { username: string; avatar_url?: string }> = {}
          
          if (inviteeIds.length > 0) {
            const profiles = await fetchProfiles(client, inviteeIds)
            inviteeProfilesMap = profiles.reduce<Record<string, { username: string; avatar_url?: string }>>((acc, p) => {
              if (p.id) {
                acc[p.id] = { username: p.username || 'User', avatar_url: p.avatar_url ?? undefined }
              }
              return acc
            }, {})
          }

          for (const invite of uniqueRequests) {
            const crew = invite.crews as any
            const invitee = inviteeProfilesMap[invite.invitee_id] || { username: 'Someone' }
            const requesterName = invitee.username?.trim().split(/\s+/)[0] || 'Someone'
            const crewName = crew?.title || 'a crew'
            const timeAgo = formatTimeAgo(invite.created_at)
            
            allNotifications.push({
              id: `crew-request-${invite.id}`,
              type: 'crew_invite',
              text: `${requesterName} wants to join "${crewName}"`,
              time: timeAgo,
              link: `/crew/detail?crewId=${crew.id}`,
              inviteId: invite.id,
              crewId: crew.id,
              crewName: crewName,
              inviterName: requesterName,
              avatarUrl: invitee.avatar_url,
            })
          }
        }

        // 3. Fetch dabs (swipes where user was dabbed)
        const { data: dabs } = await client
          .from('swipes')
          .select('id,swiper,created_at')
          .eq('swipee', userId)
          .eq('action', 'like')
          .order('created_at', { ascending: false })
          .limit(10)

        if (dabs && dabs.length > 0) {
          const swiperIds = Array.from(new Set(dabs.map(d => d.swiper).filter(Boolean) as string[]))
          let swiperProfilesMap: Record<string, { username: string; avatar_url?: string }> = {}
          if (swiperIds.length > 0) {
            const profiles = await fetchProfiles(client, swiperIds)
            swiperProfilesMap = profiles.reduce<Record<string, { username: string; avatar_url?: string }>>((acc, p) => {
              acc[p.id] = { username: p.username, avatar_url: p.avatar_url ?? undefined }
              return acc
            }, {})
          }

          for (const dab of dabs) {
            const swiper = swiperProfilesMap[dab.swiper]
            const firstName = swiper?.username?.trim().split(/\s+/)[0] || 'Someone'
            const timeAgo = formatTimeAgo(dab.created_at)
            allNotifications.push({
              id: `dab-${dab.id}`,
              type: 'dab',
              text: `${firstName} dabbed you`,
              time: timeAgo,
              link: '/home',
              userId: dab.swiper,
              avatarUrl: swiper?.avatar_url,
            })
          }
        }

        setNotifications(allNotifications.slice(0, 20))
      } catch (err) {
        console.error('Failed to load notifications', err)
        setNotifications([])
      } finally {
        setLoading(false)
      }
    }

    loadNotifications()
  }, [userId])

  const handleNotificationClick = (notif: NotificationItem) => {
    if (notif.link) {
      router.push(notif.link)
    }
  }

  const handleAcceptCrewInvite = async (e: React.MouseEvent, inviteId: string) => {
    e.stopPropagation()
    if (!userId || !supabase) return

    // Prevent double-clicks
    if (processingIds.has(inviteId)) return
    setProcessingIds(prev => new Set(prev).add(inviteId))
    // Clear any previous error for this invite
    setErrorIds(prev => { const next = { ...prev }; delete next[inviteId]; return next })

    try {
      const client = supabase

      const { data: inviteData, error: fetchError } = await client
        .from('crew_invites')
        .select('inviter_id, invitee_id, crew_id')
        .eq('id', inviteId)
        .single()

      if (fetchError || !inviteData) {
        setErrorIds(prev => ({ ...prev, [inviteId]: 'Invite not found' }))
        return
      }

      const isRequest = inviteData.inviter_id === userId
      const isInvite = inviteData.invitee_id === userId

      if (isRequest) {
        const { data: threadData, error: threadError } = await client
          .from('threads')
          .select('id')
          .eq('crew_id', inviteData.crew_id)
          .eq('type', 'crew')
          .single()

        if (threadError || !threadData?.id) {
          setErrorIds(prev => ({ ...prev, [inviteId]: 'Crew thread not found' }))
          return
        }

        const { data: existingParticipant } = await client
          .from('thread_participants')
          .select('user_id')
          .eq('thread_id', threadData.id)
          .eq('user_id', inviteData.invitee_id)
          .maybeSingle()

        if (!existingParticipant) {
          const { error: addError } = await client
            .from('thread_participants')
            .insert({
              thread_id: threadData.id,
              user_id: inviteData.invitee_id,
              role: 'member'
            })

          if (addError) {
            console.error('Error adding user to crew:', addError)
            setErrorIds(prev => ({ ...prev, [inviteId]: 'Failed to add user to crew' }))
            return
          }
        }

        // Update ALL pending invites from this user for this crew (handles duplicates)
        const { error: updateError } = await client
          .from('crew_invites')
          .update({ status: 'accepted', accepted_at: new Date().toISOString() })
          .eq('invitee_id', inviteData.invitee_id)
          .eq('crew_id', inviteData.crew_id)
          .eq('status', 'pending')

        if (updateError) {
          console.error('Error updating invite status:', updateError)
        }
      } else if (isInvite) {
        const { error } = await client.rpc('accept_crew_invite', { invite_id: inviteId })
        if (error) {
          console.error('Error accepting invite:', error)
          setErrorIds(prev => ({ ...prev, [inviteId]: 'Failed to accept invitation' }))
          return
        }

        // Also update any duplicate invites for the same crew
        await client
          .from('crew_invites')
          .update({ status: 'accepted', accepted_at: new Date().toISOString() })
          .eq('invitee_id', userId)
          .eq('crew_id', inviteData.crew_id)
          .eq('status', 'pending')
      } else {
        setErrorIds(prev => ({ ...prev, [inviteId]: 'No permission to accept this invite' }))
        return
      }

      // Remove all notifications related to this user+crew combo
      setNotifications(prev => prev.filter(n => {
        if (n.type !== 'crew_invite') return true
        return !(n.crewId === inviteData.crew_id &&
          (n.userId === inviteData.invitee_id || n.inviteId === inviteId))
      }))
      // Clear error on success
      setErrorIds(prev => { const next = { ...prev }; delete next[inviteId]; return next })
      // Notify MobileTopbar to re-check unread count
      window.dispatchEvent(new CustomEvent('notifications-updated'))
    } catch (err) {
      console.error('Error accepting invite:', err)
      setErrorIds(prev => ({ ...prev, [inviteId]: 'Failed to accept invitation' }))
    } finally {
      setProcessingIds(prev => {
        const next = new Set(prev)
        next.delete(inviteId)
        return next
      })
    }
  }

  const handleDeclineCrewInvite = async (e: React.MouseEvent, inviteId: string) => {
    e.stopPropagation()
    if (!userId || !supabase) return

    // Prevent double-clicks
    if (processingIds.has(inviteId)) return
    setProcessingIds(prev => new Set(prev).add(inviteId))
    // Clear any previous error for this invite
    setErrorIds(prev => { const next = { ...prev }; delete next[inviteId]; return next })

    try {
      const client = supabase

      const { data: inviteData, error: fetchError } = await client
        .from('crew_invites')
        .select('inviter_id, invitee_id, crew_id')
        .eq('id', inviteId)
        .single()

      if (fetchError || !inviteData) {
        setErrorIds(prev => ({ ...prev, [inviteId]: 'Invite not found' }))
        return
      }

      const isRequest = inviteData.inviter_id === userId
      const isInvite = inviteData.invitee_id === userId

      if (!isRequest && !isInvite) {
        setErrorIds(prev => ({ ...prev, [inviteId]: 'No permission to decline this invite' }))
        return
      }

      // Update ALL pending invites from this user for this crew (handles duplicates)
      const { error } = await client
        .from('crew_invites')
        .update({ status: 'declined' })
        .eq('invitee_id', inviteData.invitee_id)
        .eq('crew_id', inviteData.crew_id)
        .eq('status', 'pending')

      if (error) {
        console.error('Error declining invite:', error)
        setErrorIds(prev => ({ ...prev, [inviteId]: 'Failed to decline invitation' }))
        return
      }

      // Remove all notifications related to this user+crew combo
      setNotifications(prev => prev.filter(n => {
        if (n.type !== 'crew_invite') return true
        return !(n.crewId === inviteData.crew_id &&
          (n.userId === inviteData.invitee_id || n.inviteId === inviteId))
      }))
      // Clear error on success
      setErrorIds(prev => { const next = { ...prev }; delete next[inviteId]; return next })
      // Notify MobileTopbar to re-check unread count
      window.dispatchEvent(new CustomEvent('notifications-updated'))
    } catch (err) {
      console.error('Error declining invite:', err)
      setErrorIds(prev => ({ ...prev, [inviteId]: 'Failed to decline invitation' }))
    } finally {
      setProcessingIds(prev => {
        const next = new Set(prev)
        next.delete(inviteId)
        return next
      })
    }
  }

  // Dismiss a notification (for messages and dabs)
  const handleDismissNotification = (e: React.MouseEvent, notifId: string) => {
    e.stopPropagation()
    const newDismissed = new Set(dismissedIds).add(notifId)
    setDismissedIds(newDismissed)
    saveDismissedNotifications(newDismissed)
    setNotifications(prev => prev.filter(n => n.id !== notifId))
  }

  // Handle entering chat with a user (for dab notifications)
  const handleEnterChat = async (e: React.MouseEvent, otherUserId: string) => {
    e.stopPropagation()
    if (!userId || !supabase) return

    try {
      const client = supabase

      // Check if a direct thread already exists with this user
      const { data: existingThreads } = await client
        .from('threads')
        .select('id')
        .eq('type', 'direct')
        .or(`and(user_a.eq.${userId},user_b.eq.${otherUserId}),and(user_a.eq.${otherUserId},user_b.eq.${userId})`)
        .limit(1)

      if (existingThreads && existingThreads.length > 0) {
        // Thread exists, navigate to it
        router.push(`/chats/${existingThreads[0].id}`)
      } else {
        // Create new thread
        const { data: newThread, error: createError } = await client
          .from('threads')
          .insert({
            type: 'direct',
            user_a: userId,
            user_b: otherUserId,
          })
          .select('id')
          .single()

        if (createError || !newThread) {
          console.error('Error creating thread:', createError)
          return
        }

        // Navigate to the new thread
        router.push(`/chats/${newThread.id}`)
      }
    } catch (err) {
      console.error('Error entering chat:', err)
    }
  }

  // Filter out dismissed notifications for display
  const visibleNotifications = notifications.filter(n => !dismissedIds.has(n.id))

  return (
    <RequireAuth>
      <div className="notifications-screen" data-name="/notifications">
        <MobileTopbar breadcrumb="Notifications" />
        <div className="notifications-content">
          <div
            className="notifications-card"
            data-node-id="786:2988"
            style={loading || visibleNotifications.length === 0 ? { justifyContent: 'center' } : undefined}
          >
            {loading ? (
              <LoadingState message="Loading notifications…" />
            ) : visibleNotifications.length === 0 ? (
              <EmptyState message="No notifications" />
            ) : (
              <div className="notifications-list" data-node-id="786:2987">
                {visibleNotifications.map(notif => (
                  <div
                    key={notif.id}
                    className="notification-tile"
                    role="button"
                    tabIndex={0}
                    onClick={() => handleNotificationClick(notif)}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleNotificationClick(notif) }}
                    data-node-id="780:2917"
                  >
                    <div className="notification-tile-avatar" data-node-id="780:2908">
                      <Avatar
                        src={notif.avatarUrl}
                        alt=""
                        className="notification-tile-avatar-img"
                        size={40}
                      />
                    </div>
                    <div className="notification-tile-text" data-node-id="780:2912">
                      <p className="notification-tile-title" data-node-id="780:2913">
                        {notif.text}
                      </p>
                      {notif.time && (
                        <p className="notification-tile-timestamp" data-node-id="780:2914">
                          {notif.time}
                        </p>
                      )}
                    </div>
                    {notif.type === 'crew_invite' && notif.inviteId ? (
                      <div className="notification-tile-actions-wrapper">
                        {errorIds[notif.inviteId] && (
                          <span className="notification-tile-error">{errorIds[notif.inviteId]}</span>
                        )}
                        <div className="notification-tile-actions">
                          <button
                            type="button"
                            className={`notification-action-accept ${processingIds.has(notif.inviteId) ? 'processing' : ''}`}
                            onClick={(e) => { e.stopPropagation(); handleAcceptCrewInvite(e, notif.inviteId!) }}
                            disabled={processingIds.has(notif.inviteId)}
                          >
                            {processingIds.has(notif.inviteId) ? '...' : 'Accept'}
                          </button>
                          <button
                            type="button"
                            className={`notification-action-decline ${processingIds.has(notif.inviteId) ? 'processing' : ''}`}
                            onClick={(e) => { e.stopPropagation(); handleDeclineCrewInvite(e, notif.inviteId!) }}
                            disabled={processingIds.has(notif.inviteId)}
                          >
                            {processingIds.has(notif.inviteId) ? '...' : 'Decline'}
                          </button>
                        </div>
                      </div>
                    ) : notif.type === 'dab' && notif.userId ? (
                      <div className="notification-tile-actions-wrapper">
                        <div className="notification-tile-actions">
                          <button
                            type="button"
                            className="notification-action-decline"
                            onClick={(e) => handleDismissNotification(e, notif.id)}
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            className="notification-action-accept"
                            onClick={(e) => handleEnterChat(e, notif.userId!)}
                          >
                            Enter chat
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        className="notification-dismiss"
                        onClick={(e) => { e.stopPropagation(); handleDismissNotification(e, notif.id) }}
                        aria-label="Dismiss notification"
                      >
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <MobileNavbar active="Default" />
      </div>
    </RequireAuth>
  )
}

