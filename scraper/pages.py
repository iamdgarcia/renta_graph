"""
Scraper for supplementary AEAT HTML pages and extra PDFs.
These complement the main manual PDFs with campaign-specific, procedural,
and novelty content for Renta 2025.
"""
import os
import requests
import urllib3

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

RAW_DIR = "raw"
AEAT_BASE = "https://sede.agenciatributaria.gob.es"
HACIENDA_BASE = "https://www.hacienda.gob.es"

HEADERS = {
    "User-Agent": "Mozilla/5.0 (compatible; RentaGraph/1.0; research use)"
}

# Extra HTML pages: (url, filename, description)
HTML_PAGES = [
    (
        f"{AEAT_BASE}/Sede/todas-noticias/2026/marzo/18/campana-renta-2025.html",
        "aeat_campana_renta_2025.html",
        "Campaña Renta 2025 — página oficial de inicio de campaña",
    ),
    (
        f"{AEAT_BASE}/Sede/procedimientoini/G229.shtml",
        "aeat_modelo100_procedimiento.html",
        "Modelo 100 IRPF 2025 — procedimiento oficial",
    ),
    (
        f"{AEAT_BASE}/Sede/irpf/campana-renta/novedades-renta-2025.html",
        "aeat_novedades_renta_2025.html",
        "Novedades destacadas de la campaña Renta 2025",
    ),
    (
        f"{AEAT_BASE}/Sede/ayuda/manuales-videos-folletos/manuales-practicos/manual-especifico-irpf-2025-personas-anos.html",
        "aeat_manual_especifico_2025.html",
        "Manual específico IRPF 2025 para personas con discapacidad y mayores",
    ),
]

# Extra PDFs: (url, filename, description)
EXTRA_PDFS = [
    (
        f"{HACIENDA_BASE}/sgt/normativadoctrina/proyectos/26012026-anexo-i-y-ii-renta-2025.pdf",
        "hacienda_d100_renta_2025.pdf",
        "Borrador modelo D-100 Renta 2025 — Ministerio de Hacienda",
    ),
]


def _get(url: str, output_path: str, label: str, binary: bool = False) -> bool:
    if os.path.exists(output_path):
        print(f"  [pages] Already downloaded: {output_path}")
        return True
    print(f"  [pages] Fetching: {label} ...")
    try:
        resp = requests.get(url, headers=HEADERS, timeout=60, verify=False,
                            stream=binary)
        resp.raise_for_status()
        if binary:
            with open(output_path, "wb") as f:
                for chunk in resp.iter_content(chunk_size=65536):
                    if chunk:
                        f.write(chunk)
        else:
            with open(output_path, "w", encoding="utf-8") as f:
                f.write(resp.text)
        size = os.path.getsize(output_path)
        print(f"  [pages] Saved {output_path} ({size // 1024} KB)")
        return True
    except requests.RequestException as e:
        print(f"  [pages] WARNING: Could not fetch {label}: {e}")
        return False


def download_extra_pages() -> None:
    os.makedirs(RAW_DIR, exist_ok=True)
    for url, filename, label in HTML_PAGES:
        _get(url, os.path.join(RAW_DIR, filename), label, binary=False)
    for url, filename, label in EXTRA_PDFS:
        _get(url, os.path.join(RAW_DIR, filename), label, binary=True)
