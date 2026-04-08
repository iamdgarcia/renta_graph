# UI Redesign — Light Theme & Expandable 3-Pane Layout

**Date:** 2026-04-08
**Status:** Approved

---

## 1. Goals

- Fix critical dark-mode breakage (black chat pane)
- Establish a proper design token system in `globals.css`
- Replace Arial with a distinctive editorial type pairing
- Implement expandable 3-pane layout: file tree | article viewer | chat
- Restyle all components to the new light theme
- Add empty states, typing indicator, and trust signals to the API key modal

---

## 2. Design Tokens (globals.css)

All colour and spacing tokens live in `:root` as CSS custom properties. Components consume tokens — no hardcoded hex values in JSX.

```css
/* Palette */
--color-bg:        #faf9f6;   /* warm cream page background */
--color-surface:   #ffffff;   /* cards, modals, bubbles */
--color-border:    #e8e4dc;   /* dividers, input borders */
--color-accent:    #1a4fa0;   /* AEAT institutional blue — CTAs, active states */
--color-accent-hover: #153d80;
--color-text:      #1c1917;   /* primary text */
--color-text-muted:#6b7280;   /* secondary / placeholder */
--color-danger:    #7f1d1d;   /* disclaimer background */
--color-danger-text:#fecaca;

/* Typography */
--font-display: 'DM Serif Display', Georgia, serif;
--font-body:    'DM Sans', system-ui, sans-serif;
--font-mono:    'JetBrains Mono', monospace;

/* Spacing scale */
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-6: 24px;
```

Google Fonts import in `layout.tsx` for DM Serif Display, DM Sans (weights 400/500/600), and JetBrains Mono.

**Dark mode is explicitly disabled for this iteration.** The `@media (prefers-color-scheme: dark)` override in `globals.css` is removed; the design is light-only.

---

## 3. Layout (`page.tsx` + `layout.tsx`)

### Shell (layout.tsx)

`layout.tsx` is server-only and contains only `DisclaimerBanner` and the `<body>` wrapper. Fonts are loaded via `next/font/google` (not raw `<link>` tags) and injected as CSS variables on `<html>`.

```
<html style="--font-display: ...; --font-body: ...; --font-mono: ...">
  <body class="h-screen flex flex-col overflow-hidden" style="background: var(--color-bg)">
    <DisclaimerBanner />       ← 32px sticky top
    <main class="flex-1 overflow-hidden">
      {children}               ← page.tsx renders TopNav + panes
    </main>
  </body>
</html>
```

### Three-Pane Shell (page.tsx)

`page.tsx` is a Client Component (`'use client'`). It renders `TopNav` and the three panes, owning all interactive state.

```
┌─────────────────────────────────────────────────────────┐
│ DisclaimerBanner (32px, sticky) — from layout.tsx       │
│ TopNav (48px) — rendered by page.tsx                    │
├──────────┬─────────────────────────┬────────────────────┤
│ FileTree │ ArticleViewer           │ ChatPanel          │
│ 200px    │ 0px → 420px (animated)  │ flex-1 (min 360px) │
│ fixed    │ opens when file clicked │ always visible     │
└──────────┴─────────────────────────┴────────────────────┘
```

`TopNav` receives props from `page.tsx`:
- `apiKey: string | null`
- `onRemoveKey: () => void`
- `onShowDemo: () => void`

It contains:

- Left: "RentaGraph" wordmark in `font-display`
- Centre: empty (grows)
- Right: `[Ver demo]` button · API key status indicator (green dot + "Clave activa" or grey "Sin clave") · `[Eliminar clave]` link (only when key exists)

State in `page.tsx`:
- `apiKey: string | null`
- `activeFile: string | null` — when set, ArticleViewer expands
- `articleContent: string | null`
- `articleLoading: boolean`
- `showDemo: boolean`

When `activeFile` is set, the ArticleViewer column animates from `width: 0` to `width: 420px` using a CSS transition (`transition: width 200ms ease`). When cleared (close button), it collapses back to 0.

**Demo modal / API key modal interaction:**

- `ApiKeyModal` renders when `!apiKey && !showDemo`
- `DemoModal` renders when `showDemo === true`
- When DemoModal closes, `showDemo` goes back to `false` — if `apiKey` is still null, ApiKeyModal reappears automatically

`WikiExplorer` is split into two components:
- `FileTree` — just the 200px list (no internal split)
- `ArticleViewer` — the content pane, controlled by parent via props

The `WikiExplorerHandle` imperative ref is replaced by lifting state to `page.tsx`: `FileTree` calls `onFileSelect(filename)` → parent fetches content → passes to `ArticleViewer`.

---

## 4. DisclaimerBanner

- Height: 32px, single line
- Background: `var(--color-danger)` (`#7f1d1d`), text: `var(--color-danger-text)` (`#fecaca`)
- Text: "⚠ Base de conocimiento experimental. No es asesoría fiscal ni jurídica."
- Right side: `[×]` dismiss button — stores `dismissed=true` in `sessionStorage`; banner hides for the session. On next session it reappears.
- No emoji 🚨 — replaced with a plain `⚠` unicode character for professionalism

---

## 5. FileTree Component

Props: `files: string[]`, `activeFile: string | null`, `onFileSelect: (f: string) => void`

- 200px fixed width, full height, `overflow-y: auto`
- Section header: "Wiki Fiscal" in `font-display`, 13px, `color-text-muted`
- Each file: `<button>` — 36px tall, full width, left-aligned, 12px horizontal padding
  - Default: `color-text`, hover `background: #f0ede6`
  - Active: left border 2px `color-accent`, background `#eef2fb`, text `color-accent`, font-weight 500
