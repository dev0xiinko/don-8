import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { sendVerificationEmail } from '@/lib/mailer'

// POST /api/ngo-application/verify/send  { applicationId }
export async function POST(request: NextRequest) {
  try {
    const { applicationId, action, code } = await request.json()
    const filePath = path.join(process.cwd(), 'mock', 'ngo-applications.json')
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ success: false, message: 'Applications file not found' }, { status: 500 })
    }
    const apps = JSON.parse(fs.readFileSync(filePath, 'utf8'))
    const idx = apps.findIndex((a: any) => a.id === Number(applicationId))
    if (idx === -1) {
      return NextResponse.json({ success: false, message: 'Application not found' }, { status: 404 })
    }

    const app = apps[idx]

    if (action === 'send') {
      // Generate new code and expiry
      const generateCode = () => Math.floor(100000 + Math.random() * 900000).toString()
      app.verificationCode = generateCode()
      app.verificationExpiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString()
      // Send via email provider (Nodemailer)
      try {
        await sendVerificationEmail(app.email, app.verificationCode)
      } catch (e) {
        console.error('Failed to send verification email:', e)
        return NextResponse.json({ success: false, message: 'Failed to send verification email. Check SMTP settings.' }, { status: 500 })
      }
      fs.writeFileSync(filePath, JSON.stringify(apps, null, 2))
      return NextResponse.json({ success: true, message: 'Verification code sent', devOnlyVerificationCode: app.verificationCode })
    }

    if (action === 'verify') {
      if (!code) {
        return NextResponse.json({ success: false, message: 'Verification code required' }, { status: 400 })
      }
      const now = Date.now()
      const exp = app.verificationExpiresAt ? new Date(app.verificationExpiresAt).getTime() : 0
      if (!app.verificationCode || now > exp) {
        return NextResponse.json({ success: false, message: 'Verification code expired. Please request a new one.' }, { status: 400 })
      }
      if (String(code) !== String(app.verificationCode)) {
        return NextResponse.json({ success: false, message: 'Invalid verification code' }, { status: 400 })
      }
      app.emailVerified = true
      // Invalidate the code after success
      app.verificationCode = null
      app.verificationExpiresAt = null
      fs.writeFileSync(filePath, JSON.stringify(apps, null, 2))
      return NextResponse.json({ success: true, message: 'Email verified successfully' })
    }

    return NextResponse.json({ success: false, message: 'Unknown action' }, { status: 400 })
  } catch (error) {
    console.error('Email verification error:', error)
    return NextResponse.json({ success: false, message: 'Failed to process verification' }, { status: 500 })
  }
}
