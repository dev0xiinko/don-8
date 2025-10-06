import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

interface NGOScore {
  ngoId: number
  ngoName: string
  currentScore: number
  maxScore: number
  totalWithdrawals: number
  updatesOnTime: number
  updatesLate: number
  lastUpdated: string
  scoreHistory: ScoreEvent[]
}

interface ScoreEvent {
  date: string
  type: 'withdrawal' | 'update' | 'penalty'
  campaignId?: string
  withdrawalAmount?: number
  daysAfterWithdrawal?: number
  scoreChange: number
  description: string
}

const SCORES_FILE = path.join(process.cwd(), 'mock', 'ngo-scores.json')
const CAMPAIGNS_DIR = path.join(process.cwd(), 'mock', 'campaigns')
const CAMPAIGNS_FILE = path.join(process.cwd(), 'mock', 'campaigns.json')

// Dynamic scoring weights and criteria
const SCORING_CRITERIA = {
  baseScore: 100,
  maxScore: 150,
  weights: {
    reportFrequency: 0.2,      // 20% - Regular report uploads
    updateConsistency: 0.25,   // 25% - Regular campaign updates
    donationTransparency: 0.15, // 15% - Clear donation tracking
    withdrawalCompliance: 0.25, // 25% - Updates within 7 days of withdrawal
    campaignCompletion: 0.1,   // 10% - Successfully completed campaigns
    responseTime: 0.05         // 5% - Quick response to queries/issues
  },
  penalties: {
    lateUpdate: -10,           // Per late update after withdrawal
    noReports: -5,             // Per month without reports
    inactiveCampaign: -3,      // Per campaign with no updates >30 days
    donationDiscrepancy: -15   // Major discrepancies in donation reporting
  },
  bonuses: {
    frequentReports: 10,       // Bonus for monthly+ reports
    quickUpdates: 5,           // Updates within 24h of withdrawal
    highEngagement: 8,         // Regular updates and donor communication
    completedCampaigns: 15,    // Successfully completed campaigns with final reports
    activeWithdrawal: 3        // Bonus for each withdrawal (shows active fund usage)
  }
}

