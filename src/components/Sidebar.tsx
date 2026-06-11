import { BookOpen, MessagesSquare, Moon, Sun, X } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

export type View = "chat" | "knowledge"

const items: { id: View; label: string; icon: React.ReactNode; hint: string }[] = [
  {
    id: "chat",
    label: "Assistente",
    icon: <MessagesSquare className="size-4" />,
    hint: "Chiedi al sapere aziendale",
  },
  {
    id: "knowledge",
    label: "Base di conoscenza",
    icon: <BookOpen className="size-4" />,
    hint: "Documenti, PDF e testi",
  },
]

export function Sidebar({
  view,
  setView,
  dark,
  toggleDark,
  mobileOpen,
  onClose,
}: {
  view: View
  setView: (v: View) => void
  dark: boolean
  toggleDark: () => void
  mobileOpen: boolean
  onClose: () => void
}) {
  const select = (v: View) => {
    setView(v)
    onClose()
  }

  return (
    <>
      {/* Backdrop — only on mobile when the drawer is open */}
      <div
        onClick={onClose}
        className={cn(
          "fixed inset-0 z-40 bg-black/40 transition-opacity md:hidden",
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0"
        )}
      />

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar transition-transform",
          "md:static md:z-auto md:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center gap-2.5 px-5 py-5">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <BookOpen className="size-5" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold leading-tight">SapereAI</p>
            <p className="text-xs text-muted-foreground">Conoscenza aziendale</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={onClose}
            aria-label="Chiudi menu"
          >
            <X className="size-4" />
          </Button>
        </div>

        <nav className="flex flex-1 flex-col gap-1 px-3">
          {items.map((item) => (
            <button
              key={item.id}
              onClick={() => select(item.id)}
              className={cn(
                "flex items-start gap-3 rounded-lg px-3 py-2.5 text-left transition-colors cursor-pointer",
                view === item.id
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50"
              )}
            >
              <span className="mt-0.5">{item.icon}</span>
              <span className="flex flex-col">
                <span className="text-sm font-medium">{item.label}</span>
                <span className="text-xs text-muted-foreground">{item.hint}</span>
              </span>
            </button>
          ))}
        </nav>

        <div className="px-3 pb-4">
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-muted-foreground"
            onClick={toggleDark}
          >
            {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
            {dark ? "Tema chiaro" : "Tema scuro"}
          </Button>
          <p className="mt-2 px-3 text-[11px] text-muted-foreground">
            Progetto pilota · demo
          </p>
        </div>
      </aside>
    </>
  )
}
