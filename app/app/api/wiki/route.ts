import { NextRequest } from 'next/server'
import { listWikiFiles, readWikiPage } from '@/lib/wiki'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  const file = request.nextUrl.searchParams.get('file')

  if (!file) {
    const files = await listWikiFiles()
    return Response.json(files)
  }

  try {
    const content = await readWikiPage(file)
    return new Response(content, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    })
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
      return new Response('Not found', { status: 404 })
    }
    if (err instanceof Error && err.message.startsWith('Invalid wiki filename')) {
      return new Response('Bad request', { status: 400 })
    }
    return new Response('Internal server error', { status: 500 })
  }
}
