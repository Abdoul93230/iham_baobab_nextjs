export default function SellerProfileLoading() {
  return (
    <div className="min-h-screen bg-gray-50">

      {/* Cover photo */}
      <div className="w-full h-40 md:h-52 bg-gray-200 animate-pulse" />

      {/* Profile header */}
      <div className="max-w-4xl mx-auto px-4">
        <div className="relative -mt-12 mb-6 flex flex-col sm:flex-row items-start sm:items-end gap-4">
          {/* Avatar */}
          <div className="w-24 h-24 rounded-2xl bg-gray-300 animate-pulse border-4 border-white shadow-md flex-shrink-0" />
          <div className="flex-1 pb-2 space-y-2">
            <div className="h-6 w-48 rounded-full bg-gray-200 animate-pulse" />
            <div className="h-4 w-32 rounded-full bg-gray-200 animate-pulse" />
          </div>
          {/* Action buttons */}
          <div className="flex gap-2 pb-2">
            <div className="h-9 w-24 rounded-full bg-gray-200 animate-pulse" />
            <div className="h-9 w-24 rounded-full bg-gray-200 animate-pulse" />
          </div>
        </div>

        {/* Stats row */}
        <div className="flex gap-6 mb-6 p-4 bg-white rounded-2xl shadow-sm">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div className="h-5 w-12 rounded-full bg-gray-200 animate-pulse" />
              <div className="h-3 w-16 rounded-full bg-gray-100 animate-pulse" />
            </div>
          ))}
        </div>

        {/* Description */}
        <div className="bg-white rounded-2xl p-4 shadow-sm mb-6 space-y-2">
          <div className="h-4 w-full rounded-full bg-gray-200 animate-pulse" />
          <div className="h-4 w-4/5 rounded-full bg-gray-200 animate-pulse" />
          <div className="h-4 w-3/5 rounded-full bg-gray-200 animate-pulse" />
        </div>

        {/* Produits grid */}
        <div className="space-y-4">
          <div className="h-6 w-36 rounded-full bg-gray-200 animate-pulse" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="rounded-xl overflow-hidden bg-white shadow-sm">
                <div className="aspect-square bg-gray-200 animate-pulse" />
                <div className="p-2 space-y-2">
                  <div className="h-3 w-3/4 rounded-full bg-gray-200 animate-pulse" />
                  <div className="h-4 w-1/2 rounded-full bg-gray-200 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