// Dynamic score calculation based on NGO's actual data
async function calculateDynamicScore(ngoId: number, ngoName?: string): Promise<NGOScore> {
  console.log(`🧮 Calculating dynamic score for NGO ${ngoId} (${ngoName})`)
  
  // Load all campaigns to analyze NGO performance
  const campaignsData = await loadAllCampaigns()
  const ngoCampaigns = campaignsData.filter((campaign: any) => 
    campaign.ngoId === ngoId || (ngoName && campaign.ngoName === ngoName)
  )
  
  console.log(`📊 Found ${ngoCampaigns.length} campaigns for NGO ${ngoId}`)
  
  let score = SCORING_CRITERIA.baseScore
  let totalWithdrawals = 0
  let updatesOnTime = 0
  let updatesLate = 0
  const scoreHistory: ScoreEvent[] = []
  
  // Analyze each campaign for transparency metrics
  for (const campaign of ngoCampaigns) {
    const campaignAge = Math.floor(
      (Date.now() - new Date(campaign.createdAt).getTime()) / (1000 * 60 * 60 * 24)
    )
    
    // 1. Report Frequency Analysis
    const reports = campaign.reports || []
    const reportsPerMonth = reports.length > 0 ? (reports.length / Math.max(1, campaignAge / 30)) : 0
    
    if (reportsPerMonth >= 1) {
      score += SCORING_CRITERIA.bonuses.frequentReports
      scoreHistory.push({
        date: new Date().toISOString(),
        type: 'update',
        campaignId: campaign.id.toString(),
        scoreChange: SCORING_CRITERIA.bonuses.frequentReports,
        description: `Bonus: Regular report uploads (${reports.length} reports)`
      })
    } else if (reportsPerMonth === 0 && campaignAge > 30) {
      score += SCORING_CRITERIA.penalties.noReports
      scoreHistory.push({
        date: new Date().toISOString(),
        type: 'penalty',
        campaignId: campaign.id.toString(),
        scoreChange: SCORING_CRITERIA.penalties.noReports,
        description: `Penalty: No reports for ${Math.floor(campaignAge/30)} month(s)`
      })
    }
    
    // 2. Update Consistency Analysis
    const updates = campaign.updates || []
    const updatesPerMonth = updates.length > 0 ? (updates.length / Math.max(1, campaignAge / 30)) : 0
    
    if (updatesPerMonth >= 2) {
      score += SCORING_CRITERIA.bonuses.highEngagement
      scoreHistory.push({
        date: new Date().toISOString(),
        type: 'update',
        campaignId: campaign.id.toString(),
        scoreChange: SCORING_CRITERIA.bonuses.highEngagement,
        description: `Bonus: High engagement (${updates.length} updates)`
      })
    } else if (updates.length === 0 && campaignAge > 30) {
      score += SCORING_CRITERIA.penalties.inactiveCampaign
      scoreHistory.push({
        date: new Date().toISOString(),
        type: 'penalty',
        campaignId: campaign.id.toString(),
        scoreChange: SCORING_CRITERIA.penalties.inactiveCampaign,
        description: `Penalty: No updates for ${campaignAge} days`
      })
    }
    
    // 3. Withdrawal Compliance Analysis
    if (campaign.withdrawals && campaign.withdrawals.length > 0) {
      for (const withdrawal of campaign.withdrawals) {
        totalWithdrawals++
        
        // Check if update was posted within 7 days
        const withdrawalDate = new Date(withdrawal.timestamp)
        const sevenDaysLater = new Date(withdrawalDate.getTime() + (7 * 24 * 60 * 60 * 1000))
        
        const updatesAfterWithdrawal = updates.filter((update: any) => {
          const updateDate = new Date(update.createdAt)
          return updateDate >= withdrawalDate && updateDate <= sevenDaysLater
        })
        
        if (updatesAfterWithdrawal.length > 0) {
          updatesOnTime++
          // Check if update was within 24 hours for bonus
          const quickUpdates = updatesAfterWithdrawal.filter((update: any) => {
            const updateDate = new Date(update.createdAt)
            const hoursDiff = (updateDate.getTime() - withdrawalDate.getTime()) / (1000 * 60 * 60)
            return hoursDiff <= 24
          })
          
          if (quickUpdates.length > 0) {
            score += SCORING_CRITERIA.bonuses.quickUpdates
            scoreHistory.push({
              date: new Date().toISOString(),
              type: 'update',
              campaignId: campaign.id.toString(),
              withdrawalAmount: withdrawal.amount,
              scoreChange: SCORING_CRITERIA.bonuses.quickUpdates,
              description: `Bonus: Quick update within 24h of withdrawal`
            })
          }
        } else {
          // Check if more than 7 days have passed
          const now = new Date()
          if (now > sevenDaysLater) {
            updatesLate++
            score += SCORING_CRITERIA.penalties.lateUpdate
            scoreHistory.push({
              date: new Date().toISOString(),
              type: 'penalty',
              campaignId: campaign.id.toString(),
              withdrawalAmount: withdrawal.amount,
              scoreChange: SCORING_CRITERIA.penalties.lateUpdate,
              description: `Penalty: No update within 7 days of withdrawal`
            })
          }
        }
      }
    }
    
    // 4. Campaign Completion Analysis
    if (campaign.status === 'completed') {
      const finalReports = reports.filter((report: any) => 
        report.type === 'final' || report.description.toLowerCase().includes('final')
      )
      
      if (finalReports.length > 0) {
        score += SCORING_CRITERIA.bonuses.completedCampaigns
        scoreHistory.push({
          date: new Date().toISOString(),
          type: 'update',
          campaignId: campaign.id.toString(),
          scoreChange: SCORING_CRITERIA.bonuses.completedCampaigns,
          description: `Bonus: Campaign completed with final report`
        })
      }
    }
    
    // 5. Donation Transparency Analysis
    const donations = campaign.donations || []
    const stats = campaign.stats || {}
    
    // Check for major discrepancies in donation reporting
    const calculatedTotal = donations
      .filter((d: any) => d.status === 'confirmed')
      .reduce((sum: number, d: any) => sum + parseFloat(d.amount || 0), 0)
    
    const reportedTotal = stats.confirmedAmount || 0
    const discrepancy = Math.abs(calculatedTotal - reportedTotal)
    
    if (discrepancy > 0.01) { // More than 0.01 SONIC discrepancy
      score += SCORING_CRITERIA.penalties.donationDiscrepancy
      scoreHistory.push({
        date: new Date().toISOString(),
        type: 'penalty',
        campaignId: campaign.id.toString(),
        scoreChange: SCORING_CRITERIA.penalties.donationDiscrepancy,
        description: `Penalty: Donation amount discrepancy (${discrepancy.toFixed(4)} SONIC)`
      })
    }
  }
  
  // 6. Load withdrawals from withdrawals.json file
  const withdrawalsFromFile = await loadWithdrawals(ngoId)
  const totalWithdrawalsFromFile = withdrawalsFromFile.length
  
  // Use the higher count (from campaigns or from withdrawals file)
  const actualTotalWithdrawals = Math.max(totalWithdrawals, totalWithdrawalsFromFile)
  
  // 7. Active Withdrawal Bonus
  if (actualTotalWithdrawals > 0) {
    const withdrawalBonus = actualTotalWithdrawals * SCORING_CRITERIA.bonuses.activeWithdrawal
    score += withdrawalBonus
    scoreHistory.push({
      date: new Date().toISOString(),
      type: 'update',
      campaignId: 'all',
      scoreChange: withdrawalBonus,
      description: `Bonus: ${actualTotalWithdrawals} active withdrawals (+${SCORING_CRITERIA.bonuses.activeWithdrawal} each)`
    })
  }
  
  // Cap the score at maximum
  score = Math.min(score, SCORING_CRITERIA.maxScore)
  score = Math.max(0, score) // Don't go below 0
  
  const ngoScore: NGOScore = {
    ngoId,
    ngoName: ngoName || `NGO ${ngoId}`,
    currentScore: Math.round(score),
    maxScore: SCORING_CRITERIA.maxScore,
    totalWithdrawals: actualTotalWithdrawals,
    updatesOnTime,
    updatesLate,
    lastUpdated: new Date().toISOString(),
    scoreHistory: scoreHistory.slice(0, 20) // Keep last 20 events
  }
  
  console.log(`✅ Dynamic score calculated for NGO ${ngoId}: ${ngoScore.currentScore}/${SCORING_CRITERIA.maxScore}`)
  return ngoScore
}

