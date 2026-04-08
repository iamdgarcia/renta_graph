'use client'

import { useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'

interface ApiKeyModalProps {
  open: boolean
  onKeySubmit: (key: string) => void
}

export function ApiKeyModal({ open, onKeySubmit }: ApiKeyModalProps) {
  const [key, setKey] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = key.trim()
    if (!trimmed) return
    onKeySubmit(trimmed)
  }

  return (
    <Dialog.Root open={open}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-6 shadow-xl focus:outline-none">
          <Dialog.Title className="mb-1 text-lg font-semibold text-gray-900">
            Introduce tu API Key
          </Dialog.Title>
          <Dialog.Description className="mb-4 text-sm text-gray-600">
            Tu clave se guarda únicamente en tu navegador (localStorage) y nunca se envía a nuestros servidores.
          </Dialog.Description>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input
              type="password"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="sk-..."
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              autoComplete="off"
            />

            <button
              type="submit"
              disabled={!key.trim()}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Guardar clave
            </button>
          </form>

          <p className="mt-4 text-xs text-gray-500">
            Obtén tu clave en:{' '}
            <a
              href="https://platform.openai.com/api-keys"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-gray-700"
            >
              OpenAI
            </a>{' '}
            ·{' '}
            <a
              href="https://console.anthropic.com/settings/keys"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-gray-700"
            >
              Anthropic
            </a>
          </p>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
