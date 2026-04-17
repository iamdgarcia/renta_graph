# Portfolio Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Polish RentaGraph for portfolio presentation: replace the demo transcripts with 6 curated scenarios, enhance the root README, and add an author credit popover to the TopNav.

**Architecture:** Three independent deliverables — JSON content (`app/data/demo-transcripts.json`), Markdown (`README.md` at repo root), and a React component change (`app/components/TopNav.tsx`). No new dependencies. No shared state between tasks.

**Tech Stack:** Next.js App Router, React useState/useRef/useEffect, Tailwind v4, existing CSS design tokens (`var(--color-*)`), Markdown.

---

## File Map

| Action | File | What changes |
|--------|------|-------------|
| Modify | `app/data/demo-transcripts.json` | Replace 3 placeholder entries with 6 curated scenarios |
| Modify | `README.md` | Add badges, Live Demo link, Extend guide, Tech Stack table, Author section |
| Modify | `app/components/TopNav.tsx` | Add `'use client'`, about-popover state + UI |

---

## Task 1: Demo Transcripts

**Files:**
- Modify: `app/data/demo-transcripts.json`

The `DemoModal` component (`app/components/DemoModal.tsx:5`) imports this file as `@/data/demo-transcripts.json`. It expects an array of `{ id, title, messages: [{ role, content }] }`. Assistant messages may contain `[[ArticleName]]` syntax — `parseContent()` at line 12 renders these as citation chips.

All `[[ArticleName]]` references must match real filenames (without `.md`) in `app/content/wiki/`. The verified real filenames used below are:
- `Obligación de presentar declaración del IRPF`
- `Rendimientos_del_Trabajo_y_Obligación_de_Declarar`
- `Contribuyentes por el IRPF`
- `Base máxima de inversión deducible en vivienda habitual`
- `Deducciones por obras de mejora en la vivienda habitual`
- `Cuotas del Régimen Especial de Trabajadores Autónomos (RETA)`
- `Amortizaciones fiscalmente deducibles`
- `Actividades_Económicas_y_Estimación`
- `Unidad familiar en el IRPF`
- `Prestaciones de trabajo entre miembros de la misma unidad familiar`
- `Ganancias_Patrimoniales_y_Base_del_Ahorro`
- `Determinación del importe de las ganancias o pérdidas patrimoniales`
- `Acciones admitidas a negociación en mercados secundarios oficiales`
- `integración y compensación de rentas en la base imponible del ahorro`
- `Deducción por gastos educativos en la Comunidad de Madrid`
- `Deducción Alquiler Madrid`
- `Participación de las Comunidades Autónomas en la gestión del IRPF`

- [ ] **Step 1: Replace `app/data/demo-transcripts.json` with this exact content**

