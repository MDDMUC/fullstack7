'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useRef, useState } from 'react'

import ButtonCta from '@/components/ButtonCta'
import MobileNavbar from '@/components/MobileNavbar'
import BackBar from '@/components/BackBar'
import { RequireAuth } from '@/components/RequireAuth'
import { useAuthSession } from '@/hooks/useAuthSession'
import { supabase } from '@/lib/supabaseClient'
import { uploadImageToStorage } from '@/lib/profileUtils'

const HERO_PLACEHOLDER = '/icons/event-placeholder.svg'

export default function EventCreatePage() {
  const router = useRouter()
  const { session } = useAuthSession()

  const [title, setTitle] = useState('')
  const [location, setLocation] = useState('')
  const [description, setDescription] = useState('')
  const [startAt, setStartAt] = useState('')
  const [slotsTotal, setSlotsTotal] = useState('')
  const [slotsOpen, setSlotsOpen] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [status, setStatus] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [uploadingImage, setUploadingImage] = useState(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!session?.user) {
      setError('You must be signed in to create an event.')
      return
    }
    if (!title.trim() || !startAt) {
      setError('Title and time are required.')
      return
    }
    if (!supabase) {
      setError('Unable to connect to Supabase.')
      return
    }
    setSubmitting(true)
    setError(null)
    setStatus(null)

    const parsedStart = new Date(startAt)
    if (isNaN(parsedStart.getTime())) {
      setError('Invalid date/time.')
      setSubmitting(false)
      return
    }
    const payload: Record<string, unknown> = {
      title: title.trim(),
      location: location.trim() || null,
      description: description.trim() || null,
      start_at: parsedStart.toISOString(),
      slots_total: slotsTotal ? Number(slotsTotal) : null,
      slots_open: slotsOpen ? Number(slotsOpen) : null,
      image_url: imageUrl.trim() || null,
      created_by: session.user.id,
    }

    const { error: insertError } = await supabase.from('events').insert(payload)

    if (insertError) {
      setError(insertError.message)
    } else {
      setStatus('Event created! Redirecting…')
      setTimeout(() => {
        router.push('/events')
      }, 400)
    }

    setSubmitting(false)
  }

  const handleImageSelect = async (file?: File | null) => {
    if (!file) return
    if (!session?.user || !supabase) {
      setError('You must be signed in to upload an image.')
      return
    }
    setUploadingImage(true)
    setError(null)
    setStatus(null)
    const url = await uploadImageToStorage(supabase, session.user.id, file, 'event-cover')
    if (url) {
      setImageUrl(url)
      setStatus('Image uploaded')
    } else {
      setError('Image upload failed.')
    }
    setUploadingImage(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const onPickImage = () => {
    fileInputRef.current?.click()
  }

  const onFileChange: React.ChangeEventHandler<HTMLInputElement> = e => {
    const file = e.target.files?.[0]
    void handleImageSelect(file)
  }

  return (
    <RequireAuth>
      <div className="events-create-screen" data-name="/event/create">
        <div className="events-create-content">
          <div className="events-create-card">
            <BackBar
              backHref="/events"
              backText="back"
              className="events-detail-backbar"
            />

            <div className={`events-create-hero ${!imageUrl ? 'events-create-hero-fallback' : ''}`}>
              {imageUrl && <img src={imageUrl} alt="" className="events-create-hero-img" />}
              <div className="events-create-hero-overlay" />
              <div className="events-create-hero-text">
                <p className="events-detail-title">{title || 'EVENT Title'}</p>
                <p className="events-detail-subtitle">{location || 'Location Name'}</p>
                <div className="events-detail-info-row">
                  <p className="events-detail-info-loc">{location ? '' : 'City'}</p>
                </div>
              </div>
            </div>

            <form className="events-create-form" onSubmit={handleSubmit}>
              <div className="events-create-field">
                <p className="events-create-label">BASICS</p>
                <input
                  type="text"
                  className="events-create-input"
                  placeholder="Event Title..."
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  required
                />
                <div className="events-create-upload-row">
                  <button
                    type="button"
                    className="events-create-upload"
                    onClick={onPickImage}
                    disabled={uploadingImage}
                  >
                    {uploadingImage ? 'Uploading…' : imageUrl ? 'Replace Image' : 'Upload Image'}
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={onFileChange}
                    className="events-create-file-input"
                  />
                </div>
                <div className="events-create-input" style={{ display: 'flex', gap: 'var(--space-md)', padding: 0 }}>
                  <input
                    type="number"
                    className="events-create-input"
                    placeholder="Total slots"
                    value={slotsTotal}
                    onChange={e => setSlotsTotal(e.target.value)}
                    min={0}
                    style={{ flex: 1 }}
                  />
                  <input
                    type="number"
                    className="events-create-input"
                    placeholder="Open slots"
                    value={slotsOpen}
                    onChange={e => setSlotsOpen(e.target.value)}
                    min={0}
                    style={{ flex: 1 }}
                  />
                </div>
              </div>

              <div className="events-create-field">
                <p className="events-create-label">TIME &amp; LOCATION</p>
                <input
                  type="datetime-local"
                  className="events-create-input"
                  placeholder="Enter Day and Time..."
                  value={startAt}
                  onChange={e => setStartAt(e.target.value)}
                />
                <input
                  type="text"
                  className="events-create-input"
                  placeholder="Enter Location..."
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                />
              </div>

              <div className="events-create-field">
                <p className="events-create-label">DESCRIPTION</p>
                <textarea
                  className="events-create-input"
                  placeholder="Enter Description..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  rows={3}
                />
              </div>

              {(error || status) && (
                <p className={error ? 'events-detail-status events-detail-status-error' : 'events-detail-status'}>
                  {error || status}
                </p>
              )}

              <div className="events-create-actions">
                <button
                  type="button"
                  className="events-create-cancel"
                  onClick={() => router.push('/events')}
                  disabled={submitting}
                >
                  CANCEL
                </button>
                <ButtonCta type="submit" disabled={submitting || !title.trim() || !startAt}>
                  {submitting ? 'Creating…' : 'CREATE'}
                </ButtonCta>
              </div>
            </form>
          </div>

          <MobileNavbar active="events" />
        </div>
      </div>
    </RequireAuth>
  )
}
