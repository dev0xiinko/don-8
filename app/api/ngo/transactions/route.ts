import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

interface AggregatedTx {
  id: string
  type: 'donation' | 'withdrawal'
  amount: number
  description: string
  date: string
  txHash: string
  campaignId?: number
  campaignTitle?: string
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const ngoIdParam = url.searchParams.get('ngoId')
    if (!ngoIdParam) {
      return NextResponse.json({ success: false, message: 'ngoId is required' }, { status: 400 })
    }
    const ngoId = parseInt(ngoIdParam)

    // Load campaigns for this NGO
    const campaignsFile = path.join(process.cwd(), 'mock', 'campaigns.json')
    let campaigns: any[] = []
    try {
      const fileContent = fs.readFileSync(campaignsFile, 'utf8')
      campaigns = JSON.parse(fileContent)
    } catch {
      campaigns = []
    }

    const ngoCampaigns = campaigns.filter((c: any) => c.ngoId === ngoId)

    // Aggregate donations from comprehensive campaign files
    const comprehensiveDir = path.join(process.cwd(), 'mock', 'campaigns')
    const donations: AggregatedTx[] = []

    for (const c of ngoCampaigns) {
      const compFile = path.join(comprehensiveDir, `campaign_${c.id}.json`)
      if (!fs.existsSync(compFile)) continue
      try {
        const comp = JSON.parse(fs.readFileSync(compFile, 'utf8'))
        const compDonations: any[] = comp.donations || []
        for (const d of compDonations) {
          // Only count confirmed donations if status present
          if (d.status && d.status !== 'confirmed') continue
          const txHash = d.txHash || d.transactionHash || `donation_${c.id}_${d.id}`
          const amountNum = typeof d.amount === 'string' ? parseFloat(d.amount) : (d.amount || 0)
          donations.push({
            id: txHash,
            type: 'donation',
            amount: amountNum || 0,
            description: `Donation to ${c.title}${d.donor ? ` by ${d.donor}` : ''}`,
            date: d.confirmedAt || d.timestamp || new Date().toISOString(),
            txHash,
            campaignId: c.id,
            campaignTitle: c.title,
          })
        }
      } catch (e) {
        // Skip malformed comprehensive file
      }
    }

    // Load withdrawals for this NGO
    const withdrawalsFile = path.join(process.cwd(), 'mock', 'withdrawals.json')
    let withdrawalsRaw: any[] = []
    try {
      if (fs.existsSync(withdrawalsFile)) {
        withdrawalsRaw = JSON.parse(fs.readFileSync(withdrawalsFile, 'utf8'))
      }
    } catch {
      withdrawalsRaw = []
    }
    const withdrawals: AggregatedTx[] = withdrawalsRaw
      .filter((w: any) => w.ngoId === ngoId)
      .map((w: any) => {
        const txHash = w.txHash || `withdrawal_${w.id}`
        const amt = typeof w.amount === 'string' ? parseFloat(w.amount) : (w.amount || 0)
        return {
          id: txHash,
          type: 'withdrawal' as const,
          amount: amt,
          description: `Withdrawal to ${w.destination?.slice(0, 8) || 'address'}...`,
          date: w.timestamp || w.createdAt || new Date().toISOString(),
          txHash,
        }
      })

    // Merge and sort
    const transactions: AggregatedTx[] = [...donations, ...withdrawals].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    )

    return NextResponse.json({ success: true, transactions })
  } catch (error) {
    console.error('Error aggregating NGO transactions:', error)
    return NextResponse.json({ success: false, message: 'Failed to fetch transactions' }, { status: 500 })
  }
}
