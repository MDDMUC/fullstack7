'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import MobileTopbar from '@/components/MobileTopbar'
import MobileNavbar from '@/components/MobileNavbar'
import { RequireAuth } from '@/components/RequireAuth'
import { useAuthSession } from '@/hooks/useAuthSession'
import AdminMetricCard from '@/components/admin/AdminMetricCard'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

type TabType = 'overview' | 'funnel' | 'engagement'

// Mock data for charts
const mockGrowthData = [
  { day: 'Mon', signups: 12, dau: 120 },
  { day: 'Tue', signups: 15, dau: 135 },
  { day: 'Wed', signups: 8, dau: 128 },
  { day: 'Thu', signups: 18, dau: 145 },
  { day: 'Fri', signups: 22, dau: 160 },
  { day: 'Sat', signups: 25, dau: 175 },
  { day: 'Sun', signups: 20, dau: 170 },
]

// Mock recent activity events
const mockRecentActivity = [
  { id: 1, type: 'signup', text: 'New signup from Munich', time: '2m ago', icon: '👤' },
  { id: 2, type: 'match', text: 'Match created in Berlin', time: '5m ago', icon: '🤝' },
  { id: 3, type: 'message', text: 'Message sent in Munich', time: '8m ago', icon: '💬' },
  { id: 4, type: 'signup', text: 'New signup from Munich', time: '12m ago', icon: '👤' },
  { id: 5, type: 'event', text: 'Event RSVP in Munich', time: '15m ago', icon: '📅' },
]

// Mock funnel data
const mockFunnelSteps = [
  { name: 'Basic Profile', count: 150, percentage: 100, dropoff: 0, avgTime: '45s' },
  { name: 'Interests', count: 132, percentage: 88, dropoff: 12, avgTime: '20s' },
  { name: 'Location', count: 118, percentage: 79, dropoff: 11, avgTime: '15s' },
  { name: 'Pledge', count: 105, percentage: 70, dropoff: 11, avgTime: '30s' },
  { name: 'Success', count: 98, percentage: 65, dropoff: 7, avgTime: '10s' },
]

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
                {/* KPI Grid */}
                <div className="admin-kpi-grid">
                  <AdminMetricCard
                    value={142}
                    label="DAU (24h)"
                    trend={{ value: '12%', direction: 'up' }}
                  />
                  <AdminMetricCard
                    value={45}
                    label="Last 7d"
                    trend={{ value: '5%', direction: 'down' }}
                  />
                  <AdminMetricCard
                    value="42%"
                    label="Day 7"
                    trend={{ value: '-', direction: 'neutral' }}
                  />
                  <AdminMetricCard
                    value={89}
                    label="Last 7d"
                    trend={{ value: '8%', direction: 'up' }}
                  />
                </div>

                {/* Growth Chart */}
                <div className="admin-chart-card">
                  <h3 className="admin-chart-title">User Growth</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={mockGrowthData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-default)" opacity={0.2} />
                      <XAxis
                        dataKey="day"
                        stroke="var(--color-text-muted)"
                        style={{ fontSize: 'var(--font-size-xs)' }}
                      />
                      <YAxis
                        stroke="var(--color-text-muted)"
                        style={{ fontSize: 'var(--font-size-xs)' }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'var(--color-surface-panel)',
                          border: '1px solid var(--color-border-default)',
                          borderRadius: 'var(--radius-md)',
                          color: 'var(--color-text-default)',
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="signups"
                        stroke="var(--color-primary)"
                        strokeWidth={2}
                        name="Signups"
                      />
                      <Line
                        type="monotone"
                        dataKey="dau"
                        stroke="var(--color-secondary)"
                        strokeWidth={2}
                        name="DAU"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Recent Activity Feed */}
                <div className="admin-activity-card">
                  <div className="admin-activity-header">
                    <h3 className="admin-activity-title">Live Feed</h3>
                    <div className="stat-live-dot"></div>
                  </div>
                  <div className="admin-activity-list">
                    {mockRecentActivity.map((activity) => (
                      <div key={activity.id} className="admin-activity-item">
                        <span className="admin-activity-icon">{activity.icon}</span>
                        <div className="admin-activity-content">
                          <span className="admin-activity-text">{activity.text}</span>
                          <span className="admin-activity-time">{activity.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'funnel' && (
              <div className="analytics-tab-panel">
                {/* Funnel Summary Card */}
                <div className="admin-funnel-summary">
                  <div className="admin-funnel-completion-rate">65%</div>
                  <div className="admin-funnel-completion-label">Completion Rate</div>
                  <div className="admin-funnel-completion-subtext">Basic Profile → Success</div>
                </div>

                {/* Funnel Visualization */}
                <div className="admin-funnel-card">
                  <h3 className="admin-funnel-title">Onboarding Funnel</h3>
                  <div className="admin-funnel-steps">
                    {mockFunnelSteps.map((step, index) => (
                      <div key={index} className="admin-funnel-step">
                        <div className="admin-funnel-step-header">
                          <span className="admin-funnel-step-label">
                            {step.name} ({step.count})
                          </span>
                          {step.dropoff > 0 && (
                            <span
                              className="admin-funnel-step-dropoff"
                              style={{
                                color: step.dropoff > 20 ? 'var(--color-state-red)' : 'var(--color-muted)'
                              }}
                            >
                              -{step.dropoff}%
                            </span>
                          )}
                        </div>
                        <div className="admin-funnel-bar-container">
                          <div
                            className="admin-funnel-bar-fill"
                            style={{ width: `${step.percentage}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Step Friction Table */}
                <div className="admin-friction-card">
                  <h3 className="admin-friction-title">Step Friction</h3>
                  <table className="admin-friction-table">
                    <thead>
                      <tr>
                        <th>Step Name</th>
                        <th>Avg Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mockFunnelSteps.map((step, index) => {
                        const isSlowest = step.avgTime === '45s' || step.avgTime === '30s'
                        return (
                          <tr key={index}>
                            <td
                              style={{
                                color: isSlowest ? 'var(--color-yellow)' : 'var(--color-text)'
                              }}
                            >
                              {step.name}
                            </td>
                            <td
                              style={{
                                color: isSlowest ? 'var(--color-yellow)' : 'var(--color-text)'
                              }}
                            >
                              {step.avgTime}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
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
