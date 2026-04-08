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
          className="inline-block rounded bg-blue-100 px-1 py-0.5 text-blue-800 text-xs font-medium"
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
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50" />
        <Dialog.Content
          className="fixed left-1/2 top-1/2 z-50 flex h-[600px] w-[900px] max-w-[95vw] max-h-[90vh] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-xl bg-white shadow-2xl"
          aria-describedby={undefined}
        >
          {/* Left sidebar: transcript list */}
          <div className="flex w-56 flex-shrink-0 flex-col border-r border-zinc-200 bg-zinc-50">
            <div className="border-b border-zinc-200 px-4 py-3">
              <Dialog.Title className="text-sm font-semibold text-zinc-700">
                Conversaciones de demo
              </Dialog.Title>
            </div>
            <nav className="flex flex-col gap-1 p-2">
              {transcripts.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setSelectedId(t.id)}
                  className={`rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                    t.id === selectedId
                      ? 'bg-blue-100 text-blue-800 font-medium'
                      : 'text-zinc-600 hover:bg-zinc-100'
                  }`}
                >
                  {t.title}
                </button>
              ))}
            </nav>
          </div>

          {/* Right side: chat view */}
          <div className="flex flex-1 flex-col min-w-0">
            <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3">
              <span className="text-sm font-medium text-zinc-700">{selected.title}</span>
              <Dialog.Close
                onClick={onClose}
                className="flex h-7 w-7 items-center justify-center rounded-full text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 transition-colors"
                aria-label="Cerrar"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </Dialog.Close>
            </div>

            <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4">
              {selected.messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                      msg.role === 'user'
                        ? 'bg-zinc-200 text-zinc-800'
                        : 'bg-white border border-zinc-200 text-zinc-800 shadow-sm'
                    }`}
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
