import { NextRequest } from 'next/server'
import { streamText, convertToModelMessages, UIMessage, stepCountIs } from 'ai'
import { loadGraph } from '@/lib/graph'
import {
  createChatTools,
  buildRentalContext,
  buildSystemPrompt,
  getLatestUserText,
  getModel,
} from './chat-helpers'

export const runtime = 'nodejs'

type LangSmithClientLike = {
  createRun: (run: Record<string, unknown>) => Promise<void>
  updateRun: (runId: string, run: Record<string, unknown>) => Promise<void>
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
  const rentalContext = buildRentalContext(latestUserText)
  const systemPrompt = buildSystemPrompt(rentalContext)

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
    tools: createChatTools(graph),
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
