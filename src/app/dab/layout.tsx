import { OnboardingProvider } from '@/contexts/OnboardingContext'

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <OnboardingProvider><div className="onboard-bg">{children}</div></OnboardingProvider>
}






