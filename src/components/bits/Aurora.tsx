import { cn } from "@/lib/utils"

/**
 * React-Bits style aurora background: a few large, blurred, slowly drifting
 * colour blobs. Purely decorative — sits behind the hero. Honors
 * prefers-reduced-motion via the shared keyframe guard in globals.css.
 */
export function Aurora({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 -z-10 overflow-hidden",
        className,
      )}
    >
      <div
        className="absolute left-1/2 top-[28%] size-[34rem] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-50 blur-[90px] [animation:aurora-drift_18s_ease-in-out_infinite] dark:opacity-30"
        style={{
          background:
            "radial-gradient(circle at center, #2E7FD4 0%, transparent 70%)",
        }}
      />
      <div
        className="absolute left-[32%] top-[55%] size-[26rem] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-40 blur-[90px] [animation:aurora-drift_22s_ease-in-out_infinite_reverse] dark:opacity-25"
        style={{
          background:
            "radial-gradient(circle at center, #5B9BD5 0%, transparent 70%)",
        }}
      />
      <div
        className="absolute left-[68%] top-[48%] size-[24rem] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-30 blur-[90px] [animation:aurora-drift_26s_ease-in-out_infinite] dark:opacity-20"
        style={{
          background:
            "radial-gradient(circle at center, #163F82 0%, transparent 70%)",
        }}
      />
    </div>
  )
}
