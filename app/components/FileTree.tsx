'use client'

import { useState, useMemo } from 'react'
import { GraphView } from '@/components/GraphView'
import { FileTreeHeader } from '@/components/file-tree/FileTreeHeader'
import { FileTreeListPane } from '@/components/file-tree/FileTreeListPane'
import {
  getActiveCategory,
  getBaseOpenCategories,
  groupFilesByCategory,
  getEffectiveOpenCategories,
} from '@/components/file-tree/utils'

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

export function FileTree({ files, activeFile, onFileSelect, onNodeClick }: FileTreeProps) {
  const [view, setView] = useState<'list' | 'graph'>('list')
  const [search, setSearch] = useState('')
  const [openCats, setOpenCats] = useState<Set<string>>(new Set())

  const activeCategory = useMemo(
    () => getActiveCategory(files, activeFile),
    [activeFile, files]
  )

  const baseOpenCats = useMemo(() => {
    return getBaseOpenCategories(openCats, activeCategory)
  }, [openCats, activeCategory])

  const grouped = useMemo(() => groupFilesByCategory(files, search), [files, search])

  const effectiveOpenCats = useMemo(
    () => getEffectiveOpenCategories(search, grouped, baseOpenCats),
    [search, grouped, baseOpenCats],
  )

  function toggleCat(cat: string) {
    if (search) return
    setOpenCats((prev) => {
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
      <FileTreeHeader view={view} onViewChange={setView} />

      {view === 'list' ? (
        <FileTreeListPane
          search={search}
          grouped={grouped}
          effectiveOpenCats={effectiveOpenCats}
          activeFile={activeFile}
          onSearchChange={setSearch}
          onToggleCategory={toggleCat}
          onFileSelect={onFileSelect}
        />
      ) : (
        <GraphView onNodeClick={onNodeClick} activeFile={activeFile} />
      )}
    </div>
  )
}
