import { tool } from 'ai'
import { createOpenAI } from '@ai-sdk/openai'
import { createAnthropic } from '@ai-sdk/anthropic'
import { z } from 'zod'
import { readWikiPage, searchWikiPages } from '@/lib/wiki'
import {
  GraphData,
  findNodes,
  bfsSubgraph,
  dfsSubgraph,
  shortestPath,
  formatSubgraphForLLM,
} from '@/lib/graph'

const RENTAL_QUERY_PATTERN = /\balquiler\b|arrendamiento|arrendar|arrendatario|arrendador|vivienda habitual/i
const REGIONAL_DETAIL_PATTERN = /andaluc|galicia|madrid|catalu|valenc|murcia|astur|cantab|aragon|navarra|país vasco|la rioja|canarias|extremadura|castilla|ceuta|melilla|balear|comunidad/i
const AGE_DETAIL_PATTERN = /\b\d{2}\s*años\b|menor de|mayor de|joven|edad/i
const CONTRACT_DATE_DETAIL_PATTERN = /20\d{2}|contrato|antes de|desde|prorrog|fecha/i
const INCOME_DETAIL_PATTERN = /base imponible|ingresos|renta anual|tributación|individual|conjunta|euros|€/i

const RENTAL_POLICY_TEXT = `

REGLAS ADICIONALES PARA CONSULTAS DE ALQUILER:
- Antes de recomendar deducciones aplicables a la persona usuaria, debes verificar datos clave: Comunidad Autónoma, edad, año/fecha del contrato de alquiler y nivel de ingresos/base imponible.
- Si faltan esos datos, NO des una recomendación personalizada cerrada: haz una pregunta breve pidiendo exactamente esos datos y, además, ofrece solo un resumen general de lo que sí aparece en la wiki.
- Para consultas de alquiler, debes leer al menos 1 artículo general y 1 artículo autonómico (si existen en la wiki) antes de responder.
- En la respuesta final separa claramente: "Lo confirmado en fuentes" y "Lo que depende de tu caso".
`

type RentalContext = {
  rentalQuery: boolean
  rentalMissingDetails: boolean
  rentalPolicy: string
}

export function getLatestUserText(messages: unknown[]): string {
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
  return RENTAL_QUERY_PATTERN.test(text)
}

function hasRegionalDetail(text: string): boolean {
  return REGIONAL_DETAIL_PATTERN.test(text)
}

function hasAgeDetail(text: string): boolean {
  return AGE_DETAIL_PATTERN.test(text)
}

function hasContractDateDetail(text: string): boolean {
  return CONTRACT_DATE_DETAIL_PATTERN.test(text)
}

function hasIncomeDetail(text: string): boolean {
  return INCOME_DETAIL_PATTERN.test(text)
}

export function buildRentalContext(latestUserText: string): RentalContext {
  const rentalQuery = isRentalQuery(latestUserText)
  const rentalMissingDetails =
    rentalQuery
    && (!hasRegionalDetail(latestUserText)
      || !hasAgeDetail(latestUserText)
      || !hasContractDateDetail(latestUserText)
      || !hasIncomeDetail(latestUserText))

  return {
    rentalQuery,
    rentalMissingDetails,
    rentalPolicy: rentalQuery ? RENTAL_POLICY_TEXT : '',
  }
}

export function buildSystemPrompt(context: RentalContext): string {
  return `Eres un experto en el sistema tributario español y la Declaración de la Renta.
Tienes acceso a una base de conocimiento (wiki) con artículos fiscales compilados por IA, y a un grafo de conocimiento con 181 conceptos fiscales y sus relaciones.

REGLA FUNDAMENTAL — SIN EXCEPCIONES:
Antes de escribir cualquier respuesta DEBES consultar la wiki usando search_wiki y read_wiki_page.
Nunca respondas desde tu conocimiento de entrenamiento. Toda respuesta debe basarse exclusivamente en lo que hayas leído de las herramientas.

FLUJO OBLIGATORIO:
1. Llama primero a search_wiki con la pregunta del usuario para localizar artículos relevantes.
2. Llama a read_wiki_page para al menos 2 artículos del resultado (si existen).
3. Si necesitas entender relaciones entre conceptos, llama también a query_graph.
4. Redacta tu respuesta basándote ÚNICAMENTE en el contenido leído. Cita cada artículo consultado con la sintaxis [[NombreDelArtículo]].
5. Si no hay detalle suficiente en las fuentes, indícalo de forma explícita y concreta (qué falta), pero aporta todo lo que sí esté documentado.${context.rentalPolicy}

${context.rentalMissingDetails ? 'IMPORTANTE PARA ESTE MENSAJE: faltan datos del perfil para determinar deducciones de alquiler aplicables. Debes pedir esos datos en tu respuesta.' : ''}`
}

