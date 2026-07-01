"use client"

import * as React from "react"
import { AnimatePresence, motion } from "motion/react"
import { FileText, User } from "lucide-react"

import { AnimatedLogo } from "@/components/AnimatedLogo"

// Scripted Q&A drawn from the seeded knowledge base, so the preview mirrors
// what the real assistant answers.
const scripts = [
  {
    q: "Posso usare i cicli for?",
    a: "Meglio di no: preferisci i metodi funzionali degli array — map, filter, reduce. Il codice è più dichiarativo e meno soggetto a errori.",
    source: "Linee guida Frontend",
  },
  {
    q: "Cosa controllo prima di aprire una PR?",
    a: "Togli i console.log, elimina i commenti superflui e verifica che `npm run build` passi in locale.",
    source: "Checklist Pull Request",
  },
  {
    q: "Quando si fa il deploy in produzione?",
    a: "Dopo una review approvata e con CI verde, dal lunedì al giovedì — mai il venerdì.",
    source: "Processo di rilascio",
  },
]

type Phase = "user" | "typing" | "answer"

export function ChatPreview() {
  const [idx, setIdx] = React.useState(0)
  const [phase, setPhase] = React.useState<Phase>("user")
  const [typed, setTyped] = React.useState("")
  const current = scripts[idx]

  React.useEffect(() => {
    if (phase === "user") {
      const t = setTimeout(() => setPhase("typing"), 550)
      return () => clearTimeout(t)
    }
    if (phase === "typing") {
      const t = setTimeout(() => {
        setTyped("")
        setPhase("answer")
      }, 650)
      return () => clearTimeout(t)
    }
    // answer: typewriter, then hold and advance to the next script
    if (typed.length < current.a.length) {
      const t = setTimeout(
        () => setTyped(current.a.slice(0, typed.length + 1)),
        11
      )
      return () => clearTimeout(t)
    }
    const t = setTimeout(() => {
      setIdx((i) => (i + 1) % scripts.length)
      setPhase("user")
    }, 2200)
    return () => clearTimeout(t)
  }, [phase, typed, current.a])

  const answering = phase === "typing" || phase === "answer"
  const done = phase === "answer" && typed.length === current.a.length

  return (
    <div className="w-full overflow-hidden rounded-2xl border border-border bg-card/70 shadow-2xl shadow-black/20 backdrop-blur">
      {/* Window chrome */}
      <div className="flex items-center gap-2 border-b border-border px-4 py-3">
        <span className="size-3 rounded-full bg-destructive/70" />
        <span className="size-3 rounded-full bg-amber-400/70" />
        <span className="size-3 rounded-full bg-emerald-400/70" />
        <div className="ml-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          <AnimatedLogo mode="static" className="size-4" />
          Corpass — Assistente
        </div>
      </div>

      {/* Conversation */}
      <div className="flex min-h-[19rem] flex-col gap-4 p-5">
        <AnimatePresence mode="wait">
          <motion.div
            key={idx}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="flex flex-col gap-4"
          >
            {/* User question */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="flex items-start gap-3 flex-row-reverse"
            >
              <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
                <User className="size-4" />
              </div>
              <div className="max-w-[80%] rounded-2xl rounded-tr-sm bg-primary px-4 py-2.5 text-sm leading-relaxed text-primary-foreground">
                {current.q}
              </div>
            </motion.div>

            {/* Assistant */}
            {answering && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="flex items-start gap-3"
              >
                <AnimatedLogo
                  mode={phase === "typing" ? "thinking" : "static"}
                  className="size-8 shrink-0"
                />
                <div className="flex max-w-[85%] flex-col gap-2">
                  <div className="rounded-2xl rounded-tl-sm bg-muted px-4 py-2.5 text-sm leading-relaxed text-foreground">
                    {phase === "typing" ? (
                      <TypingDots />
                    ) : (
                      <span>
                        {typed}
                        {!done && (
                          <span className="ml-0.5 inline-block h-4 w-0.5 -translate-y-0.5 animate-pulse bg-primary align-middle" />
                        )}
                      </span>
                    )}
                  </div>

                  {done && (
                    <motion.div
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="flex items-center gap-1.5"
                    >
                      <span className="text-xs text-muted-foreground">
                        Fonte:
                      </span>
                      <span className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-2 py-1 text-xs">
                        <span className="inline-flex size-4 items-center justify-center rounded bg-primary/15 text-[10px] font-semibold text-primary">
                          1
                        </span>
                        <FileText className="size-3 text-muted-foreground" />
                        <span>{current.source}</span>
                      </span>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

function TypingDots() {
  return (
    <span className="flex items-center gap-1 py-1">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="size-1.5 rounded-full bg-muted-foreground"
          animate={{ opacity: [0.3, 1, 0.3], y: [0, -2, 0] }}
          transition={{
            duration: 1,
            repeat: Infinity,
            delay: i * 0.18,
            ease: "easeInOut",
          }}
        />
      ))}
    </span>
  )
}
