"use client"

import * as React from "react"
import { motion } from "motion/react"
import {
  ArrowRight,
  BookOpen,
  Database,
  FileText,
  GraduationCap,
  Image as ImageIcon,
  MessagesSquare,
  Moon,
  Quote,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Sun,
  Upload,
  Zap,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { AnimatedLogo } from "@/components/AnimatedLogo"
import { GradientText } from "@/components/bits/GradientText"
import { Reveal } from "@/components/bits/Reveal"
import { SpotlightCard } from "@/components/bits/SpotlightCard"
import { DottedSurface } from "@/components/bits/DottedSurface"
import { ForwardScroll } from "@/components/bits/ForwardScroll"
import { ScrollCompass } from "@/components/bits/ScrollCompass"
import {
  RadialOrbitalTimeline,
  type OrbitItem,
} from "@/components/bits/RadialOrbitalTimeline"
import { ChatPreview } from "@/components/landing/ChatPreview"

const features = [
  {
    icon: <MessagesSquare className="size-5" />,
    title: "Chat che cita le fonti",
    body: "Ogni risposta indica i documenti usati, con un livello di confidenza. Apri la fonte con un clic e verifica.",
  },
  {
    icon: <BookOpen className="size-5" />,
    title: "Base di conoscenza viva",
    body: "Linee guida, procedure, onboarding, comunicazione coi clienti: tutto in un unico posto, sempre interrogabile.",
  },
  {
    icon: <Upload className="size-5" />,
    title: "Carichi qualsiasi file",
    body: "PDF, immagini (PNG/JPG) o testo. Da PDF e immagini il contenuto viene estratto automaticamente dall'IA.",
  },
  {
    icon: <Sparkles className="size-5" />,
    title: "L'IA legge tutto il documento",
    body: "Cerca l'informazione nell'intero testo — non in frammenti isolati — e risponde in italiano, senza inventare.",
  },
]

const perks: OrbitItem[] = [
  {
    id: 1,
    title: "Risposte immediate",
    icon: Zap,
    energy: 95,
    related: [2, 6],
    content:
      "Il sapere aziendale è sempre a portata di chat: niente attese, niente ticket per una domanda a cui i documenti già rispondono.",
  },
  {
    id: 2,
    title: "Fonti verificabili",
    icon: Quote,
    energy: 90,
    related: [1, 3],
    content:
      "Ogni risposta cita i documenti da cui proviene. Puoi aprirli e controllare: nessuna risposta “scatola nera”.",
  },
  {
    id: 3,
    title: "Onboarding rapido",
    icon: GraduationCap,
    energy: 82,
    related: [2, 4],
    content:
      "I nuovi arrivati trovano da soli procedure, linee guida e accessi, senza interrompere il resto del team.",
  },
  {
    id: 4,
    title: "Unica fonte di verità",
    icon: Database,
    energy: 88,
    related: [3, 5],
    content:
      "Basta informazioni sparse tra chat, email e cartelle: tutto converge in un'unica base interrogabile.",
  },
  {
    id: 5,
    title: "Sempre aggiornato",
    icon: RefreshCw,
    energy: 85,
    related: [4, 6],
    content:
      "Carichi un documento e l'assistente lo conosce all'istante. La conoscenza cresce con l'azienda.",
  },
  {
    id: 6,
    title: "Riservato e interno",
    icon: ShieldCheck,
    energy: 92,
    related: [5, 1],
    content:
      "Risponde solo in base ai tuoi documenti e non inventa. Il sapere resta dentro l'azienda.",
  },
]

function SectionTitle({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string
  title: React.ReactNode
  subtitle?: string
}) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <p className="text-sm font-medium uppercase tracking-wide text-primary">
        {eyebrow}
      </p>
      <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
        {title}
      </h2>
      {subtitle && <p className="mt-4 text-muted-foreground">{subtitle}</p>}
    </div>
  )
}

