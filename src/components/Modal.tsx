'use client'

import React, { useEffect, useRef } from 'react'

export type ModalProps = {
  open: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  footer?: React.ReactNode
  showCloseButton?: boolean
  closeOnOverlayClick?: boolean
  className?: string
  overlayClassName?: string
  size?: 'sm' | 'md' | 'lg'
}

/**
 * Modal component for dialogs and overlays throughout the app
 * Consolidates the repeated modal/overlay patterns
 *
 * @param open - Whether the modal is visible
 * @param onClose - Callback when modal should close
 * @param title - Optional title shown in header
 * @param children - Modal content
 * @param footer - Optional footer content (e.g., action buttons)
 * @param showCloseButton - Whether to show X close button (default: true)
 * @param closeOnOverlayClick - Whether clicking overlay closes modal (default: true)
 * @param className - Additional class for modal container
 * @param overlayClassName - Additional class for overlay
 * @param size - Modal size: 'sm' (300px), 'md' (400px), 'lg' (500px) - default 'md'
 */
export default function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  showCloseButton = true,
  closeOnOverlayClick = true,
  className = '',
  overlayClassName = '',
  size = 'md',
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement | null>(null)

  // Handle click outside
  useEffect(() => {
    if (!open || !closeOnOverlayClick) return

    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open, closeOnOverlayClick, onClose])

  // Handle escape key
  useEffect(() => {
    if (!open) return

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [open, onClose])

  if (!open) return null

  const sizeClass = {
    sm: 'modal-size-sm',
    md: 'modal-size-md',
    lg: 'modal-size-lg',
  }[size]

  return (
    <div className={`modal-overlay ${overlayClassName}`}>
      <div
        ref={modalRef}
        className={`modal-container ${sizeClass} ${className}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
      >
        {(title || showCloseButton) && (
          <div className="modal-header">
            {title && <h2 id="modal-title" className="modal-title">{title}</h2>}
            {showCloseButton && (
              <button
                type="button"
                className="modal-close"
                onClick={onClose}
                aria-label="Close"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            )}
          </div>
        )}

        <div className="modal-content">
          {children}
        </div>

        {footer && (
          <div className="modal-footer">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}
