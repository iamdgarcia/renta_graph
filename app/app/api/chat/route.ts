import { NextRequest } from 'next/server'
import { streamText, tool, convertToModelMessages, UIMessage, stepCountIs } from 'ai'
import { createOpenAI } from '@ai-sdk/openai'
import { createAnthropic } from '@ai-sdk/anthropic'
import { z } from 'zod'
import { readWikiPage, searchWikiPages } from '@/lib/wiki'
import { loadGraph, findNodes, bfsSubgraph, dfsSubgraph, shortestPath, formatSubgraphForLLM } from '@/lib/graph'

export const runtime = 'nodejs'

type LangSmithClientLike = {
  createRun: (run: Record<string, unknown>) => Promise<void>
  updateRun: (runId: string, run: Record<string, unknown>) => Promise<void>
}

function getLatestUserText(messages: unknown[]): string {
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const message = messages[index] as {
      role?: string
      content?: unknown
      parts?: Array<{ type?: string; text?: string }>
    }

    if (message.role !== 'user') continue

    if (typeof message.content === 'string') {
      return message.content
    }

    if (Array.isArray(message.parts)) {
      const text = message.parts
        .filter((part) => part.type === 'text' && typeof part.text === 'string')
        .map((part) => part.text ?? '')
        .join(' ')
        .trim()

      if (text) return text
    }
  }

  return ''
}

function isRentalQuery(text: string): boolean {
  return /\balquiler\b|arrendamiento|arrendar|arrendatario|arrendador|vivienda habitual/i.test(text)
}

function hasRegionalDetail(text: string): boolean {
  return /andaluc|galicia|madrid|catalu|valenc|murcia|astur|cantab|aragon|navarra|país vasco|la rioja|canarias|extremadura|castilla|ceuta|melilla|balear|comunidad/i.test(text)
}

function hasAgeDetail(text: string): boolean {
  return /\b\d{2}\s*años\b|menor de|mayor de|joven|edad/i.test(text)
}

function hasContractDateDetail(text: string): boolean {
  return /20\d{2}|contrato|antes de|desde|prorrog|fecha/i.test(text)
}

function hasIncomeDetail(text: string): boolean {
  return /base imponible|ingresos|renta anual|tributación|individual|conjunta|euros|€/i.test(text)
}

function isLangSmithEnabled(): boolean {
  return (
    process.env.LANGSMITH_TRACING === 'true' &&
    !!process.env.LANGSMITH_API_KEY
  )
}

async function getLangSmithClient(): Promise<LangSmithClientLike | null> {
  if (!isLangSmithEnabled()) return null
  try {
    const langsmithModule = await import('langsmith')
    const ClientCtor = (langsmithModule as unknown as { Client: new (params: { apiKey?: string; apiUrl?: string }) => LangSmithClientLike }).Client
    return new ClientCtor({
      apiKey: process.env.LANGSMITH_API_KEY,
      apiUrl: process.env.LANGSMITH_ENDPOINT,
    })
  } catch {
    return null
  }
}

