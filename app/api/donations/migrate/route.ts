import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function POST(request: NextRequest) {
  try {
    const { donations, campaignId } = await request.json()
    
    if (!donations || !Array.isArray(donations)) {
      return NextResponse.json(
        { success: false, error: 'Invalid donations data' },
        { status: 400 }
      )
    }

    const donationsDir = path.join(process.cwd(), 'mock', 'donations')
    
    // Ensure directory exists
    if (!fs.existsSync(donationsDir)) {
      fs.mkdirSync(donationsDir, { recursive: true })
    }

    const filePath = path.join(donationsDir, `${campaignId}.json`)
    
    // Read existing donations or create empty array
    let existingDonations: any[] = []
    if (fs.existsSync(filePath)) {
      try {
        const content = fs.readFileSync(filePath, 'utf8')
        existingDonations = JSON.parse(content) || []
      } catch (error) {
        console.error('Error reading existing donations:', error)
      }
    }

    // Add new donations (avoid duplicates)
    const existingTxHashes = new Set(existingDonations.map(d => d.txHash))
    const newDonations = donations.filter((d: any) => !existingTxHashes.has(d.txHash))
    
    if (newDonations.length > 0) {
      const updatedDonations = [...existingDonations, ...newDonations]
      
      // Sort by timestamp
      updatedDonations.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      
      // Write to file
      fs.writeFileSync(filePath, JSON.stringify(updatedDonations, null, 2))
      
      console.log(`Migrated ${newDonations.length} donations to campaign ${campaignId}`)
      
      return NextResponse.json({
        success: true,
        message: `Successfully migrated ${newDonations.length} donations`,
        totalDonations: updatedDonations.length
      })
    } else {
      return NextResponse.json({
        success: true,
        message: 'No new donations to migrate',
        totalDonations: existingDonations.length
      })
    }

  } catch (error) {
    console.error('Error in migration API:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to migrate donations',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    // Get migration status - check localStorage vs JSON files
    const donationsDir = path.join(process.cwd(), 'mock', 'donations')
    
    let jsonFileCount = 0
    let totalJsonDonations = 0
    
    if (fs.existsSync(donationsDir)) {
      const files = fs.readdirSync(donationsDir).filter(f => f.endsWith('.json'))
      jsonFileCount = files.length
      
      for (const file of files) {
        try {
          const content = fs.readFileSync(path.join(donationsDir, file), 'utf8')
          const donations = JSON.parse(content)
          if (Array.isArray(donations)) {
            totalJsonDonations += donations.length
          }
        } catch (error) {
          console.error(`Error reading ${file}:`, error)
        }
      }
    }
    
    return NextResponse.json({
      success: true,
      migration: {
        jsonFiles: jsonFileCount,
        totalJsonDonations: totalJsonDonations,
        donationsDirectory: donationsDir
      }
    })
    
  } catch (error) {
    console.error('Error checking migration status:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to check migration status' },
      { status: 500 }
    )
  }
}