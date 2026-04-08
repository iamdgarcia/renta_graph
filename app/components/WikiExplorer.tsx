'use client'

import { forwardRef, useEffect, useImperativeHandle, useState } from 'react'
import ReactMarkdown from 'react-markdown'

export type WikiExplorerHandle = {
  openFile: (filename: string) => void
}

const WikiExplorer = forwardRef<WikiExplorerHandle, object>((_props, ref) => {
  const [files, setFiles] = useState<string[]>([])
  const [activeFile, setActiveFile] = useState<string | null>(null)
  const [content, setContent] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch('/api/wiki')
      .then((res) => res.json())
      .then((data: string[]) => setFiles(data))
      .catch(() => setFiles([]))
  }, [])

  const openFile = async (filename: string) => {
    setActiveFile(filename)
    setLoading(true)
    setContent(null)
    const res = await fetch(`/api/wiki?file=${encodeURIComponent(filename)}`)
    const text = await res.text()
    setContent(text)
    setLoading(false)
  }

  useImperativeHandle(ref, () => ({ openFile }))

  return (
    <div className="flex h-full overflow-hidden">
      {/* Left: file list */}
      <div className="w-56 shrink-0 border-r overflow-y-auto p-2 space-y-1">
        {files.map((f) => (
          <button
            key={f}
            onClick={() => openFile(f)}
            className={`w-full text-left px-3 py-1.5 rounded text-sm truncate ${
              activeFile === f
                ? 'bg-blue-100 text-blue-700 font-medium'
                : 'hover:bg-gray-100 text-gray-700'
            }`}
          >
            {f}
          </button>
        ))}
      </div>
      {/* Right: content */}
      <div className="flex-1 overflow-y-auto p-4 prose prose-sm max-w-none">
        {loading && <p className="text-gray-400 text-sm">Cargando...</p>}
        {content && <ReactMarkdown>{content}</ReactMarkdown>}
        {!loading && !content && (
          <p className="text-gray-400 text-sm italic">Selecciona un artículo del índice.</p>
        )}
      </div>
    </div>
  )
})

WikiExplorer.displayName = 'WikiExplorer'
export default WikiExplorer
