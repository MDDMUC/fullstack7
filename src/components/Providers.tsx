'use client'

import { ToastProvider } from '@/components/Toast'
import { MessageToastListener } from '@/components/MessageToastListener'
import { CrewInviteToastListener } from '@/components/CrewInviteToastListener'

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <MessageToastListener />
      <CrewInviteToastListener />
      {children}
    </ToastProvider>
  )
}