```json
[
  {
    "id": "primera-declaracion",
    "title": "¿Tengo que declarar?",
    "messages": [
      {
        "role": "user",
        "content": "Soy asalariado con un solo pagador y gané 19.500 € brutos en 2024. ¿Estoy obligado a hacer la declaración?"
      },
      {
        "role": "assistant",
        "content": "Con un solo pagador y 19.500 € brutos, estás por debajo del umbral general de 22.000 € que establece [[Obligación de presentar declaración del IRPF]]. En principio no estarías obligado a declarar.\n\nSin embargo, según [[Rendimientos_del_Trabajo_y_Obligación_de_Declarar]], ese límite se reduce a 15.000 € si tuvieras más de un pagador y el segundo te hubiera abonado más de 1.500 € en el año. Con un único pagador, el límite de 22.000 € se aplica íntegramente.\n\nDicho esto, aunque no estés obligado, puede interesarte declarar si te retuvieron de más, ya que obtendrías una devolución. Consulta tu borrador en la app de la AEAT."
      },
      {
        "role": "user",
        "content": "¿Y si también cobré 200 € de intereses del banco?"
      },
      {
        "role": "assistant",
        "content": "Los 200 € de intereses son rendimientos del capital mobiliario. Según [[Contribuyentes por el IRPF]], estos rendimientos generan obligación de declarar solo cuando superan los 1.600 € anuales en conjunto.\n\nCon 200 €, estás muy por debajo de ese umbral. Tu situación no cambia: no estás obligado a declarar por tener un único pagador laboral con 19.500 € brutos."
      }
    ]
  },
  {
    "id": "deduccion-vivienda",
    "title": "Deducción por vivienda habitual",
    "messages": [
      {
        "role": "user",
        "content": "Compré mi vivienda habitual con hipoteca en 2011 y sigo pagando cuotas. ¿Puedo deducirme algo en la renta?"
      },
      {
        "role": "assistant",
        "content": "Sí, puedes seguir aplicando la deducción por adquisición de vivienda habitual del régimen transitorio. Según [[Base máxima de inversión deducible en vivienda habitual]], la base máxima de deducción es de **9.040 €/año**, con un porcentaje general del **15%** (7,5% tramo estatal + 7,5% tramo autonómico).\n\nComo compraste antes del 1 de enero de 2013, mantienes el derecho adquirido mientras continúes pagando la hipoteca y la vivienda siga siendo tu residencia habitual. La deducción máxima anual posible es 9.040 × 15% = **1.356 €**.\n\nConsulta también [[Deducciones por obras de mejora en la vivienda habitual]]: si has hecho reformas de eficiencia energética, existen deducciones adicionales independientes del régimen transitorio."
      },
      {
        "role": "user",
        "content": "¿Y si refinancié la hipoteca en 2015 para bajar el tipo de interés?"
      },
      {
        "role": "assistant",
        "content": "Una novación que solo cambia las condiciones financieras (tipo de interés, plazo) sin ampliar el capital pendiente no interrumpe el derecho al régimen transitorio. Lo que importa, según [[Base máxima de inversión deducible en vivienda habitual]], es que el préstamo original financiara la adquisición antes del 1 de enero de 2013.\n\nSi el saldo refinanciado no superó el capital pendiente en el momento de la novación, conservas el derecho. Si tienes dudas, revisa la escritura de novación o consulta el criterio vinculante de la AEAT."
      }
    ]
  },
  {
    "id": "autonomo-gastos",
    "title": "Autónomo: gastos deducibles",
    "messages": [
      {
        "role": "user",
        "content": "Soy autónomo en estimación directa simplificada. ¿Qué gastos puedo deducirme?"
      },
      {
        "role": "assistant",
        "content": "En estimación directa puedes deducir todos los gastos necesarios para la actividad, correctamente justificados con factura. Los principales son:\n\n1. **Cuotas a la Seguridad Social**: deducibles al 100% según [[Cuotas del Régimen Especial de Trabajadores Autónomos (RETA)]]. En 2024 la cuota varía entre 225 € y 530 €/mes según tus ingresos reales.\n\n2. **Amortizaciones** de equipos e inmovilizado, con los coeficientes máximos de [[Amortizaciones fiscalmente deducibles]]. Los equipos informáticos tienen un máximo del 25% anual.\n\n3. **Suministros del local** (luz, internet): 100% si tienes local afecto; si trabajas desde casa, el 30% de la parte proporcional al espacio de trabajo.\n\n4. **Otros gastos**: material de oficina, publicidad, formación, seguros relacionados con la actividad.\n\nEn la modalidad simplificada, según [[Actividades_Económicas_y_Estimación]], hay además una deducción del 5% del rendimiento neto en concepto de gastos de difícil justificación (en lugar del 10% de la modalidad normal)."
      },
      {
        "role": "user",
        "content": "¿Cómo amortizo un portátil de 1.200 € que compré para el trabajo?"
      },
      {
        "role": "assistant",
        "content": "Para equipos informáticos, [[Amortizaciones fiscalmente deducibles]] fija un coeficiente máximo del **25% anual** (período mínimo de amortización: 4 años).\n\nPara tu portátil de 1.200 €:\n- Cuota anual máxima: 1.200 × 25% = **300 €/año**\n- En 4 años habrás amortizado el total.\n\nPuedes aplicar un porcentaje menor si lo prefieres, siempre dentro del período máximo de 10 años. También existe libertad de amortización para elementos de escaso valor (precio unitario < 300 €, con límite de 25.000 €/año), pero tu portátil supera ese umbral, así que se aplica la tabla ordinaria."
      }
    ]
  },
  {
    "id": "conjunta-vs-individual",
    "title": "¿Conjunta o individual?",
    "messages": [
      {
        "role": "user",
        "content": "Estoy casado, yo gano 40.000 € y mi mujer trabaja a tiempo parcial y gana 8.000 €. ¿Nos conviene declarar conjunta o individual?"
      },
      {
        "role": "assistant",
        "content": "La respuesta depende del cálculo concreto, pero en vuestro caso la conjunta suele ser más ventajosa.\n\nSegún [[Unidad familiar en el IRPF]], la tributación conjunta aplica una **reducción especial de 3.400 €** sobre la base imponible (además del mínimo personal de cada miembro). Esta reducción compensa parcialmente el efecto de acumular ambas rentas en la tarifa progresiva.\n\nEn vuestro caso aproximado:\n- **Individual**: tú tributas sobre ~34.500 € netos (tras gastos deducibles); tu mujer sobre ~2.500 € con cuota prácticamente cero.\n- **Conjunta**: tributáis juntos sobre ~36.500 €, con la reducción de 3.400 € → base de ~33.100 €.\n\nCon la tarifa estatal + autonómica, la conjunta suele ahorrar entre 500 y 800 € cuando la diferencia de rentas es tan grande. El simulador de la AEAT te dará el cálculo exacto antes de presentar."
      },
      {
        "role": "user",
        "content": "¿Podemos elegir conjunta este año e individual el siguiente?"
      },
      {
        "role": "assistant",
        "content": "Sí. Según [[Unidad familiar en el IRPF]], la opción de tributación conjunta o individual se ejerce **cada año de forma independiente**. Es irrevocable dentro de un mismo ejercicio (una vez presentada la declaración), pero no vincula los ejercicios futuros.\n\nPuedes cambiar cada año según vuestras circunstancias: cambios de ingresos, nacimiento de hijos, deducciones aplicables. No hay ninguna obligación de mantener la misma modalidad varios años consecutivos.\n\nNota: si uno de los dos presentara la declaración individual, el otro debe hacerlo también en individual ese mismo año; no es posible que uno tribute conjunta y el otro individual con el mismo cónyuge."
      }
    ]
  },
  {
    "id": "ganancias-bolsa",
    "title": "Ganancias en Bolsa e inversiones",
    "messages": [
      {
        "role": "user",
        "content": "Vendí acciones de Inditex en 2024 con una ganancia de 4.000 €, pero también tuve una pérdida de 1.500 € con otras acciones. ¿Cómo tributa esto?"
      },
      {
        "role": "assistant",
        "content": "Las ganancias y pérdidas por venta de acciones van a la **base del ahorro** y se compensan entre sí dentro del mismo ejercicio. Según [[integración y compensación de rentas en la base imponible del ahorro]], primero se compensan las pérdidas con las ganancias del mismo tipo.\n\nEn tu caso:\n- Ganancia: +4.000 €\n- Pérdida: –1.500 €\n- **Base imponible neta: 2.500 €**\n\nEste resultado tributa con la escala del ahorro definida en [[Ganancias_Patrimoniales_y_Base_del_Ahorro]]: los primeros 6.000 € al **19%**, lo que supone una cuota de **475 €**.\n\nEl cálculo de cada ganancia o pérdida individual se hace según [[Determinación del importe de las ganancias o pérdidas patrimoniales]]: precio de venta menos precio de adquisición, más/menos los gastos de compraventa (comisiones del bróker son deducibles)."
      },
      {
        "role": "user",
        "content": "¿Y si me quedan pérdidas de años anteriores sin compensar?"
      },
      {
        "role": "assistant",
        "content": "Las pérdidas patrimoniales no compensadas en un ejercicio pueden arrastrarse durante los **4 ejercicios siguientes**, según [[integración y compensación de rentas en la base imponible del ahorro]].\n\nPrimero se compensan con las ganancias patrimoniales del mismo ejercicio; si hay exceso de pérdidas, ese remanente se aplica a los rendimientos del capital mobiliario de la base del ahorro (dividendos, intereses) con un límite del 25% de esos rendimientos. Lo que quede se puede compensar en los 4 ejercicios siguientes.\n\nRevisa las casillas de tu declaración de años anteriores para ver si tienes saldos negativos pendientes y aplícalos antes de calcular tu cuota."
      }
    ]
  },
  {
    "id": "deducciones-madrid",
    "title": "Deducciones autonómicas en Madrid",
    "messages": [
      {
        "role": "user",
        "content": "Vivo en Madrid con dos hijos de 5 y 8 años. ¿Qué deducciones autonómicas puedo aplicar además de las estatales?"
      },
      {
        "role": "assistant",
        "content": "La Comunidad de Madrid tiene varias deducciones específicas para familias con hijos. Las más relevantes para tu perfil:\n\n1. **Gastos educativos** ([[Deducción por gastos educativos en la Comunidad de Madrid]]): 15% en escolaridad (0-3 años), 10% en enseñanza de idiomas extranjeros, 5% en informática. Límite por hijo: hasta 400 € en enseñanza ordinaria.\n\n2. **Nacimiento o adopción de hijos**: 600 € por el primer hijo, 750 € por el segundo. Si no la aplicaste en el año del nacimiento, ya no es recuperable.\n\n3. **Alquiler de vivienda habitual** ([[Deducción Alquiler Madrid]]): 30% de lo pagado, hasta 1.000 €/año, si tu base imponible no supera 25.620 €.\n\nSegún [[Participación de las Comunidades Autónomas en la gestión del IRPF]], el tramo autonómico (50% del impuesto) es el que financia estas deducciones propias. Madrid es una de las comunidades más generosas en desgravaciones familiares."
      },
      {
        "role": "user",
        "content": "¿Qué documentación necesito para las deducciones de gastos educativos?"
      },
      {
        "role": "assistant",
        "content": "Para aplicar [[Deducción por gastos educativos en la Comunidad de Madrid]] necesitas conservar:\n\n- **Facturas o recibos** del centro educativo o academia con: nombre del alumno o pagador, importe, concepto (escolaridad, idiomas, informática) y fecha.\n- Si el pago fue por domiciliación bancaria, el extracto complementa la factura pero no la sustituye.\n\nLa AEAT puede reclamarte estos justificantes en una comprobación posterior. El plazo de prescripción es de **4 años** desde la fecha de presentación de la declaración, así que guárdalos al menos ese tiempo.\n\nEn el modelo 100, estas deducciones se declaran en el apartado de deducciones autonómicas de la Comunidad de Madrid."
      }
    ]
  }
]
```

