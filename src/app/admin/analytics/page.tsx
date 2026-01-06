'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import MobileTopbar from '@/components/MobileTopbar'
import MobileNavbar from '@/components/MobileNavbar'
import { RequireAuth } from '@/components/RequireAuth'
import { useAuthSession } from '@/hooks/useAuthSession'

type TabType = 'overview' | 'funnel' | 'engagement'

export default function AdminAnalyticsPage() {
  const { session } = useAuthSession()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<TabType>('overview')

  // Simple admin check - update this based on your admin user logic
  const isAdmin = session?.user?.email?.includes('admin') ||
                  session?.user?.email?.includes('@mddmuc.com')

  // Redirect non-admin users
  if (session && !isAdmin) {
    router.push('/home')
    return null
  }

  return (
    <RequireAuth>
      <div className="analytics-screen">
        <MobileTopbar breadcrumb="Analytics" />

        <div className="analytics-content">
          {/* Tabs */}
          <div className="analytics-tabs">
            <button
              className={`analytics-tab ${activeTab === 'overview' ? 'analytics-tab-active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              Overview
            </button>
            <button
              className={`analytics-tab ${activeTab === 'funnel' ? 'analytics-tab-active' : ''}`}
              onClick={() => setActiveTab('funnel')}
            >
              Funnel
            </button>
            <button
              className={`analytics-tab ${activeTab === 'engagement' ? 'analytics-tab-active' : ''}`}
              onClick={() => setActiveTab('engagement')}
            >
              Engagement
            </button>
          </div>

          {/* Tab Content */}
          <div className="analytics-tab-content">
            {activeTab === 'overview' && (
              <div className="analytics-tab-panel">
                <p style={{ color: 'var(--color-muted)', padding: 'var(--space-lg)' }}>
                  Overview tab - Coming soon
                </p>
              </div>
            )}

            {activeTab === 'funnel' && (
              <div className="analytics-tab-panel">
                <p style={{ color: 'var(--color-muted)', padding: 'var(--space-lg)' }}>
                  Funnel tab - Coming soon
                </p>
              </div>
            )}

            {activeTab === 'engagement' && (
              <div className="analytics-tab-panel">
                <p style={{ color: 'var(--color-muted)', padding: 'var(--space-lg)' }}>
                  Engagement tab - Coming soon
                </p>
              </div>
            )}
          </div>
        </div>

        <MobileNavbar />
      </div>
    </RequireAuth>
  )
}
