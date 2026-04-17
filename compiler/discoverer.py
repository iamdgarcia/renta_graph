"""
Phase 1 — Topic Discovery.

Reads ALL parsed raw documents and asks the LLM to identify every tax concept
that should become a wiki article. The result is saved to raw/topics.json.

This is the Karpathy "compile" step: the LLM acts as a compiler that reads
source material and produces a structured index — NOT the articles themselves.
Articles are written separately in Phase 2 (llm.py), one per topic.
"""
import json
import re
from pathlib import Path
from typing import List

import instructor
from openai import OpenAI
from pydantic import BaseModel, Field

PARSED_DIR = Path("raw/parsed")
TOPICS_FILE = Path("raw/topics.json")

# Larger chunks for discovery — we only need topic names, not full text
DISCOVERY_CHUNK_CHARS = 60_000

CATEGORIES = [
    "conceptos-generales",
    "rendimientos",
    "deducciones",
    "inversiones",
    "autonomica",
    "procedimientos",
    "novedades-2025",
]

SYSTEM_PROMPT = """Eres un experto fiscal español. Tu tarea es leer fragmentos de documentación oficial del IRPF y extraer una lista de TODOS los conceptos fiscales que merecen un artículo propio en una wiki.

Reglas:
- Extrae TODOS los conceptos que aparezcan, sin omitir nada relevante
- El título debe ser el nombre canónico exacto del concepto en español (p.ej. "Reducción por tributación conjunta", "Mínimo personal y familiar")
- Evita títulos demasiado genéricos ("Introducción", "Resumen") o demasiado fragmentados
- Si el mismo concepto aparece con variantes de nombre, usa el nombre más completo y oficial
- Las deducciones autonómicas de cada comunidad merecen artículos separados (p.ej. "Deducción por alquiler de vivienda — Comunidad de Madrid")"""

USER_PROMPT = """Analiza este fragmento de documentación fiscal y lista TODOS los conceptos fiscales que encuentres y que merezcan un artículo propio.

Fuente: {source}

Contenido:
{content}"""


class Topic(BaseModel):
    title: str = Field(description="Nombre canónico del concepto fiscal en español")
    category: str = Field(description=f"Categoría: {', '.join(CATEGORIES)}")
    description: str = Field(description="Una frase que describe qué es este concepto (máx 200 chars)")


class TopicList(BaseModel):
    topics: List[Topic]


def _slugify(title: str) -> str:
    return re.sub(r'[<>:"/\\|?*\n\r\x00/]', ' ', title).strip()


def discover_topics(force: bool = False) -> List[dict]:
    if TOPICS_FILE.exists() and not force:
        print(f"  [discover] Loading existing topics from {TOPICS_FILE}")
        return json.loads(TOPICS_FILE.read_text(encoding="utf-8"))

    parsed_files = sorted(PARSED_DIR.glob("*.md"))
    if not parsed_files:
        print("  [discover] No parsed files found in raw/parsed/")
        return []

    client = instructor.from_openai(OpenAI())
    seen: dict[str, dict] = {}  # title_lower -> topic dict

    for parsed_file in parsed_files:
        content = parsed_file.read_text(encoding="utf-8")
        chunks = [content[i:i + DISCOVERY_CHUNK_CHARS]
                  for i in range(0, len(content), DISCOVERY_CHUNK_CHARS)]
        source = parsed_file.stem

        for idx, chunk in enumerate(chunks):
            print(f"  [discover] {source} chunk {idx + 1}/{len(chunks)} ...")
            try:
                result: TopicList = client.chat.completions.create(
                    model="gpt-4o",
                    response_model=TopicList,
                    messages=[
                        {"role": "system", "content": SYSTEM_PROMPT},
                        {"role": "user", "content": USER_PROMPT.format(
                            source=source, content=chunk)},
                    ],
                    max_retries=2,
                )
            except Exception as e:
                print(f"  [discover] WARNING: LLM call failed: {e}")
                continue

            for topic in result.topics:
                key = topic.title.lower().strip()
                if key not in seen:
                    seen[key] = {
                        "title": topic.title,
                        "slug": _slugify(topic.title),
                        "category": topic.category if topic.category in CATEGORIES else "conceptos-generales",
                        "description": topic.description[:200],
                        "sources": [source],
                    }
                else:
                    # Merge sources — same concept found in multiple documents
                    if source not in seen[key]["sources"]:
                        seen[key]["sources"].append(source)

    topics = sorted(seen.values(), key=lambda t: (t["category"], t["title"]))
    TOPICS_FILE.write_text(json.dumps(topics, ensure_ascii=False, indent=2),
                           encoding="utf-8")
    print(f"  [discover] Found {len(topics)} unique topics → {TOPICS_FILE}")
    return topics
