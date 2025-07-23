"use client"

import { useState, useEffect } from "react"

export interface NGOReport {
  id: string
  ngoId: string
  ngoName: string
  reportType: "financial" | "impact" | "activity" | "annual"
  title: string
  description: string
  reportingPeriod: {
    startDate: string
    endDate: string
  }
  submittedAt: string
  status: "pending" | "under_review" | "approved" | "rejected" | "revision_requested"
  reviewedAt?: string
  reviewedBy?: string
  reviewNotes?: string

  // Financial Information
  financialData?: {
    totalReceived: string
    totalSpent: string
    remainingBalance: string
    expenses: Array<{
      category: string
      amount: string
      description: string
      date: string
      receipts?: string[]
    }>
    fundingSources: Array<{
      source: string
      amount: string
      date: string
    }>
  }

  // Impact Information
  impactData?: {
    beneficiariesReached: number
    programsCompleted: number
    goalsAchieved: Array<{
      goal: string
      status: "completed" | "in_progress" | "not_started"
      progress: number
      description: string
    }>
    metrics: Array<{
      metric: string
      value: string
      unit: string
      comparison?: string
    }>
  }

  // Activity Information
  activityData?: {
    activitiesCompleted: Array<{
      name: string
      date: string
      location: string
      participants: number
      description: string
      outcomes: string
    }>
    upcomingActivities: Array<{
      name: string
      plannedDate: string
      location: string
      expectedParticipants: number
      description: string
    }>
  }

  // Supporting Documents
  documents: Array<{
    name: string
    type: "receipt" | "photo" | "certificate" | "report" | "other"
    url: string
    uploadedAt: string
  }>

  // Media
  media?: Array<{
    type: "image" | "video"
    url: string
    caption: string
    uploadedAt: string
  }>

  // Compliance
  compliance?: {
    regulatoryCompliance: boolean
    auditStatus: "pending" | "completed" | "not_required"
    certifications: string[]
    licenses: string[]
  }
}