// Get NGO scores (all or specific NGO)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const ngoId = searchParams.get('ngoId')
    
    console.log('📊 Getting dynamic NGO scores', ngoId ? `for NGO ${ngoId}` : 'for all NGOs')
    
    if (ngoId) {
      const source = new URL(request.url).searchParams.get('source') || 'dynamic'
      if (source === 'stored') {
        // Explicitly requested stored score
        const storedScores = await loadNGOScores()
        const storedScore = storedScores.find(score => score.ngoId === parseInt(ngoId))
        if (storedScore) {
          console.log(`📦 Returning stored score for NGO ${ngoId}: ${storedScore.currentScore}`)
          return NextResponse.json({ success: true, score: storedScore })
        }
      }
      // Default: dynamic calculation (authoritative)
      const campaigns = await loadAllCampaigns()
      const ngoCampaign = campaigns.find((c: any) => c.ngoId === parseInt(ngoId))
      const ngoName = ngoCampaign?.ngoName || `NGO ${ngoId}`
      const dynamicScore = await calculateDynamicScore(parseInt(ngoId), ngoName)
      console.log(`🧮 Returning dynamic score for NGO ${ngoId}: ${dynamicScore.currentScore}`)
      return NextResponse.json({ success: true, score: dynamicScore })
    }
    
    // Calculate dynamic scores for all NGOs
    const campaigns = await loadAllCampaigns()
    const uniqueNGOs = new Set<number>()
    const ngoNames = new Map<number, string>()
    
    campaigns.forEach((campaign: any) => {
      if (campaign.ngoId) {
        uniqueNGOs.add(campaign.ngoId)
        ngoNames.set(campaign.ngoId, campaign.ngoName || `NGO ${campaign.ngoId}`)
      }
    })
    
    const allScores: NGOScore[] = []
    for (const ngoId of uniqueNGOs) {
      const dynamicScore = await calculateDynamicScore(ngoId, ngoNames.get(ngoId))
      allScores.push(dynamicScore)
    }
    
    // Return all scores with ranking
    const rankedScores = allScores
      .sort((a: NGOScore, b: NGOScore) => b.currentScore - a.currentScore)
      .map((score: NGOScore, index: number) => ({
        ...score,
        rank: index + 1
      }))
    
    return NextResponse.json({
      success: true,
      scores: rankedScores,
      summary: {
        totalNGOs: allScores.length,
        averageScore: allScores.reduce((sum: number, s: NGOScore) => sum + s.currentScore, 0) / allScores.length || 0,
        topScore: rankedScores[0]?.currentScore || 0,
        lowestScore: rankedScores[rankedScores.length - 1]?.currentScore || 0
      }
    })
    
  } catch (error) {
    console.error('Error getting NGO scores:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to get NGO scores' },
      { status: 500 }
    )
  }
}

