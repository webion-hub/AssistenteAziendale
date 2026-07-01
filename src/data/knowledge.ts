// Knowledge base "trained" on company documents, procedures and history.
// In a real product these snippets would be produced by ingesting PDFs,
// images (OCR) and text into a vector store. Here they are seeded in-memory
// so the pilot is fully self-contained.

export type SourceType = "pdf" | "image" | "text" | "markdown"

export interface Snippet {
  id: string
  heading: string
  body: string
  tags: string[]
}

export interface KnowledgeDoc {
  id: string
  title: string
  category: string
  sourceType: SourceType
  author: string
  updatedAt: string
  // Full document text — kept whole (not chunked) so the assistant can search
  // across the entire content when answering.
  content: string
  // Optional structured sections. Seed docs are authored as sections for a
  // richer detail view; uploaded documents are stored as plain `content`.
  snippets?: Snippet[]
  // Optional AI-generated summary produced when the document is ingested.
  summary?: string
  // Keywords used for lightweight document-level relevance ranking.
  tags?: string[]
}

export interface Role {
  id: string
  title: string
  emoji: string
  description: string
  docIds: string[]
  checklist: string[]
}

// Seed docs are authored as structured sections. `content` and `tags` are
// derived from those sections below so they behave like uploaded documents.
type SeedDoc = Omit<KnowledgeDoc, "content" | "tags"> & { snippets: Snippet[] }

