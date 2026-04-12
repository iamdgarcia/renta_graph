# Per-Comunidad Renta 2025 Screenshot Capture — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Capture full-page PNG screenshots of the AEAT Fiscalidad Autonómica page and the BOE IRPF law page for each of the 17 Spanish autonomous communities, saved to `raw/comunidades/` with a `manifest.json`.

**Architecture:** Interactive Playwright MCP browser session — no Python code written. For each comunidad, navigate to the relevant AEAT `AEAT.fisterritorial` page and the BOE consolidated law page, take a full-page screenshot, save the PNG. After all captures, write `manifest.json` with metadata for every file. Commit in batches.

**Tech Stack:** Playwright MCP (browser navigation + screenshots), Bash (mkdir, ls -lh for verification), Write tool (manifest.json)

---

## File Map

| Path | Role |
|------|------|
| `raw/comunidades/manifest.json` | Index of all 34 captures (17 × 2 sources) |
| `raw/comunidades/<slug>/aeat.png` | Full-page screenshot of AEAT Fiscalidad Autonómica page |
| `raw/comunidades/<slug>/boe.png` | Full-page screenshot of BOE consolidated IRPF law |
| `raw/comunidades/aeat_index.png` | Screenshot of the AEAT index page (navigation reference) |

Slugs: `andalucia`, `aragon`, `asturias`, `baleares`, `canarias`, `cantabria`, `castilla_la_mancha`, `castilla_y_leon`, `cataluna`, `extremadura`, `galicia`, `la_rioja`, `madrid`, `murcia`, `comunitat_valenciana`, `navarra`, `pais_vasco`

---

### Task 0: Setup — create directories

**Files:** Creates `raw/comunidades/` tree

- [ ] **Step 1: Create all 17 community directories**

```bash
mkdir -p raw/comunidades/andalucia \
  raw/comunidades/aragon \
  raw/comunidades/asturias \
  raw/comunidades/baleares \
  raw/comunidades/canarias \
  raw/comunidades/cantabria \
  raw/comunidades/castilla_la_mancha \
  raw/comunidades/castilla_y_leon \
  raw/comunidades/cataluna \
  raw/comunidades/extremadura \
  raw/comunidades/galicia \
  raw/comunidades/la_rioja \
  raw/comunidades/madrid \
  raw/comunidades/murcia \
  raw/comunidades/comunitat_valenciana \
  raw/comunidades/navarra \
  raw/comunidades/pais_vasco
```

- [ ] **Step 2: Verify**

```bash
ls raw/comunidades/ | wc -l
```

Expected output: `17`

---

### Task 1: Explore AEAT index and discover per-comunidad URLs

**Files:** Creates `raw/comunidades/aeat_index.png`

- [ ] **Step 1: Navigate to AEAT Fiscalidad Autonómica index**

Use Playwright MCP to navigate to:
```
https://www.agenciatributaria.es/AEAT.fisterritorial/Inicio/_menu_/Fiscalidad_Autonomica/Fiscalidad_Autonomica.html
```

- [ ] **Step 2: Take full-page screenshot of the index**

Save to: `raw/comunidades/aeat_index.png` — full-page mode, 1280px width.

- [ ] **Step 3: Read page links to identify per-comunidad URL pattern**

Get the visible text or accessibility snapshot of the page. Look for links to the 15 régimen común CCAA (Andalucía, Aragón, etc.) and the 2 foral CCAA (Navarra, País Vasco). Record the URL pattern — expected to be under `/Regimen_comun/<Name>/` and `/Regimen_Foral/<Name>/`. This URL pattern is used in Tasks 2–4.

- [ ] **Step 4: Verify screenshot saved**

```bash
ls -lh raw/comunidades/aeat_index.png
```

Expected: file exists, size > 100KB.

- [ ] **Step 5: Commit**

```bash
git add raw/comunidades/aeat_index.png
git commit -m "chore: add AEAT Fiscalidad Autonomica index screenshot"
```

---

### Task 2: AEAT screenshots — Andalucía, Aragón, Asturias, Baleares, Canarias

For each community: navigate to its AEAT Fiscalidad Autonómica IRPF page (URL discovered in Task 1), take a full-page screenshot at 1280px, save to the corresponding file. Note the actual URL for the manifest.

**Files:**
- Create: `raw/comunidades/andalucia/aeat.png`
- Create: `raw/comunidades/aragon/aeat.png`
- Create: `raw/comunidades/asturias/aeat.png`
- Create: `raw/comunidades/baleares/aeat.png`
- Create: `raw/comunidades/canarias/aeat.png`

