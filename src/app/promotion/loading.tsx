export default function PromotionLoading() {
  return (
    <div className="min-h-screen bg-gray-50">

      {/* Hero promo */}
      <div className="bg-gradient-to-r from-red-500 to-orange-400 py-10 px-4">
        <div className="max-w-5xl mx-auto space-y-3">
          <div className="h-8 w-72 rounded-full bg-white/20 animate-pulse" />
          <div className="h-4 w-96 max-w-full rounded-full bg-white/15 animate-pulse" />
          {/* Countdown placeholder */}
          <div className="flex gap-3 mt-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="w-16 h-16 rounded-xl bg-white/20 animate-pulse" />
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">

        {/* Filtres */}
        <div className="flex gap-3 flex-wrap">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-9 w-28 rounded-full bg-gray-200 animate-pulse" />
          ))}
        </div>

        {/* Grille promos */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {Array.from({ length: 16 }).map((_, i) => (
            <div key={i} className="rounded-xl overflow-hidden bg-white shadow-sm relative">
              {/* Badge réduction */}
              <div className="absolute top-2 left-2 h-6 w-14 rounded-full bg-red-200 animate-pulse z-10" />
              <div className="aspect-square bg-gray-200 animate-pulse" />
              <div className="p-2 space-y-2">
                <div className="h-3 w-3/4 rounded-full bg-gray-200 animate-pulse" />
                <div className="flex items-center gap-2">
                  <div className="h-4 w-16 rounded-full bg-gray-200 animate-pulse" />
                  <div className="h-3 w-12 rounded-full bg-gray-100 animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}
