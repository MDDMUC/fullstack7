'use client'

import { useEffect, useState } from 'react'
import { RequireAuth } from '@/components/RequireAuth'
import MobileTopbar from '@/components/MobileTopbar'
import MobileNavbar from '@/components/MobileNavbar'
import { useAuthSession } from '@/hooks/useAuthSession'
import {
  isPushSupported,
  isIOSSafariNonPWA,
  subscribeToPush,
  unsubscribeFromPush,
  getPushPreferences,
} from '@/lib/pushNotifications'
import { isFirebaseConfigured } from '@/lib/firebaseConfig'

export default function SettingsPage() {
  const { session } = useAuthSession()
  const userId = session?.user?.id
  const [pushEnabled, setPushEnabled] = useState(false)
  const [loading, setLoading] = useState(true)
  const [toggling, setToggling] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [showIOSWarning, setShowIOSWarning] = useState(false)
  const [firebaseConfigured, setFirebaseConfigured] = useState(false)

  // Load push preferences on mount
  useEffect(() => {
    const loadPreferences = async () => {
      if (!userId) return

      try {
        setFirebaseConfigured(isFirebaseConfigured())

        // Check if iOS Safari non-PWA
        if (isIOSSafariNonPWA()) {
          setShowIOSWarning(true)
        }

        // Load saved preferences
        const prefs = await getPushPreferences(userId)
        setPushEnabled(prefs?.enabled ?? false)
      } catch (err) {
        console.error('Failed to load push preferences:', err)
      } finally {
        setLoading(false)
      }
    }

    loadPreferences()
  }, [userId])

  const handleToggle = async () => {
    if (!userId) return

    setToggling(true)
    setError(null)
    setSuccessMsg(null)

    try {
      if (!firebaseConfigured) {
        throw new Error('Push notifications not configured. Please contact support.')
      }

      if (!isPushSupported()) {
        throw new Error('Push notifications are not supported in this browser.')
      }

      if (isIOSSafariNonPWA()) {
        throw new Error('Please add DAB to your home screen to enable notifications on iOS.')
      }

      if (!pushEnabled) {
        // Enable notifications
        await subscribeToPush(userId)
        setPushEnabled(true)
        setError(null)
        setSuccessMsg('✅ Notifications enabled successfully!')
      } else {
        // Disable notifications
        await unsubscribeFromPush(userId)
        setPushEnabled(false)
        setError(null)
        setSuccessMsg('Notifications disabled')
      }
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMsg(null), 3000)
      
    } catch (err: any) {
      console.error('Failed to toggle push notifications:', err)
      setError(err.message || 'Failed to update notification settings')
      // Revert toggle state on error
      setPushEnabled(!pushEnabled)
    } finally {
      setToggling(false)
    }
  }

  return (
    <RequireAuth>
      <div className="settings-screen">
        <MobileTopbar breadcrumb="Settings" />

        <div className="settings-content">
          <div className="settings-card custom-scrollbar">
            {/* Notifications Section */}
            <div className="settings-section">
              <div className="settings-section-header">
                <span className="settings-section-icon">🔔</span>
                <h2 className="settings-section-title">
                  Notifications
                </h2>
              </div>

              {/* Firebase Configuration Warning */}
              {!firebaseConfigured && (
                <div className="settings-alert settings-alert-error">
                  <p className="settings-alert-text settings-alert-text-error">
                    ⚠️ Push notifications are not configured. Please complete Firebase setup.
                  </p>
                </div>
              )}

              {/* iOS Safari Warning */}
              {showIOSWarning && (
                <div className="settings-alert settings-alert-warning">
                  <p className="settings-alert-text">
                    📱 <strong>iOS users:</strong> To receive notifications, tap the Share button in Safari and select "Add to Home Screen" first.
                  </p>
                </div>
              )}

              {/* Toggle */}
              <div className="settings-toggle-row">
                <div className="settings-toggle-label">
                  <p className="settings-toggle-title">
                    Enable push notifications
                  </p>
                  <p className="settings-toggle-desc">
                    Get notified about new matches, messages, and events
                  </p>
                </div>

                {/* Toggle Switch */}
                <button
                  type="button"
                  onClick={handleToggle}
                  disabled={toggling || !firebaseConfigured || loading}
                  className="settings-toggle-switch"
                  aria-checked={pushEnabled}
                  role="switch"
                  aria-label="Enable push notifications"
                >
                  <div className="settings-toggle-thumb" />
                </button>
              </div>

              {/* Error Message */}
              {error && (
                <div className="settings-alert settings-alert-error">
                  <p className="settings-alert-text settings-alert-text-error">
                    {error}
                  </p>
                </div>
              )}
              
              {/* Success Message */}
              {successMsg && (
                <div className="settings-alert" style={{ borderColor: 'var(--color-primary)', backgroundColor: 'rgba(92, 225, 230, 0.1)' }}>
                  <p className="settings-alert-text" style={{ color: 'var(--color-primary)' }}>
                    {successMsg}
                  </p>
                </div>
              )}
            </div>

            {/* Coming Soon Sections */}
            <div className="settings-section" style={{ opacity: 0.5 }}>
              <p className="settings-toggle-desc" style={{ textAlign: 'center' }}>
                More settings coming soon...
              </p>
            </div>
          </div>
        </div>

        <MobileNavbar />
      </div>
    </RequireAuth>
  )
}