- [ ] **Step 1: Screenshot — Andalucía**

Navigate to the Andalucía IRPF page found via the index (expected path contains `Andalucia`).
Full-page screenshot → `raw/comunidades/andalucia/aeat.png`.
Record exact URL visited.

- [ ] **Step 2: Screenshot — Aragón**

Navigate to the Aragón IRPF page (expected path contains `Aragon`).
Full-page screenshot → `raw/comunidades/aragon/aeat.png`.
Record exact URL visited.

- [ ] **Step 3: Screenshot — Asturias**

Navigate to the Asturias IRPF page (expected path contains `Asturias`).
Full-page screenshot → `raw/comunidades/asturias/aeat.png`.
Record exact URL visited.

- [ ] **Step 4: Screenshot — Illes Balears**

Navigate to the Baleares IRPF page (expected path contains `Baleares` or `Illes_Balears`).
Full-page screenshot → `raw/comunidades/baleares/aeat.png`.
Record exact URL visited.

- [ ] **Step 5: Screenshot — Canarias**

Navigate to the Canarias IRPF page (expected path contains `Canarias`).
Full-page screenshot → `raw/comunidades/canarias/aeat.png`.
Record exact URL visited.

- [ ] **Step 6: Verify all 5 files**

```bash
ls -lh raw/comunidades/andalucia/aeat.png \
  raw/comunidades/aragon/aeat.png \
  raw/comunidades/asturias/aeat.png \
  raw/comunidades/baleares/aeat.png \
  raw/comunidades/canarias/aeat.png
```

Expected: all 5 files exist, each > 50KB.

- [ ] **Step 7: Commit**

```bash
git add raw/comunidades/andalucia/aeat.png \
  raw/comunidades/aragon/aeat.png \
  raw/comunidades/asturias/aeat.png \
  raw/comunidades/baleares/aeat.png \
  raw/comunidades/canarias/aeat.png
git commit -m "chore: AEAT screenshots — Andalucia Aragon Asturias Baleares Canarias"
```

---

### Task 3: AEAT screenshots — Cantabria, Castilla-La Mancha, Castilla y León, Cataluña, Extremadura

**Files:**
- Create: `raw/comunidades/cantabria/aeat.png`
- Create: `raw/comunidades/castilla_la_mancha/aeat.png`
- Create: `raw/comunidades/castilla_y_leon/aeat.png`
- Create: `raw/comunidades/cataluna/aeat.png`
- Create: `raw/comunidades/extremadura/aeat.png`

- [ ] **Step 1: Screenshot — Cantabria**

Navigate to the Cantabria IRPF page (expected path contains `Cantabria`).
Full-page screenshot → `raw/comunidades/cantabria/aeat.png`.
Record exact URL visited.

- [ ] **Step 2: Screenshot — Castilla-La Mancha**

Navigate to the Castilla-La Mancha IRPF page (expected path contains `Castilla_La_Mancha` or `Castilla-La_Mancha`).
Full-page screenshot → `raw/comunidades/castilla_la_mancha/aeat.png`.
Record exact URL visited.

- [ ] **Step 3: Screenshot — Castilla y León**

Navigate to the Castilla y León IRPF page (expected path contains `Castilla_y_Leon` or `Castilla_Leon`).
Full-page screenshot → `raw/comunidades/castilla_y_leon/aeat.png`.
Record exact URL visited.

- [ ] **Step 4: Screenshot — Cataluña**

Navigate to the Cataluña IRPF page (expected path contains `Cataluna` or `Catalunya`).
Full-page screenshot → `raw/comunidades/cataluna/aeat.png`.
Record exact URL visited.

- [ ] **Step 5: Screenshot — Extremadura**

Navigate to the Extremadura IRPF page (expected path contains `Extremadura`).
Full-page screenshot → `raw/comunidades/extremadura/aeat.png`.
Record exact URL visited.

- [ ] **Step 6: Verify all 5 files**

```bash
ls -lh raw/comunidades/cantabria/aeat.png \
  raw/comunidades/castilla_la_mancha/aeat.png \
  raw/comunidades/castilla_y_leon/aeat.png \
  raw/comunidades/cataluna/aeat.png \
  raw/comunidades/extremadura/aeat.png
```

Expected: all 5 files exist, each > 50KB.

- [ ] **Step 7: Commit**