- Border-right: 1px `color-border`
- File names strip the `.md` extension for display

---

## 6. ArticleViewer Component

Props: `file: string | null`, `content: string | null`, `loading: boolean`, `onClose: () => void`

- Controlled width: when `file` is null, `width: 0; overflow: hidden`. When set, `width: 420px`.
- CSS transition on width: `200ms ease`
- Inner container: full height, `overflow-y: auto`, padding 24px
- Header row (when open): filename (without `.md`) in `font-display` 18px + `[×]` close button top-right
- Border-right: 1px `color-border`
- Content rendered with `ReactMarkdown` + `@tailwindcss/typography` (`prose prose-sm`)
- Loading state: skeleton placeholder (3 lines of animated grey bars, CSS animation)
- No state: pane is width-0, nothing rendered

---

## 7. ChatPanel

Props: `apiKey: string | null`, `onCitationClick: (filename: string) => void`

### Empty state (no messages yet)
When `messages.length === 0`:
- Centred vertically in the pane
- "Agente IRPF" heading in `font-display` 24px
- Subtitle: "Pregunta sobre tu declaración de la renta" in `color-text-muted`
- 3 clickable example chips:
  - "¿Qué deducciones puedo aplicar por alquiler?"
  - "¿Cómo tributan las criptomonedas?"
  - "¿Cuál es el mínimo personal y familiar?"
  - Clicking a chip prefills and submits the message

### Message bubbles
- User: right-aligned, `background: var(--color-accent)`, white text, border-radius `18px 18px 4px 18px`
- Assistant: left-aligned, `background: var(--color-surface)`, border `1px var(--color-border)`, shadow `0 1px 3px rgba(0,0,0,0.06)`, border-radius `18px 18px 18px 4px`
- Max-width: 78%
- Font: `font-body` 14px, line-height 1.6

### Citation chips
`[[Article Name]]` parsed inline into:
```html
<button class="citation-chip">Article Name</button>
```
Style: `background: #eef2fb`, `color: var(--color-accent)`, `font-family: var(--font-mono)`, 12px, border-radius 4px, padding `2px 6px`, cursor pointer, hover `background: #dce6f7`

### Typing indicator
Three animated dots (`●●●`), staggered CSS animation (`animation-delay`), color `color-text-muted`. Replaces the text "Pensando..."

### Input bar
- Full width, border-top `1px var(--color-border)`, padding 12px 16px
- Input: full width minus button, border `1px var(--color-border)`, border-radius 10px, 44px height, `font-body` 14px, focus ring `2px var(--color-accent)`
- Send button: `background: var(--color-accent)`, white, 44px tall, border-radius 10px, "Enviar", disabled when empty or loading
- No-key state: a muted centered message "Introduce tu API key para chatear" — the input and button are hidden entirely (not just disabled)

---

## 8. ApiKeyModal

### Layout
- Modal: max-width 440px, border-radius 16px, padding 32px
- No close button (intentional — user must enter a key or use demo mode)

### Content top-to-bottom
1. Lock icon (SVG, 32px, `color-accent`)
2. "Conecta tu API Key" heading in `font-display` 22px
3. "Tu clave se guarda solo en tu navegador. Nunca llega a nuestros servidores." — 13px `color-text-muted`
4. Provider selector — two pill buttons: `[OpenAI]` `[Anthropic]`
   - Selected: `background: var(--color-accent)`, white text
   - Unselected: `border: 1px var(--color-border)`, `color-text`
   - Selecting a provider updates the input placeholder: `sk-...` (OpenAI) or `sk-ant-...` (Anthropic)
5. Password input, 44px, full width
6. "Guardar clave" CTA button, full width, `color-accent`
7. Divider: `──── o ────`
8. "Ver demo sin clave →" link — opens DemoModal, closes ApiKeyModal

---

## 9. DemoModal

Functionally unchanged. Style updates only:
- Modal: max-width `960px`, border-radius 16px, `background: var(--color-bg)`
- Left sidebar: `background: var(--color-surface)`, border-right `1px var(--color-border)`
- Active transcript: same active style as FileTree (left border + accent background)
- Message bubbles: same style as ChatPanel
- Citation chips: same style as ChatPanel

---

## 10. Files Changed

| File | Change |
|---|---|
| `app/globals.css` | Design tokens, font imports, dark mode removed, base reset |
| `app/layout.tsx` | Google Fonts `<link>`, body class, TopNav extracted |
| `app/page.tsx` | 3-pane shell, lift state from WikiExplorer |
| `app/components/DisclaimerBanner.tsx` | Muted style, dismiss button |
| `app/components/FileTree.tsx` | New component (split from WikiExplorer) |
| `app/components/ArticleViewer.tsx` | New component (split from WikiExplorer) |
| `app/components/WikiExplorer.tsx` | Deleted (replaced by FileTree + ArticleViewer) |
| `app/components/TopNav.tsx` | New component |
| `app/components/ChatPanel.tsx` | Full restyle, empty state, typing indicator |
| `app/components/ApiKeyModal.tsx` | Provider selector, trust copy, demo link |
| `app/components/DemoModal.tsx` | Style-only updates |

---

## 11. Out of Scope

- Mobile responsive layout (future iteration)
- Dark mode (future iteration)
- RAG / vector search (Phase 3)
- Animation library (Motion) — CSS transitions only for this pass
