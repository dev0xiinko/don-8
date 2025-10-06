import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET(request: NextRequest) {
  try {
    const donationsDir = path.join(process.cwd(), 'mock', 'donations')
    
    // Ensure directory exists
    if (!fs.existsSync(donationsDir)) {
      fs.mkdirSync(donationsDir, { recursive: true })
    }
    
    const allDonations: any[] = []
    
    // Read all campaign donation files
    const files = fs.readdirSync(donationsDir)
    
    for (const file of files) {
      if (file.endsWith('.json')) {
        const filePath = path.join(donationsDir, file)
        try {
          const content = fs.readFileSync(filePath, 'utf8')
          const donations = JSON.parse(content)
          
          if (Array.isArray(donations)) {
            // Add campaign ID from filename
            const campaignId = file.replace('.json', '')
            const donationsWithCampaign = donations.map(d => ({
              ...d,
              campaignId: campaignId
            }))
            allDonations.push(...donationsWithCampaign)
          }
        } catch (error) {
          console.error(`Error reading donation file ${file}:`, error)
        }
      }
    }
    
    // Sort by timestamp (newest first)
    allDonations.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    
    // Calculate statistics
    const confirmed = allDonations.filter(d => d.status === 'confirmed')
    const pending = allDonations.filter(d => d.status === 'pending')
    const uniqueDonors = new Set(allDonations.map(d => d.anonymous ? 'anonymous' : d.donorAddress)).size
    const uniqueCampaigns = new Set(allDonations.map(d => d.campaignId)).size
    
    const stats = {
      totalDonations: allDonations.length,
      totalAmount: confirmed.reduce((sum: number, d: any) => sum + parseFloat(d.amount || '0'), 0),
      confirmedDonations: confirmed.length,
      pendingDonations: pending.length,
      uniqueDonors,
      uniqueCampaigns,
      lastUpdated: new Date().toISOString()
    }
    
    return NextResponse.json({
      success: true,
      donations: allDonations,
      stats
    })
    
  } catch (error) {
    console.error('Error in global donations API:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to load global donations',
        donations: [],
        stats: {
          totalDonations: 0,
          totalAmount: 0,
          confirmedDonations: 0,
          pendingDonations: 0,
          uniqueDonors: 0,
          uniqueCampaigns: 0,
          lastUpdated: new Date().toISOString()
        }
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { walletAddress } = await request.json()
    
    const donationsDir = path.join(process.cwd(), 'mock', 'donations')
    
    // Ensure directory exists
    if (!fs.existsSync(donationsDir)) {
      fs.mkdirSync(donationsDir, { recursive: true })
    }
    
    const allDonations: any[] = []
    
    // Read all campaign donation files
    const files = fs.readdirSync(donationsDir)
    
    for (const file of files) {
      if (file.endsWith('.json')) {
        const filePath = path.join(donationsDir, file)
        try {
          const content = fs.readFileSync(filePath, 'utf8')
          const donations = JSON.parse(content)
          
          if (Array.isArray(donations)) {
            // Add campaign ID from filename
            const campaignId = file.replace('.json', '')
            const donationsWithCampaign = donations.map(d => ({
              ...d,
              campaignId: campaignId
            }))
            allDonations.push(...donationsWithCampaign)
          }
        } catch (error) {
          console.error(`Error reading donation file ${file}:`, error)
        }
      }
    }
    
    // Filter by wallet address if provided
    let filteredDonations = allDonations
    if (walletAddress) {
      filteredDonations = allDonations.filter(d => 
        d.donorAddress && d.donorAddress.toLowerCase() === walletAddress.toLowerCase()
      )
    }
    
    // Sort by timestamp (newest first)
    filteredDonations.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    
    return NextResponse.json({
      success: true,
      donations: filteredDonations,
      total: filteredDonations.length
    })
    
  } catch (error) {
    console.error('Error in filtered donations API:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to load filtered donations',
        donations: [],
        total: 0
      },
      { status: 500 }
    )
  }
}