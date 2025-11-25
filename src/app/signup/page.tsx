'use client'

import SignupForm from '@/components/SignupForm'
import Logo from '@/components/Logo'
import Link from 'next/link'

export default function SignupPage() {
  return (
    <>
      <header className="site-header">
        <Logo />
        <nav className="nav-links" style={{ gap: '12px' }}>
          <Link className="cta" href="/signup" style={{ padding: '10px 16px', color: '#0c0e12' }}>Get Started</Link>
          <Link className="ghost" href="/login" style={{ padding: '10px 16px' }}>Login</Link>
        </nav>
      </header>
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

          <div style={{ width: '100%', maxWidth: '440px' }}>
            <SignupForm />
          </div>
        </section>
      </main>
    </>
  )
}
