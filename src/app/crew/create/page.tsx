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

const CREW_IMAGE_FALLBACK = '/crew-fallback.jpg'

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

    // Step 1: Create the crew
    const { data: crewData, error: insertError } = await supabase
      .from('crews')
      .insert(payload)
      .select('id, title')
      .single()

    if (insertError) {
      setError(insertError.message)
      setSubmitting(false)
      return
    }

    if (!crewData) {
      setError('Failed to create crew')
      setSubmitting(false)
      return
    }

    // Step 2: Create a thread for the crew
    const { data: threadData, error: threadError } = await supabase
      .from('threads')
      .insert({
        type: 'crew',
        crew_id: crewData.id,
        title: crewData.title,
        created_by: session.user.id,
        last_message: 'Crew chat created',
        last_message_at: new Date().toISOString(),
      })
      .select('id')
      .single()

    if (threadError || !threadData) {
      console.error('Failed to create thread:', threadError)
      setError('Crew created but failed to set up chat. Please try accessing it from the crew list.')
      setSubmitting(false)
      // Still redirect since crew was created
      setTimeout(() => {
        router.push('/crew')
      }, 2000)
      return
    }

    // Step 3: Add creator as first participant (owner)
    const { error: participantError } = await supabase
      .from('thread_participants')
      .insert({
        thread_id: threadData.id,
        user_id: session.user.id,
        role: 'owner',
      })

    if (participantError) {
      console.error('Failed to add creator to participants:', participantError)
      setError('Crew created but you may need to refresh to see it. Please check the crew list.')
      setSubmitting(false)
      setTimeout(() => {
        router.push('/crew')
      }, 2000)
      return
    }

    // Success!
    setStatus('Crew created! Redirecting…')
    setSubmitting(false)
    setTimeout(() => {
      router.push('/crew')
    }, 400)
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
            <BackBar backText="create crew" backHref="/crew" />

            <div className="events-create-hero">
              <img src={imageUrl || CREW_IMAGE_FALLBACK} alt="" className="events-create-hero-img" />
              <div className="events-create-hero-overlay" />
              <div className="events-create-hero-text">
                <p className="events-detail-title">{title || 'Crew Name'}</p>
                <p className="events-detail-subtitle">{location || 'Location'}</p>
              </div>
            </div>

            <form className="events-create-form" onSubmit={handleSubmit}>
              <div className="events-create-field">
                <p className="events-create-label">NAME</p>
                <input
                  type="text"
                  className="events-create-input"
                  placeholder="Enter crew name..."
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="events-create-field">
                <p className="events-create-label">LOCATION</p>
                <input
                  type="text"
                  className="events-create-input"
                  placeholder="City, State or Address..."
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                />
              </div>

              <div className="events-create-field">
                <p className="events-create-label">DESCRIPTION</p>
                <textarea
                  className="events-create-input"
                  placeholder="What's this crew about?..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  rows={4}
                />
              </div>

              <div className="events-create-field">
                <p className="events-create-label">COVER IMAGE</p>
                <div className="events-create-upload-row">
                  <button
                    type="button"
                    className="events-create-upload"
                    onClick={onPickImage}
                    disabled={uploadingImage}
                  >
                    {uploadingImage ? 'Uploading…' : imageUrl ? 'Change Image' : 'Upload Image'}
                  </button>
                  {imageUrl && (
                    <span className="events-create-upload-status">✓ Image uploaded</span>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={onFileChange}
                    className="events-create-file-input"
                  />
                </div>
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
        </div>

        <MobileNavbar active="crew" />
      </div>
    </RequireAuth>
  )
}


