import * as React from "react"
import { Menu } from "lucide-react"

import { Sidebar, type View } from "@/components/Sidebar"
import { Header } from "@/components/Header"
import { Button } from "@/components/ui/button"
import { ChatView } from "@/components/ChatView"
import { KnowledgeView } from "@/components/KnowledgeView"
import { Landing } from "@/components/Landing"
import { AppProvider, useStore } from "@/store"

function Shell({
  dark,
  toggleDark,
  onHome,
}: {
  dark: boolean
  toggleDark: () => void
  onHome: () => void
}) {
  const { clearActiveChat, openChat } = useStore()
  const [view, setView] = React.useState<View>("chat")
  const [focusDocId, setFocusDocId] = React.useState<string | null>(null)
  const [navOpen, setNavOpen] = React.useState(false)
  const [collapsed, setCollapsed] = React.useState(false)

  const openDoc = (docId: string) => {
    setFocusDocId(docId)
    setView("knowledge")
  }

  const handleNewChat = () => {
    clearActiveChat()
    setView("chat")
    setNavOpen(false)
  }

  const handleOpenChat = (id: string) => {
    openChat(id)
    setView("chat")
    setNavOpen(false)
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      <Sidebar
        view={view}
        setView={setView}
        dark={dark}
        toggleDark={toggleDark}
        mobileOpen={navOpen}
        onClose={() => setNavOpen(false)}
        collapsed={collapsed}
        toggleCollapsed={() => setCollapsed((c) => !c)}
        onNewChat={handleNewChat}
        onOpenChat={handleOpenChat}
        onHome={onHome}
      />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* Mobile app bar */}
        <div className="flex items-center gap-2 border-b border-border px-4 py-3 md:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setNavOpen(true)}
            aria-label="Apri menu"
          >
            <Menu className="size-5" />
          </Button>
          <span className="text-sm font-semibold">Corpass</span>
        </div>

        <Header view={view} />

        <main className="min-h-0 flex-1 overflow-hidden">
          {view === "chat" && <ChatView onOpenDoc={openDoc} />}
          {view === "knowledge" && (
            <KnowledgeView
              focusDocId={focusDocId}
              clearFocus={() => setFocusDocId(null)}
            />
          )}
        </main>
      </div>
    </div>
  )
}

function App() {
  const [mode, setMode] = React.useState<"landing" | "app">("landing")

  // Theme lives at the app root so it applies to both the landing page and the
  // demo. Starts `true` to match the statically dark-rendered HTML (no
  // hydration mismatch); the stored preference is adopted right after mount.
  const [dark, setDark] = React.useState(true)

  React.useEffect(() => {
    let stored: string | null = null
    try {
      stored = localStorage.getItem("theme")
    } catch {
      // ignore — storage may be unavailable
    }
    const isDark = stored ? stored === "dark" : true
    document.documentElement.classList.toggle("dark", isDark)
    // Legitimate one-off sync of the persisted theme after mount; initializing
    // from localStorage during render would cause a hydration mismatch.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDark(isDark)
  }, [])

  const toggleDark = React.useCallback(() => {
    setDark((prev) => {
      const next = !prev
      document.documentElement.classList.toggle("dark", next)
      try {
        localStorage.setItem("theme", next ? "dark" : "light")
      } catch {
        // ignore — persistence is best-effort
      }
      return next
    })
  }, [])

  return (
    <AppProvider>
      {mode === "landing" ? (
        <Landing
          onEnter={() => setMode("app")}
          dark={dark}
          toggleDark={toggleDark}
        />
      ) : (
        <Shell
          dark={dark}
          toggleDark={toggleDark}
          onHome={() => setMode("landing")}
        />
      )}
    </AppProvider>
  )
}

export default App
