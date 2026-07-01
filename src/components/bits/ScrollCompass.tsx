"use client"

import * as React from "react"
import { useScroll, useSpring, useMotionValueEvent } from "motion/react"

import { Logo } from "@/components/Logo"
import { cn } from "@/lib/utils"

/**
 * The Corpass compass, anchored bottom-center. As the page scrolls, the needle
 * sweeps clockwise (up to two full turns from top to bottom). A spring smooths
 * the motion so it glides instead of snapping to each scroll delta.
 */
export function ScrollCompass({ className }: { className?: string }) {
  const needleRef = React.useRef<SVGGElement>(null)
  const { scrollYProgress } = useScroll()
  const smooth = useSpring(scrollYProgress, {
    stiffness: 70,
    damping: 22,
    mass: 0.5,
  })

  useMotionValueEvent(smooth, "change", (p) => {
    const el = needleRef.current
    if (el) el.style.transform = `rotate(${(p * 720).toFixed(2)}deg)`
  })

  return (
    <div className={cn("relative", className)}>
      <div
        aria-hidden
        className="absolute inset-0 -z-10 rounded-full blur-xl"
        style={{
          background:
            "radial-gradient(circle, color-mix(in oklch, var(--primary) 45%, transparent), transparent 70%)",
        }}
      />
      <Logo needleRef={needleRef} className="size-full drop-shadow-lg" />
    </div>
  )
}
