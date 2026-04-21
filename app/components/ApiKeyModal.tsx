'use client'

import { useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'

type Provider = 'openai' | 'anthropic'

const PLACEHOLDERS: Record<Provider, string> = {
  openai: 'sk-...',
  anthropic: 'sk-ant-...',
}

interface ApiKeyModalProps {
  open: boolean
  onKeySubmit: (key: string) => void
  onShowDemo: () => void
}

export function ApiKeyModal({ open, onKeySubmit, onShowDemo }: ApiKeyModalProps) {
  const [key, setKey] = useState('')
  const [provider, setProvider] = useState<Provider>('openai')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = key.trim()
    if (!trimmed) return
    onKeySubmit(trimmed)
  }

  return (
    <Dialog.Root open={open}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" />
        <Dialog.Content
          className="fixed left-1/2 top-1/2 z-50 w-full max-w-[440px] -translate-x-1/2 -translate-y-1/2 focus:outline-none"
          onEscapeKeyDown={(e) => e.preventDefault()}
          onPointerDownOutside={(e) => e.preventDefault()}
          onInteractOutside={(e) => e.preventDefault()}
          style={{
            backgroundColor: 'var(--color-surface)',
            borderRadius: '16px',
            padding: '32px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
          }}
        >
          {/* Lock icon */}
          <div className="mb-5 flex justify-center">
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ color: 'var(--color-accent)' }}
            >
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>

          <Dialog.Title
            className="mb-1 text-center text-[22px]"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text)' }}
          >
            Conecta tu API Key
          </Dialog.Title>
          <Dialog.Description
            className="mb-6 text-center text-[13px]"
            style={{ color: 'var(--color-muted)' }}
          >
            Tu clave se guarda solo en tu navegador. Nunca llega a nuestros servidores.
          </Dialog.Description>

          <p
            className="mb-5 text-center text-xs"
            style={{ color: 'var(--color-muted)' }}
          >
            Creado por{' '}
            <a
              href="https://github.com/iamdgarcia"
              target="_blank"
              rel="noreferrer"
              className="underline decoration-dotted underline-offset-4 transition-opacity hover:opacity-70"
              style={{ color: 'var(--color-accent)' }}
            >
              @iamdgarcia
            </a>{' '}
            ·{' '}
            <a
              href="https://github.com/iamdgarcia/renta_graph"
              target="_blank"
              rel="noreferrer"
              className="underline decoration-dotted underline-offset-4 transition-opacity hover:opacity-70"
              style={{ color: 'var(--color-accent)' }}
            >
              Ver repo
            </a>
          </p>

          {/* Provider selector */}
          <div className="mb-4 flex gap-2">
            {(['openai', 'anthropic'] as Provider[]).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setProvider(p)}
                className="flex-1 rounded-lg py-2 text-sm font-medium transition-colors"
                style={{
                  backgroundColor:
                    provider === p ? 'var(--color-accent)' : 'transparent',
                  color: provider === p ? '#ffffff' : 'var(--color-text)',
                  border:
                    provider === p
                      ? '1px solid transparent'
                      : '1px solid var(--color-border)',
                }}
              >
                {p === 'openai' ? 'OpenAI' : 'Anthropic'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <input
              type="password"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder={PLACEHOLDERS[provider]}
              autoComplete="off"
              className="w-full rounded-lg px-3 text-sm focus:outline-none"
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
              disabled={!key.trim()}
              className="w-full rounded-lg text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
              style={{
                height: '44px',
                backgroundColor: 'var(--color-accent)',
                fontFamily: 'var(--font-body)',
              }}
            >
              Guardar clave
            </button>
          </form>

          {/* Divider */}
          <div className="my-5 flex items-center gap-3">
            <div
              className="h-px flex-1"
              style={{ backgroundColor: 'var(--color-border)' }}
            />
            <span className="text-xs" style={{ color: 'var(--color-muted)' }}>
              o
            </span>
            <div
              className="h-px flex-1"
              style={{ backgroundColor: 'var(--color-border)' }}
            />
          </div>

          <button
            type="button"
            onClick={onShowDemo}
            className="w-full text-center text-sm transition-opacity hover:opacity-70"
            style={{ color: 'var(--color-accent)' }}
          >
            Ver demo sin clave →
          </button>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
