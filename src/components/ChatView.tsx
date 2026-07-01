import * as React from "react"
import { motion } from "motion/react"
import { FileText, Send, User } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"
import { MessageContent } from "@/components/MessageContent"
import { AnimatedLogo } from "@/components/AnimatedLogo"
import { Aurora } from "@/components/bits/Aurora"
import { GradientText } from "@/components/bits/GradientText"
import { ShinyText } from "@/components/bits/ShinyText"
import { Reveal } from "@/components/bits/Reveal"
import { suggestedQuestions } from "@/lib/assistant"
import { askAI } from "@/lib/api"
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
  const messages = React.useMemo(
    () => activeChat?.messages ?? [],
    [activeChat]
  )
  const started = messages.length > 0

  const scrollToBottom = React.useCallback(() => {
    const vp = viewportRef.current
    if (vp) vp.scrollTo({ top: vp.scrollHeight, behavior: "smooth" })
  }, [])

  React.useEffect(() => {
    if (started) scrollToBottom()
  }, [messages, thinking, started, scrollToBottom])

  const ask = async (question: string) => {
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

    try {
      const result = await askAI(trimmed, docs)
      appendMessage(chatId, {
        id: nextId(),
        role: "assistant",
        text: result.text,
        citations: result.citations,
        confidence: result.confidence,
      })
    } catch (err) {
      appendMessage(chatId, {
        id: nextId(),
        role: "assistant",
        text: `⚠️ ${err instanceof Error ? err.message : "Errore imprevisto"}`,
        citations: [],
        confidence: "nessuna",
      })
    } finally {
      setThinking(false)
    }
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
      {suggestedQuestions.map((q, i) => (
        <Reveal key={q} delay={0.3 + i * 0.06}>
          <button
            onClick={() => ask(q)}
            className="rounded-full border border-border bg-card px-3 py-1.5 text-xs text-foreground transition-colors hover:bg-accent hover:text-accent-foreground cursor-pointer"
          >
            {q}
          </button>
        </Reveal>
      ))}
    </div>
  )

  // First arrival: centered hero with the input in the middle of the page and
  // the suggestions underneath. Sending a message switches to the chat layout.
  if (!started) {
    return (
      <div className="relative flex h-full flex-col items-center justify-center overflow-hidden px-4">
        <Aurora />
        <div className="w-full max-w-2xl">
          <div className="mb-8 flex flex-col items-center text-center">
            <Reveal>
              <AnimatedLogo mode="idle" className="mb-4 size-16 drop-shadow-sm" />
            </Reveal>
            <Reveal delay={0.08}>
              <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                <GradientText>Assistente Aziendale</GradientText>
              </h1>
            </Reveal>
            <Reveal delay={0.16}>
              <p className="mt-2 text-sm text-muted-foreground sm:text-base">
                il sapere aziendale in un'unica chat
              </p>
            </Reveal>
          </div>

          <Reveal delay={0.24}>{inputBar}</Reveal>

          <div className="mt-5">{suggestions}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative flex h-full flex-col">
      {/* Soft ambient gradient behind the conversation. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(ellipse 90% 55% at 50% -8%, color-mix(in oklch, var(--primary) 12%, transparent), transparent 60%), radial-gradient(ellipse 70% 45% at 100% 108%, color-mix(in oklch, var(--primary) 7%, transparent), transparent 60%)",
        }}
      />
      <ScrollArea className="flex-1" viewportRef={viewportRef}>
        <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8">
          {messages.map((msg) => (
            <MessageBubble key={msg.id} msg={msg} onOpenDoc={onOpenDoc} />
          ))}

          {thinking && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="flex items-center gap-3"
            >
              <AnimatedLogo mode="thinking" className="size-8 shrink-0" />
              <div className="rounded-2xl rounded-tl-sm bg-muted px-4 py-2.5 text-sm">
                <ShinyText>Cerco nella base di conoscenza…</ShinyText>
              </div>
            </motion.div>
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
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className={cn("flex items-start gap-3", isUser && "flex-row-reverse")}
    >
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
                  key={c.docId}
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
    </motion.div>
  )
}

function Avatar({ role }: { role: "user" | "assistant" }) {
  const isUser = role === "user"
  if (!isUser) {
    return <AnimatedLogo mode="interactive" className="size-8 shrink-0" />
  }
  return (
    <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
      <User className="size-4" />
    </div>
  )
}
