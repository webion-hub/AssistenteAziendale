import { NextResponse } from "next/server"

import { CHAT_MODEL, claudeAttivo, getClient, textFrom } from "@/lib/claude"

export const runtime = "nodejs"

interface ContextSnippet {
  heading: string
  body: string
}

// AI #1: answer questions grounded in the knowledge base.
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

  let body: { question?: unknown; context?: unknown }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "JSON non valido." }, { status: 400 })
  }

  const question = typeof body.question === "string" ? body.question.trim() : ""
  if (!question) {
    return NextResponse.json({ error: "Campo 'question' mancante." }, { status: 400 })
  }

  const sources: ContextSnippet[] = Array.isArray(body.context)
    ? (body.context as ContextSnippet[])
    : []

  const contextBlock = sources.length
    ? sources.map((s, i) => `[${i + 1}] ${s.heading}\n${s.body}`).join("\n\n")
    : "(nessun documento pertinente trovato)"

  const system = [
    "Sei l'assistente interno di Webion. Rispondi a domande su sapere aziendale,",
    "linee guida e standard di programmazione.",
    "Regole:",
    "- Rispondi SOLO basandoti sui documenti forniti qui sotto.",
    "- Se i documenti non contengono la risposta, dillo chiaramente e non inventare.",
    "- Cita le fonti usate con la notazione [n] corrispondente al documento.",
    "- Rispondi in italiano, in modo conciso e professionale. Usa markdown.",
    "",
    "Documenti disponibili:",
    contextBlock,
  ].join("\n")

  try {
    const message = await getClient().messages.create({
      model: CHAT_MODEL,
      max_tokens: 1024,
      system,
      messages: [{ role: "user", content: question }],
    })
    return NextResponse.json({ text: textFrom(message) })
  } catch (err) {
    console.error("[/api/chat]", err)
    return NextResponse.json(
      { error: "Errore nella chiamata al modello." },
      { status: 502 }
    )
  }
}
