'use client'

import React, { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuthSession } from '@/hooks/useAuthSession'
import { fetchProfiles } from '@/lib/profiles'
import { supabase, requireSupabase } from '@/lib/supabaseClient'
import Avatar from '@/components/Avatar'

const IMG_BACK = 'https://www.figma.com/api/mcp/asset/66aa6b9e-8828-4ea6-b35f-7f40de2a84f9'
const IMG_ICON = 'https://www.figma.com/api/mcp/asset/819ae93e-17ef-4b2b-9423-20ebaf8b10f1'
const IMG_GYMS = 'https://www.figma.com/api/mcp/asset/49b9a635-3cbe-4fea-9a36-11dcaa538fca'
const IMG_BELL = 'https://www.figma.com/api/mcp/asset/f04bae63-a13f-4ceb-920f-d32174597230'

export type MobileTopbarProps = {
  breadcrumb?: string
  className?: string
}

type NotificationItem = {
  id: string
  type: 'message' | 'dab' | 'crew_invite'
  text: string
  time?: string
  link?: string
  userId?: string
  inviteId?: string
  crewId?: string
  crewName?: string
  inviterName?: string
}

/**
 * Mobile topbar component matching Figma node 764:3056
 * Displays breadcrumb text on left, profile avatar and notifications icon on right
 */
