export default function AdminDashboardLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Skeleton */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 bg-gray-200 rounded-lg animate-pulse" />
            <div className="w-20 h-6 bg-gray-200 rounded animate-pulse" />
            <div className="w-16 h-5 bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="flex items-center space-x-4">
            <div className="w-32 h-4 bg-gray-200 rounded animate-pulse" />
            <div className="w-8 h-8 bg-gray-200 rounded animate-pulse" />
            <div className="w-8 h-8 bg-gray-200 rounded animate-pulse" />
            <div className="w-8 h-8 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Title Skeleton */}
        <div className="mb-8">
          <div className="w-48 h-8 bg-gray-200 rounded animate-pulse mb-2" />
          <div className="w-96 h-4 bg-gray-200 rounded animate-pulse" />
        </div>

        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-lg border">
              <div className="flex items-center justify-between mb-2">
                <div className="w-20 h-4 bg-gray-200 rounded animate-pulse" />
                <div className="w-4 h-4 bg-gray-200 rounded animate-pulse" />
              </div>
              <div className="w-16 h-8 bg-gray-200 rounded animate-pulse mb-1" />
              <div className="w-24 h-3 bg-gray-200 rounded animate-pulse" />
            </div>
          ))}
        </div>

        {/* Tabs Skeleton */}
        <div className="space-y-6">
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="w-24 h-8 bg-gray-200 rounded animate-pulse" />
            ))}
          </div>

          {/* Content Skeleton */}
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="bg-white p-6 rounded-lg border">
                  <div className="flex items-center space-x-2 mb-4">
                    <div className="w-5 h-5 bg-gray-200 rounded animate-pulse" />
                    <div className="w-32 h-5 bg-gray-200 rounded animate-pulse" />
                  </div>
                  <div className="w-48 h-4 bg-gray-200 rounded animate-pulse mb-4" />
                  <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, j) => (
                      <div key={j} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="space-y-2">
                          <div className="w-32 h-4 bg-gray-200 rounded animate-pulse" />
                          <div className="w-24 h-3 bg-gray-200 rounded animate-pulse" />
                        </div>
                        <div className="w-16 h-8 bg-gray-200 rounded animate-pulse" />
                      </div>
                    ))}
                  </div>
                  <div className="w-full h-10 bg-gray-200 rounded animate-pulse mt-4" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
