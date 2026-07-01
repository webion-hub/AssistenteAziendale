import { retrieveDocs, type Citation } from "@/lib/assistant"
import type { KnowledgeDoc } from "@/data/knowledge"

export interface ChatResult {
  text: string
  citations: Citation[]
  confidence: "alta" | "media" | "nessuna"
}

export interface DocAnalysis {
  summary: string
  category: string
  tags: string[]
  /** Extracted text content (full transcription for uploaded files). */
  content: string
}

export interface AnalyzeInput {
  title: string
  /** Plain text content (for typed text or text files). */
  body?: string
  /** Binary file to be read natively by Claude (PDF or image). */
  file?: { data: string; mediaType: string }
}

/**
 * Ask the backend AI a question, grounded in the most relevant documents from
 * the knowledge base. Document-level retrieval runs client-side; the FULL text
 * of each selected document is sent to the server so the model can search
 * across the whole content.
 */
export async function askAI(
  question: string,
  docs: KnowledgeDoc[]
): Promise<ChatResult> {
  const matches = retrieveDocs(question, docs)

  const context = matches.map((m) => ({
    title: m.doc.title,
    content: m.doc.content,
  }))

  const citations: Citation[] = matches.map((m, i) => ({
    index: i + 1,
    docId: m.doc.id,
    docTitle: m.doc.title,
    heading: m.doc.title,
  }))

  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question, context }),
  })

  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error ?? `Errore del server (${res.status})`)
  }

  const data = (await res.json()) as { text: string }
  return {
    text: data.text,
    citations,
    confidence: matches.length === 0 ? "nessuna" : matches[0].score >= 6 ? "alta" : "media",
  }
}

/**
 * Ask the backend AI to summarize / categorize / tag a document — and, for
 * uploaded PDFs/images, to extract the full text content.
 */
export async function analyzeDoc(input: AnalyzeInput): Promise<DocAnalysis> {
  const res = await fetch("/api/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  })

  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error ?? `Errore del server (${res.status})`)
  }

  return (await res.json()) as DocAnalysis
}
