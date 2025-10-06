// Migration script to convert existing campaigns to comprehensive format
const fs = require('fs')
const path = require('path')

async function migrateToComprehensiveFormat() {
  console.log('🔄 MIGRATING TO COMPREHENSIVE CAMPAIGN FORMAT')
  console.log('=============================================\n')
  
  const campaignsFile = path.join(process.cwd(), 'mock', 'campaigns.json')
  const donationsDir = path.join(process.cwd(), 'mock', 'donations')
  const newCampaignsDir = path.join(process.cwd(), 'mock', 'campaigns')
  
  // Create new campaigns directory
  if (!fs.existsSync(newCampaignsDir)) {
    fs.mkdirSync(newCampaignsDir, { recursive: true })
    console.log('📁 Created campaigns directory')
  }
  
  // Read existing campaigns
  if (!fs.existsSync(campaignsFile)) {
    console.log('❌ No campaigns.json found')
    return
  }
  
  const campaigns = JSON.parse(fs.readFileSync(campaignsFile, 'utf8'))
  console.log(`📊 Found ${campaigns.length} campaigns to migrate\n`)
  
  for (const campaign of campaigns) {
    console.log(`🔄 Migrating campaign ${campaign.id}: ${campaign.title || campaign.name}`)
    
    // Look for existing donations
    let existingDonations = []
    const donationFiles = [
      path.join(donationsDir, `${campaign.id}.json`),
      path.join(donationsDir, `campaign_${campaign.id}.json`)
    ]
    
    for (const donationFile of donationFiles) {
      if (fs.existsSync(donationFile)) {
        try {
          const donations = JSON.parse(fs.readFileSync(donationFile, 'utf8'))
          existingDonations = donations.map(d => ({
            ...d,
            timestamp: d.timestamp || new Date().toISOString()
          }))
          console.log(`  📦 Found ${existingDonations.length} existing donations`)
          break
        } catch (error) {
          console.log(`  ⚠️ Error reading donation file: ${error.message}`)
        }
      }
    }
    
    // Calculate statistics
    const confirmed = existingDonations.filter(d => d.status === 'confirmed')
    const pending = existingDonations.filter(d => d.status === 'pending')
    const confirmedAmount = confirmed.reduce((sum, d) => sum + parseFloat(d.amount || '0'), 0)
    const pendingAmount = pending.reduce((sum, d) => sum + parseFloat(d.amount || '0'), 0)
    const uniqueDonors = new Set(
      existingDonations
        .filter(d => !d.anonymous)
        .map(d => d.donorAddress?.toLowerCase())
    ).size
    
    // Create comprehensive campaign data
    const comprehensiveCampaign = {
      // Basic campaign info
      id: campaign.id,
      title: campaign.title || campaign.name,
      description: campaign.description,
      longDescription: campaign.longDescription || campaign.description,
      ngoId: campaign.ngoId,
      ngoName: campaign.ngoName,
      category: campaign.category,
      location: campaign.location || 'Philippines',
      targetAmount: campaign.targetAmount || 100,
      status: campaign.status || 'active',
      featured: campaign.featured || false,
      urgencyLevel: campaign.urgencyLevel || 'normal',
      walletAddress: campaign.walletAddress,
      createdAt: campaign.createdAt || new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      
      // Campaign details
      beneficiaries: campaign.beneficiaries || 0,
      tags: campaign.tags || [],
      imageUrl: campaign.imageUrl || '',
      images: campaign.images || [],
      startDate: campaign.startDate || campaign.createdAt || new Date().toISOString(),
      endDate: campaign.endDate || '2025-12-31',
      
      // Calculated stats
      stats: {
        totalDonations: existingDonations.length,
        totalAmount: confirmedAmount + pendingAmount,
        confirmedAmount: confirmedAmount,
        pendingAmount: pendingAmount,
        donorCount: existingDonations.length,
        uniqueDonors: uniqueDonors,
        lastDonationAt: existingDonations.length > 0 ? existingDonations[0].timestamp : undefined
      },
      
      // Updates and milestones
      updates: campaign.updates || [],
      milestones: campaign.milestones || [],
      
      // Integrated donations
      donations: existingDonations
    }
    
    // Save comprehensive format
    const newFile = path.join(newCampaignsDir, `campaign_${campaign.id}.json`)
    fs.writeFileSync(newFile, JSON.stringify(comprehensiveCampaign, null, 2))
    
    console.log(`  ✅ Migrated: ${existingDonations.length} donations, ${confirmedAmount.toFixed(4)} SONIC confirmed`)
  }
  
  console.log('\n🎉 MIGRATION COMPLETE!')
  console.log(`✅ Migrated ${campaigns.length} campaigns to comprehensive format`)
  console.log(`📁 New files created in: ${newCampaignsDir}`)
  console.log('\n💡 The system will now use the comprehensive format automatically')
  console.log('💡 Old campaigns.json and donations/*.json files can be kept as backup')
}

// Run migration
if (require.main === module) {
  migrateToComprehensiveFormat().catch(console.error)
}

module.exports = { migrateToComprehensiveFormat }