import * as React from "react"
import { BookOpen, Menu } from "lucide-react"

import { Sidebar, type View } from "@/components/Sidebar"
import { Button } from "@/components/ui/button"
import { ChatView } from "@/components/ChatView"
import { KnowledgeView } from "@/components/KnowledgeView"
import { AppProvider } from "@/store"

function App() {
  const [view, setView] = React.useState<View>("chat")
  const [focusDocId, setFocusDocId] = React.useState<string | null>(null)
  const [dark, setDark] = React.useState(false)
  const [navOpen, setNavOpen] = React.useState(false)

  React.useEffect(() => {
    document.documentElement.classList.toggle("dark", dark)
  }, [dark])

  const openDoc = (docId: string) => {
    setFocusDocId(docId)
    setView("knowledge")
  }

  return (
    <AppProvider>
      <div className="flex h-screen overflow-hidden bg-background text-foreground">
        <Sidebar
          view={view}
          setView={setView}
          dark={dark}
          toggleDark={() => setDark((d) => !d)}
          mobileOpen={navOpen}
          onClose={() => setNavOpen(false)}
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
            <div className="flex items-center gap-2">
              <div className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <BookOpen className="size-4" />
              </div>
              <span className="text-sm font-semibold">SapereAI</span>
            </div>
          </div>

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
    </AppProvider>
  )
}

export default App
