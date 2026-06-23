import Anthropic from "@anthropic-ai/sdk"

// Models: Sonnet 4.6 for answering, Haiku 4.5 for the cheaper ingest analysis.
export const CHAT_MODEL = "claude-sonnet-4-6"
export const ANALYZE_MODEL = "claude-haiku-4-5-20251001"

const apiKey = process.env.ANTHROPIC_API_KEY

/** Whether a Claude API key is configured server-side. */
export function claudeAttivo(): boolean {
  return Boolean(apiKey)
}

let client: Anthropic | null = null

/** Lazily-instantiated Anthropic client. Throws if no key is configured. */
export function getClient(): Anthropic {
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY non configurata sul server.")
  }
  if (!client) client = new Anthropic({ apiKey })
  return client
}

/** Concatenate the text blocks of a Claude message into a single string. */
export function textFrom(message: Anthropic.Message): string {
  return message.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("")
    .trim()
}