```bash
git add raw/comunidades/cantabria/aeat.png \
  raw/comunidades/castilla_la_mancha/aeat.png \
  raw/comunidades/castilla_y_leon/aeat.png \
  raw/comunidades/cataluna/aeat.png \
  raw/comunidades/extremadura/aeat.png
git commit -m "chore: AEAT screenshots — Cantabria CastillaLaMancha CastillaYLeon Cataluna Extremadura"
```

---

### Task 4: AEAT screenshots — Galicia, La Rioja, Madrid, Murcia, Comunitat Valenciana, Navarra, País Vasco

**Files:**
- Create: `raw/comunidades/galicia/aeat.png`
- Create: `raw/comunidades/la_rioja/aeat.png`
- Create: `raw/comunidades/madrid/aeat.png`
- Create: `raw/comunidades/murcia/aeat.png`
- Create: `raw/comunidades/comunitat_valenciana/aeat.png`
- Create: `raw/comunidades/navarra/aeat.png`
- Create: `raw/comunidades/pais_vasco/aeat.png`

- [ ] **Step 1: Screenshot — Galicia**

Navigate to the Galicia IRPF page (expected path contains `Galicia`).
Full-page screenshot → `raw/comunidades/galicia/aeat.png`.
Record exact URL visited.

- [ ] **Step 2: Screenshot — La Rioja**

Navigate to the La Rioja IRPF page (expected path contains `La_Rioja` or `Rioja`).
Full-page screenshot → `raw/comunidades/la_rioja/aeat.png`.
Record exact URL visited.

- [ ] **Step 3: Screenshot — Comunidad de Madrid**

Navigate to the Madrid IRPF page (expected path contains `Madrid`).
Full-page screenshot → `raw/comunidades/madrid/aeat.png`.
Record exact URL visited.

- [ ] **Step 4: Screenshot — Región de Murcia**

Navigate to the Murcia IRPF page (expected path contains `Murcia`).
Full-page screenshot → `raw/comunidades/murcia/aeat.png`.
Record exact URL visited.

- [ ] **Step 5: Screenshot — Comunitat Valenciana**

Navigate to the Comunitat Valenciana IRPF page (expected path contains `Valencia` or `Comunitat_Valenciana`).
Full-page screenshot → `raw/comunidades/comunitat_valenciana/aeat.png`.
Record exact URL visited.

- [ ] **Step 6: Screenshot — Navarra (Foral)**

Navigate to the Navarra page under the foral section of AEAT.fisterritorial
(expected path under `/Regimen_Foral/Navarra/` or similar).
Full-page screenshot → `raw/comunidades/navarra/aeat.png`.
Record exact URL visited.

- [ ] **Step 7: Screenshot — País Vasco (Foral)**

Navigate to the País Vasco page under the foral section
(expected path under `/Regimen_Foral/Pais_Vasco/` or similar).
Full-page screenshot → `raw/comunidades/pais_vasco/aeat.png`.
Record exact URL visited.

- [ ] **Step 8: Verify all 7 files**

```bash
ls -lh raw/comunidades/galicia/aeat.png \
  raw/comunidades/la_rioja/aeat.png \
  raw/comunidades/madrid/aeat.png \
  raw/comunidades/murcia/aeat.png \
  raw/comunidades/comunitat_valenciana/aeat.png \
  raw/comunidades/navarra/aeat.png \
  raw/comunidades/pais_vasco/aeat.png
```

Expected: all 7 files exist, each > 50KB.

- [ ] **Step 9: Commit**

```bash
git add raw/comunidades/galicia/aeat.png \
  raw/comunidades/la_rioja/aeat.png \
  raw/comunidades/madrid/aeat.png \
  raw/comunidades/murcia/aeat.png \
  raw/comunidades/comunitat_valenciana/aeat.png \
  raw/comunidades/navarra/aeat.png \
  raw/comunidades/pais_vasco/aeat.png
git commit -m "chore: AEAT screenshots — Galicia LaRioja Madrid Murcia Valencia Navarra PaisVasco"
```

---

### Task 5: BOE screenshots — Andalucía, Aragón, Asturias, Baleares, Canarias

For each community: search BOE at `https://www.boe.es/buscar/legislacion.php` for the consolidated IRPF/tributos cedidos law of that community, navigate to the most relevant result (the consolidated text with deducciones autonómicas IRPF), take a full-page screenshot.

**Files:**
- Create: `raw/comunidades/andalucia/boe.png`
- Create: `raw/comunidades/aragon/boe.png`
- Create: `raw/comunidades/asturias/boe.png`
- Create: `raw/comunidades/baleares/boe.png`
- Create: `raw/comunidades/canarias/boe.png`

- [ ] **Step 1: BOE screenshot — Andalucía**

