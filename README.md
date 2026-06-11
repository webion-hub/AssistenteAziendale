# SapereAI — Assistente con conoscenza aziendale

Progetto pilota che dimostra un **assistente AI allenato sul sapere interno
dell'azienda**: documenti, procedure e linee guida che di solito vivono nella
testa di poche persone o in cartelle che nessuno ritrova.

> Risposte immediate sul sapere interno · meno dipendenza da una sola persona ·
> nuovi assunti operativi prima.

## Cosa fa

- **Assistente** — chat che risponde a domande sul sapere aziendale **citando i
  documenti interni** (es. _"Posso usare i cicli `for`?"_, _"Cosa controllo
  prima di una pull request?"_). Ogni risposta mostra confidenza e fonti
  cliccabili che aprono il documento esatto.
- **Base di conoscenza** — i documenti "dati in pasto" all'assistente. Puoi
  **caricare PDF, immagini o testo**: il contenuto viene segmentato in sezioni e
  reso ricercabile. (PDF/immagini: estrazione testo simulata nella demo.)
- **Onboarding per ruolo** — un nuovo assunto sceglie il proprio ruolo (es.
  _Frontend Developer_) e riceve subito **documenti consigliati e una checklist**
  dei primi giorni. Esempio: le linee guida di programmazione e la checklist PR
  sono le prime cose mostrate a chi entra nel team frontend.

### Conoscenza precaricata (esempi)

- **Linee guida Frontend** — niente cicli `for`/`while` (usa `map`/`forEach`),
  niente `if/else` a cascata, evita `useEffect` se non necessario, niente `let`
  (usa `const`/`useState`).
- **Checklist Pull Request** — elimina i commenti superflui, togli i
  `console.log`, verifica che il progetto builda, PR piccole e descrittive.
- **Processi** (rilascio in produzione, rollback), **Onboarding**,
  **Comunicazione con i clienti**.

## Stack

- React 19 + TypeScript + Vite
- Tailwind CSS v4
- Componenti in stile shadcn/ui (Radix primitives)
- `lucide-react` per le icone

## Avvio

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # type-check + build di produzione
npm run lint
```

## Note sull'implementazione

L'assistente usa un **motore di retrieval simulato** ([src/lib/assistant.ts](src/lib/assistant.ts)):
tokenizza la domanda e fa matching per keyword/tag sui documenti, restituendo le
sezioni più pertinenti con citazioni. È deliberatamente self-contained e senza
backend — il punto di aggancio naturale per un LLM/RAG reale è la funzione
`answer()`: basta sostituire il matching con una chiamata a un modello che riceve
i documenti recuperati come contesto.

Lo stato (documenti caricati) vive in memoria in [src/store.tsx](src/store.tsx);
ricaricando la pagina si torna al set di esempi.
