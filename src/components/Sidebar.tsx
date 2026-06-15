import {
  BookOpen,
  MessageSquare,
  MessagesSquare,
  Moon,
  PanelLeft,
  PanelLeftClose,
  Plus,
  Sun,
  Trash2,
  X,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useStore } from "@/store"

export type View = "chat" | "knowledge"

const items: { id: View; label: string; icon: React.ReactNode }[] = [
  {
    id: "chat",
    label: "Assistente",
    icon: <MessagesSquare className="size-4" />,
  },
  {
    id: "knowledge",
    label: "Base di conoscenza",
    icon: <BookOpen className="size-4" />,
  },
]

export function Sidebar({
  view,
  setView,
  dark,
  toggleDark,
  mobileOpen,
  onClose,
  collapsed,
  toggleCollapsed,
  onNewChat,
  onOpenChat,
}: {
  view: View
  setView: (v: View) => void
  dark: boolean
  toggleDark: () => void
  mobileOpen: boolean
  onClose: () => void
  collapsed: boolean
  toggleCollapsed: () => void
  onNewChat: () => void
  onOpenChat: (id: string) => void
}) {
  const { conversations, activeChatId, deleteChat } = useStore()

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
          "fixed inset-y-0 left-0 z-50 flex shrink-0 flex-col overflow-hidden border-r border-sidebar-border bg-sidebar transition-[transform,width]",
          "md:static md:z-auto md:translate-x-0",
          collapsed ? "w-16" : "w-64",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Brand */}
        <div
          className={cn(
            "flex items-center px-3 py-5",
            collapsed ? "justify-center" : "gap-2.5 px-5"
          )}
        >
          {collapsed ? (
            <Button
              variant="ghost"
              size="icon"
              className="hidden md:inline-flex"
              onClick={toggleCollapsed}
              aria-label="Espandi menu"
            >
              <PanelLeft className="size-4" />
            </Button>
          ) : (
            <>
              <h2 className="flex-1 text-sm font-semibold leading-tight">Corpass</h2>
              <Button
                variant="ghost"
                size="icon"
                className="hidden md:inline-flex"
                onClick={toggleCollapsed}
                aria-label="Riduci menu"
              >
                <PanelLeftClose className="size-4" />
              </Button>
            </>
          )}
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

        {/* Nav */}
        <nav className="flex flex-col gap-1 px-3">
          {items.map((item) => (
            <button
              key={item.id}
              onClick={() => select(item.id)}
              title={collapsed ? item.label : undefined}
              className={cn(
                "flex items-center rounded-lg py-2.5 text-left transition-colors cursor-pointer",
                collapsed ? "justify-center px-0" : "gap-3 px-3",
                view === item.id
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50"
              )}
            >
              <span className="shrink-0">{item.icon}</span>
              {!collapsed && (
                <span className="whitespace-nowrap text-sm font-medium">
                  {item.label}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* New chat */}
        <div className="px-3 pt-3">
          <Button
            variant="outline"
            className={cn("w-full gap-2 whitespace-nowrap", collapsed && "px-0")}
            onClick={onNewChat}
            title={collapsed ? "Nuova chat" : undefined}
          >
            <Plus className="size-4 shrink-0" />
            {!collapsed && "Nuova chat"}
          </Button>
        </div>

        {/* History */}
        {!collapsed && (
          <div className="mt-4 flex min-h-0 flex-1 flex-col px-3">
            <p className="px-3 pb-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              Cronologia
            </p>
            <div className="-mx-1 flex-1 overflow-y-auto px-1">
              {conversations.length === 0 ? (
                <p className="whitespace-nowrap px-3 py-2 text-xs text-muted-foreground">
                  Nessuna chat ancora
                </p>
              ) : (
                conversations.map((c) => (
                  <div
                    key={c.id}
                    className={cn(
                      "group flex items-center gap-2 rounded-lg pr-1 transition-colors",
                      view === "chat" && c.id === activeChatId
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                    )}
                  >
                    <button
                      onClick={() => onOpenChat(c.id)}
                      className="flex min-w-0 flex-1 items-center gap-2 px-3 py-2 text-left cursor-pointer"
                    >
                      <MessageSquare className="size-3.5 shrink-0 text-muted-foreground" />
                      <span className="truncate text-sm">{c.title}</span>
                    </button>
                    <button
                      onClick={() => deleteChat(c.id)}
                      className="shrink-0 rounded-md p-1.5 text-muted-foreground opacity-0 transition-opacity hover:text-foreground group-hover:opacity-100 cursor-pointer"
                      aria-label="Elimina chat"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className={cn("mt-auto pb-4 pt-3", collapsed ? "px-2" : "px-3")}>
          <Button
            variant="ghost"
            className={cn(
              "w-full gap-3 whitespace-nowrap text-muted-foreground",
              collapsed ? "justify-center px-0" : "justify-start"
            )}
            onClick={toggleDark}
            title={collapsed ? (dark ? "Tema chiaro" : "Tema scuro") : undefined}
          >
            {dark ? (
              <Sun className="size-4 shrink-0" />
            ) : (
              <Moon className="size-4 shrink-0" />
            )}
            {!collapsed && (dark ? "Tema chiaro" : "Tema scuro")}
          </Button>
        </div>
      </aside>
    </>
  )
}
