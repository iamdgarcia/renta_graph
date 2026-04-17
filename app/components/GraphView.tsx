'use client'

import { useEffect, useRef } from 'react'

type Props = {
  onNodeClick: (label: string) => void
  activeFile: string | null
}

export function GraphView({ onNodeClick, activeFile }: Props) {
  const iframeRef = useRef<HTMLIFrameElement>(null)

  // Receive node-click events from the iframe
  useEffect(() => {
    function handleMessage(e: MessageEvent) {
      if (e.data?.type === 'nodeClick' && e.data?.label) {
        onNodeClick(e.data.label as string)
      }
    }
    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [onNodeClick])

  // Tell the iframe which node is active so it can highlight it
  useEffect(() => {
    const label = activeFile ? activeFile.replace(/\.md$/, '') : null
    iframeRef.current?.contentWindow?.postMessage({ type: 'setActive', label }, '*')
  }, [activeFile])

  return (
    <div className="relative flex-1 overflow-hidden" style={{ minHeight: 0 }}>
      <iframe
        ref={iframeRef}
        src="/graph-view.html"
        className="h-full w-full"
        style={{ border: 'none', display: 'block' }}
        title="Grafo de Conocimiento IRPF"
      />
    </div>
  )
}
