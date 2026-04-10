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
