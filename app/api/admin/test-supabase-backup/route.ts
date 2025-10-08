import { NextRequest, NextResponse } from 'next/server'

export async function GET(_req: NextRequest) {
  try {
    const url = process.env.SUPABASE_URL
    const authKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    const table = process.env.SUPABASE_TABLE || 'ngo_applications_backup'
    const mode = (process.env.SUPABASE_TABLE_MODE || 'raw').toLowerCase()

    if (!url || !authKey) {
      return NextResponse.json({ ok: false, reason: 'Missing SUPABASE_URL or auth key envs' }, { status: 400 })
    }

    const base = `${url.replace(/\/$/, '')}/rest/v1/${table}`
    const now = new Date().toISOString()
    const body = mode === 'json'
      ? { payload: { _test: true, source: 'admin/test-supabase-backup', at: now } }
      : {
          app_id: Date.now(),
          organization_name: 'TEST BACKUP',
          email: 'test@example.org',
          status: 'test',
          submitted_at: now,
        }

    const res = await fetch(base, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: authKey,
        Authorization: `Bearer ${authKey}`,
        Prefer: 'return=minimal',
      },
      body: JSON.stringify(body),
    })

    if (!res.ok) {
      const text = await res.text()
      return NextResponse.json({ ok: false, status: res.status, error: text.slice(0, 500) })
    }
    return NextResponse.json({ ok: true, mode, table })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'Failed' }, { status: 500 })
  }
}
