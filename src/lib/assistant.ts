import type { KnowledgeDoc, Snippet } from "@/data/knowledge"

export interface Citation {
  index: number
  docId: string
  docTitle: string
  snippetId: string
  heading: string
}

export interface AssistantAnswer {
  text: string
  citations: Citation[]
  confidence: "alta" | "media" | "nessuna"
}

interface ScoredSnippet {
  doc: KnowledgeDoc
  snippet: Snippet
  score: number
}

const STOP_WORDS = new Set([
  "il", "lo", "la", "i", "gli", "le", "un", "uno", "una", "di", "a", "da", "in",
  "con", "su", "per", "tra", "fra", "e", "o", "che", "come", "cosa", "quando",
  "dove", "perche", "perché", "quale", "quali", "si", "no", "non", "del", "della",
  "dei", "delle", "degli", "al", "allo", "alla", "ai", "agli", "alle", "è", "ho",
  "posso", "devo", "fare", "uso", "usare", "mi", "ci", "se", "ma", "quanto",
])

function normalize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[`'"().,;:!?]/g, " ")
    .split(/\s+/)
    .map((t) => t.trim())
    .filter((t) => t.length > 1 && !STOP_WORDS.has(t))
}

export function retrieve(query: string, docs: KnowledgeDoc[]): ScoredSnippet[] {
  const tokens = normalize(query)
  if (tokens.length === 0) return []

  const scored = docs.flatMap((doc) =>
    doc.snippets.map((snippet) => {
      const haystackTags = snippet.tags.map((t) => t.toLowerCase())
      const haystackText = `${snippet.heading} ${snippet.body}`.toLowerCase()

      const score = tokens.reduce((acc, token) => {
        const tagHit = haystackTags.some(
          (tag) => tag === token || tag.includes(token) || token.includes(tag)
        )
        const headingHit = snippet.heading.toLowerCase().includes(token)
        const bodyHit = haystackText.includes(token)
        return acc + (tagHit ? 3 : 0) + (headingHit ? 2 : 0) + (bodyHit ? 1 : 0)
      }, 0)

      return { doc, snippet, score }
    })
  )

  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
}

export function answer(query: string, docs: KnowledgeDoc[]): AssistantAnswer {
  const matches = retrieve(query, docs)

  if (matches.length === 0) {
    return {
      text: "Non ho trovato nulla di pertinente nella base di conoscenza aziendale. Prova a riformulare la domanda, oppure carica un documento che copra questo argomento dalla sezione \"Base di conoscenza\".",
      citations: [],
      confidence: "nessuna",
    }
  }

  const citations: Citation[] = matches.map((m, i) => ({
    index: i + 1,
    docId: m.doc.id,
    docTitle: m.doc.title,
    snippetId: m.snippet.id,
    heading: m.snippet.heading,
  }))

  const intro =
    matches[0].score >= 6
      ? "Ecco cosa dicono le linee guida aziendali:"
      : "Ho trovato alcuni riferimenti che potrebbero aiutarti:"

  const bodyParts = matches.map(
    (m, i) => `**${m.snippet.heading}** [${i + 1}]\n${m.snippet.body}`
  )

  return {
    text: `${intro}\n\n${bodyParts.join("\n\n")}`,
    citations,
    confidence: matches[0].score >= 6 ? "alta" : "media",
  }
}

export const suggestedQuestions = [
  "Posso usare i cicli for?",
  "Cosa devo controllare prima di aprire una pull request?",
  "Quando usare useEffect?",
  "Quando uso useRef invece di useState?",
  "Come configuro l'ambiente di sviluppo?",
  "Come si fa un rilascio in produzione?",
  "Che tono uso con i clienti?",
]
