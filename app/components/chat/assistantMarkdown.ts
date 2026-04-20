export function citationMarkdown(text: string): string {
  return text.replace(/\[\[([^\]]+)\]\]/g, (_, citation: string) => {
    const safeCitation = citation.trim()
    const encoded = encodeURIComponent(safeCitation)
    return `[${safeCitation}](cite://${encoded})`
  })
}

export function normalizeAssistantMarkdown(text: string): string {
  return text
    .replace(/\s+(#{1,6}\s)/g, '\n\n$1')
    .replace(/\s+(\d+\.\s\*\*)/g, '\n$1')
    .replace(/\s+(-\s\*\*)/g, '\n$1')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}