'use client'

import React, { useState } from 'react'
import Modal from './Modal'
import { reportUser, ReportType } from '@/lib/reports'

export type ReportModalProps = {
  open: boolean
  onClose: () => void
  reportedUserId: string
  reportedUserName?: string
  onSuccess?: () => void
}

const REPORT_TYPES: { value: ReportType; label: string }[] = [
  { value: 'harassment', label: 'Harassment' },
  { value: 'inappropriate', label: 'Inappropriate content' },
  { value: 'spam', label: 'Spam' },
  { value: 'fraud', label: 'Fraud / Scam' },
  { value: 'other', label: 'Other' },
]

export default function ReportModal({
  open,
  onClose,
  reportedUserId,
  reportedUserName,
  onSuccess,
}: ReportModalProps) {
  const [reportType, setReportType] = useState<ReportType>('harassment')
  const [reason, setReason] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async () => {
    if (!reason.trim()) {
      setError('Please provide a reason for your report')
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      await reportUser(reportedUserId, reportType, reason.trim())
      setSuccess(true)
      setTimeout(() => {
        onSuccess?.()
        handleClose()
      }, 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit report')
    } finally {
      setSubmitting(false)
    }
  }

  const handleClose = () => {
    setReportType('harassment')
    setReason('')
    setError(null)
    setSuccess(false)
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={`Report ${reportedUserName || 'User'}`}
      size="md"
      footer={
        !success && (
          <div className="report-modal-footer">
            <button
              type="button"
              className="report-modal-cancel"
              onClick={handleClose}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="button"
              className="report-modal-submit"
              onClick={handleSubmit}
              disabled={submitting || !reason.trim()}
            >
              {submitting ? 'Submitting...' : 'Submit Report'}
            </button>
          </div>
        )
      }
    >
      {success ? (
        <div className="report-modal-success">
          <p>Report submitted successfully. Thank you for helping keep our community safe.</p>
        </div>
      ) : (
        <div className="report-modal-form">
          <div className="report-modal-field">
            <label className="report-modal-label">Reason for report</label>
            <div className="report-modal-options">
              {REPORT_TYPES.map((type) => (
                <label key={type.value} className="report-modal-option">
                  <input
                    type="radio"
                    name="reportType"
                    value={type.value}
                    checked={reportType === type.value}
                    onChange={() => setReportType(type.value)}
                    disabled={submitting}
                  />
                  <span>{type.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="report-modal-field">
            <label className="report-modal-label" htmlFor="report-reason">
              Details
            </label>
            <textarea
              id="report-reason"
              className="report-modal-textarea"
              placeholder="Please describe what happened..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              disabled={submitting}
              rows={4}
            />
          </div>

          {error && <p className="report-modal-error">{error}</p>}
        </div>
      )}
    </Modal>
  )
}
