export default function AdminDashboardLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Skeleton */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-gray-200 rounded-lg animate-pulse" />
              <div className="w-32 h-6 bg-gray-200 rounded animate-pulse" />
              <div className="w-20 h-5 bg-gray-200 rounded animate-pulse" />
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-32 h-4 bg-gray-200 rounded animate-pulse" />
              <div className="w-20 h-8 bg-gray-200 rounded animate-pulse" />
              <div className="w-20 h-8 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-lg border animate-pulse">
              <div className="flex justify-between items-center mb-4">
                <div className="w-24 h-4 bg-gray-200 rounded" />
                <div className="w-4 h-4 bg-gray-200 rounded" />
              </div>
              <div className="w-16 h-8 bg-gray-200 rounded mb-2" />
              <div className="w-20 h-3 bg-gray-200 rounded" />
            </div>
          ))}
        </div>

        {/* Tabs Skeleton */}
        <div className="space-y-6">
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="w-32 h-8 bg-gray-200 rounded animate-pulse" />
            ))}
          </div>

          {/* Content Skeleton */}
          <div className="bg-white rounded-lg border">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <div>
                  <div className="w-40 h-6 bg-gray-200 rounded mb-2 animate-pulse" />
                  <div className="w-64 h-4 bg-gray-200 rounded animate-pulse" />
                </div>
                <div className="flex space-x-2">
                  <div className="w-64 h-10 bg-gray-200 rounded animate-pulse" />
                  <div className="w-40 h-10 bg-gray-200 rounded animate-pulse" />
                </div>
              </div>
            </div>
            <div className="p-6">
              {/* Table Skeleton */}
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-4 py-3">
                    <div className="w-48 h-4 bg-gray-200 rounded animate-pulse" />
                    <div className="w-24 h-4 bg-gray-200 rounded animate-pulse" />
                    <div className="w-32 h-4 bg-gray-200 rounded animate-pulse" />
                    <div className="w-20 h-6 bg-gray-200 rounded animate-pulse" />
                    <div className="w-24 h-4 bg-gray-200 rounded animate-pulse" />
                    <div className="w-20 h-8 bg-gray-200 rounded animate-pulse" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
