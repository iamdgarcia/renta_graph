'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { FileTree, type WikiFileMeta } from '@/components/FileTree'
import { ArticleViewer } from '@/components/ArticleViewer'
import { ChatPanel } from '@/components/ChatPanel'
import { TopNav } from '@/components/TopNav'
import { ApiKeyModal } from '@/components/ApiKeyModal'
import { DemoModal } from '@/components/DemoModal'

export default function Home() {
  const [apiKey, setApiKey] = useState<string | null>(null)
  const [showDemo, setShowDemo] = useState(false)
  const [files, setFiles] = useState<WikiFileMeta[]>([])
  const [nodeMap, setNodeMap] = useState<Record<string, string | null>>({})
  const [activeFile, setActiveFile] = useState<string | null>(null)
  const [articleContent, setArticleContent] = useState<string | null>(null)
  const [articleLoading, setArticleLoading] = useState(false)
  const fetchAbortRef = useRef<AbortController | null>(null)

  // Read API key from localStorage after mount (avoids SSR mismatch)
  useEffect(() => {
    setApiKey(localStorage.getItem('renta_api_key'))
  }, [])

  // Load wiki file list
  useEffect(() => {
    fetch('/api/wiki')
      .then((r) => r.json())
      .then((data: WikiFileMeta[]) => setFiles(data))
      .catch(() => setFiles([]))
  }, [])

  // Load pre-built node→article mapping (independent — failure must not affect file list)
  useEffect(() => {
    fetch('/node-to-article.json')
      .then((r) => r.json())
      .then((data: Record<string, string | null>) => setNodeMap(data))
      .catch(() => {/* mapping unavailable — silently skip */})
  }, [])

  const handleFileSelect = useCallback(async (filename: string) => {
    fetchAbortRef.current?.abort()
    const controller = new AbortController()
    fetchAbortRef.current = controller

    setActiveFile(filename)
    setArticleLoading(true)
    setArticleContent(null)
    try {
      const res = await fetch(`/api/wiki?file=${encodeURIComponent(filename)}`, {
        signal: controller.signal,
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      setArticleContent(await res.text())
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        setActiveFile(null)
        setArticleContent(null)
      }
    } finally {
      setArticleLoading(false)
    }
  }, [])

  const handleCloseArticle = useCallback(() => {
    fetchAbortRef.current?.abort()
    setActiveFile(null)
    setArticleContent(null)
    setArticleLoading(false)
  }, [])

  const handleKeySubmit = useCallback((key: string) => {
    localStorage.setItem('renta_api_key', key)
    setApiKey(key)
  }, [])

  const handleRemoveKey = useCallback(() => {
    localStorage.removeItem('renta_api_key')
    setApiKey(null)
  }, [])

  // Resolve a node label or [[citation]] to a wiki filename.
  // Priority: pre-built node map → normalize match → skip if null.
  const handleCitationClick = useCallback((articleName: string) => {
    // 1. Pre-built map (covers graph nodes with special chars and prefix expansions)
    if (Object.prototype.hasOwnProperty.call(nodeMap, articleName)) {
      const mapped = nodeMap[articleName]
      if (mapped) handleFileSelect(mapped)
      return  // null means no article exists for this graph node
    }

    // 2. Normalize match: underscores↔spaces, case-insensitive (for [[wikilink]] citations)
    const normalize = (s: string) => s.replace(/\.md$/, '').replace(/_/g, ' ').toLowerCase()
    const needle = normalize(articleName)
    const entry = files.find((f) => normalize(f.name) === needle)
    if (entry) handleFileSelect(entry.name)
    // If still no match, silently skip — no "Bad request" shown to user
  }, [nodeMap, files, handleFileSelect])

  return (
    <div
      className="flex h-full flex-col overflow-hidden"
      style={{ backgroundColor: 'var(--color-bg)' }}
    >
      <TopNav
        apiKey={apiKey}
        onRemoveKey={handleRemoveKey}
        onShowDemo={() => setShowDemo(true)}
      />

      <div className="flex flex-1 overflow-hidden">
        <FileTree
          files={files}
          activeFile={activeFile}
          onFileSelect={handleFileSelect}
          onNodeClick={handleCitationClick}
        />
        <ArticleViewer
          file={activeFile}
          content={articleContent}
          loading={articleLoading}
          onClose={handleCloseArticle}
        />
        <ChatPanel
          apiKey={apiKey}
          onCitationClick={handleCitationClick}
        />
      </div>

      <ApiKeyModal
        open={!apiKey && !showDemo}
        onKeySubmit={handleKeySubmit}
        onShowDemo={() => setShowDemo(true)}
      />
      <DemoModal open={showDemo} onClose={() => setShowDemo(false)} />
    </div>
  )
}
