# UI Redesign — Light Theme Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the RentaGraph web app with a light editorial theme, proper design tokens, and an expandable 3-pane layout (file tree | article viewer | chat).

**Architecture:** All design tokens live in `globals.css` as CSS custom properties consumed by all components — no hardcoded hex values in JSX. The `WikiExplorer` monolith is split into `FileTree` + `ArticleViewer` controlled by `page.tsx`. The article viewer animates open/closed with a CSS width transition.

**Tech Stack:** Next.js 16 App Router, Tailwind v4 (`@theme` in CSS), `next/font/google`, Radix UI Dialog, React Markdown, `@tailwindcss/typography`.

**Verification:** No test framework is configured. Each task verifies with `npm run lint && npm run build` from `app/`. Both must pass before committing.

---

## File Map

| Action | Path | Responsibility |
|---|---|---|
| Modify | `app/app/globals.css` | Design tokens, font vars, base reset, dark-mode removal |
| Modify | `app/app/layout.tsx` | Load Google Fonts via `next/font`, apply variables to `<html>` |
| Modify | `app/app/page.tsx` | 3-pane shell, all interactive state, wire all components |
| Modify | `app/components/DisclaimerBanner.tsx` | Muted style + session dismiss |
| Create | `app/components/TopNav.tsx` | Logo + demo button + API key status |
| Create | `app/components/FileTree.tsx` | 200px file list (split from WikiExplorer) |
| Create | `app/components/ArticleViewer.tsx` | Animated width pane (split from WikiExplorer) |
| Delete | `app/components/WikiExplorer.tsx` | Replaced by FileTree + ArticleViewer |
| Modify | `app/components/ChatPanel.tsx` | Empty state, bubble styles, citation chips, typing dots |
| Modify | `app/components/ApiKeyModal.tsx` | Provider selector, trust copy, demo link |
| Modify | `app/components/DemoModal.tsx` | Style-only: token-based colors, matching bubble styles |

---

## Task 1: Design tokens + font loading

**Files:**

- Modify: `app/app/globals.css`
- Modify: `app/app/layout.tsx`

- [ ] **Step 1: Replace globals.css**

Replace the entire file with:

```css
@import "tailwindcss";
@plugin "@tailwindcss/typography";

@theme inline {
  --color-bg:           #faf9f6;
  --color-surface:      #ffffff;
  --color-border:       #e8e4dc;
  --color-accent:       #1a4fa0;
  --color-accent-hover: #153d80;
  --color-text:         #1c1917;
  --color-muted:        #6b7280;
  --color-danger-bg:    #7f1d1d;
  --color-danger-text:  #fecaca;

  --font-display: var(--font-dm-serif), Georgia, serif;
  --font-body:    var(--font-dm-sans), system-ui, sans-serif;
  --font-mono:    var(--font-jb-mono), monospace;
}

body {
  background-color: #faf9f6;
  color: #1c1917;
  font-family: var(--font-dm-sans), system-ui, sans-serif;
}
```

- [ ] **Step 2: Update layout.tsx to load Google Fonts and apply variables**

Replace the entire file with:

```tsx
import type { Metadata } from 'next'
import { DM_Serif_Display, DM_Sans, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { DisclaimerBanner } from '@/components/DisclaimerBanner'

const dmSerif = DM_Serif_Display({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-dm-serif',
  display: 'swap',
})

const dmSans = DM_Sans({
  weight: ['400', '500', '600'],
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
})

const jbMono = JetBrains_Mono({
  weight: ['400', '500'],
  subsets: ['latin'],
  variable: '--font-jb-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'RentaGraph — Base de conocimiento IRPF con IA',
  description: 'Consulta la Declaración de la Renta española con IA. Base de conocimiento compilada automáticamente. No es asesoría fiscal.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="es"
      className={`${dmSerif.variable} ${dmSans.variable} ${jbMono.variable}`}
    >
      <body className="h-screen flex flex-col overflow-hidden">
        <DisclaimerBanner />
        <main className="flex-1 overflow-hidden">
          {children}
        </main>
      </body>
    </html>
  )
}
```

