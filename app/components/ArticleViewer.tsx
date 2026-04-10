import Markdown from 'react-markdown'

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
              <div className="prose prose-sm max-w-none">
                <Markdown>{content}</Markdown>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
