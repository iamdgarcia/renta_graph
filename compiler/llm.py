"""
Phase 2 — Article Writing.

Reads raw/topics.json (built by discoverer.py) and writes one wiki article
per topic. For each topic, it searches the parsed documents for relevant
passages and feeds them to the LLM as context.

This is the "explosion" step: each index entry becomes a full wiki article.
"""
import json
import re
from pathlib import Path
from typing import List, Optional

import instructor
from openai import OpenAI
from pydantic import BaseModel, Field
import yaml

PARSED_DIR = Path("raw/parsed")
TOPICS_FILE = Path("raw/topics.json")
WIKI_DIR = Path("app/content/wiki")
SOURCE_BASE = "https://sede.agenciatributaria.gob.es/Sede/manuales-practicos.html"

# Max chars of relevant passages to feed per article
MAX_CONTEXT_CHARS = 40_000


class WikiArticle(BaseModel):
    title: str = Field(description="Título canónico del concepto fiscal en español")
    tags: List[str] = Field(description="3-6 etiquetas en kebab-case")
    content: str = Field(
        description=(
            "Artículo completo en Markdown. Incluye: definición, requisitos o "
            "condiciones, cálculo o importes cuando aplique, ejemplos si los hay "
            "en la fuente, y referencias [[WikiLink]] a conceptos relacionados."
        )
    )


SYSTEM_PROMPT = """Eres un experto en el sistema tributario español especializado en IRPF.

Tu tarea es escribir un artículo de wiki completo sobre un concepto fiscal concreto,
usando únicamente los fragmentos del manual oficial que se te proporcionan como contexto.

Normas:
- Escribe en español formal y preciso
- Estructura el artículo con secciones Markdown (##, ###) cuando proceda
- Usa [[NombreConcepto]] para enlazar conceptos relacionados
- Incluye cifras, porcentajes y plazos exactos cuando aparezcan en el contexto
- Si el contexto no cubre un aspecto del concepto, omítelo (no inventes)
- El artículo debe ser completo y autocontenido para alguien que lo lee sin contexto adicional"""

USER_PROMPT = """Escribe el artículo de wiki para el siguiente concepto:

**Concepto**: {title}
**Categoría**: {category}
**Descripción breve**: {description}

Usa los siguientes fragmentos del manual oficial como fuente de información:

---
{context}
---

Escribe el artículo completo ahora."""


def _extract_passages(title: str, description: str, parsed_files: list[Path],
                      max_chars: int = MAX_CONTEXT_CHARS) -> str:
    """
    Search parsed files for passages relevant to the given topic.
    Uses simple keyword matching — no embeddings needed.
    """
    # Build search terms from title words (ignore very short words)
    terms = [w.lower() for w in re.split(r'\W+', title + " " + description)
             if len(w) > 3]

    passages: list[tuple[int, str]] = []  # (score, passage)

    for pf in parsed_files:
        text = pf.read_text(encoding="utf-8")
        # Split into paragraphs
        paragraphs = re.split(r'\n{2,}', text)
        for para in paragraphs:
            if len(para.strip()) < 60:
                continue
            score = sum(1 for t in terms if t in para.lower())
            if score > 0:
                passages.append((score, para.strip()))

    # Sort by relevance, deduplicate, cap total length
    passages.sort(key=lambda x: -x[0])
    seen: set[str] = set()
    result_parts: list[str] = []
    total = 0
    for _, para in passages:
        key = para[:80]
        if key in seen:
            continue
        seen.add(key)
        if total + len(para) > max_chars:
            break
        result_parts.append(para)
        total += len(para)

    return "\n\n".join(result_parts) if result_parts else "(no se encontraron pasajes relevantes en los documentos fuente)"


def slugify(title: str) -> str:
    safe = re.sub(r'[<>:"/\\|?*\n\r\x00/]', ' ', title)
    return safe.strip()


def compile_wiki(force: bool = False) -> None:
    WIKI_DIR.mkdir(parents=True, exist_ok=True)

    if not TOPICS_FILE.exists():
        print("  [llm] raw/topics.json not found. Run 'python pipeline.py compile' (discovery runs first).")
        return

    topics = json.loads(TOPICS_FILE.read_text(encoding="utf-8"))
    parsed_files = sorted(PARSED_DIR.glob("*.md"))

    if not parsed_files:
        print("  [llm] No parsed files found in raw/parsed/.")
        return

    client = instructor.from_openai(OpenAI())
    total = len(topics)

    for i, topic in enumerate(topics, 1):
        filename = slugify(topic["title"]) + ".md"
        output_path = WIKI_DIR / filename

        if output_path.exists() and not force:
            print(f"  [llm] Skipping existing: {filename}")
            continue

        print(f"  [llm] [{i}/{total}] Writing: {topic['title']} ...")

        # Only search source files that were flagged during discovery
        relevant_files = [pf for pf in parsed_files
                          if pf.stem in topic.get("sources", [])] or parsed_files
        context = _extract_passages(topic["title"], topic.get("description", ""),
                                    relevant_files)

        try:
            article: WikiArticle = client.chat.completions.create(
                model="gpt-4o",
                response_model=WikiArticle,
                messages=[
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": USER_PROMPT.format(
                        title=topic["title"],
                        category=topic["category"],
                        description=topic.get("description", ""),
                        context=context,
                    )},
                ],
                max_retries=2,
            )
        except Exception as e:
            print(f"  [llm] WARNING: Failed to write {topic['title']}: {e}")
            continue

        frontmatter = {
            "title": article.title,
            "tags": article.tags,
            "source_url": SOURCE_BASE,
            "category": topic["category"],
        }
        body = "---\n" + yaml.dump(frontmatter, allow_unicode=True,
                                   default_flow_style=False) + "---\n\n"
        body += article.content.strip() + "\n"
        output_path.write_text(body, encoding="utf-8")
        print(f"  [llm]   -> {output_path.name}")
