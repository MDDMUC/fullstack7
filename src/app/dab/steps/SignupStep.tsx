'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

// Google Logo SVG
const GoogleLogo = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.616z" fill="#4285F4"/>
    <path d="M9 18c2.43 0 4.467-.806 5.965-2.184l-2.908-2.258c-.806.54-1.837.86-3.057.86-2.35 0-4.34-1.587-5.053-3.72H.957v2.332C2.438 15.983 5.482 18 9 18z" fill="#34A853"/>
    <path d="M3.947 10.698c-.18-.54-.282-1.117-.282-1.698s.102-1.158.282-1.698V4.97H.957C.348 6.173 0 7.548 0 9s.348 2.827.957 4.03l2.99-2.332z" fill="#FBBC05"/>
    <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.582C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.97L3.947 7.302C4.66 5.167 6.65 3.58 9 3.58z" fill="#EA4335"/>
  </svg>
)

export default function SignupStep() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirm: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleChange = (field: keyof typeof formData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }))
    setError(null)
  }

  const handleGoogleSignIn = async () => {
    if (!supabase) {
      setError('Authentication not configured')
      return
    }
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=/dab`,
        },
      })
      if (error) throw error
    } catch (err: any) {
      setError(err?.message || 'Google sign-in failed')
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!formData.fullName.trim()) {
      setError('Please enter your name')
      return
    }
    if (!formData.email.trim()) {
      setError('Please enter your email')
      return
    }
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }
    if (formData.password !== formData.confirm) {
      setError('Passwords do not match')
      return
    }

    if (!supabase) {
      setError('Authentication not configured')
      return
    }

    setLoading(true)
    try {
      const { error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            name: formData.fullName,
          },
        },
      })

      if (signUpError) throw signUpError
      // Redirect to onboarding after successful signup
      router.push('/dab')
    } catch (err: any) {
      setError(err?.message || 'Sign up failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="onb-screen">
      {/* ========================================
          BACKGROUND LAYERS - Exact from Figma
          1. Base color: #0c0e12
          2. Video with mix-blend-screen opacity-[0.08]
          3. Gradient overlay: from-transparent to-[rgba(0,0,0,0.2)]
          ======================================== */}
      <div aria-hidden="true" className="onb-bg-layers">
        {/* Layer 1: Base background color */}
        <div className="onb-bg-base" />
        
        {/* Layer 2: Video background with blend mode */}
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
        
        {/* Layer 3: Gradient overlay */}
        <div className="onb-bg-gradient" />
      </div>

      {/* ========================================
          LOGO WATERMARK
          blur-[2px] opacity-20 h-[163px] w-[287px]
          positioned at left-[51px] top-[84px]
          ======================================== */}
      <div className="onb-logo-watermark" aria-hidden="true">
        <img src="/dab-logo.svg" alt="" className="onb-logo-img" />
      </div>

      {/* ========================================
          CONTENT
          basis-0 grow p-[16px] w-full
          flex flex-col items-center justify-between
          ======================================== */}
      <div className="onb-content">
        {/* Text block - title
            flex flex-col gap-[8px] items-center justify-center
            pb-[10px] pt-[44px] px-0 w-full */}
        <div className="onb-text-block">
          <h1 className="onb-title">
            JOIN <br />
            YOUR<br />
            CREW
          </h1>
        </div>

        {/* Signup card
            bg-[#151927] border border-[#1f2633] rounded-[14px] w-full */}
        <div className="onb-signup-card">
          <div className="onb-signup-inner">
            {/* Header text block
                flex flex-col gap-[8px] items-start px-0 py-[10px] w-full */}
            <div className="onb-header-block">
              <h2 className="onb-header-title">Create your account</h2>
              <p className="onb-header-subtitle">We only share data that you agreed to.</p>
            </div>

            {/* Field row - Google + form fields
                flex flex-col gap-[8px] items-start justify-center overflow-clip w-full */}
            <div className="onb-field-row">
              {/* Google button wrapper - h-[46px] p-[2px] */}
              <div className="onb-google-wrapper">
                <button 
                  type="button" 
                  className="onb-google-btn"
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                >
                  <GoogleLogo />
                  <span>Sign in with Google</span>
                </button>
              </div>

              {/* Divider "or" - flex items-center justify-between w-full */}
              <div className="onb-divider">
                <div className="onb-divider-line" />
                <span className="onb-divider-text">or</span>
                <div className="onb-divider-line" />
              </div>

              {/* Full Name field - flex flex-col gap-[6px] */}
              <div className="onb-field">
                <label className="onb-label">Full Name</label>
                <div className="onb-input-wrapper">
                  <input
                    type="text"
                    className="onb-input"
                    placeholder="(we only display your first name)"
                    value={formData.fullName}
                    onChange={handleChange('fullName')}
                    autoComplete="name"
                  />
                </div>
              </div>

              {/* Email field */}
              <div className="onb-field">
                <label className="onb-label">Email</label>
                <div className="onb-input-wrapper">
                  <input
                    type="email"
                    className="onb-input"
                    placeholder="you@dab.com"
                    value={formData.email}
                    onChange={handleChange('email')}
                    autoComplete="email"
                  />
                </div>
              </div>

              {/* Password row - flex flex-wrap gap-[6px] */}
              <div className="onb-pw-row">
                <div className="onb-field onb-field-half">
                  <label className="onb-label">Password</label>
                  <div className="onb-input-wrapper">
                    <input
                      type="password"
                      className="onb-input"
                      placeholder="8+ characters"
                      value={formData.password}
                      onChange={handleChange('password')}
                      autoComplete="new-password"
                    />
                  </div>
                </div>
                <div className="onb-field onb-field-half">
                  <label className="onb-label">Confirm</label>
                  <div className="onb-input-wrapper">
                    <input
                      type="password"
                      className="onb-input"
                      placeholder="Repeat password"
                      value={formData.confirm}
                      onChange={handleChange('confirm')}
                      autoComplete="new-password"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Error message */}
            {error && <p className="onb-error">{error}</p>}

            {/* CTA row - flex gap-[8px] items-center overflow-clip w-full */}
            <div className="onb-cta-row">
              <button 
                type="button"
                className="onb-cta-btn"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? 'Creating...' : "Let's Go"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
