export default function CategorieLoading() {
  return (
    <div className="min-h-screen bg-gray-50">

      {/* Hero catégorie */}
      <div className="w-full py-10 px-4 bg-gradient-to-r from-gray-200 to-gray-300 animate-pulse">
        <div className="max-w-5xl mx-auto space-y-3">
          <div className="h-8 w-56 rounded-full bg-gray-300 animate-pulse" />
          <div className="h-4 w-80 rounded-full bg-gray-300 animate-pulse" />
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">

        {/* Filtres + tri */}
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="h-9 w-24 rounded-full bg-gray-200 animate-pulse" />
          <div className="h-9 w-28 rounded-full bg-gray-200 animate-pulse" />
          <div className="h-9 w-20 rounded-full bg-gray-200 animate-pulse" />
          <div className="ml-auto h-9 w-32 rounded-full bg-gray-200 animate-pulse" />
        </div>

        {/* Grille produits */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className="rounded-xl overflow-hidden bg-white shadow-sm">
              <div className="aspect-square bg-gray-200 animate-pulse" />
              <div className="p-2 space-y-2">
                <div className="h-3 w-3/4 rounded-full bg-gray-200 animate-pulse" />
                <div className="h-4 w-1/2 rounded-full bg-gray-200 animate-pulse" />
                <div className="h-3 w-2/3 rounded-full bg-gray-100 animate-pulse" />
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}
