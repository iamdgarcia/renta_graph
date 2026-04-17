"""
Descarga el contenido completo de la página de novedades INFORMA 2026 de la AEAT
y todos sus sub-enlaces, y los guarda en un único archivo Markdown en raw/.

Uso:
    python -m scraper.novedades_informa_2026
"""
import os
import re
import requests
import urllib3
from urllib.parse import urljoin, urlparse
from bs4 import BeautifulSoup

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

AEAT_BASE = "https://sede.agenciatributaria.gob.es"
INDEX_URL = (
    f"{AEAT_BASE}/Sede/irpf/novedades-impuesto/"
    "novedades-publicadas-informa-2026.html"
)
OUTPUT_FILE = "raw/aeat_novedades_informa_2026.md"
RAW_DIR = "raw"

HEADERS = {
    "User-Agent": "Mozilla/5.0 (compatible; RentaGraph/1.0; research use)"
}


def get(url: str) -> str | None:
    try:
        resp = requests.get(url, headers=HEADERS, timeout=60, verify=False)
        resp.raise_for_status()
        resp.encoding = resp.apparent_encoding or "utf-8"
        return resp.text
    except requests.RequestException as e:
        print(f"  [warn] No se pudo descargar {url}: {e}")
        return None


def html_to_text(html: str, base_url: str) -> str:
    """Convierte HTML a texto Markdown limpio usando BeautifulSoup."""
    soup = BeautifulSoup(html, "html.parser")

    # Eliminar elementos que no aportan contenido
    for tag in soup.select(
        "nav, header, footer, script, style, noscript, "
        ".menu, .breadcrumb, .pagination, .sidebar, "
        "#menu, #header, #footer, #navigation, "
        "[role=navigation], [role=banner], [role=contentinfo]"
    ):
        tag.decompose()

    # Buscar el contenido principal
    main = (
        soup.find("main")
        or soup.find(id="contenido")
        or soup.find(id="content")
        or soup.find(class_="contenido")
        or soup.find(class_="content")
        or soup.find("article")
        or soup.body
    )
    if not main:
        return soup.get_text(separator="\n", strip=True)

    lines = []
    _node_to_md(main, lines)
    text = "\n".join(lines)
    # Colapsar líneas en blanco múltiples
    text = re.sub(r"\n{3,}", "\n\n", text).strip()
    return text


def _node_to_md(node, lines: list[str]) -> None:
    """Recorre el árbol DOM y genera líneas Markdown."""
    from bs4 import NavigableString, Tag

    if isinstance(node, NavigableString):
        text = node.strip()
        if text:
            lines.append(text)
        return

    if not isinstance(node, Tag):
        return

    tag = node.name.lower() if node.name else ""

    if tag in ("h1",):
        lines.append(f"\n## {node.get_text(strip=True)}\n")
    elif tag in ("h2",):
        lines.append(f"\n### {node.get_text(strip=True)}\n")
    elif tag in ("h3", "h4", "h5", "h6"):
        lines.append(f"\n#### {node.get_text(strip=True)}\n")
    elif tag == "p":
        text = node.get_text(separator=" ", strip=True)
        if text:
            lines.append(f"\n{text}\n")
    elif tag in ("ul", "ol"):
        lines.append("")
        for li in node.find_all("li", recursive=False):
            item = li.get_text(separator=" ", strip=True)
            lines.append(f"- {item}")
        lines.append("")
    elif tag == "table":
        _table_to_md(node, lines)
    elif tag in ("br",):
        lines.append("")
    elif tag in ("script", "style", "noscript"):
        pass
    else:
        for child in node.children:
            _node_to_md(child, lines)


def _table_to_md(table, lines: list[str]) -> None:
    """Convierte una tabla HTML a Markdown."""
    rows = table.find_all("tr")
    if not rows:
        return
    lines.append("")
    for i, row in enumerate(rows):
        cells = row.find_all(["th", "td"])
        cell_texts = [c.get_text(separator=" ", strip=True) for c in cells]
        lines.append("| " + " | ".join(cell_texts) + " |")
        if i == 0:
            lines.append("| " + " | ".join(["---"] * len(cells)) + " |")
    lines.append("")


def extract_sublinks(html: str) -> list[tuple[str, str]]:
    """
    Extrae los sub-enlaces de la página índice.
    Devuelve lista de (url_absoluta, texto_enlace).
    Filtra solo los enlaces que parecen artículos/noticias de la misma sección.
    """
    soup = BeautifulSoup(html, "html.parser")

    # Buscar el contenedor principal de noticias/novedades
    main = (
        soup.find("main")
        or soup.find(id="contenido")
        or soup.find(id="content")
        or soup.body
    )

    seen = set()
    links = []

    for a in (main or soup).find_all("a", href=True):
        href = a["href"].strip()
        text = a.get_text(strip=True)

        if not href or href.startswith("#") or href.startswith("javascript"):
            continue

        abs_url = urljoin(INDEX_URL, href)
        parsed = urlparse(abs_url)

        # Solo páginas de la misma sede AEAT
        if parsed.netloc and "agenciatributaria.gob.es" not in parsed.netloc:
            continue

        # Evitar duplicados y páginas sin extensión útil (PDFs, etc. los ignoramos aquí)
        if abs_url in seen:
            continue
        if abs_url == INDEX_URL:
            continue

        # Filtrar solo rutas que parecen sub-artículos de la misma sección
        path = parsed.path
        if not (path.endswith(".html") or path.endswith(".shtml")):
            continue

        seen.add(abs_url)
        links.append((abs_url, text or path.split("/")[-1]))

    return links


def main() -> None:
    os.makedirs(RAW_DIR, exist_ok=True)

    print(f"[novedades] Descargando índice: {INDEX_URL}")
    index_html = get(INDEX_URL)
    if not index_html:
        print("[error] No se pudo descargar la página índice.")
        return

    sublinks = extract_sublinks(index_html)
    print(f"[novedades] Sub-enlaces encontrados: {len(sublinks)}")

    # Generar el Markdown
    md_parts: list[str] = []
    md_parts.append(f"# Novedades publicadas INFORMA 2026 — AEAT IRPF\n")
    md_parts.append(f"**Fuente:** {INDEX_URL}\n")
    md_parts.append(
        f"**Artículos indexados:** {len(sublinks)}\n"
    )
    md_parts.append("---\n")

    # Contenido de la página índice
    print("[novedades] Extrayendo contenido de la página índice...")
    index_text = html_to_text(index_html, INDEX_URL)
    md_parts.append("## Página índice\n")
    md_parts.append(index_text)
    md_parts.append("\n---\n")

    # Contenido de cada sub-enlace
    for i, (url, label) in enumerate(sublinks, 1):
        print(f"[novedades] [{i}/{len(sublinks)}] {label[:60]} — {url}")
        html = get(url)
        if not html:
            md_parts.append(f"## {label}\n\n_No disponible_\n\n---\n")
            continue

        text = html_to_text(html, url)
        md_parts.append(f"## {label}\n")
        md_parts.append(f"**URL:** {url}\n")
        md_parts.append(text)
        md_parts.append("\n---\n")

    output = "\n".join(md_parts)

    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        f.write(output)

    size_kb = os.path.getsize(OUTPUT_FILE) // 1024
    print(f"\n[novedades] Guardado en {OUTPUT_FILE} ({size_kb} KB)")
    print(f"[novedades] Total artículos procesados: {len(sublinks)}")


if __name__ == "__main__":
    main()
