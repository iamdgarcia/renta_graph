'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { FileTree } from '@/components/FileTree'
import { ArticleViewer } from '@/components/ArticleViewer'
import { ChatPanel } from '@/components/ChatPanel'
import { TopNav } from '@/components/TopNav'
import { ApiKeyModal } from '@/components/ApiKeyModal'
import { DemoModal } from '@/components/DemoModal'

export default function Home() {
  const [apiKey, setApiKey] = useState<string | null>(null)
  const [showDemo, setShowDemo] = useState(false)
  const [files, setFiles] = useState<string[]>([])
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
      .then((data: string[]) => setFiles(data))
      .catch(() => setFiles([]))
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
      setArticleContent(await res.text())
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        setActiveFile(null)
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

  // Citations arrive as article names without .md; resolve against the file list
  const handleCitationClick = useCallback((articleName: string) => {
    const filename =
      files.find((f) => f.replace(/\.md$/, '') === articleName) ??
      `${articleName}.md`
    handleFileSelect(filename)
  }, [files, handleFileSelect])

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
