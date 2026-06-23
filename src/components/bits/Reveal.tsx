"use client"

import { motion } from "motion/react"

/**
 * Entrance reveal powered by motion: fades and slides children up. Pass an
 * increasing `delay` to stagger a list. Respects reduced-motion (motion reads
 * the OS setting and snaps to the end state).
 */
export function Reveal({
  children,
  delay = 0,
  y = 12,
  className,
}: {
  children: React.ReactNode
  delay?: number
  y?: number
  className?: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
