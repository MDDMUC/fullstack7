'use client'

import SignupForm from '@/components/SignupForm'

export default function SignupPage() {
  return (
    <>
      <main className="signup-wrapper" style={{ maxWidth: '1080px' }}>
        <section className="signup-hero" style={{ alignItems: 'center' }}>
          <div className="signup-copy">
            <p className="eyebrow">Join the beta</p>
            <h1>Sign up, then finish onboarding in minutes.</h1>
            <p className="lede">Just your name and login to start. We’ll collect climbing details in the next steps.</p>
            <div className="pill-row">
              <span>1. Create account</span>
              <span>2. Add climbing basics</span>
              <span>3. Take the pledge</span>
            </div>
          </div>

          <div style={{ width: '100%', maxWidth: '420px' }}>
            <SignupForm />
          </div>
        </section>
      </main>
    </>
  )
}
