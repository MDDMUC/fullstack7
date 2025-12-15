'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useRef, useState } from 'react'

import ButtonCta from '@/components/ButtonCta'
import MobileNavbar from '@/components/MobileNavbar'
import { RequireAuth } from '@/components/RequireAuth'
import { useAuthSession } from '@/hooks/useAuthSession'
import { supabase } from '@/lib/supabaseClient'
import { uploadImageToStorage } from '@/lib/profileUtils'

const HERO_PLACEHOLDER = '/icons/event-placeholder.svg'

export default function CrewCreatePage() {
  const router = useRouter()
  const { session } = useAuthSession()

  const [title, setTitle] = useState('')
  const [location, setLocation] = useState('')
  const [description, setDescription] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [status, setStatus] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [uploadingImage, setUploadingImage] = useState(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!session?.user) {
      setError('You must be signed in to create a crew.')
      return
    }
    if (!title.trim()) {
      setError('Title is required.')
      return
    }
    if (!supabase) {
      setError('Unable to connect to Supabase.')
      return
    }
    setSubmitting(true)
    setError(null)
    setStatus(null)

    const payload: Record<string, unknown> = {
      title: title.trim(),
      location: location.trim() || null,
      description: description.trim() || null,
      start_at: null,
      slots_total: null,
      slots_open: null,
      image_url: imageUrl.trim() || null,
      created_by: session.user.id,
    }

    const { error: insertError } = await supabase.from('crews').insert(payload)

    if (insertError) {
      setError(insertError.message)
    } else {
      setStatus('Crew created! Redirecting…')
      setTimeout(() => {
        router.push('/crew')
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
    const url = await uploadImageToStorage(supabase, session.user.id, file, 'crew-cover')
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
      <div className="events-create-screen" data-name="/crew/create">
        <div className="events-create-content">
          <div className="events-create-card">
            <div className="events-detail-backbar">
              <Link href="/crew" className="events-detail-back-btn" aria-label="Back">
                <img src="/icons/chevron-left.svg" alt="" className="events-detail-back-icon" />
              </Link>
              <div className="events-detail-back-text">back</div>
              <div className="events-detail-dots">
                <img src="/icons/dots.svg" alt="" className="events-detail-dots-img" />
              </div>
            </div>

            <div className="events-create-hero">
              <img src={imageUrl || HERO_PLACEHOLDER} alt="" className="events-create-hero-img" />
              <div className="events-create-hero-overlay" />
              <div className="events-create-hero-text">
                <p className="events-detail-title">{title || 'CREW Title'}</p>
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
                  placeholder="Crew Title..."
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
              </div>

              <div className="events-create-field">
                <p className="events-create-label">LOCATION</p>
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
                  onClick={() => router.push('/crew')}
                  disabled={submitting}
                >
                  CANCEL
                </button>
                <ButtonCta type="submit" disabled={submitting || !title.trim()}>
                  {submitting ? 'Creating…' : 'CREATE'}
                </ButtonCta>
              </div>
            </form>
          </div>

          <MobileNavbar active="crew" />
        </div>
      </div>
    </RequireAuth>
  )
}

