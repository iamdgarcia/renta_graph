import os
from pathlib import Path
from typing import Dict, List

import frontmatter

WIKI_DIR = Path(os.environ.get("WIKI_DIR", "app/content/wiki"))
INDEX_FILE = WIKI_DIR / "index.md"

CATEGORY_LABELS = {
    "conceptos-generales": "Conceptos Generales",
    "deducciones": "Deducciones",
    "rendimientos": "Rendimientos",
    "inversiones": "Inversiones y Activos",
    "autonomica": "Deducciones Autonómicas",
    "procedimientos": "Procedimientos y Modelos",
    "otros": "Otros",
}


def _extract_summary(content: str) -> str:
    """Extract a one-line summary from the article body."""
    for line in content.splitlines():
        line = line.strip()
        # Skip frontmatter markers, headings, empty lines, code blocks
        if line and not line.startswith("#") and not line.startswith("```") and not line.startswith("---"):
            # Remove markdown bold/italic
            line = line.replace("**", "").replace("*", "").replace("__", "")
            return line[:150] + ("..." if len(line) > 150 else "")
    return "Sin descripción."


def build_index():
    WIKI_DIR.mkdir(parents=True, exist_ok=True)

    wiki_files = sorted([f for f in WIKI_DIR.glob("*.md") if f.name != "index.md"])
    if not wiki_files:
        print("  [index] No wiki articles found. Skipping index build.")
        return

    # Group articles by category
    categories: Dict[str, List[tuple]] = {}
    for wiki_file in wiki_files:
        try:
            post = frontmatter.load(wiki_file)
        except Exception as e:
            print(f"  [index] WARNING: Could not parse {wiki_file.name}: {e}")
            continue

        title = post.get("title", wiki_file.stem)
        category = post.get("category", "otros")
        summary = _extract_summary(post.content)

        categories.setdefault(category, []).append((title, summary))

    # Build index content
    lines = ["# Wiki Index — Renta Graph", "", "Este índice es mantenido automáticamente por el compilador. Lista todos los artículos disponibles con un resumen de una línea.", ""]

    for cat_key, label in CATEGORY_LABELS.items():
        if cat_key not in categories:
            continue
        lines.append(f"## {label}")
        lines.append("")
        for title, summary in sorted(categories[cat_key]):
            lines.append(f"- [[{title}]] — {summary}")
        lines.append("")

    INDEX_FILE.write_text("\n".join(lines), encoding="utf-8")
    total = sum(len(v) for v in categories.values())
    print(f"  [index] Written {INDEX_FILE} with {total} articles across {len(categories)} categories")
