export default function CategoriesLoading() {
  return (
    <div className="min-h-screen bg-gray-50">

      {/* Hero */}
      <div className="bg-gradient-to-br from-[#30A08B] via-teal-600 to-emerald-700 text-white py-14 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <div className="h-8 w-64 rounded-full bg-white/20 animate-pulse mx-auto" />
          <div className="h-5 w-96 max-w-full rounded-full bg-white/15 animate-pulse mx-auto" />
          {/* Search bar */}
          <div className="h-12 w-full max-w-lg rounded-2xl bg-white/20 animate-pulse mx-auto mt-4" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-10 space-y-10">

        {/* Grid catégories */}
        <div>
          <div className="h-6 w-40 rounded-full bg-gray-200 animate-pulse mb-5" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {Array.from({ length: 20 }).map((_, i) => (
              <div key={i} className="rounded-2xl overflow-hidden bg-white shadow-sm">
                {/* Gradient color block */}
                <div className="h-24 bg-gray-200 animate-pulse" />
                <div className="p-3 space-y-2">
                  <div className="h-4 w-3/4 rounded-full bg-gray-200 animate-pulse" />
                  <div className="h-3 w-1/2 rounded-full bg-gray-100 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section populaires */}
        <div>
          <div className="h-6 w-52 rounded-full bg-gray-200 animate-pulse mb-5" />
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