- [ ] **Step 3: Verify**

```bash
cd app && npm run lint && npm run build
```

Expected: no errors. If build fails on font names, check `node_modules/next/font/google/index.d.ts` for the exact export names for `DM_Serif_Display`, `DM_Sans`, `JetBrains_Mono`.

- [ ] **Step 4: Commit**

```bash
git add app/app/globals.css app/app/layout.tsx
git commit -m "feat: design tokens, light theme, Google Fonts via next/font"
```

---

## Task 2: DisclaimerBanner — muted style + session dismiss

**Files:**

- Modify: `app/components/DisclaimerBanner.tsx`

- [ ] **Step 1: Replace DisclaimerBanner.tsx**

```tsx
'use client'

import { useState, useEffect } from 'react'

export function DisclaimerBanner() {
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    setDismissed(sessionStorage.getItem('disclaimer_dismissed') === 'true')
  }, [])

  if (dismissed) return null

  return (
    <div
      className="relative flex shrink-0 items-center justify-center px-10 py-1.5 text-xs font-medium"
      style={{
        backgroundColor: 'var(--color-danger-bg)',
        color: 'var(--color-danger-text)',
      }}
    >
      &#9888; Base de conocimiento experimental con IA. No es asesoría fiscal ni jurídica.
      Consulta siempre a la AEAT o a un gestor cualificado.
      <button
        onClick={() => {
          sessionStorage.setItem('disclaimer_dismissed', 'true')
          setDismissed(true)
        }}
        className="absolute right-3 top-1/2 -translate-y-1/2 flex h-5 w-5 items-center justify-center rounded-full text-sm opacity-70 transition-opacity hover:opacity-100"
        aria-label="Cerrar aviso"
      >
        &#x00D7;
      </button>
    </div>
  )
}
```

- [ ] **Step 2: Verify**

```bash
cd app && npm run lint && npm run build
```

- [ ] **Step 3: Commit**

```bash
git add app/components/DisclaimerBanner.tsx
git commit -m "feat: muted disclaimer banner with session dismiss"
```

---

## Task 3: TopNav — new component

**Files:**

- Create: `app/components/TopNav.tsx`

- [ ] **Step 1: Create TopNav.tsx**

```tsx
type TopNavProps = {
  apiKey: string | null
  onRemoveKey: () => void
  onShowDemo: () => void
}

export function TopNav({ apiKey, onRemoveKey, onShowDemo }: TopNavProps) {
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
          onClick={onShowDemo}
          className="text-sm transition-opacity hover:opacity-70"
          style={{ color: 'var(--color-accent)' }}
        >
          Ver consultas demo
        </button>

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

- [ ] **Step 2: Verify**

```bash
cd app && npm run lint && npm run build
```

Expected: build will warn that TopNav is imported nowhere yet — that's fine, it's unused until Task 6.

- [ ] **Step 3: Commit**

```bash
git add app/components/TopNav.tsx
git commit -m "feat: TopNav component with logo, demo button, API key status"
```

---

## Task 4: FileTree — new component

**Files:**

- Create: `app/components/FileTree.tsx`

- [ ] **Step 1: Create FileTree.tsx**

```tsx
type FileTreeProps = {
  files: string[]
  activeFile: string | null
  onFileSelect: (filename: string) => void
}

