import { cn } from "@/lib/utils"

/**
 * React-Bits style "shiny text": a soft highlight sweeps across muted text.
 * Handy for transient status labels (e.g. while the assistant is searching).
 */
export function ShinyText({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <span
      className={cn(
        "bg-clip-text text-transparent [background-size:200%_100%] [animation:text-shine_3s_linear_infinite]",
        className,
      )}
      style={{
        backgroundImage:
          "linear-gradient(110deg, var(--muted-foreground) 35%, var(--foreground) 50%, var(--muted-foreground) 65%)",
      }}
    >
      {children}
    </span>
  )
}
