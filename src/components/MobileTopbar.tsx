'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuthSession } from '@/hooks/useAuthSession'
import { fetchProfiles } from '@/lib/profiles'
import { supabase, requireSupabase } from '@/lib/supabaseClient'
import Avatar from '@/components/Avatar'

// Inline SVG icons for proper color inheritance
const GymIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M5 12C5 8.13401 8.13401 5 12 5M16.4999 7.5L11.9999 12M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12ZM13 12C13 12.5523 12.5523 13 12 13C11.4477 13 11 12.5523 11 12C11 11.4477 11.4477 11 12 11C12.5523 11 13 11.4477 13 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const BellIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M9.35419 21C10.0593 21.6224 10.9856 22 12 22C13.0145 22 13.9407 21.6224 14.6458 21M18 8C18 6.4087 17.3679 4.88258 16.2427 3.75736C15.1174 2.63214 13.5913 2 12 2C10.4087 2 8.8826 2.63214 7.75738 3.75736C6.63216 4.88258 6.00002 6.4087 6.00002 8C6.00002 11.0902 5.22049 13.206 4.34968 14.6054C3.61515 15.7859 3.24788 16.3761 3.26134 16.5408C3.27626 16.7231 3.31488 16.7926 3.46179 16.9016C3.59448 17 4.19261 17 5.38887 17H18.6112C19.8074 17 20.4056 17 20.5382 16.9016C20.6852 16.7926 20.7238 16.7231 20.7387 16.5408C20.7522 16.3761 20.3849 15.7859 19.6504 14.6054C18.7795 13.206 18 11.0902 18 8Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

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

  // Check if current page matches icon route
  const isProfilePage = pathname?.startsWith('/profile')
  const isGymsPage = pathname?.startsWith('/gyms')
  const isNotificationsPage = pathname?.startsWith('/notifications')

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
        
        // Check for accepted crew invites (last 7 days) where user is the inviter
        // Show notification dot when someone joins user's crew
        const weekAgo = new Date()
        weekAgo.setDate(weekAgo.getDate() - 7)
        const { data: acceptedInvites } = await client
          .from('crew_invites')
          .select('id')
          .eq('inviter_id', userId)
          .eq('status', 'accepted')
          .not('accepted_at', 'is', null)
          .gte('accepted_at', weekAgo.toISOString())
          .limit(20)

        // Check if any accepted invites are not dismissed
        const undismissedAccepted = acceptedInvites?.filter(inv => !dismissed.has(`crew-joined-${inv.id}`)) ?? []
        if (undismissedAccepted.length > 0) {
          setHasUnreadNotifications(true)
          return
        }

        // Check for recent dabs (last 7 days), excluding dismissed ones
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
            <Link href="/profile" className={`mobile-topbar-profile-link ${isProfilePage ? 'active' : ''}`}>
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
            <Link href="/gyms" className={`mobile-topbar-gyms-link ${isGymsPage ? 'active' : ''}`}>
              <div className="mobile-topbar-gyms" data-name="gyms" data-node-id="764:3157">
                <div className="mobile-topbar-gyms-icon" data-name="icon" data-node-id="764:3158">
                  <GymIcon />
                </div>
              </div>
            </Link>
            <Link href="/notifications" className={`mobile-topbar-notifications-link ${isNotificationsPage ? 'active' : ''}`}>
              <div className="mobile-topbar-notifications" data-name="notifications" data-node-id="768:2659">
                <div className="mobile-topbar-notifications-icon" data-name="icon" data-node-id="768:2660">
                  <BellIcon />
                  {hasUnreadNotifications && <div className="unread-dot mobile-topbar-notifications-dot" />}
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}


