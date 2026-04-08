import os
import re
from pathlib import Path
from typing import List

import instructor
from openai import OpenAI
from pydantic import BaseModel, Field
import yaml

PARSED_DIR = Path("raw/parsed")
WIKI_DIR = Path(os.environ.get("WIKI_DIR", "app/content/wiki"))
MAX_CHUNK_CHARS = 30_000  # ~8K tokens at 3.5 chars/token


class WikiArticle(BaseModel):
    title: str = Field(description="Title of the tax concept in Spanish")
    tags: List[str] = Field(description="2-5 lowercase kebab-case tags")
    source_url: str = Field(description="Source URL for this information")
    content: str = Field(description="Full Markdown content of the article in Spanish, using [[WikiLink]] cross-references")
    category: str = Field(description="Category grouping: 'conceptos-generales', 'deducciones', 'rendimientos', 'inversiones', 'autonomica', or 'procedimientos'")


SYSTEM_PROMPT = """Eres un experto en el sistema tributario español. Tu misión es convertir texto extraído de documentos fiscales en artículos de wiki bien estructurados.

Para cada concepto fiscal identificado:
1. Escribe el artículo en español claro y preciso
2. Incluye definición, requisitos, cálculo o ejemplos cuando proceda
3. Usa [[NombreConcepto]] para referenciar otros conceptos
4. Mantén el contenido factual y basado en el documento fuente
5. El título debe ser el nombre exacto del concepto fiscal"""

USER_PROMPT_TEMPLATE = """Analiza el siguiente fragmento de documentación fiscal y genera artículos de wiki para los conceptos más importantes que encuentres. Genera entre 1 y 5 artículos según el contenido.

URL del documento fuente: {source_url}

Contenido:
{content}"""


def slugify(title: str) -> str:
    """Convert a title to a safe filename (no path separators or shell-unsafe chars)."""
    safe = re.sub(r'[<>:"/\\|?*\n\r\x00/]', ' ', title)
    return safe.strip()


def compile_wiki(force: bool = False):
    WIKI_DIR.mkdir(parents=True, exist_ok=True)

    parsed_files = list(PARSED_DIR.glob("*.md"))
    if not parsed_files:
        print("  [llm] No parsed files found in raw/parsed/. Run 'python pipeline.py compile' with --parse first, or run 'python pipeline.py all'.")
        return

    client = instructor.from_openai(OpenAI())

    for parsed_file in parsed_files:
        source_name = parsed_file.stem
        # Determine a plausible source URL based on the filename
        if source_name.startswith("manual_renta"):
            source_url = "https://www.agenciatributaria.es/AEAT.internet/Inicio/La_Agencia_Tributaria/Campanas/Renta/Renta.shtml"
        elif "boe_" in source_name:
            # Map region slugs back to the numeric page URLs used by scraper/boe.py
            _boe_url_map = {
                "madrid": "c16-1",
                "cataluna": "c16-2",
                "andalucia": "c16-3",
                "valencia": "c16-4",
            }
            region = source_name.replace("boe_", "")
            page = _boe_url_map.get(region, region)
            source_url = f"https://sede.agenciatributaria.gob.es/Sede/ayuda/manuales-videos-folletos/manuales-practicos/irpf-2024/c16/{page}.html"
        else:
            source_url = "https://www.agenciatributaria.es"

        content = parsed_file.read_text(encoding="utf-8")
        # Split into chunks if too long
        chunks = [content[i:i + MAX_CHUNK_CHARS] for i in range(0, len(content), MAX_CHUNK_CHARS)]

        for chunk_idx, chunk in enumerate(chunks):
            print(f"  [llm] Processing {source_name} chunk {chunk_idx + 1}/{len(chunks)} ...")
            try:
                articles = client.chat.completions.create(
                    model="gpt-4o",
                    response_model=List[WikiArticle],
                    messages=[
                        {"role": "system", "content": SYSTEM_PROMPT},
                        {"role": "user", "content": USER_PROMPT_TEMPLATE.format(
                            source_url=source_url,
                            content=chunk,
                        )},
                    ],
                    max_retries=2,
                )
            except Exception as e:
                print(f"  [llm] WARNING: LLM call failed for {source_name} chunk {chunk_idx}: {e}")
                continue

            for article in articles:
                filename = slugify(article.title) + ".md"
                output_path = WIKI_DIR / filename

                if output_path.exists() and not force:
                    print(f"  [llm] Skipping existing article: {filename}")
                    continue

                frontmatter = {
                    "title": article.title,
                    "tags": article.tags,
                    "source_url": article.source_url,
                    "category": article.category,
                }
                file_content = "---\n" + yaml.dump(frontmatter, allow_unicode=True, default_flow_style=False) + "---\n\n" + article.content + "\n"
                output_path.write_text(file_content, encoding="utf-8")
                print(f"  [llm] -> {output_path}")