- [ ] **Step 2: Verify the build passes**

```bash
cd /home/developer/proyectos/renta_graph/app
npm run build
```

Expected: build completes without errors. The JSON import in `DemoModal.tsx` will fail at build time if the JSON is malformed.

- [ ] **Step 3: Commit**

```bash
cd /home/developer/proyectos/renta_graph
git add app/data/demo-transcripts.json
git commit -m "feat: replace demo transcripts with 6 curated QA scenarios"
```

---

## Task 2: Root README Enhancements

**Files:**
- Modify: `README.md` (repo root — already exists with good base content)

The existing README has: title, architecture diagram, Quick Start, Repository Structure, How the Agent Works, Deploying to Vercel. Add badges, a Live Demo section, an "Extend with Your Own Data" section, a Tech Stack table, and an Author section.

- [ ] **Step 1: Add badges after the opening tagline**

Open `README.md`. After line 3 (the tagline paragraph ending with `...concept.`), add:

```markdown

[![Next.js](https://img.shields.io/badge/Next.js-App_Router-black?logo=next.js&logoColor=white)](https://nextjs.org)
[![Vercel AI SDK](https://img.shields.io/badge/AI_SDK-v6-5c2d91?logo=vercel&logoColor=white)](https://sdk.vercel.ai)
[![Python](https://img.shields.io/badge/Python-3.11+-3776ab?logo=python&logoColor=white)](https://python.org)
[![BYOK](https://img.shields.io/badge/BYOK-no_server_costs-22c55e)](https://github.com)
```