function getQueryVariants(query: string, rentalSearch: boolean): string[] {
  if (!rentalSearch) return [query]

  return [
    query,
    `${query} arrendamiento vivienda habitual`,
    `${query} deducción autonómica comunidad autónoma`,
    `${query} andalucía galicia cataluña madrid comunitat valenciana murcia`,
  ]
}

async function executeSearchWiki(query: string, limit = 6): Promise<string> {
  const rentalSearch = isRentalQuery(query)
  const effectiveLimit = rentalSearch ? Math.max(limit, 8) : limit
  const queryVariants = getQueryVariants(query, rentalSearch)

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
}

async function executeReadWikiPage(filename: string): Promise<string> {
  try {
    return await readWikiPage(filename)
  } catch {
    return `Error: artículo "${filename}" no encontrado en la wiki.`
  }
}

function executeQueryGraph(
  graph: GraphData,
  mode: 'neighbors' | 'dfs' | 'path',
  concept: string,
  target?: string,
  depth = 2,
): string {
  const queryTerms = concept.toLowerCase().split(/\s+/).filter((term) => term.length > 2)

  if (mode === 'path') {
    if (!target) return 'Error: "target" es obligatorio para mode="path"'
    const fromNodes = findNodes(graph, concept, 1)
    const toNodes = findNodes(graph, target, 1)
    if (!fromNodes.length || !toNodes.length) return 'No se encontraron los nodos especificados en el grafo.'
    const result = shortestPath(graph, fromNodes[0].id, toNodes[0].id)
    if (!result) return `No hay camino en el grafo entre "${concept}" y "${target}".`
    return formatSubgraphForLLM(result.nodes, result.edges, { queryTerms })
  }

  const starts = findNodes(graph, concept, 3)
  if (!starts.length) return `No se encontró "${concept}" en el grafo.`
  const startIds = starts.map((node) => node.id)

  if (mode === 'dfs') {
    const { nodes, edges } = dfsSubgraph(graph, startIds)
    return formatSubgraphForLLM(nodes, edges, { queryTerms })
  }

  const { nodes, edges } = bfsSubgraph(graph, startIds, depth)
  return formatSubgraphForLLM(nodes, edges, { queryTerms })
}

export function getModel(apiKey: string) {
  if (apiKey.startsWith('sk-ant-')) {
    const anthropic = createAnthropic({ apiKey })
    return anthropic('claude-3-5-sonnet-20241022')
  }

  const openai = createOpenAI({ apiKey })
  return openai('gpt-4o')
}

export function createChatTools(graph: GraphData) {
  return {
    search_wiki: tool({
      description: 'Busca artículos de la wiki por tema y devuelve los más relevantes con un resumen breve.',
      inputSchema: z.object({
        query: z.string().describe('Consulta en lenguaje natural, por ejemplo: deducciones alquiler andalucía galicia'),
        limit: z.number().int().min(1).max(10).optional().describe('Número máximo de resultados (por defecto 6)'),
      }),
      execute: async ({ query, limit = 6 }) => executeSearchWiki(query, limit),
    }),
    read_wiki_page: tool({
      description: 'Lee el contenido completo de un artículo de la wiki por su nombre (sin extensión .md)',
      inputSchema: z.object({
        filename: z.string().describe('Nombre del artículo (sin .md), exactamente como aparece en el índice'),
      }),
      execute: async ({ filename }) => executeReadWikiPage(filename),
    }),
    query_graph: tool({
      description: 'Consulta el grafo de conocimiento fiscal. "neighbors" explora el entorno (BFS desde los 3 nodos más relevantes); "dfs" traza un camino en profundidad; "path" busca el camino mínimo entre dos conceptos.',
      inputSchema: z.object({
        mode: z.enum(['neighbors', 'dfs', 'path']).describe('"neighbors" = BFS hasta depth hops; "dfs" = DFS hasta 6 hops; "path" = camino mínimo entre dos conceptos'),
        concept: z.string().describe('Concepto fiscal principal a consultar (en español)'),
        target: z.string().optional().describe('Solo para mode="path": concepto destino'),
        depth: z.number().int().min(1).max(3).optional().describe('Solo para mode="neighbors": profundidad de exploración (1-3, por defecto 2)'),
      }),
      execute: async ({ mode, concept, target, depth = 2 }) => executeQueryGraph(graph, mode, concept, target, depth),
    }),
  }
}