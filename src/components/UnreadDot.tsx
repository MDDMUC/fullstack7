'use client'

import React from 'react'

export type UnreadDotProps = {
  className?: string
}

/**
 * Global unread message indicator dot component.
 * Pulsating dot that appears in the top-right corner of avatars/images
 * to indicate unread messages. Uses consistent styling across the app.
 */
export default function UnreadDot({ className = '' }: UnreadDotProps) {
  return <span className={`unread-dot ${className}`} />
}

