'use client'

import { useState, useMemo } from 'react'
import { GraphView } from '@/components/GraphView'

export type WikiFileMeta = {
  name: string
  category: string
}

type FileTreeProps = {
  files: WikiFileMeta[]
  activeFile: string | null
  onFileSelect: (filename: string) => void
  onNodeClick: (label: string) => void
}

const CATEGORY_LABELS: Record<string, string> = {
  'conceptos-generales': 'Conceptos Generales',
  'rendimientos': 'Rendimientos',
  'deducciones': 'Deducciones',
  'procedimientos': 'Procedimientos',
  'inversiones': 'Inversiones',
  'autonomica': 'Autonómica',
  'autonomica-andalucia': 'Andalucía',
  'autonomica-aragon': 'Aragón',
  'autonomica-asturias': 'Asturias',
  'autonomica-illes-balears': 'Illes Balears',
  'autonomica-canarias': 'Canarias',
  'autonomica-cantabria': 'Cantabria',
  'autonomica-castilla-la-mancha': 'Castilla-La Mancha',
  'autonomica-castilla-y-leon': 'Castilla y León',
  'autonomica-cataluna': 'Cataluña',
  'autonomica-extremadura': 'Extremadura',
  'autonomica-galicia': 'Galicia',
  'autonomica-la-rioja': 'La Rioja',
  'autonomica-madrid': 'Comunidad de Madrid',
  'autonomica-murcia': 'Región de Murcia',
  'autonomica-comunitat-valenciana': 'Comunitat Valenciana',
  'autonomica-navarra': 'Navarra',
  'autonomica-pais-vasco': 'País Vasco',
  'fiscalidad-diferenciada': 'Fiscalidad Diferenciada',
  'sin_categoría': 'Sin Categoría',
}

const CATEGORY_ORDER = [
  'conceptos-generales',
  'rendimientos',
  'deducciones',
  'procedimientos',
  'inversiones',
  'autonomica',
  'autonomica-andalucia',
  'autonomica-aragon',
  'autonomica-asturias',
  'autonomica-illes-balears',
  'autonomica-canarias',
  'autonomica-cantabria',
  'autonomica-castilla-la-mancha',
  'autonomica-castilla-y-leon',
  'autonomica-cataluna',
  'autonomica-extremadura',
  'autonomica-galicia',
  'autonomica-la-rioja',
  'autonomica-madrid',
  'autonomica-murcia',
  'autonomica-comunitat-valenciana',
  'autonomica-navarra',
  'autonomica-pais-vasco',
  'fiscalidad-diferenciada',
  'sin_categoría',
]

function IconList() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
      <line x1="3" y1="4" x2="13" y2="4" />
      <line x1="3" y1="8" x2="13" y2="8" />
      <line x1="3" y1="12" x2="13" y2="12" />
    </svg>
  )
}

function IconGraph() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
      <circle cx="3" cy="8" r="2" />
      <circle cx="13" cy="3" r="2" />
      <circle cx="13" cy="13" r="2" />
      <line x1="5" y1="7" x2="11" y2="4" />
      <line x1="5" y1="9" x2="11" y2="12" />
    </svg>
  )
}

function IconSearch() {
  return (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
      <circle cx="7" cy="7" r="5" />
      <line x1="11" y1="11" x2="15" y2="15" />
    </svg>
  )
}

function IconFile() {
  return (
    <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V5L9 1z" />
      <polyline points="9,1 9,5 13,5" />
    </svg>
  )
}

function IconChevron({ open }: { open: boolean }) {
  return (
    <svg
      width="10" height="10"
      viewBox="0 0 16 16"
      fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
      style={{ transform: open ? 'rotate(90deg)' : 'none', transition: 'transform 150ms ease', flexShrink: 0 }}
    >
      <polyline points="5,2 11,8 5,14" />
    </svg>
  )
}

