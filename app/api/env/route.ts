import { NextResponse } from 'next/server'

export function GET() {
  return NextResponse.json({
    NEXT_PUBLIC_LANGSMITH_ENDPOINT: process.env.NEXT_PUBLIC_LANGSMITH_ENDPOINT ?? null,
    NEXT_PUBLIC_LANGSMITH_PROJECT: process.env.NEXT_PUBLIC_LANGSMITH_PROJECT ?? null,
    LANGSMITH_API_KEY_PRESENT: !!process.env.LANGSMITH_API_KEY,
    LANGSMITH_TRACING: process.env.LANGSMITH_TRACING ?? null
  })
}
