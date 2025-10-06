import nodemailer from 'nodemailer'

function getTransport() {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com'
  const port = Number(process.env.SMTP_PORT || 587)
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS

  if (!user || !pass) {
    throw new Error('SMTP credentials not configured. Please set SMTP_USER and SMTP_PASS in environment variables.')
  }

  const secure = port === 465 // true for port 465, false for 587

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  })
}

export async function sendVerificationEmail(to: string, code: string) {
  const from = process.env.EMAIL_FROM || process.env.SMTP_USER || 'no-reply@example.com'
  const transporter = getTransport()

  const html = `
    <div style="font-family: Arial, sans-serif; line-height:1.5;">
      <h2>Verify your email</h2>
      <p>Your verification code is:</p>
      <p style="font-size: 20px; font-weight: bold; letter-spacing: 2px;">${code}</p>
      <p>This code expires in 15 minutes.</p>
      <p>If you didn't request this, you can safely ignore this email.</p>
    </div>
  `

  await transporter.sendMail({
    from,
    to,
    subject: 'DON-8: Verify your email',
    text: `Your verification code is ${code}. It expires in 15 minutes.`,
    html,
  })
}
