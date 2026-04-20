import { CATEGORY_ORDER } from './constants'

type WikiLikeFile = {
  name: string
  category: string
}

export type GroupedFiles = Array<[string, WikiLikeFile[]]>

export function getActiveCategory(files: WikiLikeFile[], activeFile: string | null): string | null {
  if (!activeFile) return null
  return files.find((file) => file.name === activeFile)?.category ?? null
}

export function getBaseOpenCategories(openCats: Set<string>, activeCategory: string | null): Set<string> {
  if (!activeCategory || openCats.has(activeCategory)) return openCats
  const next = new Set(openCats)
  next.add(activeCategory)
  return next
}

export function groupFilesByCategory(files: WikiLikeFile[], search: string): GroupedFiles {
  const query = search.toLowerCase()
  const filteredFiles = query
    ? files.filter((file) => file.name.toLowerCase().includes(query))
    : files

  const groupedMap = new Map<string, WikiLikeFile[]>()
  for (const file of filteredFiles) {
    if (!groupedMap.has(file.category)) groupedMap.set(file.category, [])
    groupedMap.get(file.category)!.push(file)
  }

  const orderedGroups: GroupedFiles = []
  for (const category of CATEGORY_ORDER) {
    if (groupedMap.has(category)) {
      orderedGroups.push([category, groupedMap.get(category)!])
    }
  }

  for (const [category, categoryFiles] of groupedMap) {
    if (!CATEGORY_ORDER.includes(category)) {
      orderedGroups.push([category, categoryFiles])
    }
  }

  return orderedGroups
}

export function getEffectiveOpenCategories(
  search: string,
  grouped: GroupedFiles,
  baseOpenCats: Set<string>,
): Set<string> {
  if (!search) return baseOpenCats
  return new Set(grouped.map(([category]) => category))
}
