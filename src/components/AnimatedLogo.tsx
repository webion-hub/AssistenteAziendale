import { Logo } from "@/components/Logo"
import { cn } from "@/lib/utils"

type Mode = "idle" | "thinking" | "interactive" | "static"

/**
 * The Corpass mark, animated. Looping motion is done in CSS (cheaper than a JS
 * rAF loop for an infinite animation) — see globals.css. Like a real compass,
 * the star/bezel stays put and only the needle swings to find a bearing.
 *
 *  - idle:        gentle float + a calm left/right sway of the needle (hero)
 *  - thinking:    the needle hunts — right, recalibrate, left … (assistant busy)
 *  - interactive: the needle seeks while hovered (brand / sidebar)
 *  - static:      no motion
 */
export function AnimatedLogo({
  className,
  mode = "idle",
}: {
  className?: string
  mode?: Mode
}) {
  const needle = {
    idle: "[animation:logo-sway_6s_ease-in-out_infinite]",
    thinking: "[animation:logo-seek_3s_ease-in-out_infinite]",
    interactive: "group-hover:[animation:logo-seek_2.4s_ease-in-out_infinite]",
    static: "",
  }[mode]

  const root = cn(
    className,
    mode === "idle" && "animate-logo-float [animation:logo-float_5s_ease-in-out_infinite]",
    mode === "interactive" && "group cursor-pointer",
  )

  return <Logo className={root} needleClassName={needle} />
}
