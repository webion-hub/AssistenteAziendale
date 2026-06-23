import { cn } from "@/lib/utils"

/**
 * React-Bits style animated gradient text. The gradient pans horizontally on a
 * loop. Uses the Corpass blues.
 */
export function GradientText({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <span
      className={cn(
        "inline-block bg-clip-text text-transparent [background-size:200%_auto] [animation:gradient-pan_5s_linear_infinite]",
        className,
      )}
      style={{
        backgroundImage:
          "linear-gradient(90deg,#1B4F9C,#2E7FD4,#5B9BD5,#2E7FD4,#1B4F9C)",
      }}
    >
      {children}
    </span>
  )
}
