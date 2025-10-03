"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Eye,
  CheckCircle,
  XCircle,
  Filter,
  Search,
  Shield,
  LogOut,
} from "lucide-react";
import { useAdmin, NGOApplication } from "@/hooks/useAdmin";
import { ApplicationReviewModal } from "@/components/admin/application-review-modal";
import { mockNgoAppsData } from "./mockData";

export default function AdminDashboard() {
  const router = useRouter();
  const { applications, isLoading, updateApplicationStatus } = useAdmin();

  const [selectedApplication, setSelectedApplication] =
    useState<NGOApplication | null>(null);
  const [isApplicationModalOpen, setIsApplicationModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [adminInfo, setAdminInfo] = useState<any>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error" | "info";
  } | null>(null);
  const [approvalModal, setApprovalModal] = useState<{
    isOpen: boolean;
    application: any | null;
  }>({ isOpen: false, application: null });

  useEffect(() => {
    const session = localStorage.getItem("admin_session");
    if (session) {
      setAdminInfo(JSON.parse(session));
    } else {
      router.push("/admin/login");
    }
  }, [router]);

  const handleReviewApplication = (application: NGOApplication) => {
    setSelectedApplication(application);
    setIsApplicationModalOpen(true);
  };

  const handleApproveApplication = async (
    applicationId: string,
    notes?: string
  ) => {
    try {
      // Update session storage data
      updateSessionStorageApplication(applicationId, "approved", notes);
      // Also try to update via API if available
      await updateApplicationStatus(applicationId, "approved", notes);

      showNotification("Application approved successfully!", "success");
    } catch (error) {
      showNotification("Failed to approve application", "error");
    }
  };

  const handleRejectApplication = async (
    applicationId: string,
    notes?: string
  ) => {
    try {
      // Update session storage data
      updateSessionStorageApplication(applicationId, "rejected", notes);
      // Also try to update via API if available
      await updateApplicationStatus(applicationId, "rejected", notes);

      showNotification("Application rejected successfully!", "success");
    } catch (error) {
      showNotification("Failed to reject application", "error");
    }
  };

  const showNotification = (
    message: string,
    type: "success" | "error" | "info"
  ) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleConfirmApproval = async () => {
    if (approvalModal.application) {
      try {
        // Update session storage data
        updateSessionStorageApplication(
          approvalModal.application.id,
          "approved",
          "Quick approval from dashboard"
        );
        // Also try to update via API if available
        await updateApplicationStatus(
          approvalModal.application.id,
          "approved",
          "Quick approval from dashboard"
        );

        showNotification(
          `${
            approvalModal.application.organizationName ||
            approvalModal.application.name
          } has been approved successfully!`,
          "success"
        );
      } catch (error) {
        showNotification("Failed to approve application", "error");
      }

      // Close the modal
      setApprovalModal({ isOpen: false, application: null });
    }
  };

  const updateSessionStorageApplication = (
    applicationId: string,
    status: "approved" | "rejected" | "under_review" | "pending",
    notes?: string
  ) => {
    try {
      const sessionData = sessionStorage.getItem("ngo_applications");
      if (sessionData) {
        const applications = JSON.parse(sessionData);
        const updatedApplications = applications.map((app: any) => {
          if (
            app.id === applicationId ||
            `session_${applications.indexOf(app)}` === applicationId
          ) {
            return {
              ...app,
              status,
              reviewedAt: new Date().toISOString(),
              reviewedBy: adminInfo?.email || "admin@don8.com",
              reviewNotes:
                notes || `Application ${status} from admin dashboard`,
            };
          }
          return app;
        });
        sessionStorage.setItem(
          "ngo_applications",
          JSON.stringify(updatedApplications)
        );
        // Force a re-render by updating refresh trigger
        setRefreshTrigger((prev) => prev + 1);
      }
    } catch (error) {
      console.error("Error updating session storage:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("admin_session");
    document.cookie =
      "admin_session=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
    router.push("/admin/login");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "under_review":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "approved":
        return "bg-green-100 text-green-800 border-green-200";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  // Enhanced mock data for fallback when session storage is empty
  const mockNgoApplications = mockNgoAppsData;

  // Get applications from session storage with fallback to mock data
  const getApplicationsFromStorage = () => {
    try {
      const sessionData = sessionStorage.getItem("ngo_applications");
      if (sessionData) {
        const parsedData = JSON.parse(sessionData);
        if (Array.isArray(parsedData) && parsedData.length > 0) {
          // Map session data to ensure all required fields are present
          return parsedData.map((app: any, index: number) => ({
            id: app.id || `session_${index}`,
            organizationName:
              app.organizationName || app.name || "Unknown Organization",
            name: app.name || app.organizationName || "Unknown Organization",
            email: app.email || "",
            description: app.description || "No description provided",
            category: app.category || "other",
            website: app.website || "",
            walletAddress: app.walletAddress || "",
            status: app.status || "pending",
            submittedAt:
              app.submittedAt || app.createdAt || new Date().toISOString(),
            createdAt:
              app.createdAt || app.submittedAt || new Date().toISOString(),
            contactPerson: app.contactPerson || "Unknown",
            phone: app.phone || "",
            registrationNumber: app.registrationNumber || "",
            foundedYear: app.foundedYear || "",
            teamSize: app.teamSize || "",
            twitter: app.twitter || "",
            facebook: app.facebook || "",
            linkedin: app.linkedin || "",
            reviewedAt: app.reviewedAt,
            reviewedBy: app.reviewedBy,
            reviewNotes: app.reviewNotes,
            userType: app.userType,
            agreeTerms: app.agreeTerms,
          }));
        }
      }
    } catch (error) {
      console.error("Error parsing session storage data:", error);
    }
    return mockNgoApplications;
  };

  const rawApplications = getApplicationsFromStorage();

  // Re-run when refresh trigger changes
  useEffect(() => {
    // This effect ensures data is refreshed when refreshTrigger changes
  }, [refreshTrigger]);

  // Filter applications based on search and status
  const filteredApplications = rawApplications.filter((app) => {
    const matchesSearch =
      (app.organizationName?.toLowerCase() || "").includes(
        searchQuery.toLowerCase()
      ) ||
      (app.name?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
      (app.email?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
      (app.description?.toLowerCase() || "").includes(
        searchQuery.toLowerCase()
      ) ||
      (app.category?.toLowerCase() || "").includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "all" || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">D8</span>
              </div>
              <span className="text-xl font-bold text-gray-900">DON-8</span>
            </Link>
            <Badge variant="secondary" className="bg-red-100 text-red-800">
              <Shield className="w-3 h-3 mr-1" />
              Admin Panel
            </Badge>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              Welcome, {adminInfo?.email}
            </span>

            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Admin Dashboard
        </h1>
        <p className="text-gray-600 mb-4">
          Review and manage NGO registration applications
        </p>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Applications
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {rawApplications.length}
                  </p>
                </div>
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Shield className="w-4 h-4 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Pending Review
                  </p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {
                      rawApplications.filter((app) => app.status === "pending")
                        .length
                    }
                  </p>
                </div>
                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Eye className="w-4 h-4 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Approved</p>
                  <p className="text-2xl font-bold text-green-600">
                    {
                      rawApplications.filter((app) => app.status === "approved")
                        .length
                    }
                  </p>
                </div>
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Rejected</p>
                  <p className="text-2xl font-bold text-red-600">
                    {
                      rawApplications.filter((app) => app.status === "rejected")
                        .length
                    }
                  </p>
                </div>
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                  <XCircle className="w-4 h-4 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>NGO Applications</CardTitle>
            <CardDescription>
              Review and manage NGO registration applications
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search applications..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="under_review">Under Review</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-4">
                      <Skeleton className="h-5 w-48 mb-2" />
                      <Skeleton className="h-4 w-32 mb-2" />
                      <Skeleton className="h-3 w-64" />
                    </CardContent>
                  </Card>
                ))
              ) : filteredApplications.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {rawApplications.length === 0
                      ? "No Applications Found"
                      : "No Matching Applications"}
                  </h3>
                  <p className="text-gray-500 mb-4">
                    {rawApplications.length === 0
                      ? "There are no NGO applications in session storage. The system is showing mock data for demonstration."
                      : "No applications found matching your search criteria. Try adjusting your filters or search terms."}
                  </p>
                  {rawApplications.length === 0 && (
                    <div className="text-sm text-gray-400">
                      <p>Session storage key: "ngo_applications"</p>
                      <p>
                        Currently showing {mockNgoApplications.length} sample
                        applications
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                filteredApplications.map((application: any) => (
                  <Card
                    key={application.id}
                    className="hover:shadow-md transition-shadow"
                  >
                    <CardContent className="p-4 flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-semibold">
                            {application.organizationName ||
                              application.name ||
                              "Unknown Organization"}
                          </h3>
                          <Badge
                            className={`${getStatusColor(
                              application.status
                            )} border text-xs`}
                          >
                            {application.status?.replace("_", " ") || "pending"}
                          </Badge>
                          {application.category && (
                            <Badge
                              variant="outline"
                              className="text-xs capitalize"
                            >
                              {application.category}
                            </Badge>
                          )}
                          {application.userType && (
                            <Badge variant="secondary" className="text-xs">
                              {application.userType.toUpperCase()}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          {application.description || "No description provided"}
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
                          {application.website && (
                            <div className="flex items-center space-x-1 text-xs text-blue-600">
                              <span>🌐</span>
                              <a
                                href={application.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:underline truncate"
                              >
                                {application.website}
                              </a>
                            </div>
                          )}
                          {application.walletAddress && (
                            <div className="flex items-center space-x-1 text-xs text-gray-500">
                              <span>💼</span>
                              <span className="font-mono truncate">
                                {application.walletAddress.slice(0, 10)}...
                                {application.walletAddress.slice(-8)}
                              </span>
                            </div>
                          )}
                          {application.registrationNumber && (
                            <div className="flex items-center space-x-1 text-xs text-gray-500">
                              <span>📄</span>
                              <span>Reg: {application.registrationNumber}</span>
                            </div>
                          )}
                          {application.foundedYear && (
                            <div className="flex items-center space-x-1 text-xs text-gray-500">
                              <span>📅</span>
                              <span>Founded: {application.foundedYear}</span>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span>
                            {application.email || "No email provided"}
                          </span>
                          {application.contactPerson && (
                            <>
                              <span>•</span>
                              <span>{application.contactPerson}</span>
                            </>
                          )}
                          <span>•</span>
                          <span>
                            Submitted{" "}
                            {new Date(
                              application.createdAt ||
                                application.submittedAt ||
                                Date.now()
                            ).toLocaleDateString()}
                          </span>
                        </div>
                        {application.reviewNotes && (
                          <div className="mt-2 p-2 bg-gray-50 rounded text-xs text-gray-600">
                            <strong>Review Notes:</strong>{" "}
                            {application.reviewNotes}
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col space-y-2 items-end ml-4">
                        <Button
                          size="sm"
                          onClick={() => handleReviewApplication(application)}
                        >
                          <Eye className="w-3 h-3 mr-1" />
                          Review
                        </Button>
                        {application.status === "pending" && (
                          <div className="flex space-x-1 mt-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-green-600 border-green-600 hover:bg-green-50"
                              onClick={() =>
                                setApprovalModal({
                                  isOpen: true,
                                  application: application,
                                })
                              }
                            >
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 border-red-600 hover:bg-red-50"
                              onClick={() =>
                                handleRejectApplication(
                                  application.id,
                                  "Quick rejection from dashboard"
                                )
                              }
                            >
                              <XCircle className="w-3 h-3 mr-1" />
                              Reject
                            </Button>
                          </div>
                        )}
                        {application.status === "under_review" && (
                          <Badge
                            variant="outline"
                            className="text-xs text-yellow-600"
                          >
                            Under Review
                          </Badge>
                        )}
                        {(application.status === "approved" ||
                          application.status === "rejected") && (
                          <div className="text-xs text-gray-500 text-right">
                            {application.reviewedBy && (
                              <div>By: {application.reviewedBy}</div>
                            )}
                            {application.reviewedAt && (
                              <div>
                                {new Date(
                                  application.reviewedAt
                                ).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {isApplicationModalOpen && selectedApplication && (
          <ApplicationReviewModal
            application={selectedApplication}
            applicationId={selectedApplication.id}
            onStatusUpdate={async (id, status, notes) => {
              // Update session storage first
              updateSessionStorageApplication(id, status, notes);
              // Then try API update
              const result = await updateApplicationStatus(id, status, notes);
              return result;
            }}
            onClose={() => setIsApplicationModalOpen(false)}
          />
        )}
      </div>

      {/* Approval Confirmation Modal */}
      <Dialog
        open={approvalModal.isOpen}
        onOpenChange={(open) =>
          !open && setApprovalModal({ isOpen: false, application: null })
        }
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span>Confirm Approval</span>
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to approve this NGO application?
            </DialogDescription>
          </DialogHeader>

          {approvalModal.application && (
            <div className="py-4">
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">
                    Organization Name:
                  </span>
                  <span className="text-sm font-semibold text-gray-900">
                    {approvalModal.application.organizationName ||
                      approvalModal.application.name}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">
                    Application ID:
                  </span>
                  <span className="text-sm font-mono text-gray-700">
                    {approvalModal.application.id}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">
                    Email:
                  </span>
                  <span className="text-sm text-gray-700">
                    {approvalModal.application.email}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">
                    Category:
                  </span>
                  <Badge variant="outline" className="text-xs capitalize">
                    {approvalModal.application.category}
                  </Badge>
                </div>
              </div>

              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-800">
                  <strong>This action will:</strong>
                </p>
                <ul className="text-sm text-green-700 mt-1 space-y-1">
                  <li>• Change the application status to "Approved"</li>
                  <li>• Grant the NGO access to the platform</li>
                  <li>• Send a confirmation notification</li>
                </ul>
              </div>
            </div>
          )}

          <DialogFooter className="flex space-x-2">
            <Button
              variant="outline"
              onClick={() =>
                setApprovalModal({ isOpen: false, application: null })
              }
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmApproval}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Confirm Approval
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Notification Toast */}
      {notification && (
        <div className="fixed top-4 right-4 z-50">
          <div
            className={`px-4 py-3 rounded-lg shadow-lg border ${
              notification.type === "success"
                ? "bg-green-50 text-green-800 border-green-200"
                : notification.type === "error"
                ? "bg-red-50 text-red-800 border-red-200"
                : "bg-blue-50 text-blue-800 border-blue-200"
            }`}
          >
            <div className="flex items-center space-x-2">
              {notification.type === "success" && (
                <CheckCircle className="w-4 h-4" />
              )}
              {notification.type === "error" && <XCircle className="w-4 h-4" />}
              {notification.type === "info" && <Eye className="w-4 h-4" />}
              <span className="text-sm font-medium">
                {notification.message}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
