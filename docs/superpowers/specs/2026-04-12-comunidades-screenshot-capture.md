# Spec: Per-Comunidad Renta 2025 Screenshot Capture

**Date:** 2026-04-12
**Status:** Approved

## Goal

Capture full-page screenshots of the per-autonomous-community IRPF tax pages
that are not currently in the RentaGraph scraper pipeline. These PNGs will be
saved to `raw/comunidades/` and later processed by a vision-capable LLM in the
compiler step.

## Background

The existing scraper downloads:
- AEAT Parte 1 PDF (general IRPF rules)
- AEAT Parte 2 PDF (all 15 CCAA deductions — summary level)
- Several AEAT HTML pages (ayuda técnica, campaign pages)

What is **not** captured: the dedicated per-comunidad pages on AEAT's
Fiscalidad Autonómica subdomain (`AEAT.fisterritorial`) and the corresponding
BOE law texts. These contain more granular, up-to-date, and community-specific
data than the summary PDF.

## Execution Method

One-time interactive session using **Playwright MCP** (not a reusable Python
script). Screenshots are taken now; the compiler will consume them later.

## Scope — All 17 Autonomous Communities

| Slug | Display Name | Regime |
|------|-------------|--------|
| andalucia | Andalucía | Común |
| aragon | Aragón | Común |
| asturias | Asturias (Principado de) | Común |
| baleares | Illes Balears | Común |
| canarias | Canarias | Común |
| cantabria | Cantabria | Común |
| castilla_la_mancha | Castilla-La Mancha | Común |
| castilla_y_leon | Castilla y León | Común |
| cataluna | Cataluña | Común |
| extremadura | Extremadura | Común |
| galicia | Galicia | Común |
| la_rioja | La Rioja | Común |
| madrid | Comunidad de Madrid | Común |
| murcia | Región de Murcia | Común |
| comunitat_valenciana | Comunitat Valenciana | Común |
| navarra | Navarra | Foral |
| pais_vasco | País Vasco | Foral |

## Output Structure

```
raw/
  comunidades/
    manifest.json
    andalucia/
      aeat.png
      boe.png
    aragon/
      aeat.png
      boe.png
    ... (one folder per comunidad slug)
```

### Manifest Format

`raw/comunidades/manifest.json` is a JSON array of capture records.
The `file` field is a path **relative to `raw/`**.

```json
[
  {
    "comunidad": "andalucia",
    "display_name": "Andalucía",
    "regime": "comun",
    "source": "aeat",
    "url": "https://www.agenciatributaria.es/AEAT.fisterritorial/...",
    "file": "comunidades/andalucia/aeat.png",
    "description": "AEAT Fiscalidad Autonómica — Andalucía IRPF deducciones 2025",
    "captured_at": "2026-04-12"
  },
  ...
]
```

## AEAT Navigation Strategy

1. Open: `https://www.agenciatributaria.es/AEAT.fisterritorial/Inicio/_menu_/Fiscalidad_Autonomica/Fiscalidad_Autonomica.html`
2. Discover per-comunidad links from the index.
3. For each comunidad, navigate to its IRPF deducciones page.
4. Take a **full-page screenshot** (Playwright captures the entire scrollable content).
5. For Navarra and País Vasco, navigate to their foral subsections within `AEAT.fisterritorial`.

## BOE Navigation Strategy

For each of the 17 comunidades:

1. Go to `https://www.boe.es/buscar/legislacion.php`
2. Search: `<comunidad name> IRPF deducciones 2025` (or the name of its annual
   presupuestos/acompañamiento law).
3. Open the most relevant consolidated result (the current IRPF law for that CCAA).
4. Take a full-page screenshot.

If a comunidad's law is very long, capture the table of contents + the
deducciones section at minimum.

## Screenshot Settings

- **Format:** PNG
- **Mode:** Full-page (entire scrollable height, not just viewport)
- **Width:** 1280px (standard desktop width)

## Compiler Integration

These PNGs feed into the existing compiler pipeline. The manifest provides
structured context so the compiler LLM knows:
- Which community the image belongs to
- Whether it is AEAT (deduction summaries) or BOE (law text)
- The source URL for citation

The compiler will use a vision-capable model (Gemini 1.5 Pro or GPT-4o) to
extract deduction names, amounts, and conditions from each screenshot and
produce the corresponding `app/content/wiki/*.md` article.

## Out of Scope

- Automating this as a recurring pipeline step (future work)
- Navarra/País Vasco foral tax authority websites (not AEAT-hosted)
- PDF merging or OCR — the compiler handles extraction
