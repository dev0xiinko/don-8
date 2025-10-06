"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Trophy, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  RefreshCw,
  Award,
  Star
} from 'lucide-react'

interface NGOScoreData {
  ngoId: number
  ngoName: string
  currentScore: number
  maxScore: number
  totalWithdrawals: number
  updatesOnTime: number
  updatesLate: number
  lastUpdated: string
  scoreHistory: ScoreEvent[]
  rank?: number
}

interface ScoreEvent {
  date: string
  type: 'withdrawal' | 'update' | 'penalty'
  campaignId?: string
  withdrawalAmount?: number
  scoreChange: number
  description: string
}

interface NGOScoringProps {
  ngoId: number
  ngoName: string
}

export default function NGOScoring({ ngoId, ngoName }: NGOScoringProps) {
  const [scoreData, setScoreData] = useState<NGOScoreData | null>(null)
  const [globalRanking, setGlobalRanking] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const loadScoreData = async () => {
    try {
      setIsRefreshing(true)
      
      // Load individual NGO score
      const scoreResponse = await fetch(`/api/ngo-scores?ngoId=${ngoId}`)
      const scoreResult = await scoreResponse.json()
      
      if (scoreResult.success) {
        setScoreData(scoreResult.score)
      }
      
      // Load global ranking
      const globalResponse = await fetch('/api/ngo-scores')
      const globalResult = await globalResponse.json()
      
      if (globalResult.success) {
        setGlobalRanking(globalResult)
      }
      
    } catch (error) {
      console.error('Error loading score data:', error)
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  const runPenaltyCheck = async () => {
    try {
      setIsRefreshing(true)
      
      // This would trigger a penalty check for overdue updates
      const response = await fetch('/api/ngo-scores', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ngoId: ngoId,
          type: 'penalty_check',
          campaignId: 'all' // Check all campaigns
        })
      })
      
      const result = await response.json()
      
      if (result.success) {
        await loadScoreData() // Refresh data
      }
      
    } catch (error) {
      console.error('Error running penalty check:', error)
    } finally {
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    if (ngoId) {
      loadScoreData()
    }
  }, [ngoId])

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <RefreshCw className="w-6 h-6 animate-spin mr-2" />
          <span>Loading NGO score...</span>
        </CardContent>
      </Card>
    )
  }

  if (!scoreData) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-orange-500" />
          <p>No scoring data available</p>
        </CardContent>
      </Card>
    )
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600'
    if (score >= 70) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 90) return 'default' // green
    if (score >= 70) return 'secondary' // yellow
    return 'destructive' // red
  }

  const recentEvents = scoreData.scoreHistory.slice(0, 5)
  const myRank = globalRanking?.scores?.find((s: any) => s.ngoId === ngoId)?.rank || 'N/A'

  return (
    <div className="space-y-4">
      {/* Main Score Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center">
            <Award className="w-5 h-5 mr-2 text-yellow-600" />
            NGO Reputation Score
          </CardTitle>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={runPenaltyCheck}
              disabled={isRefreshing}
            >
              {isRefreshing ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Clock className="w-4 h-4" />
              )}
              Check Updates
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={loadScoreData}
              disabled={isRefreshing}
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Current Score */}
            <div className="text-center">
              <div className={`text-4xl font-bold ${getScoreColor(scoreData.currentScore)}`}>
                {scoreData.currentScore}
              </div>
              <div className="text-sm text-gray-600">Current Score</div>
              <Progress 
                value={(scoreData.currentScore / scoreData.maxScore) * 100} 
                className="mt-2 h-2"
              />
            </div>

            {/* Global Rank */}
            <div className="text-center">
              <div className="flex items-center justify-center mb-1">
                {myRank === 1 && <Trophy className="w-6 h-6 text-yellow-500 mr-1" />}
                <span className="text-2xl font-bold text-blue-600">#{myRank}</span>
              </div>
              <div className="text-sm text-gray-600">Global Rank</div>
              <div className="text-xs text-gray-500 mt-1">
                out of {globalRanking?.summary?.totalNGOs || 0} NGOs
              </div>
            </div>

            {/* Updates On Time */}
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {scoreData.updatesOnTime}
              </div>
              <div className="text-sm text-gray-600">Updates On Time</div>
              <div className="flex items-center justify-center mt-1">
                <CheckCircle className="w-3 h-3 text-green-500 mr-1" />
                <span className="text-xs text-green-600">Within 7 days</span>
              </div>
            </div>

            {/* Late Updates */}
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {scoreData.updatesLate}
              </div>
              <div className="text-sm text-gray-600">Late Updates</div>
              <div className="flex items-center justify-center mt-1">
                <AlertTriangle className="w-3 h-3 text-red-500 mr-1" />
                <span className="text-xs text-red-600">-10 points each</span>
              </div>
            </div>
          </div>

          {/* Score Status Alert */}
          <div className="mt-4">
            {scoreData.currentScore >= 90 && (
              <Alert className="border-green-200 bg-green-50">
                <Star className="w-4 h-4" />
                <AlertDescription className="text-green-800">
                  <strong>Excellent Reputation!</strong> You consistently engage with donors and provide timely updates.
                </AlertDescription>
              </Alert>
            )}
            
            {scoreData.currentScore >= 70 && scoreData.currentScore < 90 && (
              <Alert className="border-yellow-200 bg-yellow-50">
                <Clock className="w-4 h-4" />
                <AlertDescription className="text-yellow-800">
                  <strong>Good Reputation.</strong> Continue posting regular updates and reports to improve your score.
                </AlertDescription>
              </Alert>
            )}
            
            {scoreData.currentScore < 70 && (
              <Alert className="border-red-200 bg-red-50">
                <AlertTriangle className="w-4 h-4" />
                <AlertDescription className="text-red-800">
                  <strong>Reputation Needs Improvement.</strong> Post more updates and reports to build donor confidence and trust.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Scoring Rules */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Reputation Scoring System</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <div className="font-medium">+5 Points: Campaign Updates</div>
              <div className="text-gray-600">Earn points for posting campaign progress updates and reports</div>
            </div>
          </div>
          
          <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
            <TrendingUp className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <div className="font-medium">+3 Points: Fund Withdrawals</div>
              <div className="text-gray-600">Show activity by withdrawing donated funds for campaign use</div>
            </div>
          </div>
          
          <div className="flex items-start space-x-3 p-3 bg-orange-50 rounded-lg">
            <Clock className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <div className="font-medium">-10 Points: Penalty</div>
              <div className="text-gray-600">Deducted for withdrawals without updates within 7 days</div>
            </div>
          </div>
          
          <div className="flex items-start space-x-3 p-3 bg-purple-50 rounded-lg">
            <Star className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <div className="font-medium">Bonus Points</div>
              <div className="text-gray-600">Additional rewards for consistent transparency and donor engagement</div>
            </div>
          </div>
          
          <div className="text-xs text-gray-500 mt-2">
            Higher reputation scores increase donor confidence and improve your NGO's platform visibility.
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Scoring Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {recentEvents.length === 0 ? (
            <div className="text-center text-gray-500 py-4">
              <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No recent activity</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentEvents.map((event, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0 mt-0.5">
                    {event.type === 'update' && <CheckCircle className="w-4 h-4 text-green-600" />}
                    {event.type === 'withdrawal' && <TrendingDown className="w-4 h-4 text-blue-600" />}
                    {event.type === 'penalty' && <AlertTriangle className="w-4 h-4 text-red-600" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium">{event.description}</div>
                      <div className="flex items-center space-x-2">
                        {event.scoreChange !== 0 && (
                          <Badge variant={event.scoreChange > 0 ? 'default' : 'destructive'}>
                            {event.scoreChange > 0 ? '+' : ''}{event.scoreChange}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(event.date).toLocaleString()}
                      {event.campaignId && ` • Campaign ${event.campaignId}`}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Global Leaderboard Preview */}
      {globalRanking && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center">
              <Trophy className="w-5 h-5 mr-2 text-yellow-600" />
              Global NGO Leaderboard
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {globalRanking.scores.slice(0, 5).map((ngo: any, index: number) => (
                <div 
                  key={ngo.ngoId} 
                  className={`flex items-center justify-between p-2 rounded ${
                    ngo.ngoId === ngoId ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-200 text-xs font-bold">
                      {index + 1}
                    </div>
                    {index === 0 && <Trophy className="w-4 h-4 text-yellow-500" />}
                    <span className={`text-sm ${ngo.ngoId === ngoId ? 'font-semibold' : ''}`}>
                      {ngo.ngoName}
                    </span>
                    {ngo.ngoId === ngoId && <Badge variant="secondary">You</Badge>}
                  </div>
                  <Badge variant={getScoreBadgeVariant(ngo.currentScore)}>
                    {ngo.currentScore} pts
                  </Badge>
                </div>
              ))}
            </div>
            
            <div className="mt-4 text-xs text-gray-500 text-center">
              Average Score: {globalRanking.summary.averageScore.toFixed(1)} points
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}