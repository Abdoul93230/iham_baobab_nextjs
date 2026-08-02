export default function VoirPlusLoading() {
  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header section */}
      <div className="bg-white border-b border-gray-100 px-4 py-6">
        <div className="max-w-6xl mx-auto space-y-3">
          <div className="h-7 w-56 rounded-full bg-gray-200 animate-pulse" />
          <div className="h-4 w-80 rounded-full bg-gray-100 animate-pulse" />
          {/* Search */}
          <div className="h-11 w-full max-w-md rounded-2xl bg-gray-100 animate-pulse mt-2" />
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8 space-y-10">

        {/* Sections × 4 */}
        {[1, 2, 3, 4].map(section => (
          <div key={section} className="space-y-4">
            {/* En-tête section */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gray-200 animate-pulse" />
                <div className="h-5 w-36 rounded-full bg-gray-200 animate-pulse" />
              </div>
              <div className="h-4 w-16 rounded-full bg-gray-100 animate-pulse" />
            </div>
            {/* Grille */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {Array.from({ length: 5 }).map((_, i) => (
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
