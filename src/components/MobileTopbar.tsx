'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuthSession } from '@/hooks/useAuthSession'
import { fetchProfiles } from '@/lib/profiles'
import { supabase, requireSupabase } from '@/lib/supabaseClient'
import Avatar from '@/components/Avatar'

const IMG_BACK = 'https://www.figma.com/api/mcp/asset/66aa6b9e-8828-4ea6-b35f-7f40de2a84f9'
const IMG_GYMS = 'https://www.figma.com/api/mcp/asset/49b9a635-3cbe-4fea-9a36-11dcaa538fca'
const IMG_BELL = 'https://www.figma.com/api/mcp/asset/f04bae63-a13f-4ceb-920f-d32174597230'

// LocalStorage key for dismissed notifications (shared with notifications page)
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

export type MobileTopbarProps = {
  breadcrumb?: string
  className?: string
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
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false)

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

  // Check for unread notifications (accounts for dismissed notifications)
  useEffect(() => {
    const checkUnread = async () => {
      if (!userId || !supabase) {
        setHasUnreadNotifications(false)
        return
      }
      try {
        const client = supabase
        const dismissed = getDismissedNotifications()
        
        // Check for pending crew invites (can't be dismissed, only accepted/declined)
        const { count: inviteCount } = await client
          .from('crew_invites')
          .select('id', { count: 'exact', head: true })
          .or(`invitee_id.eq.${userId},inviter_id.eq.${userId}`)
          .eq('status', 'pending')
        
        // If there are pending invites, show the dot
        if ((inviteCount ?? 0) > 0) {
          setHasUnreadNotifications(true)
          return
        }
        
        // Check for recent dabs (last 7 days), excluding dismissed ones
        const weekAgo = new Date()
        weekAgo.setDate(weekAgo.getDate() - 7)
        const { data: dabs } = await client
          .from('swipes')
          .select('id')
          .eq('swipee', userId)
          .eq('action', 'like')
          .gte('created_at', weekAgo.toISOString())
          .limit(20)
        
        // Check if any dabs are not dismissed
        const undismissedDabs = dabs?.filter(d => !dismissed.has(`dab-${d.id}`)) ?? []
        if (undismissedDabs.length > 0) {
          setHasUnreadNotifications(true)
          return
        }
        
        // No unread notifications
        setHasUnreadNotifications(false)
      } catch (err) {
        console.error('Failed to check notifications', err)
        setHasUnreadNotifications(false)
      }
    }
    checkUnread()
    
    // Listen for storage events (in case notifications are dismissed in another tab)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === DISMISSED_NOTIFICATIONS_KEY) {
        checkUnread()
      }
    }
    // Listen for custom event (when notifications are dismissed on the same page)
    const handleNotificationsUpdated = () => {
      checkUnread()
    }
    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('notifications-updated', handleNotificationsUpdated)
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('notifications-updated', handleNotificationsUpdated)
    }
  }, [userId])

  const handleBack = () => {
    router.back()
  }

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
            <Link href="/notifications" className="mobile-topbar-notifications-link">
              <div className="mobile-topbar-notifications" data-name="notifications" data-node-id="768:2659">
                <div className="mobile-topbar-notifications-icon" data-name="icon" data-node-id="768:2660">
                  <div className="mobile-topbar-bell" data-name="bell-01" data-node-id="768:2661">
                    <div className="mobile-topbar-bell-inner" data-name="Icon" data-node-id="I768:2661;633:7275">
                      <img src={IMG_BELL} alt="Notifications" className="mobile-topbar-bell-img" />
                    </div>
                    {hasUnreadNotifications && <div className="unread-dot mobile-topbar-notifications-dot" />}
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

