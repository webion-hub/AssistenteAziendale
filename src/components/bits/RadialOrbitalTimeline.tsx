"use client"

import * as React from "react"
import { AnimatePresence, motion } from "motion/react"
import { X, type LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"

export interface OrbitItem {
  id: number
  title: string
  content: string
  icon: LucideIcon
  related: number[]
  /** 0-100, drives the little strength bar in the detail card. */
  energy: number
}

/**
 * Radial orbital timeline: items orbit a central hub and auto-rotate. Click a
 * node to pause the orbit and expand its detail card; related nodes pulse.
 */
export function RadialOrbitalTimeline({ items }: { items: OrbitItem[] }) {
  const [rotation, setRotation] = React.useState(0)
  const [expandedId, setExpandedId] = React.useState<number | null>(null)
  const [radius, setRadius] = React.useState(180)

  React.useEffect(() => {
    const onResize = () => setRadius(window.innerWidth < 640 ? 120 : 190)
    onResize()
    window.addEventListener("resize", onResize)
    return () => window.removeEventListener("resize", onResize)
  }, [])

  React.useEffect(() => {
    if (expandedId !== null) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    const id = setInterval(() => setRotation((r) => (r + 0.25) % 360), 32)
    return () => clearInterval(id)
  }, [expandedId])

  const active = items.find((i) => i.id === expandedId) ?? null
  const relatedSet = new Set(active?.related ?? [])

  // Round the trig output: Math.sin/cos can differ in the last ULP between the
  // server (Node) and the browser, which would trip a hydration mismatch on the
  // computed transform string. Rounding makes the first render deterministic.
  const round = (n: number, d = 0) => {
    const f = 10 ** d
    return Math.round(n * f) / f
  }

  const positionOf = (index: number) => {
    const angle = ((index / items.length) * 360 + rotation) * (Math.PI / 180)
    const front = (Math.sin(angle) + 1) / 2 // 0 = back, 1 = front (lower)
    return {
      x: round(Math.cos(angle) * radius, 1),
      y: round(Math.sin(angle) * radius, 1),
      zIndex: Math.round(20 + front * 20),
      opacity: round(0.5 + front * 0.5, 2),
      scale: round(0.85 + front * 0.25, 2),
    }
  }

  return (
    <div
      className="relative flex w-full items-center justify-center overflow-hidden"
      style={{ height: radius * 2 + 140 }}
      onClick={() => setExpandedId(null)}
    >
      {/* Orbit ring */}
      <div
        className="absolute rounded-full border border-border/60"
        style={{ width: radius * 2, height: radius * 2 }}
      />

      {/* Central hub */}
      <div className="absolute flex flex-col items-center">
        <div className="relative flex size-20 items-center justify-center">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary/20" />
          <span
            className="absolute inline-flex size-16 rounded-full bg-primary/25 blur-md"
          />
          <div className="relative flex size-14 items-center justify-center rounded-full border border-primary/40 bg-gradient-to-br from-primary/80 to-primary/40 text-primary-foreground shadow-lg">
            <span className="text-sm font-bold">AI</span>
          </div>
        </div>
      </div>

      {/* Orbiting nodes */}
      {items.map((item, index) => {
        const p = positionOf(index)
        const Icon = item.icon
        const isActive = expandedId === item.id
        const isRelated = relatedSet.has(item.id)
        const dimmed = expandedId !== null && !isActive && !isRelated
        return (
          <button
            key={item.id}
            onClick={(e) => {
              e.stopPropagation()
              setExpandedId((cur) => (cur === item.id ? null : item.id))
            }}
            className="absolute flex flex-col items-center outline-none"
            style={{
              transform: `translate(${p.x}px, ${p.y}px) scale(${isActive ? 1.15 : p.scale})`,
              zIndex: isActive ? 60 : p.zIndex,
              opacity: dimmed ? 0.35 : p.opacity,
              transition: "opacity 0.3s, filter 0.3s",
            }}
          >
            <span
              className={cn(
                "relative flex size-11 items-center justify-center rounded-full border transition-colors",
                isActive || isRelated
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-foreground hover:border-primary/60"
              )}
            >
              {isRelated && !isActive && (
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary/40" />
              )}
              <Icon className="relative size-5" />
            </span>
            <span
              className={cn(
                "mt-2 max-w-24 whitespace-nowrap text-center text-[11px] font-medium",
                isActive ? "text-foreground" : "text-muted-foreground"
              )}
            >
              {item.title}
            </span>
          </button>
        )
      })}

      {/* Detail card (center overlay) */}
      <AnimatePresence>
        {active && (
          <motion.div
            key={active.id}
            initial={{ opacity: 0, scale: 0.9, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 8 }}
            transition={{ duration: 0.25 }}
            onClick={(e) => e.stopPropagation()}
            className="absolute z-[70] w-72 rounded-2xl border border-border bg-popover/95 p-5 text-left shadow-2xl backdrop-blur"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="flex size-9 items-center justify-center rounded-lg bg-primary/15 text-primary">
                  <active.icon className="size-5" />
                </span>
                <h4 className="text-sm font-semibold leading-tight">
                  {active.title}
                </h4>
              </div>
              <button
                onClick={() => setExpandedId(null)}
                aria-label="Chiudi"
                className="rounded-md p-1 text-muted-foreground hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {active.content}
            </p>
            <div className="mt-4">
              <div className="flex items-center justify-between text-[11px] uppercase tracking-wide text-muted-foreground">
                <span>Impatto</span>
                <span>{active.energy}%</span>
              </div>
              <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-primary/70 to-primary"
                  initial={{ width: 0 }}
                  animate={{ width: `${active.energy}%` }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
