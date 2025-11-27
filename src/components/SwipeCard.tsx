import { ReactNode, useMemo } from 'react'
import { motion, useMotionValue, useTransform } from 'framer-motion'

type SwipeMeta = {
  direction: -1 | 0 | 1
  kind: 'none' | 'pass' | 'like' | 'match'
}

type Props = {
  children: ReactNode
  swipeMeta?: SwipeMeta
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
}

// Lightweight card wrapper inspired by framer-tinder-cards. Dragging left/right
// invokes callbacks and the caller controls exit animations via `swipeMeta`.
export default function SwipeCard({ children, swipeMeta, onSwipeLeft, onSwipeRight }: Props) {
  const x = useMotionValue(0)
  const rotate = useTransform(x, [-220, 0, 220], [-16, 0, 16])
  const shadowTint = useTransform(x, [-200, 0, 200], ['rgba(255,99,132,0.22)', 'rgba(0,0,0,0.5)', 'rgba(92,225,230,0.22)'])
  const opacity = useTransform(x, [-200, 0, 200], [0.7, 1, 0.7])

  const swipeConfidenceThreshold = 8000
  const swipePower = (offset: number, velocity: number) => Math.abs(offset) * velocity

  const onDragEnd = (_event: any, info: any) => {
    const power = swipePower(info.offset.x, info.velocity.x)
    if (power > swipeConfidenceThreshold) {
      onSwipeRight?.()
    } else if (power < -swipeConfidenceThreshold) {
      onSwipeLeft?.()
    }
  }

  const animate = useMemo(() => {
    if (!swipeMeta) return undefined
    if (swipeMeta.kind === 'match') {
      return {
        y: -140,
        scale: 1.06,
        rotate: -2,
        opacity: 0,
        boxShadow: '0 0 0 14px rgba(92,225,230,0.22), 0 24px 70px rgba(0,0,0,0.55)',
      }
    }
    if (swipeMeta.direction === -1) return { x: -420, rotate: -18, opacity: 0, scale: 0.94 }
    if (swipeMeta.direction === 1) return { x: 420, rotate: 18, opacity: 0, scale: 0.94 }
    return { x: 0, y: 0, rotate: 0, opacity: 1, scale: 1 }
  }, [swipeMeta])

  return (
    <motion.div
      className="swipe-card"
      style={{ x, rotate, opacity, boxShadow: shadowTint }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.2}
      onDragEnd={onDragEnd}
      animate={animate}
      transition={{ duration: 0.38, ease: [0.22, 0.61, 0.36, 1] }}
      initial={{ y: 12, opacity: 0.92, scale: 0.99 }}
      whileTap={{ scale: 0.995 }}
    >
      {children}
    </motion.div>
  )
}
