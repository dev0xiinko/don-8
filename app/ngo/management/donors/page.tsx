"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Download, Filter, Eye, Mail, UserCheck } from "lucide-react"

export default function DonorsManagementPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")

  // Mock data for donors list
  const donorsList = [
    {
      id: 1,
      name: "Anonymous",
      totalDonated: 2.5,
      currency: "S",
      lastDonation: "2025-01-10",
      donationsCount: 5,
      isAnonymous: true,
      email: "anonymous@example.com",
      status: "active",
    },
    {
      id: 2,
      name: "John Doe",
      totalDonated: 3.2,
      currency: "S",
      lastDonation: "2025-01-09",
      donationsCount: 3,
      isAnonymous: false,
      email: "john.doe@example.com",
      status: "active",
    },
    {
      id: 3,
      name: "Sarah Smith",
      totalDonated: 1.8,
      currency: "S",
      lastDonation: "2025-01-08",
      donationsCount: 2,
      isAnonymous: false,
      email: "sarah.smith@example.com",
      status: "active",
    },
    {
      id: 4,
      name: "Anonymous",
      totalDonated: 0.5,
      currency: "S",
      lastDonation: "2025-01-07",
      donationsCount: 1,
      isAnonymous: true,
      email: "anonymous@example.com",
      status: "inactive",
    },
    {
      id: 5,
      name: "Michael Johnson",
      totalDonated: 5.0,
      currency: "S",
      lastDonation: "2025-01-06",
      donationsCount: 4,
      isAnonymous: false,
      email: "michael.johnson@example.com",
      status: "active",
    },
  ]

  // Filter donors based on search query and filter status
  const filteredDonors = donorsList.filter((donor) => {
    const matchesSearch = donor.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         donor.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = filterStatus === "all" || donor.status === filterStatus
    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Donors Management</h1>
        <Button variant="outline" className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Export Data
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Donors List</CardTitle>
          <CardDescription>View and manage all donors and their contribution details</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4">
            <div className="flex items-center space-x-4">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search donors..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[180px]">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    <SelectValue placeholder="Filter by status" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Donors</SelectItem>
                  <SelectItem value="active">Active Donors</SelectItem>
                  <SelectItem value="inactive">Inactive Donors</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Donor</th>
                    <th className="text-left py-3 px-4">Total Donated</th>
                    <th className="text-left py-3 px-4">Donations</th>
                    <th className="text-left py-3 px-4">Last Donation</th>
                    <th className="text-left py-3 px-4">Status</th>
                    <th className="text-left py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDonors.map((donor) => (
                    <tr key={donor.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-3">
                          <Avatar className="w-8 h-8">
                            {donor.isAnonymous ? (
                              <AvatarFallback className="bg-gray-200 text-gray-600">A</AvatarFallback>
                            ) : (
                              <AvatarFallback>{donor.name.substring(0, 2)}</AvatarFallback>
                            )}
                          </Avatar>
                          <div>
                            <div>{donor.name}</div>
                            {!donor.isAnonymous && (
                              <div className="text-xs text-gray-500">{donor.email}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {donor.totalDonated} {donor.currency}
                      </td>
                      <td className="py-3 px-4">{donor.donationsCount}</td>
                      <td className="py-3 px-4">{donor.lastDonation}</td>
                      <td className="py-3 px-4">
                        {donor.isAnonymous ? (
                          <Badge variant="outline" className="bg-gray-100">
                            Anonymous
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-green-100 text-green-800">
                            Public
                          </Badge>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <Button variant="ghost" size="icon" title="View Details">
                            <Eye className="h-4 w-4" />
                          </Button>
                          {!donor.isAnonymous && (
                            <Button variant="ghost" size="icon" title="Send Email">
                              <Mail className="h-4 w-4" />
                            </Button>
                          )}
                          <Button variant="ghost" size="icon" title="Verify Donor">
                            <UserCheck className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}