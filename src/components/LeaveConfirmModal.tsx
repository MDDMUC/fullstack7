'use client'

import React from 'react'
import Modal from './Modal'

export type LeaveConfirmModalProps = {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  chatName?: string
  leaving?: boolean
}

export default function LeaveConfirmModal({
  open,
  onClose,
  onConfirm,
  chatName,
  leaving = false,
}: LeaveConfirmModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Leave Chat"
      size="sm"
      footer={
        <div className="report-modal-footer">
          <button
            type="button"
            className="report-modal-cancel"
            onClick={onClose}
            disabled={leaving}
          >
            Cancel
          </button>
          <button
            type="button"
            className="report-modal-submit"
            onClick={onConfirm}
            disabled={leaving}
          >
            {leaving ? 'Leaving...' : 'Leave Chat'}
          </button>
        </div>
      }
    >
      <div className="report-modal-form">
        <p style={{ margin: 0, color: 'var(--color-text-default)', lineHeight: 1.5 }}>
          Are you sure you want to leave <strong>{chatName || 'this chat'}</strong>?
        </p>
      </div>
    </Modal>
  )
}
