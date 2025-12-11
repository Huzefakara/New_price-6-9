import { NextRequest, NextResponse } from 'next/server'
import { appendFileSync, mkdirSync } from 'fs'
import { dirname, join } from 'path'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const revalidate = 0

const LOG_PATHS = [
  'c:\\Users\\huzef\\OneDrive\\Desktop\\Full Stack\\Price\\.cursor\\debug.log',
  join(process.cwd(), 'debug.log'),
]

const appendLog = (payload: Record<string, unknown>) => {
  LOG_PATHS.forEach(path => {
    try {
      mkdirSync(dirname(path), { recursive: true })
      appendFileSync(path, JSON.stringify(payload) + '\n', { encoding: 'utf8' })
    } catch {
      // swallow logging errors
    }
  })
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    appendLog(body)
    return NextResponse.json({ ok: true, echoed: body })
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : 'unknown' }, { status: 400 })
  }
}

export async function GET() {
  return NextResponse.json({ ok: true, info: 'POST here to log agent data' })
}


