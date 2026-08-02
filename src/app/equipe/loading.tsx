export default function EquipeLoading() {
  return (
    <div className="min-h-screen bg-gray-50">

      {/* Hero */}
      <div className="bg-white border-b border-gray-100 py-12 px-4 text-center">
        <div className="max-w-2xl mx-auto space-y-3">
          <div className="h-8 w-48 rounded-full bg-gray-200 animate-pulse mx-auto" />
          <div className="h-4 w-80 max-w-full rounded-full bg-gray-100 animate-pulse mx-auto" />
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-10">

        {/* Filtres départements */}
        <div className="flex gap-2 flex-wrap mb-8">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-8 w-24 rounded-full bg-gray-200 animate-pulse" />
          ))}
        </div>

        {/* Grille membres */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm">
              <div className="aspect-[4/3] bg-gray-200 animate-pulse" />
              <div className="p-4 space-y-2">
                <div className="h-5 w-3/4 rounded-full bg-gray-200 animate-pulse" />
                <div className="h-4 w-1/2 rounded-full bg-gray-200 animate-pulse" />
                <div className="flex gap-2 mt-3">
                  <div className="h-7 w-7 rounded-full bg-gray-200 animate-pulse" />
                  <div className="h-7 w-7 rounded-full bg-gray-200 animate-pulse" />
                  <div className="h-7 w-7 rounded-full bg-gray-200 animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}