export function FileTree({ files, activeFile, onFileSelect }: FileTreeProps) {
  return (
    <div
      className="flex h-full shrink-0 flex-col overflow-y-auto"
      style={{
        width: '200px',
        borderRight: '1px solid var(--color-border)',
        backgroundColor: 'var(--color-surface)',
      }}
    >
      <div
        className="shrink-0 px-4 py-3 text-xs font-semibold uppercase tracking-wider"
        style={{
          color: 'var(--color-muted)',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        Wiki Fiscal
      </div>

      <nav className="flex flex-col gap-0.5 p-2">
        {files.map((f) => {
          const isActive = f === activeFile
          const label = f.replace(/\.md$/, '')
          return (
            <button
              key={f}
              onClick={() => onFileSelect(f)}
              title={label}
              className={`flex h-9 w-full items-center truncate rounded-md px-3 text-[13px] transition-colors ${
                isActive ? '' : 'hover:bg-[#f0ede6]'
              }`}
              style={{
                borderLeft: isActive
                  ? '2px solid var(--color-accent)'
                  : '2px solid transparent',
                backgroundColor: isActive ? '#eef2fb' : undefined,
                color: isActive ? 'var(--color-accent)' : 'var(--color-text)',
                fontWeight: isActive ? 500 : 400,
                fontFamily: 'var(--font-body)',
              }}
            >
              {label}
            </button>
          )
        })}
      </nav>
    </div>
  )
}
```

- [ ] **Step 2: Verify**

```bash
cd app && npm run lint && npm run build
```

- [ ] **Step 3: Commit**

```bash
git add app/components/FileTree.tsx
git commit -m "feat: FileTree component — styled file list with active state"
```

---

## Task 5: ArticleViewer — new component

**Files:**

- Create: `app/components/ArticleViewer.tsx`

- [ ] **Step 1: Create ArticleViewer.tsx**

```tsx
import ReactMarkdown from 'react-markdown'

type ArticleViewerProps = {
  file: string | null
  content: string | null
  loading: boolean
  onClose: () => void
}

export function ArticleViewer({ file, content, loading, onClose }: ArticleViewerProps) {
  return (
    <div
      className="flex h-full shrink-0 flex-col overflow-hidden transition-[width] duration-200 ease-in-out"
      style={{
        width: file ? '420px' : '0px',
        borderRight: file ? '1px solid var(--color-border)' : 'none',
        backgroundColor: 'var(--color-surface)',
      }}
    >
      {file && (
        <>
          {/* Header */}
          <div
            className="flex shrink-0 items-center justify-between px-4 py-3"
            style={{ borderBottom: '1px solid var(--color-border)' }}
          >
            <span
              className="truncate text-base"
              style={{
                fontFamily: 'var(--font-display)',
                color: 'var(--color-text)',
              }}
            >
              {file.replace(/\.md$/, '')}
            </span>
            <button
              onClick={onClose}
              className="ml-2 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-lg leading-none transition-opacity hover:opacity-70"
              style={{ color: 'var(--color-muted)' }}
              aria-label="Cerrar artículo"
            >
              &#x00D7;
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-5 py-4">
            {loading && (
              <div className="animate-pulse space-y-3">
                <div
                  className="h-4 rounded"
                  style={{ backgroundColor: 'var(--color-border)', width: '80%' }}
                />
                <div
                  className="h-4 rounded"
                  style={{ backgroundColor: 'var(--color-border)', width: '60%' }}
                />
                <div
                  className="h-4 rounded"
                  style={{ backgroundColor: 'var(--color-border)', width: '72%' }}
                />
              </div>
            )}
            {content && !loading && (
              <ReactMarkdown className="prose prose-sm max-w-none">
                {content}
              </ReactMarkdown>
            )}
          </div>
        </>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Verify**

```bash
cd app && npm run lint && npm run build
```

- [ ] **Step 3: Commit**

```bash
git add app/components/ArticleViewer.tsx
git commit -m "feat: ArticleViewer component — animated width, skeleton loader"
```

---

## Task 6: page.tsx — 3-pane shell + delete WikiExplorer

**Files:**

- Modify: `app/app/page.tsx`
- Delete: `app/components/WikiExplorer.tsx`

- [ ] **Step 1: Replace page.tsx**

```tsx
'use client'

import { useState, useCallback, useEffect } from 'react'
import { FileTree } from '@/components/FileTree'
import { ArticleViewer } from '@/components/ArticleViewer'
import { ChatPanel } from '@/components/ChatPanel'
import { TopNav } from '@/components/TopNav'
import { ApiKeyModal } from '@/components/ApiKeyModal'
import { DemoModal } from '@/components/DemoModal'

export default function Home() {
  const [apiKey, setApiKey] = useState<string | null>(null)
  const [showDemo, setShowDemo] = useState(false)
  const [files, setFiles] = useState<string[]>([])
  const [activeFile, setActiveFile] = useState<string | null>(null)
  const [articleContent, setArticleContent] = useState<string | null>(null)
  const [articleLoading, setArticleLoading] = useState(false)

  // Read API key from localStorage after mount (avoids SSR mismatch)
  useEffect(() => {
    setApiKey(localStorage.getItem('renta_api_key'))
  }, [])

  // Load wiki file list
  useEffect(() => {
    fetch('/api/wiki')
      .then((r) => r.json())
      .then((data: string[]) => setFiles(data))
      .catch(() => setFiles([]))
  }, [])

  const handleFileSelect = useCallback(async (filename: string) => {
    setActiveFile(filename)
    setArticleLoading(true)
    setArticleContent(null)
    try {
      const res = await fetch(`/api/wiki?file=${encodeURIComponent(filename)}`)
      setArticleContent(await res.text())
    } finally {
      setArticleLoading(false)
    }
  }, [])

  const handleCloseArticle = useCallback(() => {
    setActiveFile(null)
    setArticleContent(null)
  }, [])

  const handleKeySubmit = useCallback((key: string) => {
    localStorage.setItem('renta_api_key', key)
    setApiKey(key)
  }, [])

  const handleRemoveKey = useCallback(() => {
    localStorage.removeItem('renta_api_key')
    setApiKey(null)
  }, [])

  // Citations arrive as article names without .md; resolve against the file list
  const handleCitationClick = useCallback((articleName: string) => {
    const filename =
      files.find((f) => f.replace(/\.md$/, '') === articleName) ??
      `${articleName}.md`
    handleFileSelect(filename)
  }, [files, handleFileSelect])

  return (
    <div
      className="flex h-full flex-col overflow-hidden"
      style={{ backgroundColor: 'var(--color-bg)' }}
    >
      <TopNav
        apiKey={apiKey}
        onRemoveKey={handleRemoveKey}
        onShowDemo={() => setShowDemo(true)}
      />

      <div className="flex flex-1 overflow-hidden">
        <FileTree
          files={files}
          activeFile={activeFile}
          onFileSelect={handleFileSelect}
        />
        <ArticleViewer
          file={activeFile}
          content={articleContent}
          loading={articleLoading}
          onClose={handleCloseArticle}
        />
        <ChatPanel
          apiKey={apiKey}
          onCitationClick={handleCitationClick}
        />
      </div>

      <ApiKeyModal
        open={!apiKey && !showDemo}
        onKeySubmit={handleKeySubmit}
        onShowDemo={() => setShowDemo(true)}
      />
      <DemoModal open={showDemo} onClose={() => setShowDemo(false)} />
    </div>
  )
}
```

- [ ] **Step 2: Delete WikiExplorer.tsx**

```bash
rm app/components/WikiExplorer.tsx
```

- [ ] **Step 3: Verify**

```bash
cd app && npm run lint && npm run build
```

Expected: build passes. `WikiExplorer` is no longer imported anywhere so deletion is safe.

- [ ] **Step 4: Commit**

```bash
git add app/app/page.tsx
git rm app/components/WikiExplorer.tsx
git commit -m "feat: 3-pane layout in page.tsx, remove WikiExplorer monolith"
```

---

## Task 7: ChatPanel — empty state, bubble styles, citation chips, typing dots

**Files:**

- Modify: `app/components/ChatPanel.tsx`

- [ ] **Step 1: Replace ChatPanel.tsx**

```tsx
'use client'

import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { useEffect, useMemo, useRef } from 'react'

type Props = {
  apiKey: string | null
  onCitationClick: (articleName: string) => void
}

const EXAMPLE_PROMPTS = [
  '¿Qué deducciones puedo aplicar por alquiler?',
  '¿Cómo tributan las criptomonedas?',
  '¿Cuál es el mínimo personal y familiar?',
]

function CitationChip({
  name,
  onClick,
}: {
  name: string
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="mx-0.5 inline-flex items-center rounded px-1.5 py-0.5 text-[11px] transition-colors bg-[#eef2fb] hover:bg-[#dce6f7]"
      style={{
        color: 'var(--color-accent)',
        fontFamily: 'var(--font-mono)',
      }}
    >
      {name}
    </button>
  )
}

function parseCitations(
  text: string,
  onCitationClick: (name: string) => void,
): React.ReactNode[] {
  const parts = text.split(/(\[\[[^\]]+\]\])/g)
  return parts.map((part, i) => {
    const match = part.match(/^\[\[(.+)\]\]$/)
    if (match) {
      return (
        <CitationChip key={i} name={match[1]} onClick={() => onCitationClick(match[1])} />
      )
    }
    return part
  })
}

export function ChatPanel({ apiKey, onCitationClick }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const transport = useMemo(
    () => new DefaultChatTransport({ api: '/api/chat' }),
    [],
  )

  // @ai-sdk/react v3: useChat does NOT expose input/handleSubmit/handleInputChange
  // Use local state for the input field, as the existing ChatPanel does.
  const [input, setInput] = useState('')

  const { messages, sendMessage, status } = useChat({ transport })

  const isLoading = status === 'streaming' || status === 'submitted'

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const text = input.trim()
    if (!text || isLoading) return
    setInput('')
    sendMessage(
      { text },
      apiKey ? { headers: { Authorization: `Bearer ${apiKey}` } } : undefined,
    )
  }

  function handleExampleClick(prompt: string) {
    if (isLoading || !apiKey) return
    sendMessage(
      { text: prompt },
      { headers: { Authorization: `Bearer ${apiKey}` } },
    )
  }

  const showEmptyState = messages.length === 0 && !isLoading

  return (
    <div
      className="flex flex-1 flex-col overflow-hidden"
      style={{ backgroundColor: 'var(--color-bg)' }}
    >
      {/* Messages */}
      <div className="flex flex-1 flex-col overflow-y-auto p-4">
        {showEmptyState && (
          <div className="flex flex-1 flex-col items-center justify-center gap-6 py-12">
            <div className="text-center">
              <h2
                className="mb-1 text-2xl"
                style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text)' }}
              >
                Agente IRPF
              </h2>
              <p className="text-sm" style={{ color: 'var(--color-muted)' }}>
                Pregunta sobre tu declaración de la renta
              </p>
            </div>

            {apiKey && (
              <div className="flex w-full max-w-sm flex-col gap-2">
                {EXAMPLE_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => handleExampleClick(prompt)}
                    className="w-full rounded-xl px-4 py-3 text-left text-sm transition-colors hover:bg-[#f0ede6]"
                    style={{
                      backgroundColor: 'var(--color-surface)',
                      border: '1px solid var(--color-border)',
                      color: 'var(--color-text)',
                      fontFamily: 'var(--font-body)',
                    }}
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {!showEmptyState && (
          <div className="flex flex-col gap-3">
            {messages.map((msg) => {
              const text = msg.parts
                .filter((p): p is { type: 'text'; text: string } => p.type === 'text')
                .map((p) => p.text)
                .join('')

              return (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className="max-w-[78%] px-4 py-2.5 text-sm leading-relaxed"
                    style={{
                      borderRadius:
                        msg.role === 'user'
                          ? '18px 18px 4px 18px'
                          : '18px 18px 18px 4px',
                      backgroundColor:
                        msg.role === 'user'
                          ? 'var(--color-accent)'
                          : 'var(--color-surface)',
                      color: msg.role === 'user' ? '#ffffff' : 'var(--color-text)',
                      border:
                        msg.role === 'user'
                          ? 'none'
                          : '1px solid var(--color-border)',
                      boxShadow:
                        msg.role === 'user'
                          ? 'none'
                          : '0 1px 3px rgba(0,0,0,0.06)',
                      fontFamily: 'var(--font-body)',
                    }}
                  >
                    {msg.role === 'assistant'
                      ? parseCitations(text, onCitationClick)
                      : text}
                  </div>
                </div>
              )
            })}

            {isLoading && (
              <div className="flex justify-start">
                <div
                  className="flex items-center gap-1 px-4 py-3"
                  style={{
                    borderRadius: '18px 18px 18px 4px',
                    backgroundColor: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                  }}
                >
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="inline-block h-1.5 w-1.5 animate-bounce rounded-full"
                      style={{
                        backgroundColor: 'var(--color-muted)',
                        animationDelay: `${i * 150}ms`,
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Input bar */}
      <div
        className="shrink-0 px-4 py-3"
        style={{ borderTop: '1px solid var(--color-border)' }}
      >
        {!apiKey ? (
          <p className="text-center text-sm" style={{ color: 'var(--color-muted)' }}>
            Introduce tu API key para chatear.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading}
              placeholder="Escribe tu pregunta fiscal..."
              className="flex-1 rounded-[10px] px-3 text-sm focus:outline-none disabled:opacity-50"
              style={{
                height: '44px',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text)',
                backgroundColor: 'var(--color-surface)',
                fontFamily: 'var(--font-body)',
              }}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="shrink-0 rounded-[10px] px-5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-40"
              style={{
                height: '44px',
                backgroundColor: 'var(--color-accent)',
                fontFamily: 'var(--font-body)',
              }}
            >
              Enviar
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
```

**Note:** `useChat` from `@ai-sdk/react` v3 exposes `input`, `setInput`, and `handleInputChange` — verify this is the case by checking `node_modules/@ai-sdk/react/dist/index.d.ts` if the build fails. If `handleInputChange` is not exported, replace it with `onChange={(e) => setInput(e.target.value)}`.

- [ ] **Step 2: Verify**

```bash
cd app && npm run lint && npm run build
```

- [ ] **Step 3: Commit**

```bash
git add app/components/ChatPanel.tsx
git commit -m "feat: ChatPanel redesign — empty state, asymmetric bubbles, citation chips, typing dots"
```

---

## Task 8: ApiKeyModal — provider selector, trust copy, demo link

**Files:**

- Modify: `app/components/ApiKeyModal.tsx`

- [ ] **Step 1: Replace ApiKeyModal.tsx**

```tsx
'use client'

import { useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'

type Provider = 'openai' | 'anthropic'

const PLACEHOLDERS: Record<Provider, string> = {
  openai: 'sk-...',
  anthropic: 'sk-ant-...',
}

interface ApiKeyModalProps {
  open: boolean
  onKeySubmit: (key: string) => void
  onShowDemo: () => void
}

export function ApiKeyModal({ open, onKeySubmit, onShowDemo }: ApiKeyModalProps) {
  const [key, setKey] = useState('')
  const [provider, setProvider] = useState<Provider>('openai')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = key.trim()
    if (!trimmed) return
    onKeySubmit(trimmed)
  }

  return (
    <Dialog.Root open={open}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" />
        <Dialog.Content
          className="fixed left-1/2 top-1/2 z-50 w-full max-w-[440px] -translate-x-1/2 -translate-y-1/2 focus:outline-none"
          style={{
            backgroundColor: 'var(--color-surface)',
            borderRadius: '16px',
            padding: '32px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
          }}
        >
          {/* Lock icon */}
          <div className="mb-5 flex justify-center">
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ color: 'var(--color-accent)' }}
            >
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>

          <Dialog.Title
            className="mb-1 text-center text-[22px]"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text)' }}
          >
            Conecta tu API Key
          </Dialog.Title>
          <Dialog.Description
            className="mb-6 text-center text-[13px]"
            style={{ color: 'var(--color-muted)' }}
          >
            Tu clave se guarda solo en tu navegador. Nunca llega a nuestros servidores.
          </Dialog.Description>

          {/* Provider selector */}
          <div className="mb-4 flex gap-2">
            {(['openai', 'anthropic'] as Provider[]).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setProvider(p)}
                className="flex-1 rounded-lg py-2 text-sm font-medium transition-colors"
                style={{
                  backgroundColor:
                    provider === p ? 'var(--color-accent)' : 'transparent',
                  color: provider === p ? '#ffffff' : 'var(--color-text)',
                  border:
                    provider === p
                      ? 'none'
                      : '1px solid var(--color-border)',
                }}
              >
                {p === 'openai' ? 'OpenAI' : 'Anthropic'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <input
              type="password"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder={PLACEHOLDERS[provider]}
              autoComplete="off"
              className="w-full rounded-lg px-3 text-sm focus:outline-none"
              style={{
                height: '44px',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text)',
                backgroundColor: 'var(--color-surface)',
                fontFamily: 'var(--font-body)',
              }}
            />
            <button
              type="submit"
              disabled={!key.trim()}
              className="w-full rounded-lg text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
              style={{
                height: '44px',
                backgroundColor: 'var(--color-accent)',
                fontFamily: 'var(--font-body)',
              }}
            >
              Guardar clave
            </button>
          </form>

          {/* Divider */}
          <div className="my-5 flex items-center gap-3">
            <div
              className="h-px flex-1"
              style={{ backgroundColor: 'var(--color-border)' }}
            />
            <span className="text-xs" style={{ color: 'var(--color-muted)' }}>
              o
            </span>
            <div
              className="h-px flex-1"
              style={{ backgroundColor: 'var(--color-border)' }}
            />
          </div>

          <button
            type="button"
            onClick={onShowDemo}
            className="w-full text-center text-sm transition-opacity hover:opacity-70"
            style={{ color: 'var(--color-accent)' }}
          >
            Ver demo sin clave →
          </button>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
```

- [ ] **Step 2: Verify**

```bash
cd app && npm run lint && npm run build
```

- [ ] **Step 3: Commit**

```bash
git add app/components/ApiKeyModal.tsx
git commit -m "feat: ApiKeyModal redesign — provider selector, trust copy, demo shortcut"
```

---

## Task 9: DemoModal — token-based style pass

**Files:**

- Modify: `app/components/DemoModal.tsx`

- [ ] **Step 1: Replace DemoModal.tsx**

```tsx
'use client'

import * as Dialog from '@radix-ui/react-dialog'
import { useState } from 'react'
import transcripts from '@/data/demo-transcripts.json'

interface Props {
  open: boolean
  onClose: () => void
}

function parseContent(text: string): React.ReactNode[] {
  const parts = text.split(/(\[\[[^\]]+\]\])/g)
  return parts.map((part, i) => {
    const match = part.match(/^\[\[([^\]]+)\]\]$/)
    if (match) {
      return (
        <span
          key={i}
          className="mx-0.5 inline-flex items-center rounded px-1.5 py-0.5 text-[11px]"
          style={{
            backgroundColor: '#eef2fb',
            color: 'var(--color-accent)',
            fontFamily: 'var(--font-mono)',
          }}
        >
          {match[1]}
        </span>
      )
    }
    return <span key={i}>{part}</span>
  })
}

export function DemoModal({ open, onClose }: Props) {
  const [selectedId, setSelectedId] = useState(transcripts[0].id)
  const selected = transcripts.find((t) => t.id === selectedId) ?? transcripts[0]

  return (
    <Dialog.Root open={open} onOpenChange={(o) => { if (!o) onClose() }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" />
        <Dialog.Content
          className="fixed left-1/2 top-1/2 z-50 flex h-[600px] w-[900px] max-w-[95vw] max-h-[90vh] -translate-x-1/2 -translate-y-1/2 overflow-hidden focus:outline-none"
          style={{
            backgroundColor: 'var(--color-bg)',
            borderRadius: '16px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
          }}
          aria-describedby={undefined}
        >
          {/* Left sidebar: transcript list */}
          <div
            className="flex w-56 shrink-0 flex-col"
            style={{
              backgroundColor: 'var(--color-surface)',
              borderRight: '1px solid var(--color-border)',
            }}
          >
            <div
              className="shrink-0 px-4 py-3"
              style={{ borderBottom: '1px solid var(--color-border)' }}
            >
              <Dialog.Title
                className="text-sm font-semibold"
                style={{ color: 'var(--color-text)' }}
              >
                Conversaciones de demo
              </Dialog.Title>
            </div>
            <nav className="flex flex-col gap-1 p-2">
              {transcripts.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setSelectedId(t.id)}
                  className={`rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                    t.id === selectedId ? '' : 'hover:bg-[#f0ede6]'
                  }`}
                  style={{
                    borderLeft:
                      t.id === selectedId
                        ? '2px solid var(--color-accent)'
                        : '2px solid transparent',
                    backgroundColor:
                      t.id === selectedId ? '#eef2fb' : undefined,
                    color:
                      t.id === selectedId
                        ? 'var(--color-accent)'
                        : 'var(--color-text)',
                    fontWeight: t.id === selectedId ? 500 : 400,
                  }}
                >
                  {t.title}
                </button>
              ))}
            </nav>
          </div>

          {/* Right: chat view */}
          <div className="flex flex-1 flex-col min-w-0">
            <div
              className="flex shrink-0 items-center justify-between px-4 py-3"
              style={{ borderBottom: '1px solid var(--color-border)' }}
            >
              <span
                className="text-sm font-medium"
                style={{ color: 'var(--color-text)' }}
              >
                {selected.title}
              </span>
              <Dialog.Close
                onClick={onClose}
                className="flex h-7 w-7 items-center justify-center rounded-full text-lg leading-none transition-opacity hover:opacity-70"
                style={{ color: 'var(--color-muted)' }}
                aria-label="Cerrar"
              >
                &#x00D7;
              </Dialog.Close>
            </div>

            <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-4">
              {selected.messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className="max-w-[80%] px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap"
                    style={{
                      borderRadius:
                        msg.role === 'user'
                          ? '18px 18px 4px 18px'
                          : '18px 18px 18px 4px',
                      backgroundColor:
                        msg.role === 'user'
                          ? 'var(--color-accent)'
                          : 'var(--color-surface)',
                      color:
                        msg.role === 'user' ? '#ffffff' : 'var(--color-text)',
                      border:
                        msg.role === 'user'
                          ? 'none'
                          : '1px solid var(--color-border)',
                      boxShadow:
                        msg.role === 'user'
                          ? 'none'
                          : '0 1px 3px rgba(0,0,0,0.06)',
                      fontFamily: 'var(--font-body)',
                    }}
                  >
                    {msg.role === 'assistant'
                      ? parseContent(msg.content)
                      : msg.content}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
```

- [ ] **Step 2: Verify**

```bash
cd app && npm run lint && npm run build
```

- [ ] **Step 3: Commit**

```bash
git add app/components/DemoModal.tsx
git commit -m "feat: DemoModal restyled with design tokens and matching bubble styles"
```

---

## Task 10: Final verification

- [ ] **Step 1: Full clean build**

```bash
cd app && npm run lint && npm run build
```

Expected: `✓ Compiled successfully`, zero lint errors, zero TypeScript errors.

- [ ] **Step 2: Visual smoke test**

```bash
cd app && npm run dev
```

Open `http://localhost:3000` and verify:

- Disclaimer banner: dark red, single line, `×` dismiss works (reappears on next session)
- TopNav: "RentaGraph" serif wordmark, demo button, API key indicator
- FileTree: 200px left column, "Wiki Fiscal" header, file buttons with active border
- ArticleViewer: hidden at load, slides open (200ms) when a file is clicked, `×` closes it
- ChatPanel: empty state with heading + example chips (if API key set); bubbles have asymmetric border-radius; typing dots animate
- ApiKeyModal: shows on load, lock icon, provider pills, "Ver demo sin clave →" link works
- DemoModal: opens from ApiKeyModal link and from TopNav button; closes and returns to ApiKeyModal if no key

- [ ] **Step 4: Final commit**

```bash
git add -p  # confirm nothing unexpected staged
git commit -m "feat: complete UI redesign — light theme, 3-pane layout, editorial type"
```
