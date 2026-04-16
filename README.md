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

```
┌─────────────────────────────────────┐     ┌──────────────────────────────────────┐
│        THE COMPILER (offline)        │     │         THE WEB APP (Vercel)          │
│                                     │     │                                      │
│  scraper/   →  raw/                 │     │  Left pane: Wiki Explorer             │
│  (AEAT PDF + BOE HTML)              │     │  (file tree + Markdown viewer)        │
│          ↓                          │     │                                      │
│  compiler/  →  app/content/wiki/    │────▶│  Right pane: Agentic Chat             │
│  (MarkItDown + GPT-4o)              │     │  (reads wiki index → tool calls)      │
│          ↓                          │     │                                      │
│  index_builder → index.md           │     │  BYOK: user provides own API key      │
└─────────────────────────────────────┘     └──────────────────────────────────────┘
        runs locally / GitHub Actions              hosted on Vercel (zero LLM cost)
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

```
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

RentaGraph is domain-agnostic. Any PDF-heavy knowledge domain (legal codes, technical manuals, medical guidelines) can be compiled into a BYOK wiki following the same pattern.

### 1. Drop your source documents into `raw/`

The scraper downloads AEAT PDFs and BOE HTML pages. For your own domain, either run a custom scraper or place documents manually:

```bash
mkdir -p raw/my-domain
cp my-docs/*.pdf raw/my-domain/
```

### 2. Configure the compiler

Edit `compiler/config.py` (or the relevant section of `compiler/main.py`):

```python
DOMAIN_DESCRIPTION = "Your domain in plain language — what the wiki covers"
DEFAULT_TAGS = ["your-tag", "domain-tag"]
SOURCE_URL_PREFIX = "https://your-source-domain.com"
```

### 3. Run the compiler

```bash
export OPENAI_API_KEY=sk-...   # or ANTHROPIC_API_KEY / GOOGLE_API_KEY
python pipeline.py compile
# or to overwrite existing articles:
python pipeline.py compile --force
```

The compiler calls the LLM to decompose raw documents into one Markdown file per concept.

### 4. Article schema (required)

Every `.md` file in `app/content/wiki/` must follow this schema or citations and the file tree will break:

```markdown
---
title: "Concept Name"
tags: ["tag1", "tag2"]
source_url: "https://original-source.com/page"
---

Article body with [[WikiLink]] cross-references to other articles.
```

### 5. Rebuild the app

```bash
cd app && npm run build
```

The wiki is read from disk at build time — no database, no re-deployment pipeline beyond a standard Next.js build.

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

1. Fork this repo and connect it to Vercel.
2. Set **Root Directory** to `app/` in Vercel project settings.
3. No environment variables needed — the app is fully BYOK.
4. Add `OPENAI_API_KEY` as a repository secret in GitHub for the wiki-update Action.

---

## Author

Built by [Daniel García Peña](https://iamdgarcia.substack.com/subscribe) — AI engineer & writer.

If RentaGraph sparked an idea or you want to follow along as this project evolves, consider subscribing to the newsletter.
