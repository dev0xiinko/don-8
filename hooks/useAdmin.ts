"use client"

import { useState, useEffect } from "react"

export interface NGOApplication {
  id: string
  organizationName: string
  email: string
  description: string
  category: string
  location: string
  website?: string
  walletAddress: string
  documents: string[]
  status: "pending" | "approved" | "rejected" | "under_review"
  submittedAt: string
  reviewedAt?: string
  reviewedBy?: string
  reviewNotes?: string
  contactPerson: string
  phone: string
  registrationNumber?: string
  taxId?: string
  bankAccount?: string
  socialMedia?: {
    facebook?: string
    twitter?: string
    linkedin?: string
  }
}

export interface PlatformUser {
  id: string
  address: string
  walletType: "metamask" | "phantom"
  userType: "donor" | "ngo"
  joinedAt: string
  lastActive: string
  totalDonated?: string
  totalReceived?: string
  status: "active" | "suspended" | "banned"
  verificationStatus: "unverified" | "pending" | "verified"
  kycCompleted: boolean
}

export interface PlatformStats {
  totalUsers: number
  totalNGOs: number
  totalDonors: number
  totalDonations: string
  totalVolume: string
  pendingApplications: number
  activeUsers24h: number
  transactionsToday: number
  averageDonation: string
  topCategories: Array<{ category: string; count: number; volume: string }>
}

export interface AdminActivity {
  id: string
  adminId: string
  action: string
  target: string
  details: string
  timestamp: string
  ipAddress?: string
}

// Mock data
const mockApplications: NGOApplication[] = [
  {
    id: "app_001",
    organizationName: "Green Earth Foundation",
    email: "contact@greenearth.org",
    description:
      "Environmental conservation and climate change awareness organization focused on reforestation and sustainable practices.",
    category: "Environment",
    location: "California, USA",
    website: "https://greenearth.org",
    walletAddress: "0x1234567890abcdef1234567890abcdef12345678",
    documents: ["registration.pdf", "tax_exempt.pdf", "financial_report.pdf"],
    status: "pending",
    submittedAt: "2025-01-08T10:30:00Z",
    contactPerson: "Sarah Johnson",
    phone: "+1-555-0123",
    registrationNumber: "REG-2024-001",
    taxId: "TAX-501C3-001",
    socialMedia: {
      facebook: "https://facebook.com/greenearth",
      twitter: "https://twitter.com/greenearth",
    },
  },
  {
    id: "app_002",
    organizationName: "Tech for Education",
    email: "admin@techforedu.org",
    description: "Providing technology access and digital literacy programs to underserved communities and schools.",
    category: "Education",
    location: "New York, USA",
    website: "https://techforedu.org",
    walletAddress: "0xabcdef1234567890abcdef1234567890abcdef12",
    documents: ["incorporation.pdf", "board_resolution.pdf"],
    status: "under_review",
    submittedAt: "2025-01-07T14:15:00Z",
    reviewedAt: "2025-01-09T09:00:00Z",
    reviewedBy: "admin_001",
    contactPerson: "Michael Chen",
    phone: "+1-555-0456",
    registrationNumber: "REG-2024-002",
  },
  {
    id: "app_003",
    organizationName: "Community Health Network",
    email: "info@commhealth.org",
    description: "Mobile healthcare services and health education programs for rural and remote communities.",
    category: "Healthcare",
    location: "Texas, USA",
    walletAddress: "0x9876543210fedcba9876543210fedcba98765432",
    documents: ["medical_license.pdf", "insurance.pdf", "audit_report.pdf"],
    status: "approved",
    submittedAt: "2025-01-05T16:45:00Z",
    reviewedAt: "2025-01-06T11:30:00Z",
    reviewedBy: "admin_002",
    reviewNotes: "All documentation verified. Excellent track record.",
    contactPerson: "Dr. Maria Rodriguez",
    phone: "+1-555-0789",
    registrationNumber: "REG-2024-003",
    taxId: "TAX-501C3-003",
  },
]

