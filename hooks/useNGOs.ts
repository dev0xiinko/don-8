"use client"

import { useState, useEffect, useMemo } from "react"

export interface NGO {
  id: number
  name: string
  description: string
  category: string
  location: string
  score: number
  totalRaised: number
  goal: number
  donors: number
  image: string
  verified: boolean
  lastUpdate: string
  walletAddress: string
  projects: string[]
  recentUpdates: Array<{
    date: string
    title: string
    description: string
  }>
}

// Mock NGO data - in a real app, this would come from an API
const mockNGOs: NGO[] = [
  {
    id: 1,
    name: "Education for All Foundation",
    description: "Providing quality education to underprivileged children worldwide through innovative programs",
    category: "Education",
    location: "Philippines",
    score: 95,
    totalRaised: 125000,
    goal: 200000,
    donors: 1250,
    image: "/placeholder.svg?height=60&width=60",
    verified: true,
    lastUpdate: "2 days ago",
    walletAddress: "0x742d35Cc6634C0532925a3b8D4C0C8b3C2e1e416",
    projects: [
      "School Building Project - 75% Complete",
      "Teacher Training Program - 60% Complete",
      "Digital Learning Initiative - 40% Complete",
    ],
    recentUpdates: [
      {
        date: "2025-01-08",
        title: "New classroom construction completed",
        description: "We've successfully completed the construction of 3 new classrooms serving 150 students.",
      },
    ],
  },
  {
    id: 2,
    name: "Clean Water Initiative",
    description: "Building wells and water systems in rural communities to provide clean drinking water",
    category: "Environment",
    location: "Kenya",
    score: 92,
    totalRaised: 89000,
    goal: 150000,
    donors: 890,
    image: "/placeholder.svg?height=60&width=60",
    verified: true,
    lastUpdate: "1 day ago",
    walletAddress: "0x8ba1f109551bD432803012645Hac136c30C6213",
    projects: ["Well Construction - 80% Complete", "Water Purification Systems - 45% Complete"],
    recentUpdates: [
      {
        date: "2025-01-09",
        title: "New well completed in Kibera",
        description: "Our latest well now serves 500 families with clean drinking water.",
      },
    ],
  },
  {
    id: 3,
    name: "Healthcare Heroes",
    description: "Supporting frontline healthcare workers and providing essential medical supplies",
    category: "Healthcare",
    location: "Global",
    score: 88,
    totalRaised: 67000,
    goal: 100000,
    donors: 567,
    image: "/placeholder.svg?height=60&width=60",
    verified: true,
    lastUpdate: "3 hours ago",
    walletAddress: "0x9Cc9a2c777605Cc5a7ac4014C882934C2e2e1e41",
    projects: ["Medical Supply Distribution - 90% Complete", "Healthcare Worker Support - 70% Complete"],
    recentUpdates: [
      {
        date: "2025-01-10",
        title: "Medical supplies delivered to rural clinics",
        description: "Distributed essential medical supplies to 15 rural healthcare facilities.",
      },
    ],
  },
  {
    id: 4,
    name: "Food Security Network",
    description: "Fighting hunger by providing nutritious meals and sustainable farming solutions",
    category: "Poverty",
    location: "Bangladesh",
    score: 91,
    totalRaised: 45000,
    goal: 80000,
    donors: 423,
    image: "/placeholder.svg?height=60&width=60",
    verified: true,
    lastUpdate: "5 hours ago",
    walletAddress: "0x1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t",
    projects: ["Community Gardens - 60% Complete", "Nutrition Programs - 85% Complete"],
    recentUpdates: [
      {
        date: "2025-01-09",
        title: "New community garden established",
        description: "Launched a new community garden that will feed 200 families year-round.",
      },
    ],
  },
  {
    id: 5,
    name: "Disaster Relief Coalition",
    description: "Providing emergency aid and rebuilding support for disaster-affected communities",
    category: "Disaster Relief",
    location: "Global",
    score: 89,
    totalRaised: 156000,
    goal: 250000,
    donors: 1890,
    image: "/placeholder.svg?height=60&width=60",
    verified: true,
    lastUpdate: "1 hour ago",
    walletAddress: "0xa1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0",
    projects: ["Emergency Response - 95% Complete", "Rebuilding Homes - 30% Complete"],
    recentUpdates: [
      {
        date: "2025-01-10",
        title: "Emergency supplies distributed",
        description: "Delivered emergency supplies to 1,000 families affected by recent flooding.",
      },
    ],
  },
]

export function useNGOs() {
  const [ngos, setNGOs] = useState<NGO[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [sortBy, setSortBy] = useState<"score" | "recent" | "progress">("score")

  // Simulate API call
  useEffect(() => {
    const loadNGOs = async () => {
      setIsLoading(true)
      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setNGOs(mockNGOs)
      setIsLoading(false)
    }

    loadNGOs()
  }, [])

  // Filter and sort NGOs
  const filteredAndSortedNGOs = useMemo(() => {
    const filtered = ngos.filter((ngo) => {
      const matchesSearch =
        ngo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ngo.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ngo.location.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesCategory =
        selectedCategory === "all" || ngo.category.toLowerCase() === selectedCategory.toLowerCase()

      return matchesSearch && matchesCategory
    })

    // Sort NGOs
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "score":
          return b.score - a.score
        case "recent":
          return new Date(b.lastUpdate).getTime() - new Date(a.lastUpdate).getTime()
        case "progress":
          return b.totalRaised / b.goal - a.totalRaised / a.goal
        default:
          return 0
      }
    })

    return filtered
  }, [ngos, searchQuery, selectedCategory, sortBy])

  const categories = useMemo(() => {
    const cats = Array.from(new Set(ngos.map((ngo) => ngo.category)))
    return cats.sort()
  }, [ngos])

  const getNGOById = (id: number): NGO | undefined => {
    return ngos.find((ngo) => ngo.id === id)
  }

  return {
    ngos: filteredAndSortedNGOs,
    allNGOs: ngos,
    isLoading,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    sortBy,
    setSortBy,
    categories,
    getNGOById,
  }
}
