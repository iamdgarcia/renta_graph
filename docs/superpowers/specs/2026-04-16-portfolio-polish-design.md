# Portfolio Polish Design

**Date:** 2026-04-16
**Status:** Approved

## Goal

Prepare RentaGraph as a portfolio project demonstrating Karpathy's "LLM as wiki compiler" concept applied to the Spanish Declaración de la Renta 2025. Three deliverables: demo transcripts, root README, and author credit in the app.

---

## Deliverable 1 — Demo Transcripts

### File

`app/data/demo-transcripts.json` — imported by `DemoModal.tsx` as `@/data/demo-transcripts.json`.

### Format

```json
[
  {
    "id": "string",
    "title": "string",
    "messages": [
      { "role": "user" | "assistant", "content": "string" }
    ]
  }
]
```

Assistant messages use `[[ArticleName]]` citation syntax, which `DemoModal.tsx` already parses and renders as styled chips.

### 6 Scenarios

| # | id | Title | User profile | Feature exercised |
|---|-----|-------|-------------|-------------------|
| 1 | `primera-declaracion` | ¿Tengo que declarar este año? | First-timer, salaried employee | Wiki grounding, obligation thresholds |
| 2 | `deduccion-vivienda` | Deducción por vivienda habitual | Homeowner with mortgage pre-2013 | Multi-article lookup, [[citations]] |
| 3 | `autonomo-gastos` | Autónomo: gastos deducibles | Freelancer, estimación directa | Graph traversal, amortización concept chain |
| 4 | `conjunta-vs-individual` | ¿Conjunta o individual? | Married couple | Comparative reasoning, multi-turn follow-up |
| 5 | `ganancias-bolsa` | Ganancias en Bolsa e inversiones | Retail investor | Renta del ahorro, dividendos, retenciones |
| 6 | `deducciones-madrid` | Deducciones autonómicas en Madrid | Madrid resident | Comunidades autónomas articles, regional specifics |

### Transcript Quality Requirements

- Each transcript: 3–5 turns (user + assistant pairs).
- Each assistant reply: 2–4 `[[citation]]` references pointing to real wiki articles that exist in `app/content/wiki/`.
- Multi-turn scenarios (4 and 3): second user message is a follow-up that exercises conversational context.
- Scenarios 3 and 6 should reference graph-traversal insights (e.g., relationships between concepts like amortización → inmovilizado, or deducciones autonómicas → comunidad autónoma).
- Tone: concise, professional, grounded — matches the actual chat system's persona.

---

## Deliverable 2 — Root README

### File

`README.md` at repo root (replaces nothing — no existing root README). Language: English.

### Sections (in order)

1. **Header** — Project name, tagline ("An LLM-powered knowledge base for the Spanish Declaración de la Renta"), badges (Live Demo, License, Next.js, AI SDK).

2. **What is this?** — 2-paragraph narrative. Paragraph 1: Karpathy's "LLM as wiki compiler" concept — the insight that LLMs are better used to compile structured knowledge offline than to answer raw questions at runtime. Paragraph 2: what RentaGraph does specifically — scrapes AEAT PDFs and BOE pages, compiles them into a 180+ article Markdown wiki, and serves them through a BYOK chat interface with graph-augmented retrieval.

3. **Architecture** — Mermaid diagram showing the two-system boundary:
   ```
   PDFs/BOE → scraper → raw/ → compiler (LLM) → content/wiki/*.md
                                                         ↓
                                               Next.js app (build time)
                                                         ↓
                                        user query → embed → RAG → LLM → stream
   ```

4. **Live Demo** — URL + one sentence. Note that demo mode requires no API key.

5. **Quickstart** — Prerequisites (Python 3.11+, Node 20+, API key for compiler), then:
   ```bash
   pip install -r scraper/requirements.txt
   pip install -r compiler/requirements.txt
   python pipeline.py scrape
   python pipeline.py compile
   cd app && npm install && npm run dev
   ```

6. **How to Extend with Your Own Data** — The key "proprietary data" section. Step-by-step:
   1. Drop source PDFs into `raw/`
   2. Update `compiler/config.py`: set `source_url`, `tags`, domain description
   3. Run `python pipeline.py compile`
   4. Rebuild the app — wiki articles are picked up at build time automatically
   5. Schema note: every `.md` must have YAML frontmatter (`title`, `tags`, `source_url`) and use `[[Wikilink]]` syntax for cross-references to get clickable citations in the UI

7. **Tech Stack** — Two-column table:

   | Layer | Tools |
   |-------|-------|
   | Scraper | Python, requests, BeautifulSoup |
   | Compiler | LlamaParse / MarkItDown, Instructor, Gemini 1.5 Pro / GPT-4o |
   | Web App | Next.js (App Router), AI SDK v6, Tailwind v4, Radix UI |
   | Retrieval | Custom BFS/DFS graph traversal on `graph.json`, wiki full-text |
   | Hosting | Vercel (zero server-side LLM costs — BYOK) |

8. **Author** — Short attribution:
   > Built by [Daniel García](https://iamdgarcia.substack.com/subscribe) · AI engineer & writer. If this sparked an idea, consider subscribing.

---

## Deliverable 3 — TopNav "About" Popover

### Component change

`app/components/TopNav.tsx` — add a "Built by Daniel García" trigger on the right side of the nav, left of the API key status indicator.

### Dependencies

No new packages. `@radix-ui/react-popover` is **not** installed. Instead, implement with React `useState` + an absolutely-positioned `<div>` (click-outside via `useEffect` + `mousedown` listener). This is a one-off simple popover — a full Radix component would be overkill.

### Visual layout

```
[RentaGraph logo]           [Built by Daniel García]  [API ●]  [Ver demo]
                                      ↓ click
                         ┌────────────────────────────────┐
                         │ Daniel García Peña             │
                         │ AI engineer & writer           │
                         │                                │
                         │  [→ Subscribe on Substack]     │
                         └────────────────────────────────┘
```

### Style

- Trigger: `<button>` styled as muted text (`var(--color-muted)`), `text-xs`, no border — matches existing nav typography.
- Popover content: `var(--color-surface)` background, `1px solid var(--color-border)` border, `border-radius: 12px`, `box-shadow` matching DemoModal.
- CTA button: accent color (`var(--color-accent)`), same pill shape as existing UI buttons.
- Substack URL: `https://iamdgarcia.substack.com/subscribe` — opens in new tab.

### No new pages or routes required.

---

## Out of Scope

- Animated demo / video walkthrough
- Actual RAG vectorization changes
- Analytics or tracking on Substack link clicks
- i18n / bilingual README