Navigate to `https://www.boe.es/buscar/legislacion.php`.
Search for: `Andalucía tributos cedidos IRPF`.
Open the most relevant consolidated law (look for "Texto Refundido" or the most recent annual Presupuestos/acompañamiento law that modifies IRPF deductions).
Full-page screenshot → `raw/comunidades/andalucia/boe.png`.
Record exact URL of the document.

- [ ] **Step 2: BOE screenshot — Aragón**

Navigate to `https://www.boe.es/buscar/legislacion.php`.
Search for: `Aragón tributos cedidos IRPF`.
Open the most relevant consolidated law.
Full-page screenshot → `raw/comunidades/aragon/boe.png`.
Record exact URL.

- [ ] **Step 3: BOE screenshot — Asturias**

Navigate to `https://www.boe.es/buscar/legislacion.php`.
Search for: `Asturias tributos cedidos IRPF`.
Open the most relevant consolidated law.
Full-page screenshot → `raw/comunidades/asturias/boe.png`.
Record exact URL.

- [ ] **Step 4: BOE screenshot — Illes Balears**

Navigate to `https://www.boe.es/buscar/legislacion.php`.
Search for: `Illes Balears tributos cedidos IRPF`.
Open the most relevant consolidated law.
Full-page screenshot → `raw/comunidades/baleares/boe.png`.
Record exact URL.

- [ ] **Step 5: BOE screenshot — Canarias**

Navigate to `https://www.boe.es/buscar/legislacion.php`.
Search for: `Canarias tributos cedidos IRPF`.
Open the most relevant consolidated law.
Full-page screenshot → `raw/comunidades/canarias/boe.png`.
Record exact URL.

- [ ] **Step 6: Verify all 5 files**

```bash
ls -lh raw/comunidades/andalucia/boe.png \
  raw/comunidades/aragon/boe.png \
  raw/comunidades/asturias/boe.png \
  raw/comunidades/baleares/boe.png \
  raw/comunidades/canarias/boe.png
```

Expected: all 5 files exist, each > 100KB (BOE pages are long).

- [ ] **Step 7: Commit**

```bash
git add raw/comunidades/andalucia/boe.png \
  raw/comunidades/aragon/boe.png \
  raw/comunidades/asturias/boe.png \
  raw/comunidades/baleares/boe.png \
  raw/comunidades/canarias/boe.png
git commit -m "chore: BOE screenshots — Andalucia Aragon Asturias Baleares Canarias"
```

---

### Task 6: BOE screenshots — Cantabria, Castilla-La Mancha, Castilla y León, Cataluña, Extremadura

**Files:**
- Create: `raw/comunidades/cantabria/boe.png`
- Create: `raw/comunidades/castilla_la_mancha/boe.png`
- Create: `raw/comunidades/castilla_y_leon/boe.png`
- Create: `raw/comunidades/cataluna/boe.png`
- Create: `raw/comunidades/extremadura/boe.png`

- [ ] **Step 1: BOE screenshot — Cantabria**

Navigate to `https://www.boe.es/buscar/legislacion.php`.
Search for: `Cantabria tributos cedidos IRPF`.
Open the most relevant consolidated law.
Full-page screenshot → `raw/comunidades/cantabria/boe.png`.
Record exact URL.

- [ ] **Step 2: BOE screenshot — Castilla-La Mancha**

Navigate to `https://www.boe.es/buscar/legislacion.php`.
Search for: `Castilla-La Mancha tributos cedidos IRPF`.
Open the most relevant consolidated law.
Full-page screenshot → `raw/comunidades/castilla_la_mancha/boe.png`.
Record exact URL.

- [ ] **Step 3: BOE screenshot — Castilla y León**

Navigate to `https://www.boe.es/buscar/legislacion.php`.
Search for: `Castilla y León tributos cedidos IRPF`.
Open the most relevant consolidated law.
Full-page screenshot → `raw/comunidades/castilla_y_leon/boe.png`.
Record exact URL.

- [ ] **Step 4: BOE screenshot — Cataluña**

Navigate to `https://www.boe.es/buscar/legislacion.php`.
Search for: `Cataluña tributos cedidos IRPF`.
Open the most relevant consolidated law (note: Cataluña may publish in Catalan in the DOGC — use the BOE consolidated version).
Full-page screenshot → `raw/comunidades/cataluna/boe.png`.
Record exact URL.

- [ ] **Step 5: BOE screenshot — Extremadura**