export function FileTree({ files, activeFile, onFileSelect, onNodeClick }: FileTreeProps) {
  const [view, setView] = useState<'list' | 'graph'>('list')
  const [search, setSearch] = useState('')
  const [openCats, setOpenCats] = useState<Set<string>>(new Set())

  const activeCategory = useMemo(
    () => (activeFile ? (files.find(f => f.name === activeFile)?.category ?? null) : null),
    [activeFile, files]
  )

  // Always keep the active file's category open
  const baseOpenCats = useMemo(() => {
    if (!activeCategory || openCats.has(activeCategory)) return openCats
    const next = new Set(openCats)
    next.add(activeCategory)
    return next
  }, [openCats, activeCategory])

  const grouped = useMemo(() => {
    const q = search.toLowerCase()
    const filtered = q ? files.filter(f => f.name.toLowerCase().includes(q)) : files

    const map = new Map<string, WikiFileMeta[]>()
    for (const f of filtered) {
      if (!map.has(f.category)) map.set(f.category, [])
      map.get(f.category)!.push(f)
    }

    const ordered: [string, WikiFileMeta[]][] = []
    for (const cat of CATEGORY_ORDER) {
      if (map.has(cat)) ordered.push([cat, map.get(cat)!])
    }
    for (const [cat, items] of map) {
      if (!CATEGORY_ORDER.includes(cat)) ordered.push([cat, items])
    }
    return ordered
  }, [files, search])

  // When searching, expand all categories with results
  const effectiveOpenCats = search
    ? new Set(grouped.map(([cat]) => cat))
    : baseOpenCats

  function toggleCat(cat: string) {
    if (search) return
    setOpenCats(prev => {
      const next = new Set(prev)
      if (next.has(cat)) next.delete(cat)
      else next.add(cat)
      return next
    })
  }

  return (
    <div
      className="flex h-full shrink-0 flex-col overflow-hidden transition-[width] duration-300 ease-in-out"
      style={{
        width: view === 'graph' ? '440px' : '240px',
        borderRight: '1px solid var(--color-border)',
        backgroundColor: view === 'graph' ? 'var(--color-bg)' : 'var(--color-surface)',
      }}
    >
      {/* Header */}
      <div
        className="flex shrink-0 items-center justify-between px-3 py-2"
        style={{
          borderBottom: '1px solid var(--color-border)',
          backgroundColor: 'var(--color-surface)',
          minHeight: '40px',
        }}
      >
        <span
          className="text-xs font-semibold uppercase tracking-wider"
          style={{ color: 'var(--color-muted)' }}
        >
          {view === 'list' ? 'Wiki Fiscal' : 'Grafo de Conocimiento'}
        </span>

        <div
          className="flex items-center rounded-md p-0.5"
          style={{ backgroundColor: 'var(--color-border)' }}
        >
          <button
            type="button"
            onClick={() => setView('list')}
            title="Vista lista"
            className="flex h-6 w-6 items-center justify-center rounded transition-colors"
            style={{
              backgroundColor: view === 'list' ? 'var(--color-surface)' : 'transparent',
              color: view === 'list' ? 'var(--color-accent)' : 'var(--color-muted)',
            }}
          >
            <IconList />
          </button>
          <button
            type="button"
            onClick={() => setView('graph')}
            title="Vista grafo"
            className="flex h-6 w-6 items-center justify-center rounded transition-colors"
            style={{
              backgroundColor: view === 'graph' ? 'var(--color-surface)' : 'transparent',
              color: view === 'graph' ? 'var(--color-accent)' : 'var(--color-muted)',
            }}
          >
            <IconGraph />
          </button>
        </div>
      </div>

      {view === 'list' ? (
        <div className="flex min-h-0 flex-1 flex-col">
          {/* Search */}
          <div className="shrink-0 px-2 py-2" style={{ borderBottom: '1px solid var(--color-border)' }}>
            <div className="relative flex items-center">
              <span className="pointer-events-none absolute left-2" style={{ color: 'var(--color-muted)' }}>
                <IconSearch />
              </span>
              <input
                type="text"
                placeholder="Buscar artículo..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full rounded-md pl-6 pr-2 text-[12px] focus:outline-none"
                style={{
                  height: '28px',
                  backgroundColor: 'var(--color-bg)',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text)',
                  fontFamily: 'var(--font-body)',
                }}
              />
            </div>
          </div>

          {/* Tree */}
          <nav className="flex-1 overflow-y-auto py-1">
            {grouped.length === 0 && (
              <p className="px-4 py-6 text-center text-[12px]" style={{ color: 'var(--color-muted)' }}>
                Sin resultados
              </p>
            )}
            {grouped.map(([cat, catFiles]) => {
              const isOpen = effectiveOpenCats.has(cat)
              const catLabel = CATEGORY_LABELS[cat] ?? cat
              return (
                <div key={cat}>
                  {/* Category row */}
                  <button
                    type="button"
                    onClick={() => toggleCat(cat)}
                    className="flex w-full items-center gap-1.5 px-2 py-1.5 text-left transition-colors hover:bg-[#f0ede6]"
                    style={{ color: 'var(--color-muted)' }}
                  >
                    <IconChevron open={isOpen} />
                    <span className="flex-1 truncate text-[11px] font-semibold uppercase tracking-wider">
                      {catLabel}
                    </span>
                    <span
                      className="shrink-0 rounded px-1 text-[10px]"
                      style={{ backgroundColor: 'var(--color-border)', color: 'var(--color-muted)' }}
                    >
                      {catFiles.length}
                    </span>
                  </button>

                  {/* File items */}
                  {isOpen && catFiles.map(f => {
                    const isActive = f.name === activeFile
                    return (
                      <button
                        key={f.name}
                        type="button"
                        onClick={() => onFileSelect(f.name)}
                        title={f.name}
                        className={`flex w-full items-center gap-1.5 py-1 pl-6 pr-2 text-left transition-colors ${isActive ? '' : 'hover:bg-[#f0ede6]'}`}
                        style={{
                          backgroundColor: isActive ? '#eef2fb' : undefined,
                          borderLeft: isActive ? '2px solid var(--color-accent)' : '2px solid transparent',
                          color: isActive ? 'var(--color-accent)' : 'var(--color-text)',
                        }}
                      >
                        <span className="shrink-0" style={{ opacity: isActive ? 1 : 0.4 }}>
                          <IconFile />
                        </span>
                        <span
                          className="truncate text-[12px]"
                          style={{ fontFamily: 'var(--font-body)', fontWeight: isActive ? 500 : 400 }}
                        >
                          {f.name}
                        </span>
                      </button>
                    )
                  })}
                </div>
              )
            })}
          </nav>
        </div>
      ) : (
        <GraphView onNodeClick={onNodeClick} activeFile={activeFile} />
      )}
    </div>
  )
}
