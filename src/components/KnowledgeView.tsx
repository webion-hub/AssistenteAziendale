import * as React from "react"
import {
  ArrowLeft,
  FileText,
  FileType,
  Image as ImageIcon,
  Plus,
  Trash2,
  Type,
  Upload,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { useStore } from "@/store"
import type { KnowledgeDoc, SourceType } from "@/data/knowledge"
import { cn } from "@/lib/utils"

const sourceIcon: Record<SourceType, React.ReactNode> = {
  pdf: <FileType className="size-4" />,
  image: <ImageIcon className="size-4" />,
  text: <Type className="size-4" />,
  markdown: <FileText className="size-4" />,
}

export function KnowledgeView({
  focusDocId,
  clearFocus,
}: {
  focusDocId: string | null
  clearFocus: () => void
}) {
  const { docs, removeDoc } = useStore()
  const [selectedId, setSelectedId] = React.useState<string | null>(focusDocId)
  const [adding, setAdding] = React.useState(false)
  const [prevFocus, setPrevFocus] = React.useState(focusDocId)
  const [pendingDelete, setPendingDelete] = React.useState<KnowledgeDoc | null>(
    null
  )

  // When the parent requests a specific document (e.g. from a citation),
  // open it — adjusting state during render instead of in an effect.
  if (focusDocId && focusDocId !== prevFocus) {
    setPrevFocus(focusDocId)
    setSelectedId(focusDocId)
    setAdding(false)
  }

  const selected = docs.find((d) => d.id === selectedId) ?? null

  const back = () => {
    setSelectedId(null)
    clearFocus()
  }

  if (adding) {
    return <AddDocForm onDone={() => setAdding(false)} />
  }

  if (selected) {
    return <DocDetail doc={selected} onBack={back} />
  }

  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center justify-start px-4 py-4 sm:px-6">
        <Button size="sm" onClick={() => setAdding(true)}>
          <Plus className="size-4" />
          Aggiungi documento
        </Button>
      </header>

      <ScrollArea className="flex-1">
        <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 sm:p-6 xl:grid-cols-3">
          {docs.map((doc) => (
            <div
              key={doc.id}
              role="button"
              tabIndex={0}
              onClick={() => setSelectedId(doc.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault()
                  setSelectedId(doc.id)
                }
              }}
              className="group relative cursor-pointer text-left"
            >
              <Button
                variant="ghost"
                size="icon"
                aria-label="Elimina documento"
                className="absolute -right-3 -top-3 z-10 size-10 rounded-full border border-border bg-background text-muted-foreground opacity-0 shadow-sm transition-opacity hover:text-destructive focus-visible:opacity-100 group-hover:opacity-100"
                onClick={(e) => {
                  e.stopPropagation()
                  setPendingDelete(doc)
                }}
              >
                <Trash2 className="size-5" />
              </Button>
              <Card className="h-full gap-3 py-5 transition-all hover:border-primary/50 hover:shadow-md">
                <CardHeader className="px-5">
                  <div className="mb-2 flex items-center justify-between">
                    <Badge variant="outline" className="gap-1">
                      {sourceIcon[doc.sourceType]}
                      {doc.sourceType.toUpperCase()}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {doc.updatedAt}
                    </span>
                  </div>
                  <CardTitle className="text-sm">{doc.title}</CardTitle>
                </CardHeader>
                <CardContent className="px-5">
                  <p className="line-clamp-2 text-xs text-muted-foreground">
                    {doc.snippets[0]?.body}
                  </p>
                  <div className="mt-3 flex items-center gap-2">
                    <Badge variant="secondary">{doc.category}</Badge>
                    <span className="text-xs text-muted-foreground">
                      {doc.snippets.length} sezioni
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </ScrollArea>

      <Dialog
        open={pendingDelete !== null}
        onOpenChange={(open) => {
          if (!open) setPendingDelete(null)
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Eliminare il documento?</DialogTitle>
            <DialogDescription>
              «{pendingDelete?.title}» verrà rimosso dalla base di conoscenza.
              L'azione non può essere annullata.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPendingDelete(null)}>
              Annulla
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (pendingDelete) removeDoc(pendingDelete.id)
                setPendingDelete(null)
              }}
            >
              <Trash2 className="size-4" />
              Elimina
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function DocDetail({
  doc,
  onBack,
}: {
  doc: KnowledgeDoc
  onBack: () => void
}) {
  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center gap-3 border-b border-border px-4 py-4 sm:px-6">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="size-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-sm font-semibold">{doc.title}</h1>
          <p className="text-xs text-muted-foreground">
            {doc.category} · {doc.author} · aggiornato il {doc.updatedAt}
          </p>
        </div>
      </header>

      <ScrollArea className="flex-1">
        <div className="mx-auto max-w-3xl space-y-4 p-4 sm:p-6">
          {doc.snippets.map((s, i) => (
            <Card key={s.id} className="gap-3 py-5">
              <CardHeader className="px-5">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <span className="inline-flex size-5 items-center justify-center rounded bg-primary/15 text-[11px] font-semibold text-primary">
                    {i + 1}
                  </span>
                  {s.heading}
                </CardTitle>
              </CardHeader>
              <CardContent className="px-5">
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                  {s.body}
                </p>
                {s.tags.length > 0 && (
                  <>
                    <Separator className="my-3" />
                    <div className="flex flex-wrap gap-1">
                      {s.tags.slice(0, 8).map((t) => (
                        <span
                          key={t}
                          className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}

function AddDocForm({ onDone }: { onDone: () => void }) {
  const { addDoc } = useStore()
  const [title, setTitle] = React.useState("")
  const [category, setCategory] = React.useState("")
  const [sourceType, setSourceType] = React.useState<SourceType>("text")
  const [body, setBody] = React.useState("")
  const [dragging, setDragging] = React.useState(false)
  const [fileName, setFileName] = React.useState<string | null>(null)

  const readFile = (file: File) => {
    setFileName(file.name)
    if (!title) setTitle(file.name.replace(/\.[^.]+$/, ""))

    const ext = file.name.split(".").pop()?.toLowerCase()
    const isText = file.type.startsWith("text") || ["txt", "md", "csv", "json"].includes(ext ?? "")

    if (isText) {
      setSourceType(ext === "md" ? "markdown" : "text")
      const reader = new FileReader()
      reader.onload = () => setBody(String(reader.result ?? ""))
      reader.readAsText(file)
      return
    }

    if (file.type.startsWith("image")) {
      setSourceType("image")
      setBody(
        `Testo estratto da immagine "${file.name}" (OCR simulato).\n\nIn produzione qui comparirebbe il testo riconosciuto dall'immagine. Per la demo, incolla o digita manualmente il contenuto da indicizzare.`
      )
      return
    }

    setSourceType("pdf")
    setBody(
      `Testo estratto dal PDF "${file.name}" (estrazione simulata).\n\nIn produzione il contenuto del PDF verrebbe estratto e segmentato automaticamente. Per la demo, incolla o digita manualmente il contenuto da indicizzare.`
    )
  }

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) readFile(file)
  }

  const canSave = title.trim().length > 0 && body.trim().length > 0

  const save = () => {
    if (!canSave) return
    addDoc({ title: title.trim(), category: category.trim(), sourceType, body })
    onDone()
  }

  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center gap-3 border-b border-border px-4 py-4 sm:px-6">
        <Button variant="ghost" size="icon" onClick={onDone}>
          <ArrowLeft className="size-4" />
        </Button>
        <h1 className="text-sm font-semibold">Aggiungi un documento alla conoscenza</h1>
      </header>

      <ScrollArea className="flex-1">
        <div className="mx-auto max-w-2xl space-y-5 p-4 sm:p-6">
          <label
            onDragOver={(e) => {
              e.preventDefault()
              setDragging(true)
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            className={cn(
              "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors",
              dragging
                ? "border-primary bg-accent"
                : "border-border hover:border-primary/50 hover:bg-accent/50"
            )}
          >
            <div className="flex size-11 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Upload className="size-5" />
            </div>
            <p className="text-sm font-medium">
              Trascina un file qui o clicca per selezionarlo
            </p>
            <p className="text-xs text-muted-foreground">
              PDF, immagini (PNG/JPG) o testo (TXT/MD). Da PDF e immagini il
              testo viene estratto automaticamente.
            </p>
            {fileName && (
              <Badge variant="secondary" className="mt-1">
                {fileName}
              </Badge>
            )}
            <input
              type="file"
              accept=".pdf,.png,.jpg,.jpeg,.txt,.md,.csv,.json,image/*,text/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) readFile(file)
              }}
            />
          </label>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-xs font-medium">Titolo</label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Es. Linee guida QA"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium">Categoria</label>
              <Input
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Es. Processi"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium">
              Contenuto da indicizzare
            </label>
            <Textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Incolla o scrivi il testo. Separa le sezioni con una riga vuota: ognuna diventa un blocco ricercabile."
              className="min-h-52"
            />
            <p className="text-[11px] text-muted-foreground">
              Il testo viene segmentato in sezioni (separate da righe vuote) e
              reso ricercabile dall'assistente.
            </p>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onDone}>
              Annulla
            </Button>
            <Button disabled={!canSave} onClick={save}>
              Aggiungi alla conoscenza
            </Button>
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}
