import React from 'react'

interface AdminMetricCardProps {
  value: string | number
  label: string
  trend?: {
    value: string
    direction: 'up' | 'down' | 'neutral'
  }
  className?: string
}

export default function AdminMetricCard({
  value,
  label,
  trend,
  className = ''
}: AdminMetricCardProps) {
  const getTrendColor = () => {
    if (!trend) return 'var(--color-text-muted)'
    if (trend.direction === 'up') return 'var(--color-primary)'
    if (trend.direction === 'down') return 'var(--color-state-red)'
    return 'var(--color-text-muted)'
  }

  const getTrendIcon = () => {
    if (!trend) return '-'
    if (trend.direction === 'up') return '↑'
    if (trend.direction === 'down') return '↓'
    return '-'
  }

  return (
    <div className={`admin-metric-card ${className}`}>
      <div className="admin-metric-value">{value}</div>
      <div className="admin-metric-label">{label}</div>
      {trend && (
        <div
          className="admin-metric-trend"
          style={{ color: getTrendColor() }}
        >
          {getTrendIcon()} {trend.value}
        </div>
      )}
    </div>
  )
}
