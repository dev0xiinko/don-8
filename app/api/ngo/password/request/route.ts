import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { sendPasswordResetEmail } from '@/lib/mailer'

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()
    if (!email) return NextResponse.json({ success: false, message: 'Email required' }, { status: 400 })

    const filePath = path.join(process.cwd(), 'mock', 'ngo-applications.json')
    const raw = fs.readFileSync(filePath, 'utf8')
    const apps = JSON.parse(raw)
    const idx = apps.findIndex((a: any) => (a.email || '').toLowerCase() === email.toLowerCase())
    if (idx === -1) return NextResponse.json({ success: true }) // avoid user enumeration

    // Only allow for approved users (or you can relax to any existing & verified email)
    if (apps[idx].status !== 'approved') {
      return NextResponse.json({ success: true })
    }

    // generate code
    const code = Math.floor(100000 + Math.random() * 900000).toString()
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString()

    apps[idx].passwordResetCode = code
    apps[idx].passwordResetExpiresAt = expiresAt

    fs.writeFileSync(filePath, JSON.stringify(apps, null, 2))

    // fire-and-forget email
    sendPasswordResetEmail(email, code).catch(() => {})

    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ success: false, message: e?.message || 'Failed' }, { status: 500 })
  }
}
