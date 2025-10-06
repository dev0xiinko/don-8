"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  FileText, 
  Image, 
  Download, 
  Eye, 
  Calendar,
  FileType,
  ExternalLink
} from 'lucide-react'

interface Report {
  id: string
  fileName: string
  filePath: string
  fileSize: number
  fileType: string
  reportType: string
  description: string
  uploadedAt: string
  uploadedBy: string
}

interface CampaignReportsProps {
  campaignId: string
  refreshKey?: number
}

export function CampaignReports({ campaignId, refreshKey = 0 }: CampaignReportsProps) {
  const [reports, setReports] = useState<Report[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await fetch(`/api/campaigns/${campaignId}/reports`)
        const result = await response.json()
        
        if (result.success) {
          setReports(result.reports || [])
        }
      } catch (error) {
        console.error('Error fetching reports:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchReports()
  }, [campaignId, refreshKey])

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('pdf')) return <FileText className="w-5 h-5 text-red-500" />
    if (fileType.includes('image')) return <Image className="w-5 h-5 text-blue-500" />
    if (fileType.includes('word') || fileType.includes('document')) return <FileType className="w-5 h-5 text-blue-600" />
    return <FileText className="w-5 h-5 text-gray-500" />
  }

  const getReportTypeBadge = (type: string) => {
    const variants: Record<string, string> = {
      'progress': 'bg-blue-100 text-blue-800',
      'financial': 'bg-green-100 text-green-800',
      'impact': 'bg-purple-100 text-purple-800',
      'final': 'bg-orange-100 text-orange-800',
      'other': 'bg-gray-100 text-gray-800'
    }
    
    return variants[type] || variants.other
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatReportType = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1).replace(/([A-Z])/g, ' $1')
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Reports & Documents
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <span className="ml-2">Loading reports...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Reports & Documents
          </div>
          <Badge variant="secondary">
            {reports.length} {reports.length === 1 ? 'report' : 'reports'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {reports.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Reports Available</h3>
            <p className="text-gray-500">
              No progress reports have been uploaded for this campaign yet.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {reports.map((report) => (
              <div key={report.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <div className="flex-shrink-0 mt-1">
                      {getFileIcon(report.fileType)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm font-medium text-gray-900 truncate">
                          {report.fileName}
                        </h4>
                        <Badge 
                          className={`text-xs ${getReportTypeBadge(report.reportType)}`}
                        >
                          {formatReportType(report.reportType)}
                        </Badge>
                      </div>
                      
                      {report.description && (
                        <p className="text-sm text-gray-600 mb-2">
                          {report.description}
                        </p>
                      )}
                      
                      <div className="flex items-center text-xs text-gray-500 space-x-4">
                        <div className="flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          {new Date(report.uploadedAt).toLocaleDateString()}
                        </div>
                        <div>
                          {formatFileSize(report.fileSize)}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => window.open(report.filePath, '_blank')}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    
                    <Button 
                      variant="ghost" 
                      size="sm"
                      asChild
                    >
                      <a href={report.filePath} download>
                        <Download className="w-4 h-4" />
                      </a>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}