// Update NGO score (for withdrawals, updates, etc.)
export async function POST(request: NextRequest) {
  try {
    const { ngoId, type, campaignId, withdrawalAmount, updateDate } = await request.json()
    
    console.log(`🔄 Processing score update for NGO ${ngoId}:`, { type, campaignId })
    
    let scores = await loadNGOScores()
    let ngoScore = scores.find(score => score.ngoId === ngoId)
    
    if (!ngoScore) {
      // Initialize new NGO score
      ngoScore = await initializeNGOScore(ngoId)
      scores.push(ngoScore)
    }
    
    let scoreChange = 0
    let description = ''
    
    if (type === 'withdrawal') {
      // Award points for active fund usage
      scoreChange = SCORING_CRITERIA.bonuses.activeWithdrawal
      description = `Withdrawal of ${withdrawalAmount} SONIC from campaign ${campaignId} (+${scoreChange} reputation points for active fund usage)`
      
      ngoScore.totalWithdrawals++
      // Do not mutate currentScore here; final application happens once below
      
      // Schedule penalty check (in real app, this would be a background job)
      // For now, we'll check on next update or manual review
      
    } else if (type === 'update') {
      // Check if this update is related to recent withdrawals
      const campaignData = await loadCampaignData(campaignId)
      
      if (campaignData && campaignData.withdrawals) {
        // Find recent withdrawals without updates
        const recentWithdrawals = campaignData.withdrawals.filter((w: any) => {
          const withdrawalDate = new Date(w.timestamp)
          const updateDateObj = new Date(updateDate)
          const daysDiff = Math.floor((updateDateObj.getTime() - withdrawalDate.getTime()) / (1000 * 60 * 60 * 24))
          
          return daysDiff >= 0 && daysDiff <= 7 && !w.hasPostUpdate
        })
        
        if (recentWithdrawals.length > 0) {
          // Update within 7 days - maintain 100 score
          scoreChange = 0
          ngoScore.updatesOnTime++
          description = `Update posted within 7 days of withdrawal - transparency maintained`
          
          // Mark withdrawals as having post-update
          recentWithdrawals.forEach((w: any) => {
            w.hasPostUpdate = true
            w.updatePostedDate = updateDate
          })
          
          await saveCampaignData(campaignId, campaignData)
        }
      }
      
    } else if (type === 'penalty_check') {
      // Manual penalty check for overdue updates
      const campaignData = await loadCampaignData(campaignId)
      
      if (campaignData && campaignData.withdrawals) {
        const overdueWithdrawals = campaignData.withdrawals.filter((w: any) => {
          if (w.hasPostUpdate) return false
          
          const withdrawalDate = new Date(w.timestamp)
          const now = new Date()
          const daysDiff = Math.floor((now.getTime() - withdrawalDate.getTime()) / (1000 * 60 * 60 * 24))
          
          return daysDiff > 7
        })
        
        if (overdueWithdrawals.length > 0) {
          scoreChange = -10 * overdueWithdrawals.length
          ngoScore.updatesLate += overdueWithdrawals.length
          description = `Penalty: ${overdueWithdrawals.length} withdrawal(s) without update within 7 days`
          
          // Mark as penalized
          overdueWithdrawals.forEach((w: any) => {
            w.penaltyApplied = true
          })
          
          await saveCampaignData(campaignId, campaignData)
        }
      }
    }
    
    // Apply score change (ensure it stays within bounds)
    ngoScore.currentScore = Math.max(0, Math.min(ngoScore.currentScore + scoreChange, SCORING_CRITERIA.maxScore))
    ngoScore.lastUpdated = new Date().toISOString()
    
    // Add to score history
    const scoreEvent: ScoreEvent = {
      date: new Date().toISOString(),
      type: type,
      campaignId: campaignId,
      withdrawalAmount: withdrawalAmount,
      scoreChange: scoreChange,
      description: description
    }
    
    ngoScore.scoreHistory.unshift(scoreEvent)
    
    // Keep only last 50 events
    if (ngoScore.scoreHistory.length > 50) {
      ngoScore.scoreHistory = ngoScore.scoreHistory.slice(0, 50)
    }
    
    // Save updated scores
    await saveNGOScores(scores)
    
    console.log(`✅ NGO ${ngoId} score updated: ${scoreChange >= 0 ? '+' : ''}${scoreChange} points`)
    
    return NextResponse.json({
      success: true,
      score: ngoScore,
      scoreChange: scoreChange,
      message: description
    })
    
  } catch (error) {
    console.error('Error updating NGO score:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update NGO score' },
      { status: 500 }
    )
  }
}

