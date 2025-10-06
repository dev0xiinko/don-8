const fs = require('fs')
const path = require('path')

// Sync campaigns.json with comprehensive campaign files
function syncCampaignData() {
  const campaignsFile = path.join(__dirname, 'mock', 'campaigns.json')
  const campaignsDir = path.join(__dirname, 'mock', 'campaigns')
  
  console.log('🔄 Syncing campaign data...')
  
  try {
    // Read campaigns.json
    const campaignsContent = fs.readFileSync(campaignsFile, 'utf8')
    const campaigns = JSON.parse(campaignsContent)
    
    console.log(`📦 Found ${campaigns.length} campaigns in campaigns.json`)
    
    // Sync each campaign
    campaigns.forEach(campaign => {
      const campaignId = campaign.id
      const comprehensiveFile = path.join(campaignsDir, `campaign_${campaignId}.json`)
      
      if (fs.existsSync(comprehensiveFile)) {
        // Load existing comprehensive data
        const comprehensiveContent = fs.readFileSync(comprehensiveFile, 'utf8')
        const comprehensiveData = JSON.parse(comprehensiveContent)
        
        // Update comprehensive data with latest from campaigns.json
        const updatedData = {
          ...comprehensiveData,
          // Sync basic info
          title: campaign.title,
          description: campaign.description,
          longDescription: campaign.longDescription || campaign.description,
          ngoId: campaign.ngoId,
          ngoName: campaign.ngoName,
          category: campaign.category,
          targetAmount: campaign.targetAmount,
          status: campaign.status,
          featured: campaign.featured,
          urgencyLevel: campaign.urgencyLevel,
          walletAddress: campaign.walletAddress,
          createdAt: campaign.createdAt,
          lastUpdated: campaign.lastUpdated,
          
          // Sync visual assets
          imageUrl: campaign.imageUrl,
          images: campaign.images || [],
          
          // Sync campaign details
          location: campaign.location,
          beneficiaries: campaign.beneficiaries || 0,
          tags: campaign.tags || [],
          startDate: campaign.startDate || campaign.createdAt,
          endDate: campaign.endDate,
          
          // Sync updates and milestones
          updates: campaign.updates || comprehensiveData.updates || [],
          milestones: campaign.milestones || comprehensiveData.milestones || [],
          
          // Keep existing reports and donations
          reports: comprehensiveData.reports || [],
          donations: comprehensiveData.donations || []
        }
        
        // Recalculate stats
        updatedData.stats = calculateStats(updatedData.donations)
        
        // Save updated comprehensive data
        fs.writeFileSync(comprehensiveFile, JSON.stringify(updatedData, null, 2))
        console.log(`✅ Synced campaign ${campaignId}: ${updatedData.title}`)
        
      } else {
        // Create new comprehensive file
        const newData = {
          id: campaign.id,
          title: campaign.title,
          description: campaign.description,
          longDescription: campaign.longDescription || campaign.description,
          ngoId: campaign.ngoId,
          ngoName: campaign.ngoName,
          category: campaign.category,
          location: campaign.location || 'Philippines',
          targetAmount: campaign.targetAmount,
          status: campaign.status,
          featured: campaign.featured || false,
          urgencyLevel: campaign.urgencyLevel || 'normal',
          walletAddress: campaign.walletAddress,
          createdAt: campaign.createdAt,
          lastUpdated: campaign.lastUpdated || new Date().toISOString(),
          
          beneficiaries: campaign.beneficiaries || 0,
          tags: campaign.tags || [],
          imageUrl: campaign.imageUrl || '',
          images: campaign.images || [],
          startDate: campaign.startDate || campaign.createdAt,
          endDate: campaign.endDate,
          
          stats: {
            totalDonations: 0,
            totalAmount: 0,
            confirmedAmount: 0,
            pendingAmount: 0,
            donorCount: 0,
            uniqueDonors: 0
          },
          
          updates: campaign.updates || [],
          milestones: campaign.milestones || [],
          reports: [],
          donations: []
        }
        
        fs.writeFileSync(comprehensiveFile, JSON.stringify(newData, null, 2))
        console.log(`🆕 Created comprehensive data for campaign ${campaign.id}`)
      }
    })
    
    console.log('✅ Campaign data sync completed')
    
  } catch (error) {
    console.error('❌ Error syncing campaign data:', error)
  }
}

function calculateStats(donations) {
  const confirmed = donations.filter(d => d.status === 'confirmed')
  const pending = donations.filter(d => d.status === 'pending')
  
  const confirmedAmount = confirmed.reduce((sum, d) => sum + parseFloat(d.amount || '0'), 0)
  const pendingAmount = pending.reduce((sum, d) => sum + parseFloat(d.amount || '0'), 0)
  const totalAmount = confirmedAmount + pendingAmount
  
  const uniqueDonors = new Set(
    donations
      .filter(d => !d.anonymous)
      .map(d => d.donorAddress?.toLowerCase())
      .filter(addr => addr)
  ).size
  
  const lastDonation = donations.length > 0 ? donations[0] : null
  
  return {
    totalDonations: donations.length,
    totalAmount: totalAmount,
    confirmedAmount: confirmedAmount,
    pendingAmount: pendingAmount,
    donorCount: donations.length,
    uniqueDonors: uniqueDonors,
    lastDonationAt: lastDonation?.timestamp
  }
}

// Run the sync
syncCampaignData()