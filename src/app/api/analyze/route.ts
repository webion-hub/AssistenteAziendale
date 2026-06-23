import { NextResponse } from "next/server"
import type Anthropic from "@anthropic-ai/sdk"

import { ANALYZE_MODEL, claudeAttivo, getClient, textFrom } from "@/lib/claude"

export const runtime = "nodejs"
export const maxDuration = 60

type ImageMediaType = "image/png" | "image/jpeg" | "image/gif" | "image/webp"

interface UploadedFile {
  data: string // base64 (no data: prefix)
  mediaType: string // "application/pdf" or "image/*"
}

interface Enrichment {
  summary: string
  category: string
  tags: string[]
}

// Generate summary / category / tags from plain text. Small, reliable JSON —
// never throws: returns empty fields if the model output can't be parsed.
async function enrich(title: string, text: string): Promise<Enrichment> {
  const empty: Enrichment = { summary: "", category: "", tags: [] }
  if (!text.trim()) return empty

  const system = [
    "Analizzi documenti aziendali per indicizzarli in una base di conoscenza.",
    "Restituisci SOLO un oggetto JSON valido, senza testo aggiuntivo, con i campi:",
    '{ "summary": string (max 2 frasi in italiano),',
    '  "category": string (1-3 parole, es. "Standard di codice", "Processi", "HR"),',
    '  "tags": string[] (5-10 parole chiave in minuscolo) }',
  ].join("\n")

  try {
    const message = await getClient().messages.create({
      model: ANALYZE_MODEL,
      max_tokens: 512,
      system,
      messages: [
        {
          role: "user",
          content: `Titolo: ${title}\n\nContenuto:\n${text.slice(0, 12000)}`,
        },
      ],
    })
    const raw = textFrom(message)
    const jsonMatch = raw.match(/\{[\s\S]*\}/)
    const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : {}
    return {
      summary: typeof parsed.summary === "string" ? parsed.summary : "",
      category: typeof parsed.category === "string" ? parsed.category : "",
      tags: Array.isArray(parsed.tags)
        ? parsed.tags.filter((t: unknown) => typeof t === "string").slice(0, 10)
        : [],
    }
  } catch (err) {
    console.error("[/api/analyze] enrich", err)
    return empty
  }
}

// Extract the full text of an uploaded file (PDF / image) as plain markdown.
// No JSON wrapping — avoids parse failures on long documents.
async function extractText(title: string, file: UploadedFile): Promise<string> {
  const fileBlock: Anthropic.Messages.ContentBlockParam =
    file.mediaType === "application/pdf"
      ? {
          type: "document",
          source: { type: "base64", media_type: "application/pdf", data: file.data },
        }
      : {
          type: "image",
          source: {
            type: "base64",
            media_type: file.mediaType as ImageMediaType,
            data: file.data,
          },
        }

  const message = await getClient().messages.create({
    model: ANALYZE_MODEL,
    max_tokens: 8192,
    system:
      "Trascrivi fedelmente in markdown TUTTO il testo contenuto nel documento (o riconosciuto nell'immagine). Non aggiungere commenti, note o spiegazioni: restituisci solo il contenuto trascritto.",
    messages: [
      {
        role: "user",
        content: [
          fileBlock,
          { type: "text", text: `Titolo del documento: ${title}. Trascrivi il contenuto.` },
        ],
      },
    ],
  })
  return textFrom(message)
}

// AI #2: analyze a document when it is added to the knowledge base.
export async function POST(req: Request) {
  if (!claudeAttivo()) {
    return NextResponse.json(
      {
        error:
          "ANTHROPIC_API_KEY non configurata sul server. Aggiungila nelle variabili d'ambiente.",
      },
      { status: 503 }
    )
  }

  let parsedBody: { title?: unknown; body?: unknown; file?: unknown }
  try {
    parsedBody = await req.json()
  } catch {
    return NextResponse.json({ error: "JSON non valido." }, { status: 400 })
  }

  const title = typeof parsedBody.title === "string" ? parsedBody.title : "(senza titolo)"
  const docBody = typeof parsedBody.body === "string" ? parsedBody.body.trim() : ""

  const file =
    parsedBody.file && typeof parsedBody.file === "object"
      ? (parsedBody.file as UploadedFile)
      : null
  const hasFile = Boolean(file?.data && file?.mediaType)

  if (!hasFile && !docBody) {
    return NextResponse.json(
      { error: "Serve 'body' (testo) oppure 'file' (PDF/immagine)." },
      { status: 400 }
    )
  }

  try {
    // For files: extract the text first (this is the step that must succeed).
    const content = hasFile && file ? await extractText(title, file) : docBody

    if (hasFile && !content.trim()) {
      return NextResponse.json(
        { error: "Non è stato possibile estrarre testo dal file." },
        { status: 502 }
      )
    }

    // Enrichment never throws — the document is saved even if it returns empty.
    const meta = await enrich(title, content)

    return NextResponse.json({ ...meta, content })
  } catch (err) {
    console.error("[/api/analyze]", err)
    return NextResponse.json(
      { error: "Errore nell'analisi del documento." },
      { status: 502 }
    )
  }
}
