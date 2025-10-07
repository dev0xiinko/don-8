import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function POST(_req: NextRequest) {
  try {
    const filePath = path.join(process.cwd(), 'mock', 'ngo-applications.json')
    const raw = fs.readFileSync(filePath, 'utf8')
    const apps = JSON.parse(raw)

    let removedPasswords = 0
    let clearedCodes = 0

    for (const app of apps) {
      if (app && 'registrationPassword' in app) {
        delete app.registrationPassword
        removedPasswords++
      }
      if (app && ('verificationCode' in app || 'verificationExpiresAt' in app)) {
        // Keep current emailVerified flag, but drop transient code data
        if ('verificationCode' in app) {
          app.verificationCode = null
        }
        if ('verificationExpiresAt' in app) {
          app.verificationExpiresAt = null
        }
        clearedCodes++
      }
    }

    fs.writeFileSync(filePath, JSON.stringify(apps, null, 2))

    return NextResponse.json({
      success: true,
      removedPasswords,
      clearedCodes,
      message: 'NGO applications sanitized.'
    })
  } catch (e: any) {
    console.error('Sanitize NGO applications failed:', e)
    return NextResponse.json({ success: false, error: e?.message || 'Failed to sanitize' }, { status: 500 })
  }
}
