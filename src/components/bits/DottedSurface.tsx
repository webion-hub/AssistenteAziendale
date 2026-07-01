"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * Animated dotted surface background (Canvas 2D). A grid of dots on a tilted
 * plane undulates with a travelling sine wave; dots further "into" the scene
 * fade and shrink for depth. Brand-azure tinted, adapts to the theme, and
 * freezes for users who prefer reduced motion. No WebGL / heavy deps.
 */
export function DottedSurface({ className }: { className?: string }) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null)

  React.useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches

    let width = 0
    let height = 0
    let dpr = 1

    // Read the theme once per resize so the dot colour matches light/dark.
    let tint = "125, 180, 255" // fallback azure (rgb)
    const readTint = () => {
      const isDark = document.documentElement.classList.contains("dark")
      tint = isDark ? "120, 175, 255" : "70, 120, 210"
    }

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      width = canvas.clientWidth
      height = canvas.clientHeight
      canvas.width = Math.floor(width * dpr)
      canvas.height = Math.floor(height * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      readTint()
    }
    resize()

    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    // Grid of points in "plane" space; rows recede into the distance.
    const spacing = 26
    let raf = 0
    let t = 0

    const draw = () => {
      ctx.clearRect(0, 0, width, height)
      const cols = Math.ceil(width / spacing) + 2
      const rows = Math.ceil(height / spacing) + 2

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x = c * spacing
          const baseY = r * spacing
          // Travelling wave: combine two sines for an organic ripple.
          const wave =
            Math.sin(x * 0.012 + t) * 6 +
            Math.sin(baseY * 0.02 - t * 0.8) * 6
          const y = baseY + wave

          // Depth cue: dots higher on screen are "further", so dimmer/smaller.
          const depth = 1 - baseY / (height + spacing)
          const pulse = (Math.sin(x * 0.012 + baseY * 0.02 + t) + 1) / 2
          const size = 0.8 + pulse * 1.6
          const alpha = (0.12 + pulse * 0.32) * (0.35 + depth * 0.65)

          ctx.beginPath()
          ctx.fillStyle = `rgba(${tint}, ${alpha.toFixed(3)})`
          ctx.arc(x, y, size, 0, Math.PI * 2)
          ctx.fill()
        }
      }
    }

    if (reduced) {
      draw()
      return () => ro.disconnect()
    }

    const loop = () => {
      t += 0.02
      draw()
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)

    // Re-read the tint when the theme class toggles.
    const mo = new MutationObserver(readTint)
    mo.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    })

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      mo.disconnect()
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={cn("pointer-events-none size-full", className)}
    />
  )
}