function getModel(apiKey: string) {
  if (apiKey.startsWith('sk-ant-')) {
    const anthropic = createAnthropic({ apiKey })
    return anthropic('claude-3-5-sonnet-20241022')
  }
  const openai = createOpenAI({ apiKey })
  return openai('gpt-4o')
}

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const apiKey = authHeader?.replace(/^Bearer\s+/i, '').trim()

  if (!apiKey) {
    return new Response('API key required', { status: 400 })
  }

  let body: { messages: unknown[] }
  try {
    body = await request.json()
  } catch {
    return new Response('Invalid JSON body', { status: 400 })
  }

  const graph = await loadGraph()
  const latestUserText = getLatestUserText(body.messages)
  const rentalQuery = isRentalQuery(latestUserText)
  const rentalMissingDetails = rentalQuery && (
    !hasRegionalDetail(latestUserText)
    || !hasAgeDetail(latestUserText)
    || !hasContractDateDetail(latestUserText)
    || !hasIncomeDetail(latestUserText)
  )

  const rentalPolicy = rentalQuery
    ? `

REGLAS ADICIONALES PARA CONSULTAS DE ALQUILER:
- Antes de recomendar deducciones aplicables a la persona usuaria, debes verificar datos clave: Comunidad Autónoma, edad, año/fecha del contrato de alquiler y nivel de ingresos/base imponible.
- Si faltan esos datos, NO des una recomendación personalizada cerrada: haz una pregunta breve pidiendo exactamente esos datos y, además, ofrece solo un resumen general de lo que sí aparece en la wiki.
- Para consultas de alquiler, debes leer al menos 1 artículo general y 1 artículo autonómico (si existen en la wiki) antes de responder.
- En la respuesta final separa claramente: "Lo confirmado en fuentes" y "Lo que depende de tu caso".
`
    : ''

  const systemPrompt = `Eres un experto en el sistema tributario español y la Declaración de la Renta.
Tienes acceso a una base de conocimiento (wiki) con artículos fiscales compilados por IA, y a un grafo de conocimiento con 181 conceptos fiscales y sus relaciones.

REGLA FUNDAMENTAL — SIN EXCEPCIONES:
Antes de escribir cualquier respuesta DEBES consultar la wiki usando search_wiki y read_wiki_page.
Nunca respondas desde tu conocimiento de entrenamiento. Toda respuesta debe basarse exclusivamente en lo que hayas leído de las herramientas.

FLUJO OBLIGATORIO:
1. Llama primero a search_wiki con la pregunta del usuario para localizar artículos relevantes.
2. Llama a read_wiki_page para al menos 2 artículos del resultado (si existen).
3. Si necesitas entender relaciones entre conceptos, llama también a query_graph.
4. Redacta tu respuesta basándote ÚNICAMENTE en el contenido leído. Cita cada artículo consultado con la sintaxis [[NombreDelArtículo]].
5. Si no hay detalle suficiente en las fuentes, indícalo de forma explícita y concreta (qué falta), pero aporta todo lo que sí esté documentado.${rentalPolicy}

${rentalMissingDetails ? 'IMPORTANTE PARA ESTE MENSAJE: faltan datos del perfil para determinar deducciones de alquiler aplicables. Debes pedir esos datos en tu respuesta.' : ''}`

  const modelMessages = await convertToModelMessages(body.messages as UIMessage[])
  const langsmithClient = await getLangSmithClient()
  const langsmithRunId = crypto.randomUUID()

  if (langsmithClient) {
    try {
      await langsmithClient.createRun({
        id: langsmithRunId,
        name: 'renta-chat-api',
        run_type: 'chain',
        session_name: process.env.LANGSMITH_PROJECT,
        start_time: new Date().toISOString(),
        inputs: {
          messages: body.messages,
        },
        extra: {
          metadata: {
            hasApiKey: !!apiKey,
            modelProvider: apiKey.startsWith('sk-ant-') ? 'anthropic' : 'openai',
          },
        },
      })
    } catch {
      // Ignore tracing errors so chat responses are never blocked.
    }
  }

  const result = streamText({
    model: getModel(apiKey),
    system: systemPrompt,
    messages: modelMessages,
    temperature: 0.2,
    tools: {
      search_wiki: tool({
        description: 'Busca artículos de la wiki por tema y devuelve los más relevantes con un resumen breve.',
        inputSchema: z.object({
          query: z.string().describe('Consulta en lenguaje natural, por ejemplo: deducciones alquiler andalucía galicia'),
          limit: z.number().int().min(1).max(10).optional().describe('Número máximo de resultados (por defecto 6)'),
        }),
        execute: async ({ query, limit = 6 }) => {
          const rentalSearch = isRentalQuery(query)
          const effectiveLimit = rentalSearch ? Math.max(limit, 8) : limit
          const queryVariants = rentalSearch
            ? [
                query,
                `${query} arrendamiento vivienda habitual`,
                `${query} deducción autonómica comunidad autónoma`,
                `${query} andalucía galicia cataluña madrid comunitat valenciana murcia`,
              ]
            : [query]

          const merged = new Map<string, { filename: string; title: string; category: string; snippet: string; score: number }>()

          for (const candidateQuery of queryVariants) {
            const partial = await searchWikiPages(candidateQuery, effectiveLimit)
            for (const item of partial) {
              const previous = merged.get(item.filename)
              if (!previous || item.score > previous.score) {
                merged.set(item.filename, item)
              }
            }
          }

          const results = [...merged.values()]
            .sort((left, right) => right.score - left.score)
            .slice(0, effectiveLimit)

          if (!results.length) {
            return 'No se encontraron artículos relevantes para esa consulta.'
          }
          return results
            .map((item, idx) => {
              return `${idx + 1}. ${item.filename} | título: ${item.title} | categoría: ${item.category}\nResumen: ${item.snippet}`
            })
            .join('\n\n')
        },
      }),
      read_wiki_page: tool({
        description: 'Lee el contenido completo de un artículo de la wiki por su nombre (sin extensión .md)',
        inputSchema: z.object({
          filename: z.string().describe('Nombre del artículo (sin .md), exactamente como aparece en el índice'),
        }),
        execute: async ({ filename }) => {
          try {
            return await readWikiPage(filename)
          } catch {
            return `Error: artículo "${filename}" no encontrado en la wiki.`
          }
        },
      }),
      query_graph: tool({
        description: 'Consulta el grafo de conocimiento fiscal. "neighbors" explora el entorno (BFS desde los 3 nodos más relevantes); "dfs" traza un camino en profundidad; "path" busca el camino mínimo entre dos conceptos.',
        inputSchema: z.object({
          mode: z.enum(['neighbors', 'dfs', 'path']).describe('"neighbors" = BFS hasta depth hops; "dfs" = DFS hasta 6 hops; "path" = camino mínimo entre dos conceptos'),
          concept: z.string().describe('Concepto fiscal principal a consultar (en español)'),
          target: z.string().optional().describe('Solo para mode="path": concepto destino'),
          depth: z.number().int().min(1).max(3).optional().describe('Solo para mode="neighbors": profundidad de exploración (1-3, por defecto 2)'),
        }),
        execute: async ({ mode, concept, target, depth = 2 }) => {
          const queryTerms = concept.toLowerCase().split(/\s+/).filter((t) => t.length > 2)

          if (mode === 'path') {
            if (!target) return 'Error: "target" es obligatorio para mode="path"'
            const fromNodes = findNodes(graph, concept, 1)
            const toNodes = findNodes(graph, target, 1)
            if (!fromNodes.length || !toNodes.length) return 'No se encontraron los nodos especificados en el grafo.'
            const result = shortestPath(graph, fromNodes[0].id, toNodes[0].id)
            if (!result) return `No hay camino en el grafo entre "${concept}" y "${target}".`
            return formatSubgraphForLLM(result.nodes, result.edges, { queryTerms })
          }

          // Multi-start: find top 3 matching nodes, traverse from all of them
          const starts = findNodes(graph, concept, 3)
          if (!starts.length) return `No se encontró "${concept}" en el grafo.`
          const startIds = starts.map((n) => n.id)

          if (mode === 'dfs') {
            const { nodes, edges } = dfsSubgraph(graph, startIds)
            return formatSubgraphForLLM(nodes, edges, { queryTerms })
          }

          // mode === 'neighbors' (BFS)
          const { nodes, edges } = bfsSubgraph(graph, startIds, depth)
          return formatSubgraphForLLM(nodes, edges, { queryTerms })
        },
      }),
    },
    stopWhen: stepCountIs(8),
    onError: async ({ error }) => {
      if (!langsmithClient) return
      try {
        await langsmithClient.updateRun(langsmithRunId, {
          end_time: new Date().toISOString(),
          error: error instanceof Error ? error.message : String(error),
        })
      } catch {
        // Ignore tracing errors.
      }
    },
    onFinish: async ({ response, finishReason, usage }) => {
      if (!langsmithClient) return
      try {
        const assistantMessages = response?.messages
          ?.filter((message) => message.role === 'assistant')
          .map((message) => message.content)

        await langsmithClient.updateRun(langsmithRunId, {
          end_time: new Date().toISOString(),
          outputs: {
            finishReason,
            usage,
            assistantMessages,
          },
        })
      } catch {
        // Ignore tracing errors.
      }
    },
  })

  return result.toUIMessageStreamResponse()
}
