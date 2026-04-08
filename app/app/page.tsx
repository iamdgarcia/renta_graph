'use client'
import { useState, useRef, useCallback } from 'react'
import WikiExplorer, { WikiExplorerHandle } from '@/components/WikiExplorer'
import { ChatPanel } from '@/components/ChatPanel'
import { ApiKeyModal } from '@/components/ApiKeyModal'
import { DemoModal } from '@/components/DemoModal'

export default function Home() {
  const [apiKey, setApiKey] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('renta_api_key')
    }
    return null
  })
  const [showDemo, setShowDemo] = useState(false)
  const wikiRef = useRef<WikiExplorerHandle>(null)

  const handleKeySubmit = useCallback((key: string) => {
    localStorage.setItem('renta_api_key', key)
    setApiKey(key)
  }, [])

  const handleCitationClick = useCallback((filename: string) => {
    wikiRef.current?.openFile(filename)
  }, [])

  return (
    <div className="flex h-full overflow-hidden">
      {/* Left pane: Wiki Explorer (40%) */}
      <div className="w-2/5 border-r flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2 border-b bg-gray-50">
          <h2 className="text-sm font-semibold text-gray-700">Wiki Fiscal</h2>
          <button
            onClick={() => setShowDemo(true)}
            className="text-xs text-blue-600 hover:underline"
          >
            Ver consultas demo
          </button>
        </div>
        <div className="flex-1 overflow-hidden">
          <WikiExplorer ref={wikiRef} />
        </div>
      </div>

      {/* Right pane: Chat (60%) */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="px-4 py-2 border-b bg-gray-50">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-700">Agente IRPF</h2>
            {apiKey && (
              <button
                onClick={() => {
                  localStorage.removeItem('renta_api_key')
                  setApiKey(null)
                }}
                className="text-xs text-gray-400 hover:text-red-500"
              >
                Eliminar API key
              </button>
            )}
          </div>
        </div>
        <div className="flex-1 overflow-hidden">
          <ChatPanel apiKey={apiKey} onCitationClick={handleCitationClick} />
        </div>
      </div>

      {/* Modals */}
      <ApiKeyModal open={!apiKey} onKeySubmit={handleKeySubmit} />
      <DemoModal open={showDemo} onClose={() => setShowDemo(false)} />
    </div>
  )
}