Navigate to `https://www.boe.es/buscar/legislacion.php`.
Search for: `Extremadura tributos cedidos IRPF`.
Open the most relevant consolidated law.
Full-page screenshot → `raw/comunidades/extremadura/boe.png`.
Record exact URL.

- [ ] **Step 6: Verify all 5 files**

```bash
ls -lh raw/comunidades/cantabria/boe.png \
  raw/comunidades/castilla_la_mancha/boe.png \
  raw/comunidades/castilla_y_leon/boe.png \
  raw/comunidades/cataluna/boe.png \
  raw/comunidades/extremadura/boe.png
```

Expected: all 5 files exist, each > 100KB.

- [ ] **Step 7: Commit**

```bash
git add raw/comunidades/cantabria/boe.png \
  raw/comunidades/castilla_la_mancha/boe.png \
  raw/comunidades/castilla_y_leon/boe.png \
  raw/comunidades/cataluna/boe.png \
  raw/comunidades/extremadura/boe.png
git commit -m "chore: BOE screenshots — Cantabria CastillaLaMancha CastillaYLeon Cataluna Extremadura"
```

---

### Task 7: BOE screenshots — Galicia, La Rioja, Madrid, Murcia, Comunitat Valenciana, Navarra, País Vasco

**Files:**
- Create: `raw/comunidades/galicia/boe.png`
- Create: `raw/comunidades/la_rioja/boe.png`
- Create: `raw/comunidades/madrid/boe.png`
- Create: `raw/comunidades/murcia/boe.png`
- Create: `raw/comunidades/comunitat_valenciana/boe.png`
- Create: `raw/comunidades/navarra/boe.png`
- Create: `raw/comunidades/pais_vasco/boe.png`

- [ ] **Step 1: BOE screenshot — Galicia**

Navigate to `https://www.boe.es/buscar/legislacion.php`.
Search for: `Galicia tributos cedidos IRPF`.
Open the most relevant consolidated law.
Full-page screenshot → `raw/comunidades/galicia/boe.png`.
Record exact URL.

- [ ] **Step 2: BOE screenshot — La Rioja**

Navigate to `https://www.boe.es/buscar/legislacion.php`.
Search for: `La Rioja tributos cedidos IRPF`.
Open the most relevant consolidated law.
Full-page screenshot → `raw/comunidades/la_rioja/boe.png`.
Record exact URL.

- [ ] **Step 3: BOE screenshot — Comunidad de Madrid**

Navigate to `https://www.boe.es/buscar/legislacion.php`.
Search for: `Comunidad de Madrid tributos cedidos IRPF`.
Open the most relevant consolidated law.
Full-page screenshot → `raw/comunidades/madrid/boe.png`.
Record exact URL.

- [ ] **Step 4: BOE screenshot — Región de Murcia**

Navigate to `https://www.boe.es/buscar/legislacion.php`.
Search for: `Región de Murcia tributos cedidos IRPF`.
Open the most relevant consolidated law.
Full-page screenshot → `raw/comunidades/murcia/boe.png`.
Record exact URL.

- [ ] **Step 5: BOE screenshot — Comunitat Valenciana**

Navigate to `https://www.boe.es/buscar/legislacion.php`.
Search for: `Comunitat Valenciana tributos cedidos IRPF`.
Open the most relevant consolidated law.
Full-page screenshot → `raw/comunidades/comunitat_valenciana/boe.png`.
Record exact URL.

- [ ] **Step 6: BOE screenshot — Navarra (Foral)**

Navigate to `https://www.boe.es/buscar/legislacion.php`.
Search for: `Navarra Convenio Económico IRPF`.
Open the Convenio Económico between the State and Navarra (the key foral document governing IRPF).
Full-page screenshot → `raw/comunidades/navarra/boe.png`.
Record exact URL.

- [ ] **Step 7: BOE screenshot — País Vasco (Foral)**

Navigate to `https://www.boe.es/buscar/legislacion.php`.
Search for: `País Vasco Concierto Económico IRPF`.
Open the Concierto Económico (Law 12/2002 or latest amendment) covering IRPF.
Full-page screenshot → `raw/comunidades/pais_vasco/boe.png`.
Record exact URL.

- [ ] **Step 8: Verify all 7 files**

```bash
ls -lh raw/comunidades/galicia/boe.png \
  raw/comunidades/la_rioja/boe.png \
  raw/comunidades/madrid/boe.png \
  raw/comunidades/murcia/boe.png \
  raw/comunidades/comunitat_valenciana/boe.png \
  raw/comunidades/navarra/boe.png \
  raw/comunidades/pais_vasco/boe.png
```