// Mock data
const mockReports: NGOReport[] = [
  {
    id: "report_001",
    ngoId: "ngo_001",
    ngoName: "Green Earth Foundation",
    reportType: "impact",
    title: "Q4 2024 Environmental Impact Report",
    description:
      "Quarterly report on our reforestation and climate awareness programs, including tree planting initiatives and community education efforts.",
    reportingPeriod: {
      startDate: "2024-10-01",
      endDate: "2024-12-31",
    },
    submittedAt: "2025-01-15T10:30:00Z",
    status: "pending",
    financialData: {
      totalReceived: "45.5",
      totalSpent: "38.2",
      remainingBalance: "7.3",
      expenses: [
        {
          category: "Tree Seedlings",
          amount: "15.5",
          description: "Purchase of 5,000 native tree seedlings",
          date: "2024-10-15",
          receipts: ["receipt_001.pdf", "receipt_002.pdf"],
        },
        {
          category: "Equipment",
          amount: "8.7",
          description: "Planting tools and maintenance equipment",
          date: "2024-11-01",
          receipts: ["receipt_003.pdf"],
        },
        {
          category: "Staff Salaries",
          amount: "12.0",
          description: "Quarterly staff compensation",
          date: "2024-12-31",
          receipts: ["payroll_q4.pdf"],
        },
        {
          category: "Transportation",
          amount: "2.0",
          description: "Vehicle fuel and maintenance for field activities",
          date: "2024-12-15",
          receipts: ["fuel_receipts.pdf"],
        },
      ],
      fundingSources: [
        {
          source: "DON-8 Platform Donations",
          amount: "35.5",
          date: "2024-10-01",
        },
        {
          source: "Government Grant",
          amount: "10.0",
          date: "2024-11-15",
        },
      ],
    },
    impactData: {
      beneficiariesReached: 2500,
      programsCompleted: 3,
      goalsAchieved: [
        {
          goal: "Plant 5,000 trees",
          status: "completed",
          progress: 100,
          description: "Successfully planted 5,200 native trees across 3 locations",
        },
        {
          goal: "Educate 2,000 community members",
          status: "completed",
          progress: 125,
          description: "Conducted workshops reaching 2,500 people about climate change",
        },
        {
          goal: "Establish 2 community gardens",
          status: "in_progress",
          progress: 75,
          description: "1 garden completed, 1 garden 75% complete",
        },
      ],
      metrics: [
        {
          metric: "Trees Planted",
          value: "5200",
          unit: "trees",
          comparison: "104% of target",
        },
        {
          metric: "CO2 Absorption Potential",
          value: "26",
          unit: "tons/year",
          comparison: "Estimated annual absorption",
        },
        {
          metric: "Community Engagement",
          value: "2500",
          unit: "people",
          comparison: "125% of target",
        },
      ],
    },
    activityData: {
      activitiesCompleted: [
        {
          name: "Community Tree Planting Day",
          date: "2024-10-20",
          location: "Riverside Park",
          participants: 150,
          description: "Large-scale community tree planting event",
          outcomes: "Planted 1,500 trees with community volunteers",
        },
        {
          name: "Climate Change Workshop",
          date: "2024-11-15",
          location: "Community Center",
          participants: 80,
          description: "Educational workshop on climate change impacts",
          outcomes: "Increased awareness and commitment to environmental action",
        },
        {
          name: "School Environmental Program",
          date: "2024-12-10",
          location: "Local Elementary School",
          participants: 200,
          description: "Environmental education program for students",
          outcomes: "Students created environmental action plans",
        },
      ],
      upcomingActivities: [
        {
          name: "Spring Planting Campaign",
          plannedDate: "2025-03-15",
          location: "Multiple sites",
          expectedParticipants: 300,
          description: "Large-scale spring tree planting initiative",
        },
      ],
    },
    documents: [
      {
        name: "Financial Summary Q4 2024",
        type: "report",
        url: "/documents/financial_summary_q4.pdf",
        uploadedAt: "2025-01-15T10:00:00Z",
      },
      {
        name: "Tree Planting Certificates",
        type: "certificate",
        url: "/documents/planting_certificates.pdf",
        uploadedAt: "2025-01-15T10:15:00Z",
      },
      {
        name: "Community Workshop Photos",
        type: "photo",
        url: "/documents/workshop_photos.zip",
        uploadedAt: "2025-01-15T10:20:00Z",
      },
    ],
    media: [
      {
        type: "image",
        url: "/images/tree_planting_1.jpg",
        caption: "Community volunteers planting trees at Riverside Park",
        uploadedAt: "2025-01-15T10:25:00Z",
      },
      {
        type: "image",
        url: "/images/workshop_1.jpg",
        caption: "Climate change workshop participants",
        uploadedAt: "2025-01-15T10:26:00Z",
      },
    ],
    compliance: {
      regulatoryCompliance: true,
      auditStatus: "completed",
      certifications: ["Environmental Stewardship Certificate", "Non-profit Registration"],
      licenses: ["Environmental Activity License"],
    },
  },
  {
    id: "report_002",
    ngoId: "ngo_002",
    ngoName: "Tech for Education",
    reportType: "financial",
    title: "Annual Financial Report 2024",
    description:
      "Comprehensive financial report for all technology education programs and digital literacy initiatives conducted in 2024.",
    reportingPeriod: {
      startDate: "2024-01-01",
      endDate: "2024-12-31",
    },
    submittedAt: "2025-01-10T14:20:00Z",
    status: "under_review",
    reviewedAt: "2025-01-12T09:00:00Z",
    reviewedBy: "admin_001",
    financialData: {
      totalReceived: "125.8",
      totalSpent: "118.3",
      remainingBalance: "7.5",
      expenses: [
        {
          category: "Computer Equipment",
          amount: "45.0",
          description: "Laptops and tablets for student programs",
          date: "2024-03-15",
          receipts: ["equipment_invoice_001.pdf"],
        },
        {
          category: "Software Licenses",
          amount: "15.5",
          description: "Educational software and development tools",
          date: "2024-02-01",
          receipts: ["software_licenses.pdf"],
        },
        {
          category: "Instructor Fees",
          amount: "35.8",
          description: "Payment to certified instructors",
          date: "2024-12-31",
          receipts: ["instructor_payments.pdf"],
        },
        {
          category: "Venue Rentals",
          amount: "12.0",
          description: "Classroom and workshop space rentals",
          date: "2024-12-31",
          receipts: ["venue_receipts.pdf"],
        },
        {
          category: "Internet & Utilities",
          amount: "10.0",
          description: "Internet connectivity and utilities for programs",
          date: "2024-12-31",
          receipts: ["utility_bills.pdf"],
        },
      ],
      fundingSources: [
        {
          source: "DON-8 Platform Donations",
          amount: "85.8",
          date: "2024-01-01",
        },
        {
          source: "Corporate Sponsorship",
          amount: "25.0",
          date: "2024-06-15",
        },
        {
          source: "Government Grant",
          amount: "15.0",
          date: "2024-09-01",
        },
      ],
    },
    impactData: {
      beneficiariesReached: 1200,
      programsCompleted: 8,
      goalsAchieved: [
        {
          goal: "Train 1,000 students in basic computer skills",
          status: "completed",
          progress: 120,
          description: "Successfully trained 1,200 students across 8 programs",
        },
        {
          goal: "Establish 5 computer labs",
          status: "completed",
          progress: 100,
          description: "Set up 5 fully equipped computer labs in underserved schools",
        },
        {
          goal: "Certify 100 advanced students",
          status: "completed",
          progress: 85,
          description: "85 students received advanced certification",
        },
      ],
      metrics: [
        {
          metric: "Students Trained",
          value: "1200",
          unit: "students",
          comparison: "120% of target",
        },
        {
          metric: "Computer Labs Established",
          value: "5",
          unit: "labs",
          comparison: "100% of target",
        },
        {
          metric: "Job Placement Rate",
          value: "78",
          unit: "percent",
          comparison: "Above industry average",
        },
      ],
    },
    documents: [
      {
        name: "Annual Financial Audit",
        type: "report",
        url: "/documents/annual_audit_2024.pdf",
        uploadedAt: "2025-01-10T14:00:00Z",
      },
      {
        name: "Student Certificates",
        type: "certificate",
        url: "/documents/student_certificates.pdf",
        uploadedAt: "2025-01-10T14:10:00Z",
      },
    ],
    compliance: {
      regulatoryCompliance: true,
      auditStatus: "completed",
      certifications: ["Educational Institution License", "Non-profit Status"],
      licenses: ["Teaching License", "Technology Training Certification"],
    },
  },
  {
    id: "report_003",
    ngoId: "ngo_003",
    ngoName: "Community Health Network",
    reportType: "activity",
    title: "Mobile Health Services Report - January 2025",
    description:
      "Monthly report on mobile healthcare services provided to rural communities, including medical checkups, vaccinations, and health education programs.",
    reportingPeriod: {
      startDate: "2025-01-01",
      endDate: "2025-01-31",
    },
    submittedAt: "2025-02-05T16:45:00Z",
    status: "approved",
    reviewedAt: "2025-02-07T11:30:00Z",
    reviewedBy: "admin_002",
    reviewNotes: "Excellent comprehensive report with clear impact metrics and proper documentation.",
    activityData: {
      activitiesCompleted: [
        {
          name: "Rural Health Camp - Village A",
          date: "2025-01-08",
          location: "Village A Community Center",
          participants: 120,
          description: "Comprehensive health checkups and basic treatments",
          outcomes: "Treated 120 patients, identified 15 cases requiring specialist care",
        },
        {
          name: "Vaccination Drive",
          date: "2025-01-15",
          location: "Multiple villages",
          participants: 200,
          description: "COVID-19 and routine vaccination program",
          outcomes: "Administered 200 vaccines, achieved 95% coverage in target area",
        },
        {
          name: "Health Education Workshop",
          date: "2025-01-22",
          location: "Village B School",
          participants: 80,
          description: "Hygiene and preventive healthcare education",
          outcomes: "Improved health awareness, distributed hygiene kits",
        },
      ],
      upcomingActivities: [
        {
          name: "Women's Health Camp",
          plannedDate: "2025-02-15",
          location: "Village C",
          expectedParticipants: 100,
          description: "Specialized women's health services and education",
        },
      ],
    },
    impactData: {
      beneficiariesReached: 400,
      programsCompleted: 3,
      goalsAchieved: [
        {
          goal: "Provide healthcare to 350 people",
          status: "completed",
          progress: 114,
          description: "Served 400 people across multiple programs",
        },
        {
          goal: "Achieve 90% vaccination coverage",
          status: "completed",
          progress: 105,
          description: "Achieved 95% vaccination coverage in target areas",
        },
      ],
      metrics: [
        {
          metric: "Patients Treated",
          value: "400",
          unit: "patients",
          comparison: "114% of monthly target",
        },
        {
          metric: "Vaccinations Administered",
          value: "200",
          unit: "doses",
          comparison: "95% coverage achieved",
        },
        {
          metric: "Health Education Participants",
          value: "80",
          unit: "people",
          comparison: "100% of workshop capacity",
        },
      ],
    },
    documents: [
      {
        name: "Medical Records Summary",
        type: "report",
        url: "/documents/medical_summary_jan2025.pdf",
        uploadedAt: "2025-02-05T16:30:00Z",
      },
      {
        name: "Vaccination Records",
        type: "report",
        url: "/documents/vaccination_records.pdf",
        uploadedAt: "2025-02-05T16:35:00Z",
      },
    ],
    media: [
      {
        type: "image",
        url: "/images/health_camp_1.jpg",
        caption: "Medical team conducting health checkups",
        uploadedAt: "2025-02-05T16:40:00Z",
      },
      {
        type: "image",
        url: "/images/vaccination_drive.jpg",
        caption: "Vaccination drive in rural village",
        uploadedAt: "2025-02-05T16:41:00Z",
      },
    ],
    compliance: {
      regulatoryCompliance: true,
      auditStatus: "not_required",
      certifications: ["Medical Service License", "Healthcare Provider Certification"],
      licenses: ["Mobile Healthcare License", "Vaccination Authorization"],
    },
  },
]

export function useNGOReports() {
  const [reports, setReports] = useState<NGOReport[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadReports()
  }, [])

  const loadReports = async () => {
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setReports(mockReports)
    } catch (error) {
      console.error("Error loading reports:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const updateReportStatus = async (reportId: string, status: NGOReport["status"], reviewNotes?: string) => {
    try {
      const updatedReports = reports.map((report) =>
        report.id === reportId
          ? {
              ...report,
              status,
              reviewedAt: new Date().toISOString(),
              reviewedBy: "current_admin",
              reviewNotes,
            }
          : report,
      )
      setReports(updatedReports)
      return true
    } catch (error) {
      console.error("Error updating report:", error)
      return false
    }
  }

  const getReportsByStatus = (status: NGOReport["status"]) => {
    return reports.filter((report) => report.status === status)
  }

  const getReportsByType = (type: NGOReport["reportType"]) => {
    return reports.filter((report) => report.reportType === type)
  }

  const getReportsByNGO = (ngoId: string) => {
    return reports.filter((report) => report.ngoId === ngoId)
  }

  return {
    reports,
    isLoading,
    updateReportStatus,
    getReportsByStatus,
    getReportsByType,
    getReportsByNGO,
    refreshReports: loadReports,
  }
}
