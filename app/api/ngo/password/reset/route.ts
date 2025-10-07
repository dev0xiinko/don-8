import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function POST(req: NextRequest) {
  try {
    const { email, code, newPassword } = await req.json()
    if (!email || !code || !newPassword) {
      return NextResponse.json({ success: false, message: 'Email, code and newPassword are required' }, { status: 400 })
    }

    const filePath = path.join(process.cwd(), 'mock', 'ngo-applications.json')
    const raw = fs.readFileSync(filePath, 'utf8')
    const apps = JSON.parse(raw)

    const idx = apps.findIndex((a: any) => (a.email || '').toLowerCase() === email.toLowerCase())
    if (idx === -1) return NextResponse.json({ success: false, message: 'Invalid code' }, { status: 400 })

    const app = apps[idx]
    const now = Date.now()
    const exp = app.passwordResetExpiresAt ? Date.parse(app.passwordResetExpiresAt) : 0
    if (!app.passwordResetCode || app.passwordResetCode !== code || !exp || now > exp) {
      return NextResponse.json({ success: false, message: 'Invalid or expired code' }, { status: 400 })
    }

    // Update credentials with new password; ensure credentials exists
    const normalizedEmail = (app.email || '').toString().trim().toLowerCase()
    app.credentials = {
      email: normalizedEmail,
      password: newPassword,
    }
    // clear reset fields
    app.passwordResetCode = null
    app.passwordResetExpiresAt = null

    apps[idx] = app
    fs.writeFileSync(filePath, JSON.stringify(apps, null, 2))

    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ success: false, message: e?.message || 'Failed' }, { status: 500 })
  }
}
