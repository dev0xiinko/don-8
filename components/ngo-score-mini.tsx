"use client"

import { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { 
  Star, 
  Award, 
  Clock, 
  AlertTriangle,
  Loader2
} from 'lucide-react'

interface NGOScoreMiniProps {
  ngoId: number
  ngoName: string
  className?: string
}

export function NGOScoreMini({ ngoId, ngoName, className = "" }: NGOScoreMiniProps) {
  const [score, setScore] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadScore = async () => {
      try {
        const response = await fetch(`/api/ngo-scores?ngoId=${ngoId}`)
        const result = await response.json()
        
        if (result.success && result.score) {
          setScore(result.score.currentScore)
        }
      } catch (error) {
        console.error('Error loading NGO score:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadScore()
  }, [ngoId])

  if (isLoading) {
    return (
      <div className={`flex items-center gap-1 ${className}`}>
        <Loader2 className="w-3 h-3 animate-spin text-gray-400" />
        <span className="text-xs text-gray-500">Loading...</span>
      </div>
    )
  }

  if (score === null) {
    return (
      <div className={`flex items-center gap-1 text-gray-500 ${className}`}>
        <Clock className="w-3 h-3" />
        <span className="text-xs">New NGO</span>
      </div>
    )
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-50 border-green-200'
    if (score >= 70) return 'text-yellow-600 bg-yellow-50 border-yellow-200'
    return 'text-red-600 bg-red-50 border-red-200'
  }

  const getScoreIcon = (score: number) => {
    if (score >= 90) return Star
    if (score >= 70) return Award
    return AlertTriangle
  }

  const ScoreIcon = getScoreIcon(score)

  return (
    <Badge 
      variant="outline" 
      className={`flex items-center gap-1 text-xs font-medium ${getScoreColor(score)} ${className}`}
    >
      <ScoreIcon className="w-3 h-3" />
      <span>{score} pts</span>
    </Badge>
  )
}