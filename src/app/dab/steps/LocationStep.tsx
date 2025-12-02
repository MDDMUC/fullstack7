'use client'

import { useState, useEffect } from 'react'
import { useOnboarding } from '@/contexts/OnboardingContext'
import { supabase } from '@/lib/supabaseClient'

/**
 * Onboarding Step 3: Your Walls (Gyms)
 * Figma node: 483-858
 * 
 * Gym data pulled dynamically from Supabase "gyms" table
 * - name: gym name
 * - area: city/location
 */

type Gym = {
  id: string
  name: string
  area: string
  image_url?: string | null
}

export default function LocationStep() {
  const { data, updateData, setCurrentStep } = useOnboarding()
  const [homebase, setHomebase] = useState(data.homebase || '')
  // Initialize selected gyms from data, filtering out 'outside' marker
  const initialGyms = (data.gym || []).filter(id => id !== 'outside')
  const [selectedGyms, setSelectedGyms] = useState<string[]>(initialGyms)
  const [climbsOutside, setClimbsOutside] = useState((data.gym || []).includes('outside'))
  const [gyms, setGyms] = useState<Gym[]>([])
  const [loading, setLoading] = useState(true)
  const [showMoreGyms, setShowMoreGyms] = useState(false)

  // Fetch gyms from Supabase on mount
  useEffect(() => {
    async function fetchGyms() {
      if (!supabase) {
        console.warn('Supabase not configured')
        setLoading(false)
        return
      }

      try {
        // First try with image_url column
        let gymData: Gym[] | null = null
        let error: any = null
        
        const resultWithImage = await supabase
          .from('gyms')
          .select('id, name, area, image_url')
          .order('name', { ascending: true })
        
        gymData = resultWithImage.data
        error = resultWithImage.error

        // If image_url column doesn't exist, fetch without it
        if (error?.message?.includes('image_url does not exist')) {
          const result = await supabase
            .from('gyms')
            .select('id, name, area')
            .order('name', { ascending: true })
          // Map the data to include image_url as null
          gymData = result.data?.map(gym => ({ ...gym, image_url: null })) || null
          error = result.error
        }

        if (error) {
          console.error('Error fetching gyms:', error.message)
        } else if (gymData) {
          setGyms(gymData)
        }
      } catch (err) {
        console.error('Failed to fetch gyms:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchGyms()
  }, [])

  const handleGymToggle = (gymId: string) => {
    setSelectedGyms(prev => 
      prev.includes(gymId)
        ? prev.filter(id => id !== gymId)
        : [...prev, gymId]
    )
  }

  const handleOutsideToggle = () => {
    setClimbsOutside(prev => !prev)
  }

  const visibleGyms = gyms.slice(0, 3)
  const remainingGyms = gyms.slice(3)

  const handleContinue = () => {
    // Validate homebase is required
    if (!homebase || homebase.trim() === '') {
      return // Don't proceed if homebase is empty
    }
    
    // If "I climb outside" is selected, add a special marker
    const gymIds = climbsOutside 
      ? [...selectedGyms, 'outside'] 
      : selectedGyms
    
    updateData({ 
      homebase: homebase.trim(),
      gym: gymIds, // Store selected gym IDs (including 'outside' if selected)
    })
    setCurrentStep(4)
  }

  const isValid = homebase.trim() !== ''

  return (
    <div 
      className="onb-screen"
      data-name="onboarding / step3 / gyms"
      data-node-id="483:858"
    >
      {/* ========================================
          BACKGROUND LAYERS - Same as other screens
          ======================================== */}
      <div aria-hidden="true" className="onb-bg-layers">
        <div className="onb-bg-base" />
        <video
          className="onb-bg-video"
          autoPlay
          loop
          muted
          playsInline
          poster="/hero-main.jpg"
        >
          <source src="/001.mp4" type="video/mp4" />
        </video>
        <div className="onb-bg-gradient" />
      </div>

      {/* ========================================
          CONTENT
          ======================================== */}
      <div className="onb-content onb-content-bottom" data-node-id="483:859">
        
        {/* CARD */}
        <div className="onb-signup-card" data-node-id="483:860">
          <div className="onb-signup-inner">
            
            {/* Header */}
            <div className="onb-header-block" data-node-id="483:861">
              <h2 className="onb-header-title" data-node-id="483:862">Your Walls</h2>
              <p className="onb-header-subtitle" data-node-id="483:863">
                Pick your favorite gyms and see what's going on,
              </p>
            </div>

            {/* Field row */}
            <div className="onb-field-row" data-node-id="483:864">
              
              {/* Homebase field */}
              <div className="onb-field" data-node-id="483:865">
                <label className="onb-label" data-node-id="483:866">Homebase</label>
                <div className="onb-input-wrapper" data-node-id="483:868">
                  <input
                    type="text"
                    className="onb-input"
                    placeholder="Start typing..."
                    value={homebase}
                    onChange={(e) => setHomebase(e.target.value)}
                    data-node-id="I483:869;475:11322"
                  />
                </div>
              </div>

              {/* Gyms field */}
              <div className="onb-field" data-node-id="483:879">
                <label className="onb-label" data-node-id="483:880">Gyms</label>
                <p className="onb-field-description" data-node-id="484:1264">
                  Select all you want to follow or frequently climb at.
                </p>
                
                {/* Gym grid - flex-wrap with gap 6px */}
                <div className="onb-gym-grid" data-node-id="483:881">
                  {loading ? (
                    <p className="onb-gym-loading">Loading gyms...</p>
                  ) : gyms.length === 0 ? (
                    <p className="onb-gym-empty">No gyms found</p>
                  ) : (
                    <>
                      {/* "I climb outside" option */}
                      <button
                        type="button"
                        className={`onb-gym-card ${climbsOutside ? 'onb-gym-card-active' : ''}`}
                        onClick={handleOutsideToggle}
                        data-node-id="climb-outside"
                      >
                        <div className="onb-gym-img-wrap">
                          <div className="onb-gym-outside-icon">🏔️</div>
                        </div>
                        <div className="onb-gym-info">
                          <span className="onb-gym-name">I climb outside</span>
                          <span className="onb-gym-city">Outdoor climbing</span>
                        </div>
                      </button>

                      {/* First 3 gyms - always visible */}
                      {visibleGyms.map((gym) => {
                        const isSelected = selectedGyms.includes(gym.id)
                        return (
                          <button
                            key={gym.id}
                            type="button"
                            className={`onb-gym-card ${isSelected ? 'onb-gym-card-active' : ''}`}
                            onClick={() => handleGymToggle(gym.id)}
                            data-node-id={`gym-${gym.id}`}
                          >
                            {/* Gym image - pulls from Supabase, falls back to placeholder */}
                            <div className="onb-gym-img-wrap">
                              <img 
                                src={gym.image_url || '/placeholder-gym.svg'}
                                alt={gym.name}
                                className="onb-gym-img"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = '/placeholder-gym.svg'
                                }}
                              />
                            </div>
                            
                            {/* Gym info - name from Supabase, area as city */}
                            <div className="onb-gym-info">
                              <span className="onb-gym-name">{gym.name}</span>
                              <span className="onb-gym-city">{gym.area}</span>
                            </div>
                          </button>
                        )
                      })}

                      {/* Dropdown for remaining gyms */}
                      {remainingGyms.length > 0 && (
                        <div className="onb-gym-dropdown-wrapper">
                          <button
                            type="button"
                            className="onb-gym-dropdown-toggle"
                            onClick={() => setShowMoreGyms(!showMoreGyms)}
                            aria-expanded={showMoreGyms}
                          >
                            <span className="onb-gym-dropdown-text">
                              {showMoreGyms ? 'Show less' : `Show ${remainingGyms.length} more gyms`}
                            </span>
                            <span className={`onb-gym-dropdown-arrow ${showMoreGyms ? 'onb-gym-dropdown-arrow-open' : ''}`}>
                              ▼
                            </span>
                          </button>
                          
                          {showMoreGyms && (
                            <div className="onb-gym-dropdown-content">
                              {remainingGyms.map((gym) => {
                                const isSelected = selectedGyms.includes(gym.id)
                                return (
                                  <button
                                    key={gym.id}
                                    type="button"
                                    className={`onb-gym-card ${isSelected ? 'onb-gym-card-active' : ''}`}
                                    onClick={() => handleGymToggle(gym.id)}
                                    data-node-id={`gym-${gym.id}`}
                                  >
                                    <div className="onb-gym-img-wrap">
                                      <img 
                                        src={gym.image_url || '/placeholder-gym.svg'}
                                        alt={gym.name}
                                        className="onb-gym-img"
                                        onError={(e) => {
                                          (e.target as HTMLImageElement).src = '/placeholder-gym.svg'
                                        }}
                                      />
                                    </div>
                                    <div className="onb-gym-info">
                                      <span className="onb-gym-name">{gym.name}</span>
                                      <span className="onb-gym-city">{gym.area}</span>
                                    </div>
                                  </button>
                                )
                              })}
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* CTA row */}
            <div className="onb-cta-row" data-node-id="483:885">
              <button
                type="button"
                className="onb-cta-btn"
                onClick={handleContinue}
                disabled={!isValid}
                data-node-id="483:886"
              >
                Continue 3/5
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
