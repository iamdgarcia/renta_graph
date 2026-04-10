'use client'

import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { useEffect, useMemo, useRef, useState } from 'react'

type Props = {
  apiKey: string | null
  onCitationClick: (articleName: string) => void
}

const EXAMPLE_PROMPTS = [
  '¿Qué deducciones puedo aplicar por alquiler?',
  '¿Cómo tributan las criptomonedas?',
  '¿Cuál es el mínimo personal y familiar?',
]

function CitationChip({
  name,
  onClick,
}: {
  name: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mx-0.5 inline-flex items-center rounded px-1.5 py-0.5 text-xs transition-colors bg-[#eef2fb] hover:bg-[#dce6f7]"
      style={{
        color: 'var(--color-accent)',
        fontFamily: 'var(--font-mono)',
      }}
    >
      {name}
    </button>
  )
}

function parseCitations(
  text: string,
  onCitationClick: (name: string) => void,
): React.ReactNode[] {
  const parts = text.split(/(\[\[[^\]]+\]\])/g)
  return parts.map((part, i) => {
    const match = part.match(/^\[\[(.+)\]\]$/)
    if (match) {
      return (
        <CitationChip key={i} name={match[1]} onClick={() => onCitationClick(match[1])} />
      )
    }
    return part
  })
}

export function ChatPanel({ apiKey, onCitationClick }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null)
  const [input, setInput] = useState('')

  const transport = useMemo(
    () => new DefaultChatTransport({ api: '/api/chat' }),
    [],
  )

  const { messages, sendMessage, status } = useChat({ transport })

  const isLoading = status === 'streaming' || status === 'submitted'

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const text = input.trim()
    if (!text || isLoading) return
    setInput('')
    sendMessage(
      { text },
      apiKey ? { headers: { Authorization: `Bearer ${apiKey}` } } : undefined,
    )
  }

  function handleExampleClick(prompt: string) {
    if (isLoading || !apiKey) return
    sendMessage(
      { text: prompt },
      { headers: { Authorization: `Bearer ${apiKey}` } },
    )
  }

  const showEmptyState = messages.length === 0 && !isLoading

  return (
    <div
      className="flex flex-1 flex-col overflow-hidden"
      style={{ backgroundColor: 'var(--color-bg)' }}
    >
      {/* Messages */}
      <div className="flex flex-1 flex-col overflow-y-auto p-4">
        {showEmptyState && (
          <div className="flex flex-1 flex-col items-center justify-center gap-6 py-12">
            <div className="text-center">
              <h2
                className="mb-1 text-2xl"
                style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text)' }}
              >
                Agente IRPF
              </h2>
              <p className="text-sm" style={{ color: 'var(--color-muted)' }}>
                Pregunta sobre tu declaración de la renta
              </p>
            </div>

            {apiKey && (
              <div className="flex w-full max-w-sm flex-col gap-2">
                {EXAMPLE_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => handleExampleClick(prompt)}
                    className="w-full rounded-xl px-4 py-3 text-left text-sm transition-colors hover:bg-[#f0ede6]"
                    style={{
                      backgroundColor: 'var(--color-surface)',
                      border: '1px solid var(--color-border)',
                      color: 'var(--color-text)',
                      fontFamily: 'var(--font-body)',
                    }}
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {!showEmptyState && (
          <div className="flex flex-col gap-3">
            {messages.map((msg) => {
              const text = msg.parts
                .filter((p): p is { type: 'text'; text: string } => p.type === 'text')
                .map((p) => p.text)
                .join('')

              return (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className="max-w-[78%] px-4 py-2.5 text-sm leading-relaxed"
                    style={{
                      borderRadius:
                        msg.role === 'user'
                          ? '18px 18px 4px 18px'
                          : '18px 18px 18px 4px',
                      backgroundColor:
                        msg.role === 'user'
                          ? 'var(--color-accent)'
                          : 'var(--color-surface)',
                      color: msg.role === 'user' ? '#ffffff' : 'var(--color-text)',
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
                      ? parseCitations(text, onCitationClick)
                      : text}
                  </div>
                </div>
              )
            })}

            {isLoading && (
              <div className="flex justify-start">
                <div
                  className="flex items-center gap-1 px-4 py-3"
                  style={{
                    borderRadius: '18px 18px 18px 4px',
                    backgroundColor: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                  }}
                >
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="inline-block h-1.5 w-1.5 animate-bounce rounded-full"
                      style={{
                        backgroundColor: 'var(--color-muted)',
                        animationDelay: `${i * 150}ms`,
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Input bar */}
      <div
        className="shrink-0 px-4 py-3"
        style={{ borderTop: '1px solid var(--color-border)' }}
      >
        {!apiKey ? (
          <p className="text-center text-sm" style={{ color: 'var(--color-muted)' }}>
            Introduce tu API key para chatear.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading}
              placeholder="Escribe tu pregunta fiscal..."
              className="flex-1 rounded-[10px] px-3 text-sm outline-none focus:shadow-[0_0_0_2px_var(--color-accent)] disabled:opacity-50"
              style={{
                height: '44px',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text)',
                backgroundColor: 'var(--color-surface)',
                fontFamily: 'var(--font-body)',
              }}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="shrink-0 rounded-[10px] px-5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-40"
              style={{
                height: '44px',
                backgroundColor: 'var(--color-accent)',
                fontFamily: 'var(--font-body)',
              }}
            >
              Enviar
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
