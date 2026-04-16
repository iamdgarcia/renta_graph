'use client'

import { useState, useEffect, useRef } from 'react'

type TopNavProps = {
  apiKey: string | null
  onRemoveKey: () => void
  onShowDemo: () => void
}

export function TopNav({ apiKey, onRemoveKey, onShowDemo }: TopNavProps) {
  const [isAboutOpen, setIsAboutOpen] = useState(false)
  const aboutRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isAboutOpen) return
    function handleClickOutside(e: MouseEvent) {
      if (aboutRef.current && !aboutRef.current.contains(e.target as Node)) {
        setIsAboutOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isAboutOpen])

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
          type="button"
          onClick={onShowDemo}
          className="text-sm transition-opacity hover:opacity-70"
          style={{ color: 'var(--color-accent)' }}
        >
          Ver consultas demo
        </button>

        <div ref={aboutRef} className="relative">
          <button
            type="button"
            onClick={() => setIsAboutOpen((o) => !o)}
            className="text-xs transition-opacity hover:opacity-70"
            style={{ color: 'var(--color-muted)' }}
          >
            Built by Daniel García
          </button>
          {isAboutOpen && (
            <div
              className="absolute right-0 top-8 z-50 w-56 p-4"
              style={{
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: '12px',
                boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
              }}
            >
              <p
                className="text-sm font-medium"
                style={{ color: 'var(--color-text)' }}
              >
                Daniel García Peña
              </p>
              <p
                className="mt-0.5 text-xs"
                style={{ color: 'var(--color-muted)' }}
              >
                AI engineer & writer
              </p>
              <a
                href="https://iamdgarcia.substack.com/subscribe"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 flex items-center justify-center rounded-lg px-3 py-1.5 text-xs font-medium transition-opacity hover:opacity-80"
                style={{
                  backgroundColor: 'var(--color-accent)',
                  color: '#ffffff',
                }}
              >
                Subscribe on Substack →
              </a>
            </div>
          )}
        </div>

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
              type="button"
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
