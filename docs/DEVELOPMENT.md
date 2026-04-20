# Development Guide

This guide centralizes advanced setup, extension, and contribution workflows for RentaGraph.

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

## Deploying to Vercel

1. Fork this repo and connect it to Vercel.
2. Set **Root Directory** to `app/` in Vercel project settings.
3. No environment variables needed — the app is fully BYOK.
4. Add `OPENAI_API_KEY` as a repository secret in GitHub for the wiki-update Action.

## Contributing

Contributions are welcome. Please keep changes focused, tested, and easy to review.

### Development setup

```bash
# Python dependencies (scraper + compiler)
pip install -r scraper/requirements.txt
pip install -r compiler/requirements.txt

# App dependencies
cd app && npm install
```

### Typical workflow

1. Create a branch from `main` (for example: `feat/wiki-categories-fallback`).
2. Make small, scoped commits with clear messages.
3. Run the checks below before opening a PR.
4. Open a PR with context, screenshots (if UI changes), and validation notes.

### Validation checklist

```bash
# App lint
cd app && npm run lint

# Pipeline smoke test
python test_mvp.py
```

If your change touches the compiler output, include a short note about what changed in `app/content/wiki/` and why.

### Commit message conventions

- Prefer Conventional Commits (examples: `fix: ...`, `feat: ...`, `docs: ...`).
- Use imperative mood and keep the subject line under ~72 chars.
- Reference related issue/PR IDs when available.
