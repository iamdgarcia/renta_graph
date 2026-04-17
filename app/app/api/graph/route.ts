import { NextRequest } from 'next/server'
import { loadGraph, findNodes, bfsSubgraph, shortestPath } from '@/lib/graph'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const node = searchParams.get('node')
  const from = searchParams.get('from')
  const to = searchParams.get('to')
  const depthParam = searchParams.get('depth')
  const depth = depthParam ? Math.min(parseInt(depthParam, 10), 4) : 2

  try {
    const graph = await loadGraph()

    // GET /api/graph → full node + edge list
    if (!node && !from && !to) {
      return Response.json({
        nodes: graph.nodes,
        edges: graph.links,
      })
    }

    // GET /api/graph?from=X&to=Y → shortest path
    if (from && to) {
      const [fromNodes, toNodes] = [findNodes(graph, from, 1), findNodes(graph, to, 1)]
      if (!fromNodes.length || !toNodes.length) {
        return Response.json({ error: 'One or both nodes not found' }, { status: 404 })
      }
      const result = shortestPath(graph, fromNodes[0].id, toNodes[0].id)
      if (!result) {
        return Response.json({ error: 'No path found' }, { status: 404 })
      }
      return Response.json(result)
    }

    // GET /api/graph?node=X&depth=N → BFS neighbourhood
    if (node) {
      const starts = findNodes(graph, node, 1)
      if (!starts.length) {
        return Response.json({ error: 'Node not found' }, { status: 404 })
      }
      const subgraph = bfsSubgraph(graph, [starts[0].id], depth)
      return Response.json({ center: starts[0], ...subgraph })
    }

    return Response.json({ error: 'Invalid query' }, { status: 400 })
  } catch (err) {
    console.error('[/api/graph]', err)
    return Response.json({ error: 'Internal error' }, { status: 500 })
  }
}