export function Landing({
  onEnter,
  dark,
  toggleDark,
}: {
  onEnter: () => void
  dark: boolean
  toggleDark: () => void
}) {
  const slides: React.ReactNode[] = [
    // 1 — Hero
    <div key="hero" className="mx-auto max-w-3xl text-center">
      <Reveal>
        <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
          <Sparkles className="size-3.5 text-primary" />
          Assistente aziendale basato su Claude
        </span>
      </Reveal>
      <Reveal delay={0.08}>
        <h1 className="mt-6 text-4xl font-semibold leading-tight tracking-tight sm:text-6xl">
          Il sapere della tua azienda,{" "}
          <GradientText>in un&apos;unica chat</GradientText>
        </h1>
      </Reveal>
      <Reveal delay={0.16}>
        <p className="mx-auto mt-5 max-w-2xl text-base text-muted-foreground sm:text-lg">
          Carica documenti, procedure e linee guida. L&apos;assistente li legge
          e risponde alle domande del team in linguaggio naturale, citando
          sempre le fonti.
        </p>
      </Reveal>
      <Reveal delay={0.24}>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button size="lg" className="w-full sm:w-auto" onClick={onEnter}>
            Prova la demo
            <ArrowRight className="size-4" />
          </Button>
        </div>
        <p className="mt-6 text-xs text-muted-foreground">
          Scorri per esplorare ↓
        </p>
      </Reveal>
    </div>,

    // 2 — Chat preview
    <div key="chat" className="mx-auto max-w-2xl">
      <SectionTitle
        eyebrow="La chat in azione"
        title="Chiedi e otterrai una risposta con le fonti"
      />
      <div className="relative mt-8">
        <div
          aria-hidden
          className="pointer-events-none absolute -inset-6 -z-10 rounded-[2rem] opacity-70 blur-2xl"
          style={{
            background:
              "radial-gradient(60% 60% at 50% 0%, color-mix(in oklch, var(--primary) 22%, transparent), transparent 70%)",
          }}
        />
        <ChatPreview />
      </div>
    </div>,

    // 3 — Features
    <div key="features">
      <SectionTitle
        eyebrow="Cosa fa"
        title="Chat e base di conoscenza insieme"
      />
      <div className="mt-10 grid gap-6 sm:grid-cols-2">
        {features.map((f) => (
          <SpotlightCard key={f.title} className="p-6">
            <div className="flex size-11 items-center justify-center rounded-xl bg-primary/15 text-primary">
              {f.icon}
            </div>
            <h3 className="mt-4 text-lg font-semibold">{f.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {f.body}
            </p>
          </SpotlightCard>
        ))}
      </div>
    </div>,

    // 5 — Upload
    <div key="upload">
      <SectionTitle
        eyebrow="Caricare i file"
        title="Trascina, salva, e l'IA fa il resto"
      />
      <div className="mt-10 grid items-center gap-8 rounded-2xl border border-border bg-card/50 p-6 backdrop-blur sm:p-10 md:grid-cols-2">
        <div>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Apri la{" "}
            <strong className="text-foreground">Base di conoscenza</strong>,
            trascina un file e salva. L&apos;IA trascrive il contenuto e lo
            indicizza. Da quel momento, ogni domanda in chat può attingere a
            quel documento — per intero.
          </p>
          <ul className="mt-5 space-y-2.5">
            {[
              {
                icon: <FileText className="size-4" />,
                t: "PDF e documenti di testo (TXT, MD)",
              },
              {
                icon: <ImageIcon className="size-4" />,
                t: "Immagini con testo — estratto via OCR",
              },
              {
                icon: <ShieldCheck className="size-4" />,
                t: "Risposte solo dai tuoi documenti, con citazioni",
              },
            ].map((row) => (
              <li key={row.t} className="flex items-center gap-3 text-sm">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/12 text-primary">
                  {row.icon}
                </span>
                <span className="text-muted-foreground">{row.t}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border bg-background/40 px-6 py-12 text-center">
          <motion.div
            className="flex size-12 items-center justify-center rounded-full bg-primary/12 text-primary"
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
          >
            <Upload className="size-5" />
          </motion.div>
          <p className="text-sm font-medium">
            Trascina un file qui o clicca per selezionarlo
          </p>
          <p className="text-xs text-muted-foreground">
            PDF, immagini o testo
          </p>
        </div>
      </div>
    </div>,

    // 6 — Orbital perks
    <div key="perks">
      <SectionTitle
        eyebrow="Perché usarlo"
        title="I vantaggi, in orbita attorno all'assistente"
        subtitle="Tocca un nodo per scoprire cosa cambia usando il chatbot aziendale per la conoscenza."
      />
      <RadialOrbitalTimeline items={perks} />
    </div>,

    // 7 — Final CTA
    <div key="cta">
      <div className="relative overflow-hidden rounded-3xl border border-border bg-card/40 px-6 py-16 text-center backdrop-blur sm:px-10">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(70% 80% at 50% 0%, color-mix(in oklch, var(--primary) 18%, transparent), transparent 70%)",
          }}
        />
        <AnimatedLogo mode="idle" className="mx-auto size-14" />
        <h2 className="mt-6 text-3xl font-semibold tracking-tight sm:text-4xl">
          Pronto a mettere alla prova l&apos;assistente?
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
          Entra nella demo, fai una domanda e guarda come risponde citando i
          documenti aziendali.
        </p>
        <div className="mt-8">
          <Button size="lg" onClick={onEnter}>
            Apri la demo
            <ArrowRight className="size-4" />
          </Button>
        </div>
      </div>
    </div>,
  ]

  return (
    <div className="relative bg-background text-foreground">
      {/* Animated dotted surface — fixed behind the whole page */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <DottedSurface className="opacity-90" />
        {/* Light, uniform scrim: keeps the moving texture visible everywhere
            while preserving text contrast. */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, color-mix(in oklch, var(--background) 55%, transparent), color-mix(in oklch, var(--background) 35%, transparent))",
          }}
        />
      </div>

      {/* Compass anchored bottom-center; needle sweeps with scroll */}
      <div className="pointer-events-none fixed bottom-4 left-1/2 z-20 -translate-x-1/2">
        <ScrollCompass className="size-16 sm:size-20" />
      </div>

      {/* Fixed top nav */}
      <header className="fixed inset-x-0 top-0 z-40 border-b border-border/60 bg-background/70 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4 sm:px-6">
          <AnimatedLogo mode="interactive" className="size-7" />
          <span className="text-sm font-semibold">Corpass</span>
          <nav className="ml-auto flex items-center gap-1 sm:gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleDark}
              aria-label={dark ? "Tema chiaro" : "Tema scuro"}
            >
              {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
            </Button>
            <Button onClick={onEnter}>
              Entra nella demo
              <ArrowRight className="size-4" />
            </Button>
          </nav>
        </div>
      </header>

      {/* Forward-scroll stage: every slide advances toward the viewer */}
      <div className="relative z-10">
        <ForwardScroll slides={slides} />

        {/* Footer */}
        <footer className="border-t border-border/60">
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:px-6">
            <div className="flex items-center gap-2">
              <AnimatedLogo mode="static" className="size-5" />
              <span className="font-medium text-foreground">Corpass</span>
            </div>
            <span>Assistente interno · basato su Claude di Anthropic</span>
          </div>
        </footer>
      </div>
    </div>
  )
}
