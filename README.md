# RentaGraph

An LLM-powered knowledge base for the Spanish *Declaración de la Renta*, implementing Andrej Karpathy's ["LLM as wiki compiler"](https://x.com/karpathy/status/1886192184808149207) concept.

> **Disclaimer:** Experimental AI knowledge base. Not financial or legal advice. Always consult the AEAT or a qualified *gestor*.

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

## Deploying to Vercel

1. Fork this repo and connect it to Vercel.
2. Set **Root Directory** to `app/` in Vercel project settings.
3. No environment variables needed — the app is fully BYOK.
4. Add `OPENAI_API_KEY` as a repository secret in GitHub for the wiki-update Action.
