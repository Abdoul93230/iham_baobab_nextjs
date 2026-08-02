export default function NouveauxLoading() {
  return (
    <div className="min-h-screen bg-gray-50">

      {/* Hero */}
      <div className="bg-gradient-to-r from-[#30A08B] to-teal-500 py-10 px-4">
        <div className="max-w-5xl mx-auto space-y-3">
          <div className="h-8 w-64 rounded-full bg-white/20 animate-pulse" />
          <div className="h-4 w-96 max-w-full rounded-full bg-white/15 animate-pulse" />
          {/* Filtres pills */}
          <div className="flex gap-2 mt-4 flex-wrap">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-8 w-24 rounded-full bg-white/20 animate-pulse" />
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8 space-y-10">

        {/* Section nouveautés × 2 */}
        {[1, 2].map(section => (
          <div key={section} className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="h-6 w-44 rounded-full bg-gray-200 animate-pulse" />
              <div className="h-4 w-16 rounded-full bg-gray-100 animate-pulse" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {Array.from({ length: 10 }).map((_, i) => (
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
        ))}

      </div>
    </div>
  )
}
