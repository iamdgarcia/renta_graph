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
                  type="button"
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
