import * as React from "react"
import { seedDocs, type KnowledgeDoc, type SourceType } from "@/data/knowledge"
import { type Citation } from "@/lib/assistant"

interface NewDocInput {
  title: string
  category: string
  sourceType: SourceType
  body: string
}

export interface ChatMessage {
  id: string
  role: "user" | "assistant"
  text: string
  citations: Citation[]
  confidence?: "alta" | "media" | "nessuna"
}

export interface Conversation {
  id: string
  title: string
  messages: ChatMessage[]
}

interface AppStore {
  docs: KnowledgeDoc[]
  addDoc: (input: NewDocInput) => void
  removeDoc: (id: string) => void
  // Chat history
  conversations: Conversation[]
  activeChatId: string | null
  createChat: () => string
  clearActiveChat: () => void
  openChat: (id: string) => void
  deleteChat: (id: string) => void
  appendMessage: (chatId: string, msg: ChatMessage) => void
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

  // --- Chat history ---------------------------------------------------------
  const [conversations, setConversations] = React.useState<Conversation[]>([])
  const [activeChatId, setActiveChatId] = React.useState<string | null>(null)

  const createChat = React.useCallback((): string => {
    const id = `chat-${chatCounter()}`
    setConversations((prev) => [
      { id, title: "Nuova conversazione", messages: [] },
      ...prev,
    ])
    setActiveChatId(id)
    return id
  }, [])

  const clearActiveChat = React.useCallback(() => setActiveChatId(null), [])

  const openChat = React.useCallback((id: string) => setActiveChatId(id), [])

  const deleteChat = React.useCallback((id: string) => {
    setConversations((prev) => prev.filter((c) => c.id !== id))
    setActiveChatId((curr) => (curr === id ? null : curr))
  }, [])

  const appendMessage = React.useCallback(
    (chatId: string, msg: ChatMessage) => {
      setConversations((prev) =>
        prev.map((c) => {
          if (c.id !== chatId) return c
          const isFirstUser =
            msg.role === "user" && !c.messages.some((m) => m.role === "user")
          return {
            ...c,
            title: isFirstUser ? deriveTitle(msg.text) : c.title,
            messages: [...c.messages, msg],
          }
        })
      )
    },
    []
  )

  const value = React.useMemo(
    () => ({
      docs,
      addDoc,
      removeDoc,
      conversations,
      activeChatId,
      createChat,
      clearActiveChat,
      openChat,
      deleteChat,
      appendMessage,
    }),
    [
      docs,
      addDoc,
      removeDoc,
      conversations,
      activeChatId,
      createChat,
      clearActiveChat,
      openChat,
      deleteChat,
      appendMessage,
    ]
  )

  return <AppContext value={value}>{children}</AppContext>
}

let counter = 0
function docCounter() {
  counter += 1
  return counter
}

let chats = 0
function chatCounter() {
  chats += 1
  return chats
}

function deriveTitle(text: string): string {
  const clean = text.trim().replace(/\s+/g, " ")
  return clean.length > 40 ? `${clean.slice(0, 40)}…` : clean
}

export function useStore(): AppStore {
  const ctx = React.useContext(AppContext)
  if (!ctx) throw new Error("useStore must be used within AppProvider")
  return ctx
}
