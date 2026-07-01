"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * React-Bits style spotlight card: a soft radial glow (in the brand azure)
 * follows the cursor across the card. Theme-aware via `var(--primary)`.
 */
export function SpotlightCard({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  const ref = React.useRef<HTMLDivElement>(null)
  const [pos, setPos] = React.useState({ x: 0, y: 0 })
  const [active, setActive] = React.useState(false)

  const onMove = (e: React.MouseEvent) => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    setPos({ x: e.clientX - rect.left, y: e.clientY - rect.top })
  }

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseEnter={() => setActive(true)}
      onMouseLeave={() => setActive(false)}
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-border bg-card/60 backdrop-blur transition-colors hover:border-primary/40",
        className
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 transition-opacity duration-300"
        style={{
          opacity: active ? 1 : 0,
          background: `radial-gradient(320px circle at ${pos.x}px ${pos.y}px, color-mix(in oklch, var(--primary) 18%, transparent), transparent 70%)`,
        }}
      />
      <div className="relative">{children}</div>
    </div>
  )
}
