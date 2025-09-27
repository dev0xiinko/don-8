"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Heart,
  TrendingUp,
  Eye,
  Search,
  Filter,
  Star,
  MapPin,
  Calendar,
  BarChart3,
  Users,
  Target,
  LogOut,
  Wallet,
  RefreshCw,
  SortAsc,
} from "lucide-react";
import { useWallet } from "@/contexts/WalletProvider";
import { useNGOs } from "@/hooks/useNGOs";
import { useDonations } from "@/hooks/useDonations";
import { DonationModal } from "@/components/features/donate/donation-modal";
import Image from "next/image";

export default function DonorDashboard() {
  const router = useRouter();
  const { isConnected, walletInfo, userInfo, disconnect, refreshWalletInfo } =
    useWallet();
  const {
    ngos,
    isLoading: ngosLoading,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    sortBy,
    setSortBy,
    categories,
  } = useNGOs();
  const {
    stats,
    getRecentDonations,
    isLoading: donationsLoading,
    refreshDonations,
  } = useDonations();

  const [selectedNGO, setSelectedNGO] = useState<any>(null);
  const [isDonationModalOpen, setIsDonationModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    // Redirect to login if not connected
    if (!isConnected) {
      router.push("/login");
    }
  }, [isConnected, router]);

  const handleLogout = async () => {
    try {
      await disconnect();
      router.push("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleDonate = (ngo: any) => {
    setSelectedNGO(ngo);
    setIsDonationModalOpen(true);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([refreshWalletInfo(), refreshDonations()]);
    } catch (error) {
      console.error("Refresh error:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const recentDonations = getRecentDonations(3);

  if (!isConnected) {
    return null; // Will redirect to login
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
                <span className="font-bold text-sm">D8</span>
              </div>
              <span className="text-xl font-bold">DON-8</span>
            </Link>
            <Badge variant="secondary">Donor Dashboard</Badge>
          </div>
          <div className="flex items-center space-x-4">
            {/* Refresh Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw
                className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`}
              />
            </Button>

            {/* Wallet Info */}
            <div className="text-sm text-muted-foreground">
              <span>
                {userInfo?.address.substring(0, 6)}...
                {userInfo?.address.substring(38)}
              </span>
            </div>

            {/* Balance */}
            {walletInfo && (
              <div className="text-xs text-muted-foreground">
                <div>
                  {Number(walletInfo.balance).toFixed(4)}{" "}
                  {walletInfo.walletType === "metamask" ? "ETH" : "SOL"}
                </div>
              </div>
            )}

            {/* Wallet Type Badge */}
            <Badge variant="outline" className="text-xs capitalize">
              {userInfo?.walletType}
            </Badge>

            {/* Logout Button */}
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Message */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">Welcome back! 👋</h1>
          <p className="text-muted-foreground">
            Your {userInfo?.walletType} wallet is connected. Start making
            transparent donations today.
          </p>

          {/* Connection Info */}
          <div className="flex items-center space-x-4 mt-2">
            <Badge variant="outline" className="text-xs capitalize">
              {userInfo?.walletType} Wallet
            </Badge>
            <Badge variant="outline" className="text-xs">
              {userInfo?.network}
            </Badge>
            {userInfo && (
              <Badge variant="outline" className="text-xs font-mono">
                {userInfo.address.substring(0, 6)}...
                {userInfo.address.substring(38)}
              </Badge>
            )}
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Donated
              </CardTitle>
              <Heart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {donationsLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <>
                  <div className="text-2xl font-bold">
                    {stats.totalDonated}{" "}
                    {walletInfo?.walletType === "metamask" ? "ETH" : "SOL"}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {stats.totalDonations} donations
                  </p>
                </>
              )}
            </CardContent>
          </Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {donationsLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <>
                  <div className="text-2xl font-bold">
                    {stats.ngosSupported}
                  </div>
                  <p className="text-xs text-muted-foreground">organizations</p>
                </>
              )}
            </CardContent>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Impact Score
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {donationsLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{stats.impactScore}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.impactScore >= 90
                      ? "Excellent"
                      : stats.impactScore >= 70
                        ? "Good"
                        : "Growing"}
                  </p>
                </>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Wallet Balance
              </CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {walletInfo
                  ? `${Number(walletInfo.balance).toFixed(4)}`
                  : "0.0000"}
              </div>
              <p className="text-xs text-muted-foreground">
                {walletInfo?.walletType === "metamask" ? "ETH" : "SOL"}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Search and Filter */}
            <Card>
              <CardHeader>
                <CardTitle>Discover NGOs</CardTitle>
                <CardDescription>
                  Find verified organizations to support
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-4 mb-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search NGOs..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select
                    value={selectedCategory}
                    onValueChange={setSelectedCategory}
                  >
                    <SelectTrigger className="w-full sm:w-48">
                      <Filter className="w-4 h-4 mr-2" />
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map((category) => (
                        <SelectItem
                          key={category}
                          value={category.toLowerCase()}
                        >
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select
                    value={sortBy}
                    onValueChange={(value: any) => setSortBy(value)}
                  >
                    <SelectTrigger className="w-full sm:w-48">
                      <SortAsc className="w-4 h-4 mr-2" />
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="score">Highest Score</SelectItem>
                      <SelectItem value="recent">Most Recent</SelectItem>
                      <SelectItem value="progress">Most Progress</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="text-sm text-gray-500">
                  {ngosLoading
                    ? "Loading..."
                    : `${ngos.length} organizations found`}
                </div>
              </CardContent>
            </Card>

            {/* NGO List */}
            <div className="space-y-4">
              {ngosLoading ? (
                // Loading skeletons
                Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <Skeleton className="w-16 h-16 rounded-full" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-6 w-3/4" />
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-1/2" />
                          <Skeleton className="h-2 w-full" />
                          <div className="flex space-x-2">
                            <Skeleton className="h-8 w-20" />
                            <Skeleton className="h-8 w-24" />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : ngos.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <p className="text-gray-500">
                      No NGOs found matching your criteria.
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => setSearchQuery("")}
                      className="mt-4"
                    >
                      Clear Search
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                ngos.map((ngo) => (
                  <Card
                    key={ngo.id}
                    className="hover:shadow-lg transition-shadow"
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <Avatar className="w-16 h-16">
                          <AvatarImage src={ngo.image || "/flood.png"} />
                          <AvatarFallback>
                            {ngo.name.substring(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="text-lg font-semibold truncate">
                              {ngo.name}
                            </h3>
                            {ngo.verified && (
                              <Badge variant="secondary" className="text-xs">
                                <Star className="w-3 h-3 mr-1" />
                                Verified
                              </Badge>
                            )}
                            <Badge variant="outline" className="text-xs">
                              Score: {ngo.score}
                            </Badge>
                          </div>
                          <p className="text-gray-600 text-sm mb-3">
                            {ngo.description}
                          </p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
                            <div className="flex items-center">
                              <MapPin className="w-4 h-4 mr-1" />
                              {ngo.location}
                            </div>
                            <div className="flex items-center">
                              <Users className="w-4 h-4 mr-1" />
                              {ngo.donors} donors
                            </div>
                            <div className="flex items-center">
                              <Calendar className="w-4 h-4 mr-1" />
                              {ngo.lastUpdate}
                            </div>
                          </div>
                          <div className="mb-4">
                            <div className="flex justify-between text-sm mb-2">
                              <span>Progress</span>
                              <span>
                                {Math.round((ngo.totalRaised / ngo.goal) * 100)}
                                %
                              </span>
                            </div>
                            <Progress
                              value={(ngo.totalRaised / ngo.goal) * 100}
                              className="h-2"
                            />
                            <div className="flex justify-between text-xs text-gray-500 mt-1">
                              <span>
                                ${ngo.totalRaised.toLocaleString()} raised
                              </span>
                              <span>Goal: ${ngo.goal.toLocaleString()}</span>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              className="bg-emerald-600 hover:bg-emerald-700"
                              onClick={() => handleDonate(ngo)}
                              disabled={
                                !walletInfo ||
                                walletInfo.walletType !== "metamask"
                              }
                            >
                              <Heart className="w-4 h-4 mr-2" />
                              Donate
                            </Button>
                            <Link href={`/ngo/${ngo.id}`}>
                              <Button variant="outline" size="sm">
                                <Eye className="w-4 h-4 mr-2" />
                                View Details
                              </Button>
                            </Link>
                          </div>
                          {walletInfo?.walletType !== "metamask" && (
                            <p className="text-xs text-amber-600 mt-2">
                              * Donations currently only supported with MetaMask
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Wallet Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Wallet className="w-5 h-5 mr-2" />
                  Connected Wallet
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/20 rounded-full flex items-center justify-center">
                      <span className="text-2xl">
                        {userInfo?.walletType === "metamask" ? "🦊" : "👻"}
                      </span>
                    </div>
                    <div>
                      <div className="font-medium capitalize">
                        {userInfo?.walletType} Wallet
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {userInfo?.network}
                      </div>
                    </div>
                  </div>
                  {walletInfo && (
                    <div className="border-t pt-3">
                      <div className="text-sm text-muted-foreground mb-1">
                        Wallet Address
                      </div>
                      <div className="font-mono text-xs bg-secondary p-2 rounded break-all">
                        {walletInfo.address}
                      </div>
                      <div className="flex items-center justify-between text-sm mt-2">
                        <span>Balance:</span>
                        <span className="font-medium">
                          {Number(walletInfo.balance).toFixed(4)}{" "}
                          {walletInfo.walletType === "metamask" ? "ETH" : "SOL"}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Recent Donations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2" />
                  Recent Donations
                </CardTitle>
              </CardHeader>
              <CardContent>
                {donationsLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-3 w-20" />
                        </div>
                        <div className="text-right space-y-2">
                          <Skeleton className="h-4 w-16" />
                          <Skeleton className="h-3 w-12" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : recentDonations.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500 text-sm">No donations yet</p>
                    <p className="text-gray-400 text-xs mt-1">
                      Start supporting NGOs to see your donation history
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentDonations.map((donation) => (
                      <div
                        key={donation.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div>
                          <p className="font-medium text-sm">
                            {donation.ngoName}
                          </p>
                          <p className="text-xs text-gray-500">
                            {donation.date}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-sm">
                            {donation.amount} {donation.currency}
                          </p>
                          <Badge
                            variant={
                              donation.status === "completed"
                                ? "secondary"
                                : donation.status === "pending"
                                  ? "default"
                                  : "destructive"
                            }
                            className="text-xs"
                          >
                            {donation.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <Link href="/donor/history">
                  <Button
                    variant="outline"
                    className="w-full mt-4 bg-transparent"
                  >
                    View All History
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/donor/analytics">
                  <Button
                    variant="outline"
                    className="w-full justify-start bg-transparent"
                  >
                    <BarChart3 className="w-4 h-4 mr-2" />
                    View Analytics
                  </Button>
                </Link>
                <Link href="/donor/tracking">
                  <Button
                    variant="outline"
                    className="w-full justify-start bg-transparent"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Track Donations
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  className="w-full justify-start bg-transparent"
                  onClick={handleLogout}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Disconnect Wallet
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Donation Modal */}
      {selectedNGO && (
        <DonationModal
          ngo={selectedNGO}
          isOpen={isDonationModalOpen}
          onClose={() => setIsDonationModalOpen(false)}
        />
      )}
    </div>
  );
}
