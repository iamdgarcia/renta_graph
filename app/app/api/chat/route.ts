import { NextRequest } from 'next/server'
import { streamText, tool, convertToModelMessages, UIMessage, stepCountIs } from 'ai'
import { createOpenAI } from '@ai-sdk/openai'
import { createAnthropic } from '@ai-sdk/anthropic'
import { z } from 'zod'
import { readWikiPage, readWikiIndex } from '@/lib/wiki'

export const runtime = 'nodejs'

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

  const wikiIndex = await readWikiIndex()

  const systemPrompt = `Eres un experto en el sistema tributario español y la Declaración de la Renta.
Tienes acceso a una base de conocimiento (wiki) con artículos fiscales compilados por IA.

INSTRUCCIONES:
1. Lee el índice de la wiki para identificar los artículos relevantes a la pregunta.
2. Usa la herramienta read_wiki_page para leer el contenido completo de los artículos relevantes.
3. Responde basándote ÚNICAMENTE en el contenido de los artículos que hayas leído.
4. Cita siempre tus fuentes usando la sintaxis [[NombreDelArtículo]] (corchetes dobles).
5. Si no encuentras información relevante en la wiki, indícalo claramente.

Índice de la wiki:
${wikiIndex}`

  const modelMessages = await convertToModelMessages(body.messages as UIMessage[])

  const result = streamText({
    model: getModel(apiKey),
    system: systemPrompt,
    messages: modelMessages,
    tools: {
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
    },
    stopWhen: stepCountIs(5),
  })

  return result.toUIMessageStreamResponse()
}