const seedDocsRaw: SeedDoc[] = [
  {
    id: "fe-guidelines",
    title: "Linee guida di programmazione — Frontend",
    category: "Linee guida",
    sourceType: "markdown",
    author: "Team Frontend",
    updatedAt: "2026-05-12",
    snippets: [
      {
        id: "fe-loops",
        heading: "Niente cicli `for` / `while`",
        body: "Evita i cicli imperativi `for` e `while`. Usa i metodi funzionali degli array: `map` per trasformare, `filter` per selezionare, `reduce` per aggregare, `forEach` per gli effetti collaterali. Il codice risulta più dichiarativo e meno soggetto a errori di indice.",
        tags: ["for", "while", "ciclo", "cicli", "loop", "map", "foreach", "filter", "reduce", "array", "iterare", "iterazione"],
      },
      {
        id: "fe-ifelse",
        heading: "Niente `if/else` a cascata",
        body: "Evita catene di `if/else` annidate. Preferisci early return (clausole di guardia), operatore ternario per casi semplici, oppure una lookup map / oggetto di dispatch per mappare casi a valori. Riduce la profondità di annidamento e migliora la leggibilità.",
        tags: ["if", "else", "if else", "cascata", "condizione", "condizioni", "early return", "ternario", "switch", "annidato", "guard"],
      },
      {
        id: "fe-useeffect",
        heading: "Evita `useEffect` se non necessario",
        body: "La domanda giusta non è «quando viene eseguito l'effetto» ma «con quale stato deve sincronizzarsi». Usa `useEffect` SOLO per sincronizzare il componente con sistemi esterni: chiamate di rete, timer (`setInterval`), event listener, manipolazione di `window`/DOM. NON usarlo per derivare stato o trasformare props: calcola il valore durante il render (eventualmente con `useMemo`). Includi sempre nell'array delle dipendenze ogni valore di stato usato dentro l'effetto: un array vuoto `[]` con dentro valori reattivi crea closure stale (legge valori vecchi). Per aggiornare lo stato senza aggiungere dipendenze usa la forma funzionale, es. `setCount(c => c + 1)`.\n\nFonte: https://leewarrick.com/blog/react-use-effect-explained/",
        tags: ["useeffect", "effect", "effetto", "hook", "react", "usememo", "stato derivato", "render", "sincronizzazione", "dipendenze", "dependency array", "closure", "stale", "sistemi esterni"],
      },
      {
        id: "fe-useref",
        heading: "`useRef`: valori mutabili fuori dal render",
        body: "`useRef` vive fuori dal ciclo di re-render e NON è reattivo: modificarlo non aggiorna la UI. Usalo per: accedere a nodi del DOM (es. `inputRef.current.focus()`); conservare valori mutabili che non devono causare un render; mantenere il valore corrente di uno stato dentro un effetto evitando le closure stale. Quando ti serve sia il render reattivo sia l'ultimo valore, combina `useState` (per aggiornare la UI) e `useRef` (per leggere il valore corrente). Per aggiornare la UI serve comunque `useState`: non basare un componente solo su `useRef`.\n\nFonte: https://leewarrick.com/blog/react-use-effect-explained/",
        tags: ["useref", "ref", "dom", "focus", "mutabile", "reattivo", "closure", "stale", "render", "react", "hook", "current"],
      },
      {
        id: "fe-let",
        heading: "Niente `let`: usa `const` e `useState`",
        body: "Non dichiarare variabili con `let`. Per valori che non cambiano usa `const`. Per stato che cambia nel tempo dentro un componente usa `useState` (o `useReducer` per stato complesso), così React gestisce il re-render. `let` introduce mutazioni difficili da tracciare.",
        tags: ["let", "const", "variabile", "variabili", "usestate", "usereducer", "stato", "mutazione", "dichiarazione"],
      },
      {
        id: "fe-naming",
        heading: "Naming e tipizzazione",
        body: "Usa nomi descrittivi in inglese per variabili e funzioni. Tipizza sempre props e ritorni in TypeScript: evita `any`, preferisci tipi espliciti o inferiti. Le funzioni componente iniziano con la maiuscola, gli hook con `use`.",
        tags: ["naming", "nome", "nomi", "typescript", "any", "tipo", "tipi", "props", "convenzioni"],
      },
    ],
  },
  {
    id: "pr-rules",
    title: "Checklist per le Pull Request",
    category: "Processi",
    sourceType: "pdf",
    author: "Engineering Lead",
    updatedAt: "2026-04-28",
    snippets: [
      {
        id: "pr-comments",
        heading: "Elimina i commenti superflui",
        body: "Prima di aprire una PR rimuovi i commenti inutili: codice commentato, TODO obsoleti, note personali. Mantieni solo i commenti che spiegano il *perché* di una scelta non ovvia.",
        tags: ["commenti", "commento", "superflui", "todo", "codice commentato", "pulizia", "pr", "pull request"],
      },
      {
        id: "pr-console",
        heading: "Togli i `console.log`",
        body: "Rimuovi tutti i `console.log` e gli statement di debug prima di richiedere la review. Per logging persistente usa il logger applicativo, non `console`.",
        tags: ["console.log", "console", "log", "debug", "logging", "pr", "pull request", "rimuovere"],
      },
      {
        id: "pr-build",
        heading: "Verifica che il progetto builda",
        body: "Esegui sempre `npm run build` e `npm run lint` in locale prima di pushare. Una PR non si apre se la build fallisce o ci sono errori di lint/type-check.",
        tags: ["build", "builda", "compila", "lint", "type-check", "ci", "test", "verde", "pr", "pull request"],
      },
      {
        id: "pr-size",
        heading: "PR piccole e descrittive",
        body: "Mantieni le PR piccole e focalizzate su un singolo cambiamento. Scrivi un titolo chiaro e una descrizione con contesto, motivazione e come testare. Collega la issue di riferimento.",
        tags: ["pr piccole", "dimensione", "descrizione", "titolo", "review", "issue", "pull request", "pr"],
      },
    ],
  },
  {
    id: "onboarding-general",
    title: "Onboarding — Primi giorni in azienda",
    category: "Onboarding",
    sourceType: "text",
    author: "People Ops",
    updatedAt: "2026-05-30",
    snippets: [
      {
        id: "ob-access",
        heading: "Accessi e strumenti",
        body: "Nel primo giorno ricevi le credenziali SSO, l'accesso a GitHub, Slack e al gestionale. Attiva l'autenticazione a due fattori su tutti gli account. Per problemi di accesso scrivi nel canale #it-support.",
        tags: ["accesso", "accessi", "credenziali", "sso", "github", "slack", "2fa", "strumenti", "primo giorno", "onboarding"],
      },
      {
        id: "ob-setup",
        heading: "Setup dell'ambiente di sviluppo",
        body: "Installa Node LTS, pnpm e l'editor consigliato (VS Code con le estensioni del team). Clona il monorepo, esegui `pnpm install` e `pnpm dev`. La guida dettagliata è nel README di ogni repository.",
        tags: ["setup", "ambiente", "sviluppo", "node", "pnpm", "vscode", "repo", "monorepo", "install", "dev"],
      },
      {
        id: "ob-people",
        heading: "A chi chiedere aiuto",
        body: "Ogni nuovo assunto ha un buddy assegnato per le prime due settimane. Per domande tecniche usa il canale del team; per ferie, permessi e contratto scrivi a People Ops. Le daily si tengono alle 9:30.",
        tags: ["aiuto", "buddy", "referente", "domande", "people ops", "ferie", "permessi", "daily", "team"],
      },
    ],
  },
  {
    id: "release-process",
    title: "Processo di rilascio in produzione",
    category: "Processi",
    sourceType: "pdf",
    author: "DevOps",
    updatedAt: "2026-03-15",
    snippets: [
      {
        id: "rel-flow",
        heading: "Flusso di deploy",
        body: "Il deploy in produzione parte dal merge su `main` dopo almeno una review approvata e CI verde. Il tag di release segue il semantic versioning. I rilasci si fanno dal lunedì al giovedì, mai il venerdì.",
        tags: ["deploy", "rilascio", "produzione", "main", "release", "semantic versioning", "ci", "venerdì"],
      },
      {
        id: "rel-rollback",
        heading: "Rollback",
        body: "In caso di incidente, esegui il rollback all'ultima release stabile dal pannello di deploy e apri un incident nel canale #incidenti. La post-mortem va scritta entro 48 ore.",
        tags: ["rollback", "incidente", "incident", "post-mortem", "ripristino", "produzione"],
      },
    ],
  },
  {
    id: "client-tone",
    title: "Comunicazione con i clienti",
    category: "Clienti",
    sourceType: "text",
    author: "Account Management",
    updatedAt: "2026-02-10",
    snippets: [
      {
        id: "cl-tone",
        heading: "Tono di voce",
        body: "Rispondi ai clienti con tono professionale ma cordiale, sempre in italiano salvo richiesta diversa. Conferma di aver compreso il problema, dai una stima realistica dei tempi e non promettere ciò che non è confermato dal team tecnico.",
        tags: ["cliente", "clienti", "tono", "comunicazione", "email", "risposta", "tempi", "stima"],
      },
      {
        id: "cl-escalation",
        heading: "Escalation",
        body: "Se un cliente segnala un blocco critico, apri un ticket con priorità alta e avvisa l'account di riferimento. Non lasciare mai un cliente senza risposta oltre le 4 ore lavorative.",
        tags: ["escalation", "ticket", "priorità", "blocco", "critico", "cliente", "sla"],
      },
    ],
  },
]