const mockUsers: PlatformUser[] = [
  {
    id: "user_001",
    address: "0x742d35Cc6634C0532925a3b8D4C0C8b3C2e1e416",
    walletType: "metamask",
    userType: "donor",
    joinedAt: "2025-01-01T00:00:00Z",
    lastActive: "2025-01-10T15:30:00Z",
    totalDonated: "2.5",
    status: "active",
    verificationStatus: "verified",
    kycCompleted: true,
  },
  {
    id: "user_002",
    address: "0x8ba1f109551bD432803012645Hac136c30C6213",
    walletType: "metamask",
    userType: "ngo",
    joinedAt: "2025-01-02T00:00:00Z",
    lastActive: "2025-01-10T12:00:00Z",
    totalReceived: "125.0",
    status: "active",
    verificationStatus: "verified",
    kycCompleted: true,
  },
]

const mockStats: PlatformStats = {
  totalUsers: 5847,
  totalNGOs: 156,
  totalDonors: 5691,
  totalDonations: "12,450",
  totalVolume: "2,847.5",
  pendingApplications: 23,
  activeUsers24h: 1247,
  transactionsToday: 89,
  averageDonation: "0.23",
  topCategories: [
    { category: "Education", count: 45, volume: "1,234.5" },
    { category: "Healthcare", count: 38, volume: "987.2" },
    { category: "Environment", count: 32, volume: "756.8" },
    { category: "Poverty", count: 28, volume: "543.1" },
    { category: "Disaster Relief", count: 13, volume: "325.9" },
  ],
}

export function useAdmin() {
  const [applications, setApplications] = useState<NGOApplication[]>([])
  const [users, setUsers] = useState<PlatformUser[]>([])
  const [stats, setStats] = useState<PlatformStats | null>(null)
  const [activities, setActivities] = useState<AdminActivity[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadAdminData()
  }, [])

  const loadAdminData = async () => {
    setIsLoading(true)
    try {
      // Simulate API calls
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setApplications(mockApplications)
      setUsers(mockUsers)
      setStats(mockStats)
      setActivities([])
    } catch (error) {
      console.error("Error loading admin data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const updateApplicationStatus = async (
    applicationId: string,
    status: NGOApplication["status"],
    reviewNotes?: string,
  ) => {
    try {
      const updatedApplications = applications.map((app) =>
        app.id === applicationId
          ? {
              ...app,
              status,
              reviewedAt: new Date().toISOString(),
              reviewedBy: "current_admin", // In real app, get from auth context
              reviewNotes,
            }
          : app,
      )
      setApplications(updatedApplications)

      // Log admin activity
      const activity: AdminActivity = {
        id: Date.now().toString(),
        adminId: "current_admin",
        action: `Application ${status}`,
        target: applicationId,
        details: `NGO application ${status}: ${applications.find((a) => a.id === applicationId)?.organizationName}`,
        timestamp: new Date().toISOString(),
      }
      setActivities((prev) => [activity, ...prev])

      return true
    } catch (error) {
      console.error("Error updating application:", error)
      return false
    }
  }

  const updateUserStatus = async (userId: string, status: PlatformUser["status"]) => {
    try {
      const updatedUsers = users.map((user) => (user.id === userId ? { ...user, status } : user))
      setUsers(updatedUsers)

      // Log admin activity
      const activity: AdminActivity = {
        id: Date.now().toString(),
        adminId: "current_admin",
        action: `User ${status}`,
        target: userId,
        details: `User status changed to ${status}`,
        timestamp: new Date().toISOString(),
      }
      setActivities((prev) => [activity, ...prev])

      return true
    } catch (error) {
      console.error("Error updating user:", error)
      return false
    }
  }

  const getApplicationsByStatus = (status: NGOApplication["status"]) => {
    return applications.filter((app) => app.status === status)
  }

  const getUsersByType = (userType: PlatformUser["userType"]) => {
    return users.filter((user) => user.userType === userType)
  }

  const getRecentActivities = (limit = 10) => {
    return activities.slice(0, limit)
  }

  return {
    applications,
    users,
    stats,
    activities,
    isLoading,
    updateApplicationStatus,
    updateUserStatus,
    getApplicationsByStatus,
    getUsersByType,
    getRecentActivities,
    refreshData: loadAdminData,
  }
}
