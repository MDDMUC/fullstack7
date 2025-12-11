'use client'

export default function ConfirmEmailWaitPage() {
  return (
    <div className="onb-screen">
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

      <div className="onb-logo-watermark" aria-hidden="true">
        <img src="/dab-logo.svg" alt="" className="onb-logo-img" />
      </div>

      <div className="onb-content">
        <div className="onb-text-block">
          <h1 className="onb-title">You have mail!</h1>
          <p className="onb-header-subtitle" style={{ textAlign: 'center' }}>
            Please check your inbox and click the confirmation link to continue.
          </p>
        </div>

        <div
          className="onb-signup-card"
          style={{
            textAlign: 'center',
            gap: 'var(--space-md)',
            padding: 'var(--space-xl)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div className="onb-header-block" style={{ width: '100%' }}>
            <h2 className="onb-header-title">Confirm to proceed</h2>
            <p className="onb-header-subtitle">
              Once confirmed, we’ll take you straight to the first onboarding step.
            </p>
          </div>
          <div className="onb-divider">
            <div className="onb-divider-line" />
            <span className="onb-divider-text">Next</span>
            <div className="onb-divider-line" />
          </div>
          <p className="onb-header-subtitle">
            Didn’t get it? Check spam or request a new link from the sign-up screen.
          </p>
        </div>
      </div>
    </div>
  )
}

