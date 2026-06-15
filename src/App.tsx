import * as React from "react"
import { Menu } from "lucide-react"

import { Sidebar, type View } from "@/components/Sidebar"
import { Header } from "@/components/Header"
import { Button } from "@/components/ui/button"
import { ChatView } from "@/components/ChatView"
import { KnowledgeView } from "@/components/KnowledgeView"
import { AppProvider, useStore } from "@/store"

function Shell() {
  const { clearActiveChat, openChat } = useStore()
  const [view, setView] = React.useState<View>("chat")
  const [focusDocId, setFocusDocId] = React.useState<string | null>(null)
  const [dark, setDark] = React.useState(false)
  const [navOpen, setNavOpen] = React.useState(false)
  const [collapsed, setCollapsed] = React.useState(false)

  React.useEffect(() => {
    document.documentElement.classList.toggle("dark", dark)
  }, [dark])

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
        toggleDark={() => setDark((d) => !d)}
        mobileOpen={navOpen}
        onClose={() => setNavOpen(false)}
        collapsed={collapsed}
        toggleCollapsed={() => setCollapsed((c) => !c)}
        onNewChat={handleNewChat}
        onOpenChat={handleOpenChat}
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
  return (
    <AppProvider>
      <Shell />
    </AppProvider>
  )
}

export default App
