import path from 'path'
import { promises as fs } from 'fs'

const WIKI_DIR = path.join(process.cwd(), 'content', 'wiki')

function normalizeSearchText(input: string): string {
  return input
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[_-]+/g, ' ')
    .replace(/[^a-z0-9ñç\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function tokenize(input: string): string[] {
  return normalizeSearchText(input)
    .split(' ')
    .filter((word) => word.length >= 3)
}

// Block path traversal: no slashes, backslashes, null bytes, or ".." sequences
function isSafeFilename(name: string): boolean {
  if (!name || name.length > 300) return false
  if (/[/\\]/.test(name)) return false     // no path separators
  if (/\0/.test(name)) return false         // no null bytes
  if (/\.\./.test(name)) return false       // no parent traversal
  return true
}

export interface WikiFileMeta {
  name: string
  category: string
}

export interface WikiSearchResult {
  filename: string
  category: string
  title: string
  snippet: string
  score: number
}

interface WikiSearchEntry {
  filename: string
  filenameNormalized: string
  category: string
  title: string
  titleNormalized: string
  tags: string[]
  tagsNormalized: string
  content: string
  contentNormalized: string
}

let _metaCache: WikiFileMeta[] | null = null
let _searchCache: WikiSearchEntry[] | null = null
let _filenameMapCache: Map<string, string> | null = null

function stripFrontmatter(content: string): string {
  if (!content.startsWith('---\n')) return content
  const end = content.indexOf('\n---\n', 4)
  if (end < 0) return content
  return content.slice(end + 5)
}

function extractFrontmatterValue(content: string, key: string): string | null {
  const re = new RegExp(`^${key}:\\s*(.+)$`, 'm')
  return content.match(re)?.[1]?.trim() ?? null
}

function extractTitle(content: string, fallbackName: string): string {
  const fromFrontmatter = extractFrontmatterValue(content, 'title')
  if (fromFrontmatter) return fromFrontmatter.replace(/^['"]|['"]$/g, '')
  const heading = content.match(/^#\s+(.+)$/m)?.[1]?.trim()
  return heading ?? fallbackName
}
const AUTONOMIA_RULES: Array<{ category: string; terms: string[] }> = [
  { category: 'autonomica-andalucia', terms: ['andalucia'] },
  { category: 'autonomica-aragon', terms: ['aragon'] },
  { category: 'autonomica-asturias', terms: ['asturias', 'principado'] },
  { category: 'autonomica-illes-balears', terms: ['illes balears', 'balears', 'baleares'] },
  { category: 'autonomica-canarias', terms: ['canarias'] },
  { category: 'autonomica-cantabria', terms: ['cantabria'] },
  { category: 'autonomica-castilla-la-mancha', terms: ['castilla la mancha'] },
  { category: 'autonomica-castilla-y-leon', terms: ['castilla y leon'] },
  { category: 'autonomica-cataluna', terms: ['cataluna', 'catalunya'] },
  { category: 'autonomica-extremadura', terms: ['extremadura'] },
  { category: 'autonomica-galicia', terms: ['galicia'] },
  { category: 'autonomica-la-rioja', terms: ['la rioja', 'rioja'] },
  { category: 'autonomica-madrid', terms: ['madrid'] },
  { category: 'autonomica-murcia', terms: ['murcia'] },
  {
    category: 'autonomica-comunitat-valenciana',
    terms: ['comunitat valenciana', 'valenciana', 'valencia'],
  },
  { category: 'autonomica-navarra', terms: ['navarra'] },
  { category: 'autonomica-pais-vasco', terms: ['pais vasco', 'euskadi'] },
]

function extractTags(content: string): string[] {
  const lines = content.split('\n')
  const tags: string[] = []
  let inTags = false

  for (const line of lines) {
    if (!inTags && /^tags:\s*$/.test(line)) {
      inTags = true
      continue
    }

    if (inTags) {
      const tagMatch = line.match(/^\s*-\s*(.+)\s*$/)
      if (tagMatch) {
        tags.push(tagMatch[1].replace(/^['"]|['"]$/g, '').trim())
        continue
      }
      break
    }
  }

  return tags
}

function normalizeCategoryValue(value: string | null): string | null {
  if (!value) return null
  const cleaned = value.trim().replace(/^['"]|['"]$/g, '')
  return cleaned.length > 0 ? cleaned : null
}

function inferCategoryFromContent(name: string, content: string): string {
  const haystack = normalizeSearchText(`${name}\n${content}`)

  for (const rule of AUTONOMIA_RULES) {
    if (rule.terms.some((term) => haystack.includes(term))) {
      return rule.category
    }
  }

  if (haystack.includes('autonomica') || haystack.includes('comunidad autonoma')) {
    return 'autonomica'
  }

  return 'sin_categoría'
}

function resolveWikiCategory(rawCategory: string | null, name: string, content: string): string {
  const explicit = normalizeCategoryValue(rawCategory)
  const inferred = inferCategoryFromContent(name, content)

  if (!explicit) {
    return inferred
  }

  // Region-specific inference always wins over generic buckets
  if (inferred.startsWith('autonomica-')) {
    return inferred
  }

  return explicit
}

async function getWikiFilenames(): Promise<string[]> {
  const entries = await fs.readdir(WIKI_DIR)
  return entries
    .filter((file) => file.endsWith('.md') && file !== 'index.md')
    .map((file) => file.replace(/\.md$/, ''))
    .sort()
}

async function getFilenameMap(): Promise<Map<string, string>> {
  if (_filenameMapCache) return _filenameMapCache

  const map = new Map<string, string>()
  const filenames = await getWikiFilenames()

  for (const filename of filenames) {
    const variants = [
      filename,
      filename.replace(/_/g, ' '),
      filename.replace(/\s+/g, '_'),
      filename.replace(/-_/g, ': '),
      filename.replace(/: /g, '-_'),
    ]

    for (const variant of variants) {
      map.set(normalizeSearchText(variant), filename)
    }
  }

  _filenameMapCache = map
  return map
}

export async function resolveWikiFilename(input: string): Promise<string | null> {
  if (!input) return null

  const normalized = normalizeSearchText(input)
  const map = await getFilenameMap()
  const direct = map.get(normalized)
  if (direct) return direct

  const candidates = await getWikiFilenames()
  const ranked = candidates
    .map((filename) => {
      const normalizedFilename = normalizeSearchText(filename)
      const isPrefix = normalizedFilename.startsWith(normalized)
      const isContains = normalizedFilename.includes(normalized)
      const reverseContains = normalized.includes(normalizedFilename)
      let score = 0
      if (isPrefix) score += 3
      if (isContains) score += 2
      if (reverseContains) score += 1
      return { filename, score }
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)

  return ranked[0]?.filename ?? null
}

async function getSearchIndex(): Promise<WikiSearchEntry[]> {
  if (_searchCache) return _searchCache

  const filenames = await getWikiFilenames()
  const entries = await Promise.all(
    filenames.map(async (filename) => {
      const filePath = path.join(WIKI_DIR, `${filename}.md`)
      const content = await fs.readFile(filePath, 'utf-8')
      const title = extractTitle(content, filename)
      const category = resolveWikiCategory(
        extractFrontmatterValue(content, 'category'),
        filename,
        content,
      )
      const tags = extractTags(content)
      const plainContent = stripFrontmatter(content)

      return {
        filename,
        filenameNormalized: normalizeSearchText(filename),
        category,
        title,
        titleNormalized: normalizeSearchText(title),
        tags,
        tagsNormalized: normalizeSearchText(tags.join(' ')),
        content,
        contentNormalized: normalizeSearchText(plainContent),
      }
    }),
  )

  _searchCache = entries
  return entries
}

export async function searchWikiPages(query: string, limit = 8): Promise<WikiSearchResult[]> {
  const terms = tokenize(query)
  if (!terms.length) return []

  const index = await getSearchIndex()
  const results = index
    .map((entry) => {
      let score = 0

      for (const term of terms) {
        if (entry.filenameNormalized.includes(term)) score += 5
        if (entry.titleNormalized.includes(term)) score += 6
        if (entry.tagsNormalized.includes(term)) score += 4
        if (entry.contentNormalized.includes(term)) score += 1
      }

      if (!score) return null

      const snippetSource = stripFrontmatter(entry.content)
        .replace(/\s+/g, ' ')
        .trim()
      const snippet = snippetSource.slice(0, 380)

      return {
        filename: entry.filename,
        title: entry.title,
        category: entry.category,
        snippet,
        score,
      }
    })
    .filter((item): item is WikiSearchResult => item !== null)
    .sort((a, b) => b.score - a.score)
    .slice(0, Math.max(1, Math.min(limit, 20)))

  return results
}

export async function listWikiFilesWithMeta(): Promise<WikiFileMeta[]> {
  if (_metaCache) return _metaCache

  const entries = await fs.readdir(WIKI_DIR)
  const markdownFiles = entries
    .filter(f => f.endsWith('.md') && f !== 'index.md')
    .sort()

  const meta = await Promise.all(
    markdownFiles.map(async (filename) => {
      const name = filename.replace(/\.md$/, '')
      try {
        // Read only first 512 bytes — enough to cover YAML frontmatter
        const fileHandle = await fs.open(path.join(WIKI_DIR, filename), 'r')
        const buffer = Buffer.alloc(512)
        const { bytesRead } = await fileHandle.read(buffer, 0, 512, 0)
        await fileHandle.close()
        const snippet = buffer.subarray(0, bytesRead).toString('utf-8')
        const catMatch = snippet.match(/^category:\s*(.+)$/m)
        const category = resolveWikiCategory(catMatch?.[1] ?? null, name, snippet)
        return { name, category }
      } catch {
        return { name, category: inferCategoryFromContent(name, '') }
      }
    })
  )

  _metaCache = meta
  return meta
}

export async function listWikiFiles(): Promise<string[]> {
  return getWikiFilenames()
}

export async function readWikiPage(filename: string): Promise<string> {
  if (!isSafeFilename(filename)) {
    throw new Error(`Invalid wiki filename: ${filename}`)
  }

  const resolved = await resolveWikiFilename(filename)
  const candidates = Array.from(
    new Set([
      filename,
      filename.replace(/ /g, '_'),
      filename.replace(/_/g, ' '),
      filename.replace(/: /g, '-_'),
      filename.replace(/-_/g, ': '),
      ...(resolved ? [resolved] : []),
    ]),
  )

  for (const candidate of candidates) {
    const filePath = path.join(WIKI_DIR, candidate + '.md')
    const resolved = path.resolve(filePath)
    if (!resolved.startsWith(path.resolve(WIKI_DIR) + path.sep)) continue
    try {
      return await fs.readFile(filePath, 'utf-8')
    } catch {
      // try next candidate
    }
  }

  throw new Error(`Article "${filename}" not found in the wiki.`)
}

export async function readWikiIndex(): Promise<string> {
  return fs.readFile(path.join(WIKI_DIR, 'index.md'), 'utf-8')
}
