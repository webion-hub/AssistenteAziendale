import * as React from "react"
import { seedDocs, type KnowledgeDoc, type SourceType } from "@/data/knowledge"

interface NewDocInput {
  title: string
  category: string
  sourceType: SourceType
  body: string
}

interface AppStore {
  docs: KnowledgeDoc[]
  addDoc: (input: NewDocInput) => void
  removeDoc: (id: string) => void
}

const AppContext = React.createContext<AppStore | null>(null)

// Split free text into snippet "chunks" — mimics how an ingestion pipeline
// would segment a document before embedding it.
function chunk(body: string, title: string): KnowledgeDoc["snippets"] {
  const blocks = body
    .split(/\n\s*\n/)
    .map((b) => b.trim())
    .filter(Boolean)

  const source = blocks.length > 0 ? blocks : [body.trim()]

  return source.map((block, i) => {
    const firstLine = block.split("\n")[0].slice(0, 60)
    const words = block
      .toLowerCase()
      .replace(/[^\p{L}\s]/gu, " ")
      .split(/\s+/)
      .filter((w) => w.length > 3)
    return {
      id: `chunk-${i}`,
      heading: firstLine || `${title} — parte ${i + 1}`,
      body: block,
      tags: Array.from(new Set(words)).slice(0, 30),
    }
  })
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [docs, setDocs] = React.useState<KnowledgeDoc[]>(seedDocs)

  const addDoc = React.useCallback((input: NewDocInput) => {
    const id = `doc-${input.title.toLowerCase().replace(/\s+/g, "-").slice(0, 20)}-${docCounter()}`
    const newDoc: KnowledgeDoc = {
      id,
      title: input.title,
      category: input.category || "Documenti caricati",
      sourceType: input.sourceType,
      author: "Caricato da te",
      updatedAt: new Date().toISOString().slice(0, 10),
      snippets: chunk(input.body, input.title),
    }
    setDocs((prev) => [newDoc, ...prev])
  }, [])

  const removeDoc = React.useCallback((id: string) => {
    setDocs((prev) => prev.filter((d) => d.id !== id))
  }, [])

  const value = React.useMemo(
    () => ({ docs, addDoc, removeDoc }),
    [docs, addDoc, removeDoc]
  )

  return <AppContext value={value}>{children}</AppContext>
}

let counter = 0
function docCounter() {
  counter += 1
  return counter
}

export function useStore(): AppStore {
  const ctx = React.useContext(AppContext)
  if (!ctx) throw new Error("useStore must be used within AppProvider")
  return ctx
}
