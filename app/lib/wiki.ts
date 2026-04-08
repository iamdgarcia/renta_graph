import path from 'path'
import { promises as fs } from 'fs'

const WIKI_DIR = path.join(process.cwd(), 'content', 'wiki')

// Regex: only allow safe characters in filenames (Spanish letters OK, no path separators)
const SAFE_FILENAME_RE = /^[A-Za-z0-9_\-áéíóúñÁÉÍÓÚÑüÜ ]+$/

export async function listWikiFiles(): Promise<string[]> {
  const entries = await fs.readdir(WIKI_DIR)
  return entries
    .filter(f => f.endsWith('.md') && f !== 'index.md')
    .map(f => f.replace(/\.md$/, ''))
    .sort()
}

export async function readWikiPage(filename: string): Promise<string> {
  if (!SAFE_FILENAME_RE.test(filename)) {
    throw new Error(`Invalid wiki filename: ${filename}`)
  }
  const filePath = path.join(WIKI_DIR, filename + '.md')
  return fs.readFile(filePath, 'utf-8')
}

export async function readWikiIndex(): Promise<string> {
  return fs.readFile(path.join(WIKI_DIR, 'index.md'), 'utf-8')
}
