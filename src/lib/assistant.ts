import type { KnowledgeDoc } from "@/data/knowledge"

export interface Citation {
  index: number
  docId: string
  docTitle: string
  heading: string
}

export interface AssistantAnswer {
  text: string
  citations: Citation[]
  confidence: "alta" | "media" | "nessuna"
}

export interface ScoredDoc {
  doc: KnowledgeDoc
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

// Rank whole documents by relevance to the query. Scoring runs over the entire
// document (title + summary + full content + tags), so a document matches even
// when the relevant passage is buried anywhere in the text.
export function retrieveDocs(query: string, docs: KnowledgeDoc[]): ScoredDoc[] {
  const tokens = normalize(query)
  if (tokens.length === 0) return []

  const scored = docs.map((doc) => {
    const haystackTags = (doc.tags ?? []).map((t) => t.toLowerCase())
    const haystackText = `${doc.title} ${doc.summary ?? ""} ${doc.content}`.toLowerCase()

    const score = tokens.reduce((acc, token) => {
      const tagHit = haystackTags.some(
        (tag) => tag === token || tag.includes(token) || token.includes(tag)
      )
      const titleHit = doc.title.toLowerCase().includes(token)
      const bodyHit = haystackText.includes(token)
      return acc + (tagHit ? 3 : 0) + (titleHit ? 2 : 0) + (bodyHit ? 1 : 0)
    }, 0)

    return { doc, score }
  })

  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
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
