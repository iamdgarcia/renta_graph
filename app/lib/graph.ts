import path from 'path'
import { promises as fs } from 'fs'

const GRAPH_PATH = path.join(process.cwd(), 'content', 'graph.json')

export interface GraphNode {
  id: string
  label: string
  file_type: string
  source_file: string
  source_location: string | null
  community: number | null
}

export interface GraphEdge {
  source: string
  target: string
  relation: string
  confidence: string
  confidence_score: number
}

export interface GraphData {
  nodes: GraphNode[]
  links: GraphEdge[]
}

let _cached: GraphData | null = null

export async function loadGraph(): Promise<GraphData> {
  if (_cached) return _cached
  const raw = await fs.readFile(GRAPH_PATH, 'utf-8')
  _cached = JSON.parse(raw) as GraphData
  return _cached
}

/** Find up to `limit` nodes whose label best matches the search terms. */
export function findNodes(graph: GraphData, query: string, limit = 3): GraphNode[] {
  const terms = query
    .toLowerCase()
    .split(/\s+/)
    .filter((t) => t.length > 2)

  return graph.nodes
    .map((n) => {
      const label = n.label.toLowerCase()
      const score = terms.reduce((s, t) => s + (label.includes(t) ? 1 : 0), 0)
      return { node: n, score }
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ node }) => node)
}

/** BFS up to `depth` hops from `startIds`. Returns reachable nodes + edges. */
export function bfsSubgraph(
  graph: GraphData,
  startIds: string[],
  depth = 2,
): { nodes: GraphNode[]; edges: GraphEdge[] } {
  const nodeMap = new Map(graph.nodes.map((n) => [n.id, n]))
  const adjOut = new Map<string, { neighbor: string; edge: GraphEdge }[]>()

  for (const e of graph.links) {
    if (!adjOut.has(e.source)) adjOut.set(e.source, [])
    adjOut.get(e.source)!.push({ neighbor: e.target, edge: e })
    // undirected — also add reverse
    if (!adjOut.has(e.target)) adjOut.set(e.target, [])
    adjOut.get(e.target)!.push({ neighbor: e.source, edge: e })
  }

  const visited = new Set<string>(startIds)
  const resultEdges: GraphEdge[] = []
  let frontier = new Set<string>(startIds)

  for (let d = 0; d < depth; d++) {
    const next = new Set<string>()
    for (const nid of frontier) {
      for (const { neighbor, edge } of adjOut.get(nid) ?? []) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor)
          next.add(neighbor)
        }
        if (!resultEdges.some((e) => e.source === edge.source && e.target === edge.target)) {
          resultEdges.push(edge)
        }
      }
    }
    frontier = next
  }

  const resultNodes = [...visited]
    .map((id) => nodeMap.get(id))
    .filter(Boolean) as GraphNode[]

  return { nodes: resultNodes, edges: resultEdges }
}

/** Shortest path (BFS) between two node IDs. Returns ordered node list or null. */
export function shortestPath(
  graph: GraphData,
  fromId: string,
  toId: string,
): { nodes: GraphNode[]; edges: GraphEdge[] } | null {
  if (fromId === toId) return null

  const nodeMap = new Map(graph.nodes.map((n) => [n.id, n]))
  const adjOut = new Map<string, { neighbor: string; edge: GraphEdge }[]>()

  for (const e of graph.links) {
    if (!adjOut.has(e.source)) adjOut.set(e.source, [])
    adjOut.get(e.source)!.push({ neighbor: e.target, edge: e })
    if (!adjOut.has(e.target)) adjOut.set(e.target, [])
    adjOut.get(e.target)!.push({ neighbor: e.source, edge: e })
  }

  const prev = new Map<string, { from: string; edge: GraphEdge }>()
  const visited = new Set([fromId])
  const queue = [fromId]

  while (queue.length > 0) {
    const cur = queue.shift()!
    if (cur === toId) break
    for (const { neighbor, edge } of adjOut.get(cur) ?? []) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor)
        prev.set(neighbor, { from: cur, edge })
        queue.push(neighbor)
      }
    }
  }

  if (!prev.has(toId)) return null

  const pathNodes: GraphNode[] = []
  const pathEdges: GraphEdge[] = []
  let cur = toId

  while (cur !== fromId) {
    const entry = prev.get(cur)!
    pathNodes.unshift(nodeMap.get(cur)!)
    pathEdges.unshift(entry.edge)
    cur = entry.from
  }
  pathNodes.unshift(nodeMap.get(fromId)!)

  return { nodes: pathNodes, edges: pathEdges }
}

/** DFS up to `maxDepth` hops from `startIds`. Returns visited nodes + traversed edges. */
export function dfsSubgraph(
  graph: GraphData,
  startIds: string[],
  maxDepth = 6,
): { nodes: GraphNode[]; edges: GraphEdge[] } {
  const nodeMap = new Map(graph.nodes.map((n) => [n.id, n]))
  const adj = new Map<string, { neighbor: string; edge: GraphEdge }[]>()

  for (const e of graph.links) {
    if (!adj.has(e.source)) adj.set(e.source, [])
    adj.get(e.source)!.push({ neighbor: e.target, edge: e })
    if (!adj.has(e.target)) adj.set(e.target, [])
    adj.get(e.target)!.push({ neighbor: e.source, edge: e })
  }

  const visited = new Set<string>()
  const resultEdges: GraphEdge[] = []
  // Start stack reversed so first startId is explored first
  const stack: { id: string; depth: number }[] = [...startIds].reverse().map((id) => ({ id, depth: 0 }))

  while (stack.length > 0) {
    const { id: cur, depth } = stack.pop()!
    if (visited.has(cur) || depth > maxDepth) continue
    visited.add(cur)
    for (const { neighbor, edge } of adj.get(cur) ?? []) {
      if (!visited.has(neighbor)) {
        stack.push({ id: neighbor, depth: depth + 1 })
        if (!resultEdges.some((e) => e.source === edge.source && e.target === edge.target)) {
          resultEdges.push(edge)
        }
      }
    }
  }

  const resultNodes = [...visited].map((id) => nodeMap.get(id)).filter(Boolean) as GraphNode[]
  return { nodes: resultNodes, edges: resultEdges }
}

/** Format a subgraph as compact text for the LLM.
 *  Nodes are ranked by relevance to `queryTerms` when provided.
 *  Output is truncated at `charBudget` characters (default 8 000). */
export function formatSubgraphForLLM(
  nodes: GraphNode[],
  edges: GraphEdge[],
  options?: { queryTerms?: string[]; charBudget?: number },
): string {
  const { queryTerms = [], charBudget = 8000 } = options ?? {}

  const rankedNodes =
    queryTerms.length > 0
      ? [...nodes].sort((a, b) => {
          const score = (n: GraphNode) =>
            queryTerms.reduce((s, t) => s + (n.label.toLowerCase().includes(t) ? 1 : 0), 0)
          return score(b) - score(a)
        })
      : nodes

  const lines: string[] = []
  for (const n of rankedNodes) {
    const loc = n.source_location ? ` [${n.source_location}]` : ''
    lines.push(`NODE: ${n.label}${loc}`)
  }
  for (const e of edges) {
    const from = nodes.find((n) => n.id === e.source)?.label ?? e.source
    const to = nodes.find((n) => n.id === e.target)?.label ?? e.target
    lines.push(`EDGE: ${from} --${e.relation} [${e.confidence}]--> ${to}`)
  }

  const output = lines.join('\n')
  if (output.length > charBudget) {
    return output.slice(0, charBudget) + `\n... (truncado — límite de ${charBudget} chars)`
  }
  return output
}
