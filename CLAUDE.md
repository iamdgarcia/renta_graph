# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Goal

RentaGraph is an LLM-powered knowledge base for the Spanish "Declaración de la Renta." It proves Karpathy's "LLM as wiki compiler" concept: an offline pipeline compiles raw tax PDFs into structured Markdown, and a web agent lets users chat with that wiki using their own API keys (BYOK).

## Repository Structure

```
/scraper/       # Python scripts to download/scrape source documents (AEAT, BOE)
/compiler/      # Python LLM scripts that convert raw docs into /content/wiki/ .md files
/app/           # Next.js App Router web application (Vercel-hosted)
/content/wiki/  # The AI-compiled knowledge base (output of the compiler, input to the web app)
```

## Two Distinct Systems — Never Mix Them

- **The Compiler** (Python): runs offline/GitHub Actions. Reads raw PDFs → writes `/content/wiki/*.md`. Heavy LLM calls happen here, not at runtime.
- **The Web App** (Next.js/Vercel): reads pre-built `/content/wiki/` at build time; only lightweight embedding + chat calls at runtime.

## Phase 1 — Compiler (Python)

- Use **LlamaParse** or Microsoft **MarkItDown** to parse tax PDFs (tables, brackets).
- Use **Instructor** library (or raw API calls) to feed raw Markdown to an LLM and decompose it into discrete concept files.
- Every output `.md` file in `/content/wiki/` **must** have YAML frontmatter (`title`, `tags`, `source_url`) and Wikilink-style backlinks (`[[Base Imponible]]`).
- Target LLMs for compilation: Gemini 1.5 Pro or GPT-4o.

## Phase 2 — Next.js Web App

- Stack: Next.js (App Router), Tailwind CSS, shadcn/ui, Vercel AI SDK.
- **Layout:** Dual-pane — left pane is a file-tree wiki explorer of `/content/wiki/`; right pane is the chat agent UI.
- **Disclaimer banner:** Sticky, unmissable. Text: *"🚨 Experimental AI Knowledge Base. Not financial or legal advice. Always consult the AEAT or a Gestor."*
- **BYOK flow:** Chat is disabled on first visit. Modal prompts for API key (OpenAI/Anthropic/Google). Key stored in `localStorage` only — never sent to a DB or logged. Key passed in `Authorization` header to Next.js Edge functions.
- **Demo mode:** "View Demo Queries" button shows 3 hardcoded pre-saved transcripts (no API key needed).

## Phase 3 — RAG & Citation Engine

- Vectorize `/content/wiki/` Markdown during build (Supabase Vector, Pinecone, or SQLite/Chroma).
- Chat flow: embed query → retrieve top-K wiki docs → inject Markdown into prompt → stream response via Vercel AI SDK.
- **Citations are mandatory:** The system prompt must require the LLM to cite source files. The frontend parses citations and renders them as clickable links that open the cited `.md` in the left pane.

## Key Constraints

- Zero server-side API costs: all LLM calls at chat-time use the user's own key via the `Authorization` header on Edge routes.
- The compiler runs locally or via GitHub Actions — it is never triggered by web traffic.
- Regional deductions (Normativa Autonómica) come from BOE scraping, not just AEAT.

## Commit Style

- Do NOT add "Co-Authored-By" trailers to commit messages.

## Development Commands

```bash
# Python pipeline — always run from repo root
pip install -r scraper/requirements.txt
pip install -r compiler/requirements.txt
python pipeline.py scrape            # download AEAT PDF + BOE pages → raw/
python pipeline.py compile           # parse + LLM compile → app/content/wiki/
python pipeline.py compile --force   # overwrite existing articles
python pipeline.py all               # scrape + compile in one step

# Next.js web app (from app/)
cd app
npm run dev      # local dev server → http://localhost:3000
npm run build    # production build (must pass before commits)
npm run lint     # ESLint
```

## Key Technical Notes

- **AI SDK version:** `ai@6.x` + `@ai-sdk/react@3.x`. Breaking changes vs older versions:
  - `useChat` from `@ai-sdk/react` uses `DefaultChatTransport` + `sendMessage({ text })` — no `handleSubmit`/`input` props
  - `UIMessage` uses `parts: UIMessagePart[]` (not `content: string`) — extract text with `parts.filter(p => p.type === 'text')`
  - `streamText` response: `.toUIMessageStreamResponse()` (not `.toDataStreamResponse()`)
  - `tool()` uses `inputSchema` (not `parameters`)
  - `convertToModelMessages()` is `async` (returns `Promise<ModelMessage[]>`)
  - `maxSteps` replaced by `stopWhen: stepCountIs(N)`
- **Tailwind version:** v4 — config lives in `app/globals.css` (`@import`, `@plugin`, `@theme`), no `tailwind.config.ts`
- **Wiki path:** `app/content/wiki/` — inside the Next.js project root so Vercel includes it automatically
- **Git:** All git commands must run from repo root (`/home/developer/proyectos/renta_graph`), not from inside `app/`
