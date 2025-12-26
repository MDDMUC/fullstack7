'use client'

import React from 'react'
import Modal from './Modal'

export type BlockConfirmModalProps = {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  userName?: string
  blocking?: boolean
}

export default function BlockConfirmModal({
  open,
  onClose,
  onConfirm,
  userName,
  blocking = false,
}: BlockConfirmModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Block User"
      size="sm"
      footer={
        <div className="report-modal-footer">
          <button
            type="button"
            className="report-modal-cancel"
            onClick={onClose}
            disabled={blocking}
          >
            Cancel
          </button>
          <button
            type="button"
            className="report-modal-submit"
            onClick={onConfirm}
            disabled={blocking}
          >
            {blocking ? 'Blocking...' : 'Block User'}
          </button>
        </div>
      }
    >
      <div className="report-modal-form">
        <p style={{ margin: 0, color: 'var(--color-text-default)', lineHeight: 1.5 }}>
          Are you sure you want to block <strong>{userName || 'this user'}</strong>? You will no longer see their messages.
        </p>
      </div>
    </Modal>
  )
}
