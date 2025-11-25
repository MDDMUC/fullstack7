'use client'

import { useState, useRef } from 'react'
import { useOnboarding } from '@/contexts/OnboardingContext'
import BackButton from '../components/BackButton'

export default function PhotosStep() {
  const { data, updateData, setCurrentStep } = useOnboarding()
  const [photos, setPhotos] = useState<File[]>(data.photos || [])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const newPhotos = [...photos, ...files].slice(0, 4) // Max 4 photos
    setPhotos(newPhotos)
    updateData({ photos: newPhotos })
  }

  const handleRemovePhoto = (index: number) => {
    const newPhotos = photos.filter((_, i) => i !== index)
    setPhotos(newPhotos)
    updateData({ photos: newPhotos })
  }

  const handleContinue = () => {
    updateData({ photos })
    setCurrentStep(8)
  }

  return (
    <div className="onboard-screen flex flex-col gap-6 items-center justify-center px-4 sm:px-8 md:px-16 lg:px-24 py-12 sm:py-16 md:py-20 lg:py-24 min-h-screen w-full relative">
      <BackButton />
      <div className="onboard-card flex flex-col items-center gap-4">
        <div className="flex gap-2 items-center justify-center px-4 py-0 w-full max-w-2xl">
          <h1 className="font-bold leading-[41px] text-[34px] text-nowrap tracking-[0.374px]" style={{ color: 'var(--text)', margin: 0 }}>
            Photos
          </h1>
        </div>

        <p className="font-normal leading-normal text-[20px] text-center max-w-2xl" style={{ color: 'var(--muted)' }}>
          The more the better match
        </p>

        <div className="flex flex-wrap gap-4 items-center justify-center w-full max-w-md">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-[150px] w-[200px] rounded-[12px] relative overflow-hidden"
              style={{ border: '1px solid var(--stroke)', background: '#0f131d' }}
            >
              {photos[index] ? (
                <>
                  <img
                    src={URL.createObjectURL(photos[index])}
                    alt={`Photo ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemovePhoto(index)}
                    className="absolute top-2 right-2 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold transition-colors"
                    style={{ background: '#ff7b7b', color: '#fff' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#ff5252'}
                    onMouseLeave={(e) => e.currentTarget.style.background = '#ff7b7b'}
                  >
                    A-
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-full flex items-center justify-center text-sm transition-colors"
                  style={{ color: 'var(--muted)' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent)'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'var(--muted)'}
                >
                  <span>+ Add photo</span>
                </button>
              )}
            </div>
          ))}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />

        <div className="w-full max-w-md">
          <button
            onClick={handleContinue}
            className="cta w-full"
            style={{ padding: '10px 16px', borderRadius: '10px' }}
          >
            <span className="font-medium leading-4 text-base tracking-[1.25px] uppercase" style={{ color: '#0c0e12' }}>
              CONTINUE 6/7
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}
