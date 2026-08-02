export default function BoutiqueLoading() {
  return (
    <div className="min-h-screen bg-gray-50">

      {/* Hero banner */}
      <div className="w-full h-56 md:h-64 bg-gradient-to-r from-[#30A08B] to-[#0d5c4e] relative overflow-hidden">
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-4">
          {/* Avatar */}
          <div className="w-20 h-20 rounded-full bg-white/20 animate-pulse" />
          {/* Store name */}
          <div className="h-6 w-48 rounded-full bg-white/20 animate-pulse" />
          {/* Description */}
          <div className="h-4 w-64 rounded-full bg-white/15 animate-pulse" />
          {/* Stats row */}
          <div className="flex gap-6 mt-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex flex-col items-center gap-1">
                <div className="h-5 w-10 rounded bg-white/20 animate-pulse" />
                <div className="h-3 w-14 rounded bg-white/15 animate-pulse" />
              </div>
            ))}
          </div>
          {/* Action buttons */}
          <div className="flex gap-3 mt-1">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-9 w-24 rounded-full bg-white/20 animate-pulse" />
            ))}
          </div>
        </div>
      </div>

      {/* Contact bar */}
      <div className="bg-white border-b border-gray-100 px-4 py-3 flex gap-4 overflow-x-auto">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-5 w-28 rounded-full bg-gray-100 animate-pulse flex-shrink-0" />
        ))}
      </div>

      {/* Tab bar */}
      <div className="bg-white border-b border-gray-100 px-4 flex gap-6 sticky top-0 z-10">
        {['Accueil', 'Tous', 'Nouveautés'].map(tab => (
          <div key={tab} className="py-3">
            <div className="h-4 w-16 rounded-full bg-gray-100 animate-pulse" />
          </div>
        ))}
      </div>

      <div className="container mx-auto px-4 py-6 space-y-8">

        {/* Banner carousel */}
        <div className="w-full h-40 md:h-52 rounded-2xl bg-gray-200 animate-pulse" />

        {/* Section produits × 3 */}
        {[1, 2, 3].map(section => (
          <div key={section} className="space-y-3">
            {/* Section header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gray-200 animate-pulse" />
                <div className="h-5 w-32 rounded-full bg-gray-200 animate-pulse" />
              </div>
              <div className="h-4 w-16 rounded-full bg-gray-100 animate-pulse" />
            </div>
            {/* Product grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {[1, 2, 3, 4].map(i => (
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
