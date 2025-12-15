'use client'

import React, { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuthSession } from '@/hooks/useAuthSession'
import { fetchProfiles } from '@/lib/profiles'
import { supabase, requireSupabase } from '@/lib/supabaseClient'

const IMG_ICON = 'https://www.figma.com/api/mcp/asset/bc120e3b-d73a-4ad4-a332-a2ce4091d34d'
const IMG_BELL = 'https://www.figma.com/api/mcp/asset/978a0595-d3d3-455f-b118-d48c2e848136'

export type MobileTopbarProps = {
  breadcrumb?: string
  className?: string
}

type NotificationItem = {
  id: string
  type: 'message' | 'dab'
  text: string
  time?: string
  link?: string
  userId?: string
}

/**
 * Mobile topbar component matching Figma node 764:3056
 * Displays breadcrumb text on left, profile avatar and notifications icon on right
 */
export default function MobileTopbar({ breadcrumb = 'Breadcrumb', className = '' }: MobileTopbarProps) {
  const { session } = useAuthSession()
  const router = useRouter()
  const userId = session?.user?.id
  const [profileAvatar, setProfileAvatar] = useState<string | null>(null)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [loadingNotifications, setLoadingNotifications] = useState(false)
  const notificationsRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const loadProfile = async () => {
      if (!userId) {
        setProfileAvatar(null)
        return
      }
      try {
        const client = supabase ?? requireSupabase()
        const profiles = await fetchProfiles(client, [userId])
        if (profiles.length > 0 && profiles[0].avatar_url) {
          setProfileAvatar(profiles[0].avatar_url)
        }
      } catch (err) {
        console.error('Failed to load profile avatar', err)
        setProfileAvatar(null)
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

        // 2. Fetch dabs (swipes where user was dabbed)
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
    setNotificationsOpen(false)
    if (notif.link) {
      router.push(notif.link)
    }
  }

  const handleClearNotifications = () => {
    setNotifications([])
    setNotificationsOpen(false)
  }

  const hasUnreadNotifications = notifications.length > 0

  return (
    <div className={`mobile-topbar ${className}`} data-name="mobile-topbar" data-node-id="764:3057">
      <div className="mobile-topbar-content" data-name="content" data-node-id="764:3058">
        <div className="mobile-topbar-left">
          <div className="mobile-topbar-breadcrumb" data-name="breadcrumb" data-node-id="764:3060">
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
                  {profileAvatar ? (
                    <img src={profileAvatar} alt="Profile" className="mobile-topbar-profile-img" />
                  ) : (
                    <div className="mobile-topbar-profile-placeholder">
                      <img src={IMG_ICON} alt="" className="mobile-topbar-profile-placeholder-img" />
                    </div>
                  )}
                </div>
              </div>
            </Link>
            <div className="mobile-topbar-notifications" data-name="notifications" data-node-id="764:3157" ref={notificationsRef}>
              <button
                type="button"
                className="mobile-topbar-notifications-button"
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                aria-expanded={notificationsOpen}
                aria-label="Notifications"
              >
                <div className="mobile-topbar-notifications-icon" data-name="icon" data-node-id="764:3158">
                  <div className="mobile-topbar-bell" data-name="bell-01" data-node-id="764:3159">
                    <div className="mobile-topbar-bell-inner" data-name="Icon" data-node-id="I764:3159;633:7275">
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
                        <button
                          key={notif.id}
                          type="button"
                          className="mobile-topbar-notification-item"
                          onClick={() => handleNotificationClick(notif)}
                        >
                          <span>{notif.text}</span>
                          {notif.time && <span className="mobile-topbar-notification-time">{notif.time}</span>}
                        </button>
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