// Helper functions
async function loadWithdrawals(ngoId: number): Promise<any[]> {
  try {
    const withdrawalsFile = path.join(process.cwd(), 'mock', 'withdrawals.json')
    if (fs.existsSync(withdrawalsFile)) {
      const content = fs.readFileSync(withdrawalsFile, 'utf8')
      const allWithdrawals = JSON.parse(content)
      return allWithdrawals.filter((w: any) => w.ngoId === ngoId)
    }
    return []
  } catch (error) {
    console.error('Error loading withdrawals:', error)
    return []
  }
}

async function loadNGOScores(): Promise<NGOScore[]> {
  try {
    if (fs.existsSync(SCORES_FILE)) {
      const content = fs.readFileSync(SCORES_FILE, 'utf8')
      return JSON.parse(content)
    }
    return []
  } catch (error) {
    console.error('Error loading NGO scores:', error)
    return []
  }
}

async function saveNGOScores(scores: NGOScore[]): Promise<void> {
  try {
    // Ensure directory exists
    const dir = path.dirname(SCORES_FILE)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    
    fs.writeFileSync(SCORES_FILE, JSON.stringify(scores, null, 2))
  } catch (error) {
    console.error('Error saving NGO scores:', error)
    throw error
  }
}

async function initializeNGOScore(ngoId: number): Promise<NGOScore> {
  // Get NGO name from applications
  let ngoName = `NGO ${ngoId}`
  
  try {
    const applicationsFile = path.join(process.cwd(), 'mock', 'ngo-applications.json')
    if (fs.existsSync(applicationsFile)) {
      const applications = JSON.parse(fs.readFileSync(applicationsFile, 'utf8'))
      const ngoApp = applications.find((app: any) => app.id === ngoId)
      if (ngoApp) {
        ngoName = ngoApp.organizationName
      }
    }
  } catch (error) {
    console.error('Error getting NGO name:', error)
  }
  
  return {
    ngoId: ngoId,
    ngoName: ngoName,
    currentScore: 100, // Start with perfect score
    maxScore: 100,
    totalWithdrawals: 0,
    updatesOnTime: 0,
    updatesLate: 0,
    lastUpdated: new Date().toISOString(),
    scoreHistory: [
      {
        date: new Date().toISOString(),
        type: 'update',
        scoreChange: 0,
        description: 'NGO score initialized at 100 points'
      }
    ]
  }
}

async function loadCampaignData(campaignId: string): Promise<any> {
  try {
    const campaignFile = path.join(CAMPAIGNS_DIR, `campaign_${campaignId}.json`)
    
    if (fs.existsSync(campaignFile)) {
      const content = fs.readFileSync(campaignFile, 'utf8')
      return JSON.parse(content)
    }
    
    return null
  } catch (error) {
    console.error('Error loading campaign data:', error)
    return null
  }
}

async function saveCampaignData(campaignId: string, data: any): Promise<void> {
  try {
    const campaignFile = path.join(CAMPAIGNS_DIR, `campaign_${campaignId}.json`)
    fs.writeFileSync(campaignFile, JSON.stringify(data, null, 2))
  } catch (error) {
    console.error('Error saving campaign data:', error)
    throw error
  }
}

async function loadAllCampaigns(): Promise<any[]> {
  try {
    // First try to load from main campaigns.json
    let campaigns: any[] = []
    
    if (fs.existsSync(CAMPAIGNS_FILE)) {
      const content = fs.readFileSync(CAMPAIGNS_FILE, 'utf8')
      campaigns = JSON.parse(content)
    }
    
    // Enhance with comprehensive data from individual campaign files
    const enhancedCampaigns = campaigns.map((campaign: any) => {
      try {
        const campaignFile = path.join(CAMPAIGNS_DIR, `campaign_${campaign.id}.json`)
        if (fs.existsSync(campaignFile)) {
          const comprehensiveData = JSON.parse(fs.readFileSync(campaignFile, 'utf8'))
          return {
            ...campaign,
            ...comprehensiveData,
            // Merge key arrays
            donations: comprehensiveData.donations || [],
            updates: comprehensiveData.updates || campaign.updates || [],
            reports: comprehensiveData.reports || [],
            withdrawals: comprehensiveData.withdrawals || [],
            stats: comprehensiveData.stats || {}
          }
        }
        return campaign
      } catch (error) {
        console.warn(`Error loading comprehensive data for campaign ${campaign.id}:`, error)
        return campaign
      }
    })
    
    return enhancedCampaigns
  } catch (error) {
    console.error('Error loading campaigns:', error)
    return []
  }
}