- [ ] **Step 2: Add a Live Demo section after the disclaimer blockquote**

After the `> **Disclaimer:** ...` blockquote and before `---`, add:

```markdown

**[→ Live Demo](https://renta-graph.vercel.app)** — No API key needed for demo mode. Bring your own OpenAI or Anthropic key to ask your own questions.
```

> Note: replace `https://renta-graph.vercel.app` with the actual Vercel deployment URL if it differs.

- [ ] **Step 3: Add "Extend with Your Own Data" section after "How the Agent Works"**

After the `## How the Agent Works` section (after its closing paragraph, before `---`), add:

```markdown

---

## Extend with Your Own Data

RentaGraph is domain-agnostic. Any PDF-heavy knowledge domain (legal codes, technical manuals, medical guidelines) can be compiled into a BYOK wiki following the same pattern.

**1. Drop your source documents into `raw/`**

The scraper downloads AEAT PDFs and BOE HTML pages. For your own domain, either run a custom scraper or place documents manually:

```bash
mkdir -p raw/my-domain
cp my-docs/*.pdf raw/my-domain/
```

**2. Configure the compiler**

Edit `compiler/config.py` (or the relevant section of `compiler/main.py`):

```python
DOMAIN_DESCRIPTION = "Your domain in plain language — what the wiki covers"
DEFAULT_TAGS = ["your-tag", "domain-tag"]
SOURCE_URL_PREFIX = "https://your-source-domain.com"
```

**3. Run the compiler**

```bash
export OPENAI_API_KEY=sk-...   # or ANTHROPIC_API_KEY / GOOGLE_API_KEY
python pipeline.py compile
# or to overwrite existing articles:
python pipeline.py compile --force
```

The compiler calls the LLM to decompose raw documents into one Markdown file per concept.

**4. Article schema (required)**

Every `.md` file in `app/content/wiki/` must follow this schema or citations and the file tree will break:

```markdown
---
title: "Concept Name"
tags: ["tag1", "tag2"]
source_url: "https://original-source.com/page"
---

Article body with [[WikiLink]] cross-references to other articles.
```

**5. Rebuild the app**

```bash
cd app && npm run build
```

The wiki is read from disk at build time — no database, no re-deployment pipeline beyond a standard Next.js build.
```

- [ ] **Step 4: Add a Tech Stack section before "Deploying to Vercel"**

Before the `## Deploying to Vercel` heading, add:

```markdown
---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Scraper | Python 3.11, `requests`, `BeautifulSoup4` |
| Compiler | `MarkItDown` (PDF parsing), `Instructor`, GPT-4o / Gemini 1.5 Pro |
| Web app | Next.js (App Router), Vercel AI SDK v6, Tailwind CSS v4, Radix UI |
| Retrieval | Custom BFS/DFS graph traversal on `graph.json` + wiki full-text lookup |
| Hosting | Vercel — zero server-side LLM costs (BYOK) |

```

- [ ] **Step 5: Add Author section at the end of the file**

Append to the end of `README.md`:

```markdown

---

## Author

Built by [Daniel García Peña](https://iamdgarcia.substack.com/subscribe) — AI engineer & writer.

If RentaGraph sparked an idea or you want to follow along as this project evolves, consider subscribing to the newsletter.
```

- [ ] **Step 6: Commit**

```bash
cd /home/developer/proyectos/renta_graph
git add README.md
git commit -m "docs: enhance root README — badges, live demo, extend guide, tech stack, author"
```

---

## Task 3: TopNav About Popover

**Files:**
- Modify: `app/components/TopNav.tsx`

The current file (65 lines) exports `TopNav` as a pure presentational component with no `'use client'` directive and no React hooks. We add an about-popover triggered by a "Built by Daniel García" button on the right side of the nav, between "Ver consultas demo" and the API key status.

No new npm packages. Uses React `useState`, `useRef`, `useEffect`. Uses existing CSS design tokens.

- [ ] **Step 1: Replace `app/components/TopNav.tsx` with this complete file**

```tsx
'use client'

import { useState, useEffect, useRef } from 'react'

type TopNavProps = {
  apiKey: string | null
  onRemoveKey: () => void
  onShowDemo: () => void
}

export function TopNav({ apiKey, onRemoveKey, onShowDemo }: TopNavProps) {
  const [isAboutOpen, setIsAboutOpen] = useState(false)
  const aboutRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isAboutOpen) return
    function handleClickOutside(e: MouseEvent) {
      if (aboutRef.current && !aboutRef.current.contains(e.target as Node)) {
        setIsAboutOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isAboutOpen])

  return (
    <div
      className="flex shrink-0 items-center justify-between px-5"
      style={{
        height: '48px',
        borderBottom: '1px solid var(--color-border)',
        backgroundColor: 'var(--color-surface)',
      }}
    >
      <span
        className="text-lg tracking-tight"
        style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text)' }}
      >
        RentaGraph
      </span>

      <div className="flex items-center gap-5">
        <button
          type="button"
          onClick={onShowDemo}
          className="text-sm transition-opacity hover:opacity-70"
          style={{ color: 'var(--color-accent)' }}
        >
          Ver consultas demo
        </button>

        <div ref={aboutRef} className="relative">
          <button
            type="button"
            onClick={() => setIsAboutOpen((o) => !o)}
            className="text-xs transition-opacity hover:opacity-70"
            style={{ color: 'var(--color-muted)' }}
          >
            Built by Daniel García
          </button>
          {isAboutOpen && (
            <div
              className="absolute right-0 top-8 z-50 w-56 p-4"
              style={{
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: '12px',
                boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
              }}
            >
              <p
                className="text-sm font-medium"
                style={{ color: 'var(--color-text)' }}
              >
                Daniel García Peña
              </p>
              <p
                className="mt-0.5 text-xs"
                style={{ color: 'var(--color-muted)' }}
              >
                AI engineer & writer
              </p>
              <a
                href="https://iamdgarcia.substack.com/subscribe"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 flex items-center justify-center rounded-lg px-3 py-1.5 text-xs font-medium transition-opacity hover:opacity-80"
                style={{
                  backgroundColor: 'var(--color-accent)',
                  color: '#ffffff',
                }}
              >
                Subscribe on Substack →
              </a>
            </div>
          )}
        </div>

        {apiKey ? (
          <div className="flex items-center gap-2">
            <span
              className="flex items-center gap-1.5 text-xs"
              style={{ color: 'var(--color-muted)' }}
            >
              <span className="inline-block h-2 w-2 rounded-full bg-green-500" />
              Clave activa
            </span>
            <button
              type="button"
              onClick={onRemoveKey}
              className="text-xs transition-opacity hover:opacity-70"
              style={{ color: 'var(--color-muted)' }}
            >
              Eliminar
            </button>
          </div>
        ) : (
          <span
            className="flex items-center gap-1.5 text-xs"
            style={{ color: 'var(--color-muted)' }}
          >
            <span className="inline-block h-2 w-2 rounded-full bg-gray-300" />
            Sin clave
          </span>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Run lint and build to verify no errors**

```bash
cd /home/developer/proyectos/renta_graph/app
npm run lint && npm run build
```

Expected: lint passes with no errors; build completes successfully. TypeScript will validate the `useRef<HTMLDivElement>` type and the event listener pattern.

- [ ] **Step 3: Start dev server and manually verify the popover**

```bash
cd /home/developer/proyectos/renta_graph/app
npm run dev
```

Open `http://localhost:3000` and verify:
1. "Built by Daniel García" text appears in the nav bar (right side, muted color)
2. Clicking it opens the popover with name, descriptor, and Substack CTA button
3. Clicking anywhere outside the popover closes it
4. Clicking the Substack button opens `https://iamdgarcia.substack.com/subscribe` in a new tab
5. The DemoModal still opens correctly from "Ver consultas demo"
6. All 6 demo transcript scenarios render with citation chips

- [ ] **Step 4: Commit**

```bash
cd /home/developer/proyectos/renta_graph
git add app/components/TopNav.tsx
git commit -m "feat: add author About popover to TopNav"
```
