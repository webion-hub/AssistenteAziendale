// Lightweight renderer for the assistant text: supports **bold** and inline
// [n] citation markers, without pulling in a full markdown dependency.

function renderInline(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*|\[\d+\])/g).filter(Boolean)
  return parts.map((part, i) => {
    const boldMatch = part.match(/^\*\*([^*]+)\*\*$/)
    if (boldMatch) {
      return (
        <strong key={i} className="font-semibold text-foreground">
          {boldMatch[1]}
        </strong>
      )
    }
    const citationMatch = part.match(/^\[(\d+)\]$/)
    if (citationMatch) {
      return (
        <sup
          key={i}
          className="mx-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded bg-primary/15 px-1 text-[10px] font-semibold text-primary"
        >
          {citationMatch[1]}
        </sup>
      )
    }
    return <span key={i}>{part}</span>
  })
}

export function MessageContent({ text }: { text: string }) {
  const lines = text.split("\n")
  return (
    <div className="space-y-2.5 text-[15px] leading-7">
      {lines.map((line, i) =>
        line.trim() === "" ? (
          <div key={i} className="h-1" />
        ) : (
          <p key={i}>{renderInline(line)}</p>
        )
      )}
    </div>
  )
}
