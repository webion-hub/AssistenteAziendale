import * as React from "react"
import { Bot, FileText, Send, User } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"
import { MessageContent } from "@/components/MessageContent"
import { answer, suggestedQuestions } from "@/lib/assistant"
import { useStore, type ChatMessage } from "@/store"
import { cn } from "@/lib/utils"

let idSeq = 0
const nextId = () => `msg-${idSeq++}`

export function ChatView({ onOpenDoc }: { onOpenDoc: (docId: string) => void }) {
  const {
    docs,
    conversations,
    activeChatId,
    createChat,
    appendMessage,
  } = useStore()
  const [input, setInput] = React.useState("")
  const [thinking, setThinking] = React.useState(false)
  const viewportRef = React.useRef<HTMLDivElement>(null)

  const activeChat = conversations.find((c) => c.id === activeChatId) ?? null
  const messages = activeChat?.messages ?? []
  const started = messages.length > 0

  const scrollToBottom = React.useCallback(() => {
    const vp = viewportRef.current
    if (vp) vp.scrollTo({ top: vp.scrollHeight, behavior: "smooth" })
  }, [])

  React.useEffect(() => {
    if (started) scrollToBottom()
  }, [messages, thinking, started, scrollToBottom])

  const ask = (question: string) => {
    const trimmed = question.trim()
    if (!trimmed || thinking) return

    const chatId = activeChatId ?? createChat()

    const userMsg: ChatMessage = {
      id: nextId(),
      role: "user",
      text: trimmed,
      citations: [],
    }
    appendMessage(chatId, userMsg)
    setInput("")
    setThinking(true)

    const result = answer(trimmed, docs)
    window.setTimeout(() => {
      appendMessage(chatId, {
        id: nextId(),
        role: "assistant",
        text: result.text,
        citations: result.citations,
        confidence: result.confidence,
      })
      setThinking(false)
    }, 650)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      ask(input)
    }
  }

  // Rendered as a plain function (not a component) so the textarea keeps focus
  // across re-renders instead of remounting.
  const inputBar = (
    <div className="flex items-end gap-2">
      <Textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Chiedi qualcosa…"
        rows={1}
        className="max-h-36 min-h-11 flex-1 py-2.5"
      />
      <Button
        size="icon"
        className="size-11 shrink-0"
        disabled={!input.trim() || thinking}
        onClick={() => ask(input)}
      >
        <Send className="size-4" />
      </Button>
    </div>
  )

  const suggestions = (
    <div className="flex flex-wrap justify-center gap-2">
      {suggestedQuestions.map((q) => (
        <button
          key={q}
          onClick={() => ask(q)}
          className="rounded-full border border-border bg-card px-3 py-1.5 text-xs text-foreground transition-colors hover:bg-accent hover:text-accent-foreground cursor-pointer"
        >
          {q}
        </button>
      ))}
    </div>
  )

  // First arrival: centered hero with the input in the middle of the page and
  // the suggestions underneath. Sending a message switches to the chat layout.
  if (!started) {
    return (
      <div className="flex h-full flex-col items-center justify-center px-4">
        <div className="w-full max-w-2xl">
          <div className="mb-8 flex flex-col items-center text-center">
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Assistente Aziendale
            </h1>
            <p className="mt-2 text-sm text-muted-foreground sm:text-base">
              il sapere aziendale in un' unica chat
            </p>
          </div>

          {inputBar}

          <div className="mt-5">{suggestions}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col">
      <ScrollArea className="flex-1" viewportRef={viewportRef}>
        <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8">
          {messages.map((msg) => (
            <MessageBubble key={msg.id} msg={msg} onOpenDoc={onOpenDoc} />
          ))}

          {thinking && (
            <div className="flex items-start gap-3">
              <Avatar role="assistant" />
              <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-sm bg-muted px-4 py-3">
                <Dot /> <Dot delay="0.15s" /> <Dot delay="0.3s" />
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="border-t border-border px-4 py-4 sm:px-6">
        <div className="mx-auto max-w-3xl">{inputBar}</div>
        <p className="mx-auto mt-2 max-w-3xl text-center text-[11px] text-muted-foreground">
          Le risposte sono generate dai documenti interni. E' necessario che le domande siano formulate in italiano. Verifica sempre quello che scrivi
        </p>
      </div>
    </div>
  )
}

function MessageBubble({
  msg,
  onOpenDoc,
}: {
  msg: ChatMessage
  onOpenDoc: (docId: string) => void
}) {
  const isUser = msg.role === "user"
  return (
    <div className={cn("flex items-start gap-3", isUser && "flex-row-reverse")}>
      <Avatar role={msg.role} />
      <div className={cn("flex max-w-[85%] flex-col gap-2 sm:max-w-[80%]", isUser && "items-end")}>
        <div
          className={cn(
            "rounded-2xl px-4 py-3",
            isUser
              ? "rounded-tr-sm bg-primary text-primary-foreground"
              : "rounded-tl-sm bg-muted text-foreground"
          )}
        >
          {isUser ? (
            <p className="text-sm leading-relaxed">{msg.text}</p>
          ) : (
            <MessageContent text={msg.text} />
          )}
        </div>

        {msg.citations.length > 0 && (
          <div className="flex flex-col gap-1.5">
            {msg.confidence === "alta" ? (
              <Badge variant="success">Confidenza alta</Badge>
            ) : (
              <Badge variant="secondary">Confidenza media</Badge>
            )}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs text-muted-foreground">Fonti:</span>
              {msg.citations.map((c) => (
                <button
                  key={c.snippetId}
                  onClick={() => onOpenDoc(c.docId)}
                  className="group inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-2 py-1 text-left text-xs transition-colors hover:border-primary/50 hover:bg-accent cursor-pointer"
                >
                  <span className="inline-flex size-4 items-center justify-center rounded bg-primary/15 text-[10px] font-semibold text-primary">
                    {c.index}
                  </span>
                  <FileText className="size-3 text-muted-foreground" />
                  <span className="max-w-52 truncate">{c.heading}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function Avatar({ role }: { role: "user" | "assistant" }) {
  const isUser = role === "user"
  return (
    <div
      className={cn(
        "flex size-8 shrink-0 items-center justify-center rounded-full",
        isUser ? "bg-secondary text-secondary-foreground" : "bg-primary/10 text-primary"
      )}
    >
      {isUser ? <User className="size-4" /> : <Bot className="size-4" />}
    </div>
  )
}

function Dot({ delay = "0s" }: { delay?: string }) {
  return (
    <span
      className="size-1.5 animate-bounce rounded-full bg-muted-foreground/60"
      style={{ animationDelay: delay }}
    />
  )
}
