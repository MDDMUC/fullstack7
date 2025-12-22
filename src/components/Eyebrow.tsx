import type { ReactNode } from 'react'

type EyebrowProps = {
  children: ReactNode
  as?: 'p' | 'div' | 'span'
}

export default function Eyebrow({ children, as: Tag = 'p' }: EyebrowProps) {
  return <Tag className="eyebrow">{children}</Tag>
}

