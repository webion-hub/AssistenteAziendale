"use client"

import * as React from "react"
import { useScroll, useSpring, useMotionValueEvent } from "motion/react"

/**
 * Scroll-pinned "come forward" sequence. The stage stays fixed (sticky) while
 * scrolling drives each slide from deep in the scene toward the viewer: it
 * zooms in from small to full size, then keeps zooming and fades as the next
 * slide takes its place. Applied to every slide, first to last.
 *
 * Transforms are written straight to each slide's inline style from the scroll
 * progress (no motion.div), which avoids motion's WAAPI mount handoff.
 */
export function ForwardScroll({ slides }: { slides: React.ReactNode[] }) {
  const ref = React.useRef<HTMLDivElement>(null)
  const slideRefs = React.useRef<(HTMLDivElement | null)[]>([])
  const total = slides.length

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  })
  // Spring-smoothed progress so slides glide between states instead of snapping
  // to each scroll delta.
  const smooth = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 26,
    mass: 0.4,
  })

  const apply = React.useCallback(
    (p: number) => {
      for (let i = 0; i < total; i++) {
        const el = slideRefs.current[i]
        if (!el) continue

        // Each slide owns a window [w0, w1]: a quick zoom-in, a long readable
        // "hold" (scale 1, fully opaque), then a quick zoom-out as the next
        // slide takes over. Windows only touch at the edges, so there's little
        // overlap and each slide stays readable for most of its window.
        const span = 1 / total
        const w0 = i * span
        const w1 = (i + 1) * span
        const isFirst = i === 0
        const isLast = i === total - 1

        const enterEnd = w0 + span * 0.28
        const holdEnd = w1 - span * 0.28
        const xs = [w0, enterEnd, holdEnd, w1]

        const scale = seg(p, xs, [isFirst ? 1 : 0.5, 1, 1, isLast ? 1 : 1.7])
        const opacity = seg(p, xs, [isFirst ? 1 : 0, 1, 1, isLast ? 1 : 0])
        const y = seg(p, xs, [isFirst ? 0 : 70, 0, 0, isLast ? 0 : -50])

        el.style.transform = `translateY(${y.toFixed(2)}px) scale(${scale.toFixed(4)})`
        el.style.opacity = opacity.toFixed(3)
        // Only the front slide should catch clicks; hidden slides above must
        // not block interaction (e.g. the orbital timeline underneath).
        el.style.pointerEvents = opacity > 0.6 ? "auto" : "none"
      }
    },
    [total]
  )

  useMotionValueEvent(smooth, "change", apply)

  React.useEffect(() => {
    apply(smooth.get())
  }, [apply, smooth])

  return (
    <div ref={ref} style={{ height: `${total * 100}vh` }}>
      <div className="sticky top-0 flex h-screen items-center justify-center overflow-hidden">
        {slides.map((slide, i) => (
          <div
            key={i}
            ref={(el) => {
              slideRefs.current[i] = el
            }}
            className="absolute inset-0 flex items-center justify-center px-4 py-20 sm:px-6"
            style={{
              zIndex: i,
              opacity: i === 0 ? 1 : 0,
              pointerEvents: i === 0 ? "auto" : "none",
              willChange: "transform, opacity",
            }}
          >
            <div className="w-full max-w-5xl">{slide}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

/** Piecewise-linear interpolation with clamping at both ends. */
function seg(p: number, xs: number[], ys: number[]): number {
  if (p <= xs[0]) return ys[0]
  for (let i = 1; i < xs.length; i++) {
    if (p <= xs[i]) {
      const span = xs[i] - xs[i - 1] || 1
      const t = (p - xs[i - 1]) / span
      return ys[i - 1] + (ys[i] - ys[i - 1]) * t
    }
  }
  return ys[ys.length - 1]
}
