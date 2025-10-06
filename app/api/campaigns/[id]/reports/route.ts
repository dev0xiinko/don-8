import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const campaignId = params.id
    const formData = await request.formData()
    const file = formData.get('report') as File
    const reportType = formData.get('reportType') as string || 'progress'
    const description = formData.get('description') as string || ''

    if (!file) {
      return NextResponse.json({
        success: false,
        message: 'No file provided'
      }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/png',
      'image/jpg'
    ]

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({
        success: false,
        message: 'Invalid file type. Please upload PDF, DOC, DOCX, or image files only.'
      }, { status: 400 })
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return NextResponse.json({
        success: false,
        message: 'File size too large. Maximum size is 10MB.'
      }, { status: 400 })
    }

    // Create reports directory if it doesn't exist
    const reportsDir = path.join(process.cwd(), 'public', 'reports')
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true })
    }

    // Generate unique filename
    const timestamp = Date.now()
    const fileExtension = path.extname(file.name)
    const safeFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const fileName = `${campaignId}_${timestamp}_${safeFileName}`
    const filePath = path.join(reportsDir, fileName)

    // Save file
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    fs.writeFileSync(filePath, buffer)

    // Load existing campaign data (using comprehensive data)
    const campaignFilePath = path.join(process.cwd(), 'mock', 'campaigns', `campaign_${campaignId}.json`)
    let campaignData: any = {}

    try {
      if (fs.existsSync(campaignFilePath)) {
        const fileContent = fs.readFileSync(campaignFilePath, 'utf8')
        campaignData = JSON.parse(fileContent)
      }
    } catch (error) {
      console.error('Error reading campaign data:', error)
    }

    // Create report object
    const report = {
      id: `report_${timestamp}`,
      fileName: file.name,
      filePath: `/reports/${fileName}`,
      fileSize: file.size,
      fileType: file.type,
      reportType,
      description,
      uploadedAt: new Date().toISOString(),
      uploadedBy: 'ngo' // Could be enhanced to include NGO info
    }

    // Add report to campaign data
    if (!campaignData.reports) {
      campaignData.reports = []
    }
    campaignData.reports.push(report)

    // Update last modified timestamp
    campaignData.lastUpdated = new Date().toISOString()

    // Save updated campaign data
    fs.writeFileSync(campaignFilePath, JSON.stringify(campaignData, null, 2))

    return NextResponse.json({
      success: true,
      message: 'Report uploaded successfully',
      report: report
    })

  } catch (error) {
    console.error('Error uploading report:', error)
    return NextResponse.json({
      success: false,
      message: 'Failed to upload report'
    }, { status: 500 })
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const campaignId = params.id
    
    // Load campaign data to get reports (using comprehensive data)
    const campaignFilePath = path.join(process.cwd(), 'mock', 'campaigns', `campaign_${campaignId}.json`)
    
    if (!fs.existsSync(campaignFilePath)) {
      return NextResponse.json({
        success: false,
        message: 'Campaign not found'
      }, { status: 404 })
    }

    const fileContent = fs.readFileSync(campaignFilePath, 'utf8')
    const campaignData = JSON.parse(fileContent)

    return NextResponse.json({
      success: true,
      reports: campaignData.reports || []
    })

  } catch (error) {
    console.error('Error fetching reports:', error)
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch reports'
    }, { status: 500 })
  }
}