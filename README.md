# RentaGraph

An LLM-powered knowledge base for the Spanish *Declaración de la Renta*, implementing Andrej Karpathy's ["LLM as wiki compiler"](https://x.com/karpathy/status/1886192184808149207) concept.

[![Next.js](https://img.shields.io/badge/Next.js-App_Router-black?logo=next.js&logoColor=white)](https://nextjs.org)
[![Vercel AI SDK](https://img.shields.io/badge/AI_SDK-v6-5c2d91?logo=vercel&logoColor=white)](https://sdk.vercel.ai)
[![Python](https://img.shields.io/badge/Python-3.11+-3776ab?logo=python&logoColor=white)](https://python.org)
[![BYOK](https://img.shields.io/badge/BYOK-no_server_costs-22c55e)](https://github.com)

> **Disclaimer:** Experimental AI knowledge base. Not financial or legal advice. Always consult the AEAT or a qualified *gestor*.

**[→ Live Demo](https://renta-graph.vercel.app)** — No API key needed for demo mode. Bring your own OpenAI or Anthropic key to ask your own questions.

---

## Architecture

```text
                    ┌─────────────────────────────────────────────┐
                    │                  CLAUDE.md                  │
                    │       the schema that controls              │
                    │         everything the pipeline does        │
                    └─────────────────────────────────────────────┘
                                           │
                                           ▼
┌ ─ ─ ─ ─ ─ ─ ─ ─ ┐   ┌───────────────────────────────────────┐   ┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐
│                  │   │                                       │   │                             │
│      raw/        │   │             COMPILER                  │   │    app/content/wiki/        │
│                  │   │                                       │   │                             │
│  AEAT PDFs       │──>│  0. scrape AEAT + BOE                 │──>│  Conceptos Generales/       │
│  BOE HTML        │   │  1. parse PDFs (MarkItDown)           │   │  Rendimientos/              │
│  CC.AA. norms    │   │  2. classify concepts                 │   │  Deducciones/               │
│                  │   │  3. compile articles (LLM)            │   │  Autonómica/                │
│                  │   │  4. add [[wikilinks]]                 │   │  index.md                   │
│                  │   │  5. update index.md                   │   │                             │
└ ─ ─ ─ ─ ─ ─ ─ ─ ┘   └───────────────────────────────────────┘   └ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘
                                                                                  │
                                                                                  ▼
                                                                    ┌─────────────────────────────┐
                                                                    │      Web App (Vercel)       │
                                                                    │      knowledge graph        │
                                                                    │      + wiki explorer        │
                                                                    └─────────────────────────────┘

┌ ─ ─ ─ ─ ─ ─ ─ ─ ┐   ┌───────────────────────────────────────┐
│                  │   │                                       │
│    pregunta      │──>│               AGENT                   │
│                  │   │                                       │──> wiki grows
│                  │   │  scan index.md                        │
│                  │   │  call read_wiki_page (tools)          │
│    respuesta     │<──│  synthesize with [[refs]]             │
│   (con [[refs]]) │   │  file insights back in                │
│                  │   │                                       │
└ ─ ─ ─ ─ ─ ─ ─ ─ ┘   └───────────────────────────────────────┘
```

**Key insight:** By pre-compiling raw tax PDFs into a structured wiki, the agent can navigate knowledge accurately using an index file — no embeddings or vector DB needed. This is the Karpathy method: the LLM writes and maintains the wiki, then reads it to answer questions.

---

## Quick Start

### Run the compiler (generates the wiki)

```bash
# Install dependencies
pip install -r scraper/requirements.txt
pip install -r compiler/requirements.txt

# Set your OpenAI key
export OPENAI_API_KEY=sk-...

# Run the full pipeline
python pipeline.py all

# Or step by step:
python pipeline.py scrape    # download AEAT PDF + BOE pages → raw/
python pipeline.py compile   # parse + LLM compile → app/content/wiki/
python pipeline.py compile --force  # overwrite existing articles
```

### Run the web app locally

```bash
cd app
npm install
npm run dev   # http://localhost:3000
```

Enter your OpenAI or Anthropic API key when prompted. Your key stays in your browser — it is never sent to our servers.

---

## Repository Structure

```text
renta_graph/
├── pipeline.py           # Unified CLI: scrape | compile | all
├── scraper/              # Downloads AEAT PDF + BOE regional pages
├── compiler/             # Parses raw docs + LLM compilation into wiki
├── app/
│   ├── content/wiki/     # The compiled knowledge base (committed to repo)
│   │   ├── index.md      # Auto-maintained article index (agent's map)
│   │   └── *.md          # One file per tax concept (YAML frontmatter + [[wikilinks]])
│   ├── app/              # Next.js App Router
│   │   ├── api/chat/     # Agentic chat route (BYOK, tool use)
│   │   └── api/wiki/     # Wiki file-serving route
│   ├── components/       # React UI components
│   └── lib/wiki.ts       # Wiki filesystem utilities
├── .github/workflows/    # GitHub Action: monthly wiki update
└── .env.example          # Required env vars for the compiler
```

---

## How the Agent Works

1. The agent receives the full `index.md` in its system prompt — a one-line summary of every wiki article.
2. It uses a `read_wiki_page(filename)` tool to fetch full articles relevant to the user's question.
3. It answers with `[[WikiLink]]` citations that open the source article in the left pane.
4. No embeddings, no vector DB — the pre-organized wiki makes retrieval simple and accurate.

---

## Extend with Your Own Data

RentaGraph is domain-agnostic and can compile other document-heavy domains into a BYOK wiki.

For the full guide (custom sources, compiler config, article schema, and rebuild flow), see:

- [`docs/DEVELOPMENT.md`](docs/DEVELOPMENT.md)

---

## Tech Stack

| Layer | Technology |
| ----- | ---------- |
| Scraper | Python 3.11, `requests`, `BeautifulSoup4` |
| Compiler | `MarkItDown` (PDF parsing), `Instructor`, GPT-4o / Gemini 1.5 Pro |
| Web app | Next.js (App Router), Vercel AI SDK v6, Tailwind CSS v4, Radix UI |
| Retrieval | Custom BFS/DFS graph traversal on `graph.json` + wiki full-text lookup |
| Hosting | Vercel — zero server-side LLM costs (BYOK) |

---

## Deploying to Vercel

- Quick deployment and full contributor workflows are documented in:
- [`docs/DEVELOPMENT.md`](docs/DEVELOPMENT.md)

---

## Contributing

Contributions are welcome. Use the concise checklist and workflows in:

- [`docs/DEVELOPMENT.md`](docs/DEVELOPMENT.md)

---

## Author

Built by [Daniel García Peña](https://iamdgarcia.substack.com/subscribe) — AI engineer & writer.

If RentaGraph sparked an idea or you want to follow along as this project evolves, consider subscribing to the newsletter.
