'use client'

import MobileTopbar from '@/components/MobileTopbar'
import MobileNavbar from '@/components/MobileNavbar'
import Footer from '@/components/Footer'

export default function CommunityGuidelinesPage() {
  return (
    <div className="guidelines-page min-h-screen bg-[var(--color-bg)] pb-[var(--space-xxxl)]">
      <MobileTopbar breadcrumb="Guidelines" />

      <main className="px-[var(--space-lg)]">
        {/* Hero Section */}
        <div className="flex flex-col gap-[var(--space-sm)] my-[var(--space-xl)]">
          <h1 className="font-bold text-[var(--font-size-xxxl)] text-[var(--color-text)]">
            Community Guidelines
          </h1>
          <p className="text-[var(--font-size-lg)] text-[var(--color-muted)]">
            Beta is for the wall, respect is for the crew. Treat people with the same trust you'd give a belay partner.
          </p>
        </div>

        {/* Section Cards */}
        <div className="flex flex-col gap-[var(--space-lg)]">
          {/* Be Respectful */}
          <section className="bg-[var(--color-panel)] border border-[var(--color-stroke)] p-[var(--space-lg)] rounded-[var(--radius-lg)]">
            <h2 className="font-bold text-[var(--font-size-md)] text-[var(--color-primary)] mb-[var(--space-md)]">
              Be Respectful
            </h2>
            <div className="text-[var(--font-size-sm)] text-[var(--color-text)] leading-relaxed space-y-[var(--space-sm)]">
              <p>
                The climbing community is built on trust and mutual respect. On DAB, we expect the same:
              </p>
              <ul className="list-disc pl-[var(--space-lg)] space-y-[var(--space-xs)]">
                <li>Treat everyone with kindness, regardless of skill level or background</li>
                <li>No harassment, hate speech, or discriminatory behavior</li>
                <li>Give beta when asked, but don't spray it when it's not wanted</li>
                <li>Respect people's boundaries and comfort levels</li>
                <li>If someone says they're not interested, respect it and move on</li>
              </ul>
            </div>
          </section>

          {/* Be Authentic */}
          <section className="bg-[var(--color-panel)] border border-[var(--color-stroke)] p-[var(--space-lg)] rounded-[var(--radius-lg)]">
            <h2 className="font-bold text-[var(--font-size-md)] text-[var(--color-primary)] mb-[var(--space-md)]">
              Be Authentic
            </h2>
            <div className="text-[var(--font-size-sm)] text-[var(--color-text)] leading-relaxed space-y-[var(--space-sm)]">
              <p>
                Honesty builds trust:
              </p>
              <ul className="list-disc pl-[var(--space-lg)] space-y-[var(--space-xs)]">
                <li>Use real photos of yourself—no catfishing</li>
                <li>Be honest about your climbing ability and certifications</li>
                <li>Don't impersonate others or create fake accounts</li>
                <li>If you're new to climbing, own it—everyone started somewhere</li>
                <li>Be upfront about what you're looking for (climbing partners, friends, dating)</li>
              </ul>
            </div>
          </section>

          {/* Keep It Safe */}
          <section className="bg-[var(--color-panel)] border border-[var(--color-stroke)] p-[var(--space-lg)] rounded-[var(--radius-lg)]">
            <h2 className="font-bold text-[var(--font-size-md)] text-[var(--color-primary)] mb-[var(--space-md)]">
              Keep It Safe
            </h2>
            <div className="text-[var(--font-size-sm)] text-[var(--color-text)] leading-relaxed space-y-[var(--space-sm)]">
              <p>
                Safety comes first, on and off the wall:
              </p>
              <ul className="list-disc pl-[var(--space-lg)] space-y-[var(--space-xs)]">
                <li>Don't share personal information like your address or phone number publicly</li>
                <li>Meet in public places (gyms, popular crags) for first sessions</li>
                <li>Report any threatening, abusive, or unsafe behavior immediately</li>
                <li>Never pressure someone to climb beyond their comfort level</li>
                <li>If you see something concerning, say something</li>
              </ul>
            </div>
          </section>

          {/* No Spam or Solicitation */}
          <section className="bg-[var(--color-panel)] border border-[var(--color-stroke)] p-[var(--space-lg)] rounded-[var(--radius-lg)]">
            <h2 className="font-bold text-[var(--font-size-md)] text-[var(--color-primary)] mb-[var(--space-md)]">
              No Spam or Solicitation
            </h2>
            <div className="text-[var(--font-size-sm)] text-[var(--color-text)] leading-relaxed space-y-[var(--space-sm)]">
              <p>
                DAB is for climbers connecting with climbers:
              </p>
              <ul className="list-disc pl-[var(--space-lg)] space-y-[var(--space-xs)]">
                <li>Don't use DAB to promote products, services, or businesses</li>
                <li>No spam, scams, or solicitation for money</li>
                <li>Don't copy-paste the same message to multiple people</li>
                <li>Keep conversations genuine and personal</li>
              </ul>
            </div>
          </section>

          {/* Content Standards */}
          <section className="bg-[var(--color-panel)] border border-[var(--color-stroke)] p-[var(--space-lg)] rounded-[var(--radius-lg)]">
            <h2 className="font-bold text-[var(--font-size-md)] text-[var(--color-primary)] mb-[var(--space-md)]">
              Content Standards
            </h2>
            <div className="text-[var(--font-size-sm)] text-[var(--color-text)] leading-relaxed space-y-[var(--space-sm)]">
              <p>
                Keep your profile and messages appropriate:
              </p>
              <ul className="list-disc pl-[var(--space-lg)] space-y-[var(--space-xs)]">
                <li>No nudity or sexually explicit content</li>
                <li>No graphic violence or disturbing imagery</li>
                <li>No illegal activities or promotion of drugs</li>
                <li>Photos should show you clearly—action shots are great, but we need to see your face</li>
              </ul>
            </div>
          </section>

          {/* Reporting & Enforcement */}
          <section className="bg-[var(--color-panel)] border border-[var(--color-stroke)] p-[var(--space-lg)] rounded-[var(--radius-lg)]">
            <h2 className="font-bold text-[var(--font-size-md)] text-[var(--color-primary)] mb-[var(--space-md)]">
              Reporting & Enforcement
            </h2>
            <div className="text-[var(--font-size-sm)] text-[var(--color-text)] leading-relaxed space-y-[var(--space-sm)]">
              <p>
                We take these guidelines seriously. Violations may result in:
              </p>
              <ul className="list-disc pl-[var(--space-lg)] space-y-[var(--space-xs)]">
                <li>Warning or temporary suspension for first-time minor violations</li>
                <li>Permanent ban for serious violations or repeat offenses</li>
                <li>Immediate removal for harassment, threats, or illegal activity</li>
              </ul>
              <p className="mt-[var(--space-md)]">
                If you see a violation, report it using the in-app report feature or email <a href="mailto:safety@dab.app" className="text-[var(--color-primary)] underline">safety@dab.app</a>. We review all reports and respond within 24 hours.
              </p>
            </div>
          </section>

          {/* The DAB Community */}
          <section className="bg-[var(--color-panel)] border border-[var(--color-stroke)] p-[var(--space-lg)] rounded-[var(--radius-lg)]">
            <h2 className="font-bold text-[var(--font-size-md)] text-[var(--color-primary)] mb-[var(--space-md)]">
              The DAB Community
            </h2>
            <div className="text-[var(--font-size-sm)] text-[var(--color-text)] leading-relaxed space-y-[var(--space-sm)]">
              <p>
                DAB exists because climbing is better with the right crew. We're here to help you find your people—whether that's a solid belay partner, a psyched crew to send with, or someone who gets why you'd rather be on the wall than anywhere else.
              </p>
              <p>
                Keep it real. Keep it safe. Keep it stoked.
              </p>
              <p className="text-[var(--color-primary)] font-bold">
                Welcome to the crew. 🤙
              </p>
            </div>
          </section>
        </div>
      </main>

      <MobileNavbar />

      <div className="desktop-footer">
        <Footer />
      </div>
    </div>
  )
}
