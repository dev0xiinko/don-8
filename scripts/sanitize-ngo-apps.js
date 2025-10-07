#!/usr/bin/env node
const fs = require('fs')
const path = require('path')

try {
  const filePath = path.join(process.cwd(), 'mock', 'ngo-applications.json')
  if (!fs.existsSync(filePath)) {
    console.error('File not found:', filePath)
    process.exit(1)
  }
  const raw = fs.readFileSync(filePath, 'utf8')
  const apps = JSON.parse(raw)
  if (!Array.isArray(apps)) {
    console.error('Unexpected format: expected an array')
    process.exit(1)
  }

  let removedPasswords = 0
  let clearedCodes = 0

  for (const app of apps) {
    if (app && Object.prototype.hasOwnProperty.call(app, 'registrationPassword')) {
      delete app.registrationPassword
      removedPasswords++
    }
    if (app && (Object.prototype.hasOwnProperty.call(app, 'verificationCode') || Object.prototype.hasOwnProperty.call(app, 'verificationExpiresAt'))) {
      if (Object.prototype.hasOwnProperty.call(app, 'verificationCode')) app.verificationCode = null
      if (Object.prototype.hasOwnProperty.call(app, 'verificationExpiresAt')) app.verificationExpiresAt = null
      clearedCodes++
    }
  }

  fs.writeFileSync(filePath, JSON.stringify(apps, null, 2))
  console.log(`Sanitized NGO applications: removedPasswords=${removedPasswords}, clearedCodes=${clearedCodes}`)
  process.exit(0)
} catch (e) {
  console.error('Sanitization failed:', e)
  process.exit(1)
}
