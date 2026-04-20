import Markdown from 'react-markdown'
import { citationMarkdown, normalizeAssistantMarkdown } from './assistantMarkdown'
import { CitationChip } from './CitationChip'

type AssistantMessageProps = {
  text: string
  onCitationClick: (name: string) => void
}

export function AssistantMessage({ text, onCitationClick }: AssistantMessageProps) {
  const markdownText = citationMarkdown(normalizeAssistantMarkdown(text))

  return (
    <div className="assistant-rich max-w-none text-sm">
      <Markdown
        components={{
          a: ({ href, children }) => {
            if (href?.startsWith('cite://')) {
              const citation = decodeURIComponent(href.replace('cite://', ''))
              return (
                <CitationChip
                  name={citation}
                  onClick={() => onCitationClick(citation)}
                />
              )
            }

            return (
              <a
                href={href}
                target="_blank"
                rel="noreferrer noopener"
                className="font-medium underline decoration-[1.5px] underline-offset-2 transition-opacity hover:opacity-80"
                style={{ color: 'var(--color-accent)' }}
              >
                {children}
              </a>
            )
          },
          p: ({ children }) => <p className="leading-7">{children}</p>,
          h1: ({ children }) => <h1 className="text-lg font-semibold">{children}</h1>,
          h2: ({ children }) => <h2 className="text-base font-semibold">{children}</h2>,
          h3: ({ children }) => (
            <h3
              className="mt-4 rounded-lg px-3 py-2 text-sm font-semibold"
              style={{
                backgroundColor: '#f3f7ff',
                color: 'var(--color-accent)',
                border: '1px solid #dbe7ff',
              }}
            >
              {children}
            </h3>
          ),
          ul: ({ children }) => <ul className="space-y-1">{children}</ul>,
          ol: ({ children }) => <ol className="space-y-2">{children}</ol>,
          li: ({ children }) => <li className="leading-7">{children}</li>,
          blockquote: ({ children }) => (
            <blockquote
              className="rounded-r-lg border-l-4 px-3 py-2 text-[13px]"
              style={{
                borderColor: '#b9cdee',
                backgroundColor: '#f8fbff',
                color: 'var(--color-muted)',
              }}
            >
              {children}
            </blockquote>
          ),
          code: ({ children }) => (
            <code
              className="rounded px-1 py-0.5 text-[12px]"
              style={{
                fontFamily: 'var(--font-mono)',
                backgroundColor: '#eef2fb',
                color: '#244a87',
              }}
            >
              {children}
            </code>
          ),
        }}
      >
        {markdownText}
      </Markdown>
    </div>
  )
}