export const seedDocs: KnowledgeDoc[] = seedDocsRaw.map((doc) => ({
  ...doc,
  content: doc.snippets.map((s) => `## ${s.heading}\n\n${s.body}`).join("\n\n"),
  tags: Array.from(new Set(doc.snippets.flatMap((s) => s.tags))),
}))

export const roles: Role[] = [
  {
    id: "frontend",
    title: "Frontend Developer",
    emoji: "🎨",
    description: "Sviluppo interfacce in React, TypeScript e Tailwind.",
    docIds: ["fe-guidelines", "pr-rules", "onboarding-general", "release-process"],
    checklist: [
      "Leggere le linee guida di programmazione Frontend",
      "Configurare l'ambiente di sviluppo e clonare il monorepo",
      "Studiare la checklist delle Pull Request",
      "Aprire una prima PR di prova seguendo le regole",
      "Conoscere il processo di rilascio",
    ],
  },
  {
    id: "backend",
    title: "Backend Developer",
    emoji: "⚙️",
    description: "API, servizi e database.",
    docIds: ["pr-rules", "onboarding-general", "release-process"],
    checklist: [
      "Configurare l'ambiente e gli accessi al database",
      "Studiare la checklist delle Pull Request",
      "Conoscere il processo di rilascio e rollback",
      "Familiarizzare con gli standard delle API interne",
    ],
  },
  {
    id: "account",
    title: "Account / Customer Success",
    emoji: "🤝",
    description: "Relazione e supporto ai clienti.",
    docIds: ["client-tone", "onboarding-general"],
    checklist: [
      "Leggere le linee guida sul tono di voce",
      "Conoscere il processo di escalation e gli SLA",
      "Conoscere i referenti tecnici per le escalation",
      "Configurare l'accesso al gestionale e al sistema di ticketing",
    ],
  },
]
