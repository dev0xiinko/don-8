type NGOApplication = Record<string, any>

function sanitizeApplication(app: NGOApplication) {
  const clone: NGOApplication = { ...app }
  // Avoid storing sensitive/transient fields in backup
  if ('registrationPassword' in clone) clone.registrationPassword = undefined
  if ('verificationCode' in clone) clone.verificationCode = undefined
  if ('verificationExpiresAt' in clone) clone.verificationExpiresAt = undefined
  return clone
}

function mapToRaw(app: NGOApplication) {
  // Map to a flat, typed schema (snake_case columns)
  return {
    app_id: app.id ?? null,
    organization_name: app.organizationName ?? app.name ?? null,
    email: app.email ?? null,
    phone: app.phone ?? null,
    description: app.description ?? null,
    address: app.address ?? null,
    registration_number: app.registrationNumber ?? null,
    tax_id: app.taxId ?? null,
    bank_account_details: app.bankAccountDetails ?? null,
    wallet_address: app.walletAddress ?? null,
    contact_person_name: app.contactPersonName ?? null,
    uploaded_documents: app.uploadedDocuments ?? [],
    website: app.website ?? null,
    category: app.category ?? null,
    founded_year: app.foundedYear ?? null,
    team_size: app.teamSize ?? null,
    twitter: app.twitter ?? null,
    facebook: app.facebook ?? null,
    linkedin: app.linkedin ?? null,
    status: app.status ?? null,
    submitted_at: app.submittedAt ? new Date(app.submittedAt).toISOString() : null,
    reviewed_at: app.reviewedAt ? new Date(app.reviewedAt).toISOString() : null,
    reviewed_by: app.reviewedBy ?? null,
    email_verified: app.emailVerified ?? false,
  }
}

async function backupToSupabase(app: NGOApplication) {
  const url = process.env.SUPABASE_URL
  const authKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    || process.env.SUPABASE_ANON_KEY
    || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !authKey) return

  const table = process.env.SUPABASE_TABLE || 'ngo_applications_backup'
  const mode = (process.env.SUPABASE_TABLE_MODE || 'raw').toLowerCase() // 'json' | 'raw'
  const upsert = process.env.SUPABASE_UPSERT === '1'
  const base = `${url.replace(/\/$/, '')}/rest/v1/${table}`
  const endpoint = upsert ? `${base}?on_conflict=app_id` : base
  const payload = sanitizeApplication(app)

  // Default to JSON mode: send { payload: <json> } to a table with a jsonb column named 'payload'
  const body = mode === 'raw' ? mapToRaw(payload) : { payload }

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: authKey,
        Authorization: `Bearer ${authKey}`,
        Prefer: upsert ? 'return=minimal, resolution=merge-duplicates' : 'return=minimal',
      },
      body: JSON.stringify(body),
    })
    if (!res.ok) {
      const text = await res.text()
      console.warn('Supabase backup failed:', res.status, text)
    }
  } catch (e) {
    console.warn('Supabase backup error:', e)
  }
}

async function backupToWebhook(app: NGOApplication) {
  const hook = process.env.DATABASE_WEBHOOK_URL
  if (!hook) return
  const payload = sanitizeApplication(app)
  try {
    const res = await fetch(hook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'ngo_application_backup', data: payload }),
    })
    if (!res.ok) {
      const text = await res.text()
      console.warn('Webhook backup failed:', res.status, text)
    }
  } catch (e) {
    console.warn('Webhook backup error:', e)
  }
}

export async function backupNgoApplication(app: NGOApplication) {
  // Run in parallel, do not throw
  await Promise.allSettled([backupToSupabase(app), backupToWebhook(app)])
}
