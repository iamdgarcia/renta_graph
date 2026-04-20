import { CATEGORY_LABELS } from './constants'
import { GroupedFiles } from './utils'
import { IconChevron, IconFile, IconSearch } from './icons'
import type { WikiFileMeta } from '@/components/FileTree'

type FileTreeListPaneProps = {
  search: string
  grouped: GroupedFiles
  effectiveOpenCats: Set<string>
  activeFile: string | null
  onSearchChange: (value: string) => void
  onToggleCategory: (category: string) => void
  onFileSelect: (filename: string) => void
}

export function FileTreeListPane({
  search,
  grouped,
  effectiveOpenCats,
  activeFile,
  onSearchChange,
  onToggleCategory,
  onFileSelect,
}: FileTreeListPaneProps) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="shrink-0 px-2 py-2" style={{ borderBottom: '1px solid var(--color-border)' }}>
        <div className="relative flex items-center">
          <span className="pointer-events-none absolute left-2" style={{ color: 'var(--color-muted)' }}>
            <IconSearch />
          </span>
          <input
            type="text"
            placeholder="Buscar artículo..."
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
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

      <nav className="flex-1 overflow-y-auto py-1">
        {grouped.length === 0 && (
          <p className="px-4 py-6 text-center text-[12px]" style={{ color: 'var(--color-muted)' }}>
            Sin resultados
          </p>
        )}
        {grouped.map(([category, categoryFiles]) => {
          const isOpen = effectiveOpenCats.has(category)
          const categoryLabel = CATEGORY_LABELS[category] ?? category

          return (
            <div key={category}>
              <button
                type="button"
                onClick={() => onToggleCategory(category)}
                className="flex w-full items-center gap-1.5 px-2 py-1.5 text-left transition-colors hover:bg-[#f0ede6]"
                style={{ color: 'var(--color-muted)' }}
              >
                <IconChevron open={isOpen} />
                <span className="flex-1 truncate text-[11px] font-semibold uppercase tracking-wider">
                  {categoryLabel}
                </span>
                <span
                  className="shrink-0 rounded px-1 text-[10px]"
                  style={{ backgroundColor: 'var(--color-border)', color: 'var(--color-muted)' }}
                >
                  {categoryFiles.length}
                </span>
              </button>

              {isOpen && categoryFiles.map((file) => (
                <FileTreeFileRow
                  key={file.name}
                  file={file}
                  activeFile={activeFile}
                  onFileSelect={onFileSelect}
                />
              ))}
            </div>
          )
        })}
      </nav>
    </div>
  )
}

type FileTreeFileRowProps = {
  file: WikiFileMeta
  activeFile: string | null
  onFileSelect: (filename: string) => void
}

function FileTreeFileRow({ file, activeFile, onFileSelect }: FileTreeFileRowProps) {
  const isActive = file.name === activeFile

  return (
    <button
      type="button"
      onClick={() => onFileSelect(file.name)}
      title={file.name}
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
        {file.name}
      </span>
    </button>
  )
}
