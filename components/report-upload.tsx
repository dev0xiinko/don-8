"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter 
} from '@/components/ui/dialog'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  Upload, 
  FileText, 
  Image, 
  CheckCircle, 
  AlertCircle,
  Download,
  Eye
} from 'lucide-react'

interface ReportUploadProps {
  campaignId: string | number
  onReportUpload: (campaignId: string, file: File, reportType?: string, description?: string) => Promise<void>
  existingReports?: any[]
}

export function ReportUpload({ campaignId, onReportUpload, existingReports = [] }: ReportUploadProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [reportType, setReportType] = useState('progress')
  const [description, setDescription] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0])
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    setIsUploading(true)
    try {
      await onReportUpload(campaignId.toString(), selectedFile, reportType, description)
      
      // Reset form on success
      setSelectedFile(null)
      setDescription('')
      setReportType('progress')
      setIsOpen(false)
    } catch (error) {
      console.error('Upload failed:', error)
    } finally {
      setIsUploading(false)
    }
  }

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('pdf')) return <FileText className="w-4 h-4 text-red-500" />
    if (fileType.includes('image')) return <Image className="w-4 h-4 text-blue-500" />
    return <FileText className="w-4 h-4 text-gray-500" />
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <Upload className="w-4 h-4" />
            Upload Report
            {existingReports.length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {existingReports.length}
              </Badge>
            )}
          </Button>
        </DialogTrigger>

        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Upload Progress Report</DialogTitle>
            <DialogDescription>
              Upload a report to keep donors updated on campaign progress
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Report Type Selection */}
            <div className="space-y-2">
              <Label htmlFor="reportType">Report Type</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select report type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="progress">Progress Report</SelectItem>
                  <SelectItem value="financial">Financial Report</SelectItem>
                  <SelectItem value="impact">Impact Assessment</SelectItem>
                  <SelectItem value="final">Final Report</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* File Upload Area */}
            <div className="space-y-2">
              <Label>Report File</Label>
              <div
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                  dragActive 
                    ? 'border-blue-500 bg-blue-50' 
                    : selectedFile 
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                {selectedFile ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-center gap-2">
                      {getFileIcon(selectedFile.type)}
                      <span className="font-medium">{selectedFile.name}</span>
                    </div>
                    <p className="text-sm text-gray-500">
                      {formatFileSize(selectedFile.size)}
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedFile(null)}
                    >
                      Remove File
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="w-12 h-12 mx-auto text-gray-400" />
                    <div>
                      <p className="text-lg font-medium">Drop your file here</p>
                      <p className="text-sm text-gray-500">or click to browse</p>
                    </div>
                    <Input
                      type="file"
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      onChange={handleFileChange}
                      className="hidden"
                      id="file-upload"
                    />
                    <Label htmlFor="file-upload">
                      <Button variant="outline" size="sm" asChild>
                        <span>Browse Files</span>
                      </Button>
                    </Label>
                    <p className="text-xs text-gray-500 mt-2">
                      Supported: PDF, DOC, DOCX, JPG, PNG (Max: 10MB)
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                placeholder="Brief description of this report..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>

            {/* Existing Reports */}
            {existingReports.length > 0 && (
              <div className="space-y-2">
                <Label>Previous Reports</Label>
                <div className="max-h-32 overflow-y-auto space-y-2">
                  {existingReports.map((report: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded border">
                      <div className="flex items-center gap-2">
                        {getFileIcon(report.fileType || 'application/pdf')}
                        <div>
                          <p className="text-sm font-medium">{report.fileName}</p>
                          <p className="text-xs text-gray-500">
                            {report.reportType} • {new Date(report.uploadedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm" asChild>
                          <a href={report.filePath} target="_blank" rel="noopener noreferrer">
                            <Eye className="w-3 h-3" />
                          </a>
                        </Button>
                        <Button variant="ghost" size="sm" asChild>
                          <a href={report.filePath} download>
                            <Download className="w-3 h-3" />
                          </a>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleUpload} 
              disabled={!selectedFile || isUploading}
            >
              {isUploading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Report
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}