export default function MobileTopbar({ breadcrumb = 'Breadcrumb', className = '' }: MobileTopbarProps) {
  const { session } = useAuthSession()
  const router = useRouter()
  const pathname = usePathname()
  const userId = session?.user?.id
  const [profileAvatar, setProfileAvatar] = useState<string | null>(null)
  const [avatarLoading, setAvatarLoading] = useState(true)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [loadingNotifications, setLoadingNotifications] = useState(false)
  const notificationsRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    // Reset avatar immediately when userId changes to prevent showing stale avatar
    setProfileAvatar(null)
    setAvatarLoading(true)
    
    const loadProfile = async () => {
      if (!userId) {
        setProfileAvatar(null)
        setAvatarLoading(false)
        return
      }
      try {
        const client = supabase ?? requireSupabase()
        const profiles = await fetchProfiles(client, [userId])
        if (profiles.length > 0 && profiles[0].avatar_url) {
          setProfileAvatar(profiles[0].avatar_url)
        } else {
          setProfileAvatar(null)
        }
      } catch (err) {
        console.error('Failed to load profile avatar', err)
        setProfileAvatar(null)
      } finally {
        setAvatarLoading(false)
      }
    }
    loadProfile()
  }, [userId])

  // Fetch notifications
  useEffect(() => {
    const loadNotifications = async () => {
      if (!userId || !supabase) return
      setLoadingNotifications(true)
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
          // Get most recent messages from threads where user is participant and message is not from user
          const { data: recentMessages } = await client
            .from('messages')
            .select('id,thread_id,body,created_at,user_id')
            .in('thread_id', Array.from(threadIds))
            .neq('user_id', userId) // Messages not from current user
            .order('created_at', { ascending: false })
            .limit(10)

          if (recentMessages && recentMessages.length > 0) {
            const senderIds = Array.from(new Set(recentMessages.map(m => m.user_id).filter(Boolean) as string[]))
            let senderProfilesMap: Record<string, { username: string }> = {}
            if (senderIds.length > 0) {
              const profiles = await fetchProfiles(client, senderIds)
              senderProfilesMap = profiles.reduce<Record<string, { username: string }>>((acc, p) => {
                acc[p.id] = { username: p.username }
                return acc
              }, {})
            }

            for (const msg of recentMessages) {
              const sender = senderProfilesMap[msg.user_id]
              const firstName = sender?.username?.trim().split(/\s+/)[0] || 'Someone'
              const timeAgo = formatTimeAgo(msg.created_at)
              allNotifications.push({
                id: `msg-${msg.id}`,
                type: 'message',
                text: `${firstName} sent you a message`,
                time: timeAgo,
                link: `/chats/${msg.thread_id}`,
                userId: msg.user_id,
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
            crews!inner(id, title, created_by),
            inviter:profiles!crew_invites_inviter_id_fkey(id, username)
          `)
          .eq('invitee_id', userId)
          .eq('status', 'pending')
          .order('created_at', { ascending: false })
          .limit(10)

        if (crewInvitesToUser && crewInvitesToUser.length > 0) {
          for (const invite of crewInvitesToUser) {
            const crew = invite.crews as any
            const inviter = invite.inviter as any
            const inviterName = inviter?.username?.trim().split(/\s+/)[0] || 'Someone'
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
            })
          }
        }

        // 2b. Fetch crew invite requests FROM users (where user is inviter/owner who needs to approve)
        const { data: crewInviteRequests, error: requestsError } = await client
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
          .limit(10)

        if (requestsError) {
          console.error('Error fetching crew invite requests:', requestsError)
          if (requestsError.message) console.error('Error message:', requestsError.message)
          if (requestsError.details) console.error('Error details:', requestsError.details)
          if (requestsError.hint) console.error('Error hint:', requestsError.hint)
        } else {
          console.log('Crew invite requests found:', crewInviteRequests?.length || 0, crewInviteRequests)
        }

        if (crewInviteRequests && crewInviteRequests.length > 0) {
          // Fetch profiles for invitees separately
          const inviteeIds = crewInviteRequests.map((inv: any) => inv.invitee_id).filter(Boolean)
          let inviteeProfilesMap: Record<string, { username: string }> = {}
          
          if (inviteeIds.length > 0) {
            const profiles = await fetchProfiles(client, inviteeIds)
            inviteeProfilesMap = profiles.reduce<Record<string, { username: string }>>((acc, p) => {
              if (p.id) {
                acc[p.id] = { username: p.username || 'User' }
              }
              return acc
            }, {})
          }

          for (const invite of crewInviteRequests) {
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
              inviterName: requesterName, // This is actually the requester
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
          let swiperProfilesMap: Record<string, { username: string }> = {}
          if (swiperIds.length > 0) {
            const profiles = await fetchProfiles(client, swiperIds)
            swiperProfilesMap = profiles.reduce<Record<string, { username: string }>>((acc, p) => {
              acc[p.id] = { username: p.username }
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
            })
          }
        }

        // Sort by time (most recent first) - messages and dabs are already sorted by created_at DESC
        // Just limit to 20 most recent
        setNotifications(allNotifications.slice(0, 20))
      } catch (err) {
        console.error('Failed to load notifications', err)
        setNotifications([])
      } finally {
        setLoadingNotifications(false)
      }
    }

    if (notificationsOpen) {
      loadNotifications()
    }
  }, [userId, notificationsOpen])

  // Handle click outside to close notifications
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!notificationsRef.current) return
      if (!notificationsRef.current.contains(e.target as Node)) {
        setNotificationsOpen(false)
      }
    }
    if (notificationsOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [notificationsOpen])

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

  const handleNotificationClick = (notif: NotificationItem) => {
    if (notif.type === 'crew_invite') {
      // Don't close notifications when clicking on crew invite - let them accept/decline
      if (notif.link) {
        router.push(notif.link)
      }
      return
    }
    setNotificationsOpen(false)
    if (notif.link) {
      router.push(notif.link)
    }
  }

  const handleAcceptCrewInvite = async (e: React.MouseEvent, inviteId: string) => {
    e.stopPropagation()
    if (!userId || !supabase) return
    
    try {
      const client = supabase
      
      // First check if this is a request (user is inviter) or an invite (user is invitee)
      const { data: inviteData } = await client
        .from('crew_invites')
        .select('inviter_id, invitee_id, crew_id')
        .eq('id', inviteId)
        .single()
      
      if (!inviteData) {
        alert('Invite not found')
        return
      }

      const isRequest = inviteData.inviter_id === userId // User is owner approving a request
      const isInvite = inviteData.invitee_id === userId // User is accepting an invite

      if (isRequest) {
        // User is approving a request - need to add invitee to thread_participants
        const { data: threadData } = await client
          .from('threads')
          .select('id')
          .eq('crew_id', inviteData.crew_id)
          .eq('type', 'crew')
          .single()

        if (threadData?.id) {
          // Check if user is already a participant
          const { data: existingParticipant } = await client
            .from('thread_participants')
            .select('user_id')
            .eq('thread_id', threadData.id)
            .eq('user_id', inviteData.invitee_id)
            .maybeSingle()

          // Only add if not already a participant
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
              console.error('Error message:', addError.message)
              console.error('Error details:', addError.details)
              console.error('Error hint:', addError.hint)
              console.error('Error code:', addError.code)
              alert('Failed to approve request')
              return
            }
          }

          // Update invite status to accepted (whether user was already a participant or not)
          const { error: updateError } = await client
            .from('crew_invites')
            .update({ status: 'accepted', accepted_at: new Date().toISOString() })
            .eq('id', inviteId)

          if (updateError) {
            console.error('Error updating invite status:', updateError)
            console.error('Error message:', updateError.message)
            console.error('Error details:', updateError.details)
            console.error('Error hint:', updateError.hint)
            console.error('Error code:', updateError.code)
          } else {
            // Show success message
            const { data: inviteeProfile } = await client
              .from('onboardingprofiles')
              .select('username')
              .eq('id', inviteData.invitee_id)
              .single()
            
            const inviteeName = inviteeProfile?.username?.trim().split(/\s+/)[0] || 'User'
            if (existingParticipant) {
              alert(`${inviteeName} is already in the crew. Invite status updated.`)
            } else {
              alert(`${inviteeName} has been added to the crew!`)
            }
          }
        }
      } else if (isInvite) {
        // User is accepting an invite - call the existing function
        const { data, error } = await client.rpc('accept_crew_invite', { invite_id: inviteId })
        
        if (error) {
          console.error('Error accepting invite:', error)
          alert('Failed to accept invitation')
          return
        }
      } else {
        alert('You do not have permission to accept this invite')
        return
      }
      
      // Remove notification and refresh
      setNotifications(prev => prev.filter(n => 
        n.id !== `crew-invite-${inviteId}` && n.id !== `crew-request-${inviteId}`
      ))
      
      // If user was on crew detail page, refresh
      if (window.location.pathname.includes('/crew/detail')) {
        window.location.reload()
      }
    } catch (err) {
      console.error('Error accepting invite:', err)
      alert('Failed to accept invitation')
    }
  }

  const handleDeclineCrewInvite = async (e: React.MouseEvent, inviteId: string) => {
    e.stopPropagation()
    if (!userId || !supabase) return
    
    try {
      const client = supabase
      
      // Check if user is invitee (declining an invite) or inviter (declining a request)
      const { data: inviteData } = await client
        .from('crew_invites')
        .select('inviter_id, invitee_id')
        .eq('id', inviteId)
        .single()
      
      if (!inviteData) {
        alert('Invite not found')
        return
      }

      const isRequest = inviteData.inviter_id === userId // User is owner declining a request
      const isInvite = inviteData.invitee_id === userId // User is declining an invite

      if (!isRequest && !isInvite) {
        alert('You do not have permission to decline this invite')
        return
      }

      // Update invite status to declined
      const { error } = await client
        .from('crew_invites')
        .update({ status: 'declined' })
        .eq('id', inviteId)
      
      if (error) {
        console.error('Error declining invite:', error)
        alert('Failed to decline invitation')
        return
      }
      
      // Remove notification
      setNotifications(prev => prev.filter(n => 
        n.id !== `crew-invite-${inviteId}` && n.id !== `crew-request-${inviteId}`
      ))
    } catch (err) {
      console.error('Error declining invite:', err)
      alert('Failed to decline invitation')
    }
  }

  const handleClearNotifications = () => {
    setNotifications([])
    setNotificationsOpen(false)
  }

  const handleBack = () => {
    // Prefer router.back, fallback to home
    router.back()
    // No extra fallback to avoid double navigation; router.back is fine for mobile flow
  }

  const hasUnreadNotifications = notifications.length > 0
  const showBack =
    pathname?.startsWith('/profile') ||
    pathname?.startsWith('/notifications')

  return (
    <div className={`mobile-topbar ${className}`} data-name="mobile-topbar" data-node-id="764:3057">
      <div className="mobile-topbar-content" data-name="content" data-node-id="764:3058">
        <div className="mobile-topbar-left">
          <div className="mobile-topbar-breadcrumb" data-name="breadcrumb" data-node-id="764:3060">
            {showBack && (
              <button type="button" className="mobile-topbar-back" onClick={handleBack} aria-label="Back">
                <div className="mobile-topbar-back-icon">
                  <img src={IMG_BACK} alt="" className="mobile-topbar-back-img" />
                </div>
              </button>
            )}
            <p className="mobile-topbar-breadcrumb-text" data-node-id="764:3063">
              {breadcrumb}
            </p>
          </div>
        </div>
        <div className="mobile-topbar-right">
          <div className="mobile-topbar-icons" data-name="icons" data-node-id="764:3161">
            <Link href="/profile" className="mobile-topbar-profile-link">
              <div className="mobile-topbar-profile" data-name="profile" data-node-id="764:3073">
                <div className="mobile-topbar-profile-icon" data-name="icon" data-node-id="764:3074">
                  {!avatarLoading && (
                    <Avatar
                      src={profileAvatar}
                      alt="Profile"
                      className="mobile-topbar-profile-img"
                      showPlaceholder={false}
                    />
                  )}
                </div>
              </div>
            </Link>
            <Link href="/gyms" className="mobile-topbar-gyms-link">
              <div className="mobile-topbar-gyms" data-name="gyms" data-node-id="764:3157">
                <div className="mobile-topbar-gyms-icon" data-name="icon" data-node-id="764:3158">
                  <div className="mobile-topbar-bar-chart" data-name="bar-chart-square-up" data-node-id="768:2683">
                    <div className="mobile-topbar-bar-chart-inner" data-name="Icon" data-node-id="I768:2683;633:5687">
                      <img src={IMG_GYMS} alt="Gyms" className="mobile-topbar-bar-chart-img" />
                    </div>
                  </div>
                </div>
              </div>
            </Link>
            <div className="mobile-topbar-notifications" data-name="notifications" data-node-id="768:2659" ref={notificationsRef}>
              <button
                type="button"
                className="mobile-topbar-notifications-button"
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                aria-expanded={notificationsOpen}
                aria-label="Notifications"
              >
                <div className="mobile-topbar-notifications-icon" data-name="icon" data-node-id="768:2660">
                  <div className="mobile-topbar-bell" data-name="bell-01" data-node-id="768:2661">
                    <div className="mobile-topbar-bell-inner" data-name="Icon" data-node-id="I768:2661;633:7275">
                      <img src={IMG_BELL} alt="Notifications" className="mobile-topbar-bell-img" />
                    </div>
                    {hasUnreadNotifications && <div className="unread-dot mobile-topbar-notifications-dot" />}
                  </div>
                </div>
              </button>
              {notificationsOpen && (
                <div className="mobile-topbar-notifications-menu mh-silver-dropdown-right">
                  {loadingNotifications ? (
                    <div className="mobile-topbar-notifications-empty">
                      <p>Loading...</p>
                    </div>
                  ) : notifications.length === 0 ? (
                    <div className="mobile-topbar-notifications-empty">
                      <p>No notifications</p>
                    </div>
                  ) : (
                    <>
                      {notifications.map(notif => (
                        <div
                          key={notif.id}
                          className={`mobile-topbar-notification-item ${notif.type === 'crew_invite' ? 'crew-invite-notification' : ''}`}
                        >
                          <button
                            type="button"
                            className="mobile-topbar-notification-content"
                            onClick={() => handleNotificationClick(notif)}
                          >
                            <span>{notif.text}</span>
                            {notif.time && <span className="mobile-topbar-notification-time">{notif.time}</span>}
                          </button>
                          {notif.type === 'crew_invite' && notif.inviteId && (
                            <div className="crew-invite-actions">
                              <button
                                type="button"
                                className="crew-invite-accept"
                                onClick={(e) => handleAcceptCrewInvite(e, notif.inviteId!)}
                              >
                                Accept
                              </button>
                              <button
                                type="button"
                                className="crew-invite-decline"
                                onClick={(e) => handleDeclineCrewInvite(e, notif.inviteId!)}
                              >
                                Decline
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                      <button
                        type="button"
                        className="mobile-topbar-notifications-clear"
                        onClick={handleClearNotifications}
                      >
                        Clear
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

