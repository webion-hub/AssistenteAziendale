import { cn } from "@/lib/utils"

/**
 * Corpass compass mark. The three moving parts — the 8-point star, the gray
 * ring and the navigation needle — are split into their own groups so they can
 * be animated independently (see AnimatedLogo).
 */
export function Logo({
  className,
  starClassName,
  ringClassName,
  needleClassName,
}: {
  className?: string
  starClassName?: string
  ringClassName?: string
  needleClassName?: string
}) {
  return (
    <svg
      viewBox="0 0 200 200"
      className={className}
      role="img"
      aria-label="Corpass"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Compass star */}
      <g className={cn("logo-pivot", starClassName)}>
        <g fill="#2E7FD4">
          <polygon points="100,100 92.3,81.5 100,5" />
          <polygon points="100,100 107.7,81.5 143.8,56.2" />
          <polygon points="100,100 118.5,92.3 195,100" />
          <polygon points="100,100 118.5,107.7 143.8,143.8" />
          <polygon points="100,100 107.7,118.5 100,195" />
          <polygon points="100,100 92.3,118.5 56.2,143.8" />
          <polygon points="100,100 81.5,107.7 5,100" />
          <polygon points="100,100 81.5,92.3 56.2,56.2" />
        </g>
        <g fill="#163F82">
          <polygon points="100,100 100,5 107.7,81.5" />
          <polygon points="100,100 143.8,56.2 118.5,92.3" />
          <polygon points="100,100 195,100 118.5,107.7" />
          <polygon points="100,100 143.8,143.8 107.7,118.5" />
          <polygon points="100,100 100,195 92.3,118.5" />
          <polygon points="100,100 56.2,143.8 81.5,107.7" />
          <polygon points="100,100 5,100 81.5,92.3" />
          <polygon points="100,100 56.2,56.2 92.3,81.5" />
        </g>
      </g>

      {/* Inner disc + gray ring */}
      <g className={ringClassName}>
        <circle cx="100" cy="100" r="49" fill="#ffffff" />
        <circle cx="100" cy="100" r="49" fill="none" stroke="#868D96" strokeWidth="3" />
        <circle cx="100" cy="100" r="43" fill="none" stroke="#B9BEC6" strokeWidth="1" />
      </g>

      {/* Navigation needle */}
      <g className={cn("logo-pivot", needleClassName)}>
        <polygon points="100,66 76,126 100,112" fill="#5B9BD5" />
        <polygon points="100,66 124,126 100,112" fill="#1B4F9C" />
      </g>
    </svg>
  )
}
