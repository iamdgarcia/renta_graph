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
