'use client'

import { ToastProvider } from '@/components/Toast'
import { MessageToastListener } from '@/components/MessageToastListener'

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <MessageToastListener />
      {children}
    </ToastProvider>
  )
}