Expected: all 7 files exist, each > 100KB.

- [ ] **Step 9: Commit**

```bash
git add raw/comunidades/galicia/boe.png \
  raw/comunidades/la_rioja/boe.png \
  raw/comunidades/madrid/boe.png \
  raw/comunidades/murcia/boe.png \
  raw/comunidades/comunitat_valenciana/boe.png \
  raw/comunidades/navarra/boe.png \
  raw/comunidades/pais_vasco/boe.png
git commit -m "chore: BOE screenshots — Galicia LaRioja Madrid Murcia Valencia Navarra PaisVasco"
```

---

### Task 8: Write manifest.json

At this point all 34 screenshots are captured. Write `raw/comunidades/manifest.json` using the exact URLs recorded during Tasks 2–7. Each entry must have the URL from the actual page visited.

**Files:**
- Create: `raw/comunidades/manifest.json`

- [ ] **Step 1: Write manifest.json with all 34 entries**

Use the Write tool to create `raw/comunidades/manifest.json`. Populate each entry's `url` field with the URL recorded during the corresponding screenshot step. The `file` field is relative to `raw/`.

The array must contain exactly 34 entries — one per (comunidad, source) pair. Template (replace `ACTUAL_URL_FROM_SCREENSHOT` with the real URL):

```json
[
  {"comunidad":"andalucia","display_name":"Andalucía","regime":"comun","source":"aeat","url":"ACTUAL_URL_FROM_SCREENSHOT","file":"comunidades/andalucia/aeat.png","description":"AEAT Fiscalidad Autonómica — Andalucía IRPF deducciones 2025","captured_at":"2026-04-12"},
  {"comunidad":"andalucia","display_name":"Andalucía","regime":"comun","source":"boe","url":"ACTUAL_URL_FROM_SCREENSHOT","file":"comunidades/andalucia/boe.png","description":"BOE Ley tributos cedidos — Andalucía IRPF 2025","captured_at":"2026-04-12"},
  {"comunidad":"aragon","display_name":"Aragón","regime":"comun","source":"aeat","url":"ACTUAL_URL_FROM_SCREENSHOT","file":"comunidades/aragon/aeat.png","description":"AEAT Fiscalidad Autonómica — Aragón IRPF deducciones 2025","captured_at":"2026-04-12"},
  {"comunidad":"aragon","display_name":"Aragón","regime":"comun","source":"boe","url":"ACTUAL_URL_FROM_SCREENSHOT","file":"comunidades/aragon/boe.png","description":"BOE Ley tributos cedidos — Aragón IRPF 2025","captured_at":"2026-04-12"},
  {"comunidad":"asturias","display_name":"Asturias (Principado de)","regime":"comun","source":"aeat","url":"ACTUAL_URL_FROM_SCREENSHOT","file":"comunidades/asturias/aeat.png","description":"AEAT Fiscalidad Autonómica — Asturias IRPF deducciones 2025","captured_at":"2026-04-12"},
  {"comunidad":"asturias","display_name":"Asturias (Principado de)","regime":"comun","source":"boe","url":"ACTUAL_URL_FROM_SCREENSHOT","file":"comunidades/asturias/boe.png","description":"BOE Ley tributos cedidos — Asturias IRPF 2025","captured_at":"2026-04-12"},
  {"comunidad":"baleares","display_name":"Illes Balears","regime":"comun","source":"aeat","url":"ACTUAL_URL_FROM_SCREENSHOT","file":"comunidades/baleares/aeat.png","description":"AEAT Fiscalidad Autonómica — Illes Balears IRPF deducciones 2025","captured_at":"2026-04-12"},
  {"comunidad":"baleares","display_name":"Illes Balears","regime":"comun","source":"boe","url":"ACTUAL_URL_FROM_SCREENSHOT","file":"comunidades/baleares/boe.png","description":"BOE Ley tributos cedidos — Illes Balears IRPF 2025","captured_at":"2026-04-12"},
  {"comunidad":"canarias","display_name":"Canarias","regime":"comun","source":"aeat","url":"ACTUAL_URL_FROM_SCREENSHOT","file":"comunidades/canarias/aeat.png","description":"AEAT Fiscalidad Autonómica — Canarias IRPF deducciones 2025","captured_at":"2026-04-12"},
  {"comunidad":"canarias","display_name":"Canarias","regime":"comun","source":"boe","url":"ACTUAL_URL_FROM_SCREENSHOT","file":"comunidades/canarias/boe.png","description":"BOE Ley tributos cedidos — Canarias IRPF 2025","captured_at":"2026-04-12"},
  {"comunidad":"cantabria","display_name":"Cantabria","regime":"comun","source":"aeat","url":"ACTUAL_URL_FROM_SCREENSHOT","file":"comunidades/cantabria/aeat.png","description":"AEAT Fiscalidad Autonómica — Cantabria IRPF deducciones 2025","captured_at":"2026-04-12"},
  {"comunidad":"cantabria","display_name":"Cantabria","regime":"comun","source":"boe","url":"ACTUAL_URL_FROM_SCREENSHOT","file":"comunidades/cantabria/boe.png","description":"BOE Ley tributos cedidos — Cantabria IRPF 2025","captured_at":"2026-04-12"},
  {"comunidad":"castilla_la_mancha","display_name":"Castilla-La Mancha","regime":"comun","source":"aeat","url":"ACTUAL_URL_FROM_SCREENSHOT","file":"comunidades/castilla_la_mancha/aeat.png","description":"AEAT Fiscalidad Autonómica — Castilla-La Mancha IRPF deducciones 2025","captured_at":"2026-04-12"},
  {"comunidad":"castilla_la_mancha","display_name":"Castilla-La Mancha","regime":"comun","source":"boe","url":"ACTUAL_URL_FROM_SCREENSHOT","file":"comunidades/castilla_la_mancha/boe.png","description":"BOE Ley tributos cedidos — Castilla-La Mancha IRPF 2025","captured_at":"2026-04-12"},
  {"comunidad":"castilla_y_leon","display_name":"Castilla y León","regime":"comun","source":"aeat","url":"ACTUAL_URL_FROM_SCREENSHOT","file":"comunidades/castilla_y_leon/aeat.png","description":"AEAT Fiscalidad Autonómica — Castilla y León IRPF deducciones 2025","captured_at":"2026-04-12"},
  {"comunidad":"castilla_y_leon","display_name":"Castilla y León","regime":"comun","source":"boe","url":"ACTUAL_URL_FROM_SCREENSHOT","file":"comunidades/castilla_y_leon/boe.png","description":"BOE Ley tributos cedidos — Castilla y León IRPF 2025","captured_at":"2026-04-12"},
  {"comunidad":"cataluna","display_name":"Cataluña","regime":"comun","source":"aeat","url":"ACTUAL_URL_FROM_SCREENSHOT","file":"comunidades/cataluna/aeat.png","description":"AEAT Fiscalidad Autonómica — Cataluña IRPF deducciones 2025","captured_at":"2026-04-12"},
  {"comunidad":"cataluna","display_name":"Cataluña","regime":"comun","source":"boe","url":"ACTUAL_URL_FROM_SCREENSHOT","file":"comunidades/cataluna/boe.png","description":"BOE Ley tributos cedidos — Cataluña IRPF 2025","captured_at":"2026-04-12"},
  {"comunidad":"extremadura","display_name":"Extremadura","regime":"comun","source":"aeat","url":"ACTUAL_URL_FROM_SCREENSHOT","file":"comunidades/extremadura/aeat.png","description":"AEAT Fiscalidad Autonómica — Extremadura IRPF deducciones 2025","captured_at":"2026-04-12"},
  {"comunidad":"extremadura","display_name":"Extremadura","regime":"comun","source":"boe","url":"ACTUAL_URL_FROM_SCREENSHOT","file":"comunidades/extremadura/boe.png","description":"BOE Ley tributos cedidos — Extremadura IRPF 2025","captured_at":"2026-04-12"},
  {"comunidad":"galicia","display_name":"Galicia","regime":"comun","source":"aeat","url":"ACTUAL_URL_FROM_SCREENSHOT","file":"comunidades/galicia/aeat.png","description":"AEAT Fiscalidad Autonómica — Galicia IRPF deducciones 2025","captured_at":"2026-04-12"},
  {"comunidad":"galicia","display_name":"Galicia","regime":"comun","source":"boe","url":"ACTUAL_URL_FROM_SCREENSHOT","file":"comunidades/galicia/boe.png","description":"BOE Ley tributos cedidos — Galicia IRPF 2025","captured_at":"2026-04-12"},
  {"comunidad":"la_rioja","display_name":"La Rioja","regime":"comun","source":"aeat","url":"ACTUAL_URL_FROM_SCREENSHOT","file":"comunidades/la_rioja/aeat.png","description":"AEAT Fiscalidad Autonómica — La Rioja IRPF deducciones 2025","captured_at":"2026-04-12"},
  {"comunidad":"la_rioja","display_name":"La Rioja","regime":"comun","source":"boe","url":"ACTUAL_URL_FROM_SCREENSHOT","file":"comunidades/la_rioja/boe.png","description":"BOE Ley tributos cedidos — La Rioja IRPF 2025","captured_at":"2026-04-12"},
  {"comunidad":"madrid","display_name":"Comunidad de Madrid","regime":"comun","source":"aeat","url":"ACTUAL_URL_FROM_SCREENSHOT","file":"comunidades/madrid/aeat.png","description":"AEAT Fiscalidad Autonómica — Comunidad de Madrid IRPF deducciones 2025","captured_at":"2026-04-12"},
  {"comunidad":"madrid","display_name":"Comunidad de Madrid","regime":"comun","source":"boe","url":"ACTUAL_URL_FROM_SCREENSHOT","file":"comunidades/madrid/boe.png","description":"BOE Ley tributos cedidos — Comunidad de Madrid IRPF 2025","captured_at":"2026-04-12"},
  {"comunidad":"murcia","display_name":"Región de Murcia","regime":"comun","source":"aeat","url":"ACTUAL_URL_FROM_SCREENSHOT","file":"comunidades/murcia/aeat.png","description":"AEAT Fiscalidad Autonómica — Región de Murcia IRPF deducciones 2025","captured_at":"2026-04-12"},
  {"comunidad":"murcia","display_name":"Región de Murcia","regime":"comun","source":"boe","url":"ACTUAL_URL_FROM_SCREENSHOT","file":"comunidades/murcia/boe.png","description":"BOE Ley tributos cedidos — Región de Murcia IRPF 2025","captured_at":"2026-04-12"},
  {"comunidad":"comunitat_valenciana","display_name":"Comunitat Valenciana","regime":"comun","source":"aeat","url":"ACTUAL_URL_FROM_SCREENSHOT","file":"comunidades/comunitat_valenciana/aeat.png","description":"AEAT Fiscalidad Autonómica — Comunitat Valenciana IRPF deducciones 2025","captured_at":"2026-04-12"},
  {"comunidad":"comunitat_valenciana","display_name":"Comunitat Valenciana","regime":"comun","source":"boe","url":"ACTUAL_URL_FROM_SCREENSHOT","file":"comunidades/comunitat_valenciana/boe.png","description":"BOE Ley tributos cedidos — Comunitat Valenciana IRPF 2025","captured_at":"2026-04-12"},
  {"comunidad":"navarra","display_name":"Navarra","regime":"foral","source":"aeat","url":"ACTUAL_URL_FROM_SCREENSHOT","file":"comunidades/navarra/aeat.png","description":"AEAT Fiscalidad Autonómica — Navarra Convenio Económico IRPF 2025","captured_at":"2026-04-12"},
  {"comunidad":"navarra","display_name":"Navarra","regime":"foral","source":"boe","url":"ACTUAL_URL_FROM_SCREENSHOT","file":"comunidades/navarra/boe.png","description":"BOE Convenio Económico — Navarra IRPF 2025","captured_at":"2026-04-12"},
  {"comunidad":"pais_vasco","display_name":"País Vasco","regime":"foral","source":"aeat","url":"ACTUAL_URL_FROM_SCREENSHOT","file":"comunidades/pais_vasco/aeat.png","description":"AEAT Fiscalidad Autonómica — País Vasco Concierto Económico IRPF 2025","captured_at":"2026-04-12"},
  {"comunidad":"pais_vasco","display_name":"País Vasco","regime":"foral","source":"boe","url":"ACTUAL_URL_FROM_SCREENSHOT","file":"comunidades/pais_vasco/boe.png","description":"BOE Concierto Económico — País Vasco IRPF 2025","captured_at":"2026-04-12"}
]
```

- [ ] **Step 2: Verify manifest entry count**

```bash
python3 -c "import json; data=json.load(open('raw/comunidades/manifest.json')); print(len(data), 'entries')"
```

Expected output: `34 entries`

- [ ] **Step 3: Verify all files referenced in manifest exist**

```bash
python3 -c "
import json, os
data = json.load(open('raw/comunidades/manifest.json'))
missing = [e['file'] for e in data if not os.path.exists(os.path.join('raw', e['file']))]
if missing:
    print('MISSING:', missing)
else:
    print('All 34 files present')
"
```

Expected output: `All 34 files present`

- [ ] **Step 4: Commit**

```bash
git add raw/comunidades/manifest.json
git commit -m "chore: add manifest.json for 34 comunidad screenshots"
```
