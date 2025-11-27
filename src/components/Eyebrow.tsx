type EyebrowProps = {
  children: React.ReactNode
  as?: 'p' | 'div' | 'span'
}

export default function Eyebrow({ children, as: Tag = 'p' }: EyebrowProps) {
  return <Tag className="eyebrow">{children}</Tag>
}
