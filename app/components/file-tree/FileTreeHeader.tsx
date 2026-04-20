import { IconList, IconGraph } from './icons'

type FileTreeHeaderProps = {
  view: 'list' | 'graph'
  onViewChange: (view: 'list' | 'graph') => void
}

export function FileTreeHeader({ view, onViewChange }: FileTreeHeaderProps) {
  return (
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
          onClick={() => onViewChange('list')}
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
          onClick={() => onViewChange('graph')}
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
  )
}
