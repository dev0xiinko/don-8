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

export async function sendApplicationStatusEmail(
  to: string,
  status: 'approved' | 'rejected',
  orgName?: string,
  notes?: string,
  tempPassword?: string
) {
  const from = process.env.EMAIL_FROM || process.env.SMTP_USER || 'no-reply@example.com'
  const transporter = getTransport()
  const prettyStatus = status === 'approved' ? 'Approved' : 'Rejected'
  const subject = `DON-8: Your NGO Application has been ${prettyStatus}`
  const safeName = orgName || 'your organization'
  const extra = notes ? `<p><strong>Notes:</strong> ${notes}</p>` : ''
  const html = `
    <div style="font-family: Arial, sans-serif; line-height:1.6;">
      <h2>Application ${prettyStatus}</h2>
      <p>Hello,</p>
      <p>Your NGO application for <strong>${safeName}</strong> has been <strong>${prettyStatus.toLowerCase()}</strong>.</p>
      ${extra}
      ${status === 'approved'
        ? `<p>You can now sign in to the DON-8 platform using your registered email and password.</p>
           ${tempPassword ? `<p><strong>Temporary password:</strong> <code>${tempPassword}</code></p>
           <p>Please change your password after logging in for security.</p>` : ''}`
        : ''}
      <p>Thank you for applying to DON-8.</p>
    </div>
  `
  const text = `Your NGO application for ${safeName} has been ${prettyStatus.toLowerCase()}. ${notes ? 'Notes: ' + notes : ''}`

  await transporter.sendMail({ from, to, subject, text, html })
}

export async function sendPasswordResetEmail(to: string, code: string) {
  const from = process.env.EMAIL_FROM || process.env.SMTP_USER || 'no-reply@example.com'
  const transporter = getTransport()

  const html = `
    <div style="font-family: Arial, sans-serif; line-height:1.5;">
      <h2>Password Reset Request</h2>
      <p>Use the following verification code to reset your password:</p>
      <p style="font-size: 20px; font-weight: bold; letter-spacing: 2px;">${code}</p>
      <p>This code expires in 15 minutes.</p>
      <p>If you didn't request this, you can safely ignore this email.</p>
    </div>
  `

  await transporter.sendMail({
    from,
    to,
    subject: 'DON-8: Password reset code',
    text: `Your password reset code is ${code}. It expires in 15 minutes.`,
    html,
  })
}
