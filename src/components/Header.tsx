import { Bell, ChevronDown, Gift, Info, Languages } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useStore } from "@/store"
import type { View } from "@/components/Sidebar"

export function Header({ view }: { view: View }) {
  const { conversations, activeChatId } = useStore()
  const activeChat = conversations.find((c) => c.id === activeChatId) ?? null

  const title =
    view === "knowledge"
      ? "Base di conoscenza"
      : activeChat?.title ?? "Nuova conversazione"

  return (
    <header className="hidden h-16 shrink-0 items-center gap-4 border-b border-border bg-background/80 px-6 backdrop-blur md:flex">
      {/* Current chat / section name */}
      <p className="min-w-0 flex-1 truncate text-sm font-semibold">{title}</p>

      {/* More info chip */}
      <div className="group relative">
        <a
          href="https://webion.com/en/contact-us"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 rounded-full bg-accent px-3 py-1.5 text-xs font-medium text-accent-foreground transition-colors hover:bg-accent/70"
        >
          <Info className="size-3.5" />
          Maggiori informazioni
        </a>
        <span
          role="tooltip"
          className="pointer-events-none absolute right-0 top-full z-50 mt-2 w-max max-w-xs rounded-md bg-popover px-3 py-1.5 text-xs text-popover-foreground opacity-0 shadow-md ring-1 ring-border transition-opacity group-hover:opacity-100"
        >
          Vuoi più informazioni sulla demo? Invia una mail
        </span>
      </div>

      {/* Right-side actions */}
      <div className="flex items-center gap-1">
        <HeaderIconButton label="Lingua">
          <Languages className="size-4" />
        </HeaderIconButton>
        <HeaderIconButton label="Novità">
          <Gift className="size-4" />
        </HeaderIconButton>
        <HeaderIconButton label="Notifiche" badge>
          <Bell className="size-4" />
        </HeaderIconButton>

        <div className="mx-2 h-6 w-px bg-border" />

        <button className="flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-accent/60">
          <div className="flex size-7 items-center justify-center rounded-md bg-primary/15 text-xs font-semibold text-primary">
            We
          </div>
          <span className="hidden text-sm font-medium sm:inline">Webion</span>
          <ChevronDown className="size-4 text-muted-foreground" />
        </button>
      </div>
    </header>
  )
}

function HeaderIconButton({
  children,
  label,
  badge,
}: {
  children: React.ReactNode
  label: string
  badge?: boolean
}) {
  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={label}
      className="relative text-muted-foreground"
    >
      {children}
      {badge && (
        <span
          className={cn(
            "absolute right-2 top-2 size-2 rounded-full bg-primary ring-2 ring-background"
          )}
        />
      )}
    </Button>
  )
}
