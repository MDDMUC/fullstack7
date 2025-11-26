import { ReactNode } from 'react'
import { motion, useMotionValue, useTransform } from 'framer-motion'

type Props = {
  children: ReactNode
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  direction?: 'left' | 'right' | 'match' | null
}

export default function SwipeCard({ children, onSwipeLeft, onSwipeRight, direction }: Props) {
  const x = useMotionValue(0)
  const rotate = useTransform(x, [-200, 0, 200], [-15, 0, 15])
  const opacity = useTransform(x, [-200, 0, 200], [0.7, 1, 0.7])

  const onDragEnd = (_event: any, info: any) => {
    const velocity = info.velocity.x
    const offset = info.offset.x
    const threshold = 150
    if (offset > threshold || velocity > 500) {
      onSwipeRight?.()
    } else if (offset < -threshold || velocity < -500) {
      onSwipeLeft?.()
    }
  }

  const animate =
    direction === 'left'
      ? { x: -320, rotate: -15, opacity: 0 }
      : direction === 'right'
      ? { x: 320, rotate: 15, opacity: 0 }
      : direction === 'match'
      ? { y: -120, scale: 1.06, rotate: -2, opacity: 0, boxShadow: '0 0 0 10px rgba(92,225,230,0.32), 0 20px 60px rgba(0,0,0,0.5)' }
      : { x: 0, y: 0, rotate: 0, opacity: 1, scale: 1, boxShadow: 'none' }

  return (
    <motion.div
      className="swipe-card"
      style={{ x, rotate, opacity }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.2}
      onDragEnd={onDragEnd}
      animate={animate}
      transition={{ duration: 0.45, ease: [0.22, 0.61, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}
