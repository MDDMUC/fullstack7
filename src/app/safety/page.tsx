'use client'

import MobileTopbar from '@/components/MobileTopbar'
import MobileNavbar from '@/components/MobileNavbar'
import Footer from '@/components/Footer'

export default function SafetyPage() {
  return (
    <div className="safety-page min-h-screen bg-[var(--color-bg)] pb-[var(--space-xxxl)]">
      <MobileTopbar breadcrumb="Safety" />

      <main className="px-[var(--space-lg)]">
        {/* Hero Section */}
        <div className="flex flex-col gap-[var(--space-sm)] my-[var(--space-xl)]">
          <h1 className="font-bold text-[var(--font-size-xxxl)] text-[var(--color-text)]">
            Safety Guidelines
          </h1>
          <p className="text-[var(--font-size-lg)] text-[var(--color-muted)]">
            Check your knots. Safety over ego, always.
          </p>
        </div>

        {/* Section Cards */}
        <div className="flex flex-col gap-[var(--space-lg)]">
          {/* Emergency Section */}
          <section className="bg-[var(--color-panel)] border border-[var(--color-stroke)] p-[var(--space-lg)] rounded-[var(--radius-lg)]">
            <h2 className="font-bold text-[var(--font-size-md)] text-[var(--color-red)] mb-[var(--space-md)]">
              Emergency
            </h2>
            <div className="text-[var(--font-size-sm)] text-[var(--color-text)] leading-relaxed space-y-[var(--space-sm)]">
              <p>
                If you are in immediate danger or witness a safety emergency, contact local authorities immediately.
              </p>
              <p>
                For urgent safety concerns on DAB, email us at <a href="mailto:safety@dab.app" className="text-[var(--color-red)] underline">safety@dab.app</a>. We respond within 24 hours.
              </p>
            </div>
          </section>

          {/* Personal Safety */}
          <section className="bg-[var(--color-panel)] border border-[var(--color-stroke)] p-[var(--space-lg)] rounded-[var(--radius-lg)]">
            <h2 className="font-bold text-[var(--font-size-md)] text-[var(--color-primary)] mb-[var(--space-md)]">
              Personal Safety
            </h2>
            <div className="text-[var(--font-size-sm)] text-[var(--color-text)] leading-relaxed space-y-[var(--space-sm)]">
              <p>
                Meeting new climbers is one of the best parts of the community, but always prioritize your safety:
              </p>
              <ul className="list-disc pl-[var(--space-lg)] space-y-[var(--space-xs)]">
                <li>Meet in public climbing gyms or popular outdoor crags</li>
                <li>Let a friend know where you're climbing and when you'll be back</li>
                <li>Trust your gut—if something feels off, it probably is</li>
                <li>Share your location with a trusted contact when meeting someone new</li>
                <li>Start with group climbs before climbing one-on-one with someone new</li>
              </ul>
            </div>
          </section>

          {/* Climbing Safety */}
          <section className="bg-[var(--color-panel)] border border-[var(--color-stroke)] p-[var(--space-lg)] rounded-[var(--radius-lg)]">
            <h2 className="font-bold text-[var(--font-size-md)] text-[var(--color-primary)] mb-[var(--space-md)]">
              Climbing Safety
            </h2>
            <div className="text-[var(--font-size-sm)] text-[var(--color-text)] leading-relaxed space-y-[var(--space-sm)]">
              <p>
                DAB connects you with climbing partners, but you're responsible for your own safety on the wall:
              </p>
              <ul className="list-disc pl-[var(--space-lg)] space-y-[var(--space-xs)]">
                <li>Always perform safety checks before climbing (knots, harness, belay device)</li>
                <li>Communicate clearly with your belay partner</li>
                <li>Only belay others if you're certified and confident in your skills</li>
                <li>Be honest about your experience level—no one respects a sandbagger</li>
                <li>Know your limits and don't let anyone pressure you into climbs beyond your ability</li>
              </ul>
            </div>
          </section>

          {/* Reporting Unsafe Behavior */}
          <section className="bg-[var(--color-panel)] border border-[var(--color-stroke)] p-[var(--space-lg)] rounded-[var(--radius-lg)]">
            <h2 className="font-bold text-[var(--font-size-md)] text-[var(--color-primary)] mb-[var(--space-md)]">
              Reporting Unsafe Behavior
            </h2>
            <div className="text-[var(--font-size-sm)] text-[var(--color-text)] leading-relaxed space-y-[var(--space-sm)]">
              <p>
                If you experience or witness unsafe, abusive, or threatening behavior on DAB:
              </p>
              <ul className="list-disc pl-[var(--space-lg)] space-y-[var(--space-xs)]">
                <li>Use the in-app report feature on any profile or message</li>
                <li>Block the user immediately to prevent further contact</li>
                <li>Email detailed information to <a href="mailto:safety@dab.app" className="text-[var(--color-primary)] underline">safety@dab.app</a></li>
                <li>We take all reports seriously and investigate within 24 hours</li>
              </ul>
              <p className="mt-[var(--space-md)]">
                Your safety is our top priority. We have zero tolerance for harassment, threats, or behavior that compromises the safety of our community.
              </p>
            </div>
          </section>

          {/* Privacy & Data */}
          <section className="bg-[var(--color-panel)] border border-[var(--color-stroke)] p-[var(--space-lg)] rounded-[var(--radius-lg)]">
            <h2 className="font-bold text-[var(--font-size-md)] text-[var(--color-primary)] mb-[var(--space-md)]">
              Privacy & Data
            </h2>
            <div className="text-[var(--font-size-sm)] text-[var(--color-text)] leading-relaxed space-y-[var(--space-sm)]">
              <p>
                Protect your personal information:
              </p>
              <ul className="list-disc pl-[var(--space-lg)] space-y-[var(--space-xs)]">
                <li>Don't share your phone number, address, or financial information on the platform</li>
                <li>Be cautious about sharing your home gym if it's very close to where you live</li>
                <li>Use DAB's messaging system instead of moving to personal contact immediately</li>
                <li>Report any requests for money or suspicious financial activity</li>
              </ul>
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
