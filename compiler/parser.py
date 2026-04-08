import os
from pathlib import Path
from markitdown import MarkItDown

RAW_DIR = Path("raw")
PARSED_DIR = Path("raw/parsed")


def parse_all():
    PARSED_DIR.mkdir(parents=True, exist_ok=True)
    md = MarkItDown()

    source_files = list(RAW_DIR.glob("*.pdf")) + list(RAW_DIR.glob("*.html"))
    if not source_files:
        print("  [parser] No source files found in raw/. Run 'python pipeline.py scrape' first.")
        return

    for src in source_files:
        out_path = PARSED_DIR / (src.stem + ".md")
        if out_path.exists():
            print(f"  [parser] Already parsed: {out_path}")
            continue
        print(f"  [parser] Parsing {src} ...")
        try:
            result = md.convert(str(src))
            out_path.write_text(result.text_content, encoding="utf-8")
            print(f"  [parser] -> {out_path}")
        except Exception as e:
            print(f"  [parser] WARNING: Failed to parse {src}: {e}")
