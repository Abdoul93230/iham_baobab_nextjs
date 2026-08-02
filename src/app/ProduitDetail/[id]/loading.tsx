export default function ProduitDetailLoading() {
  return (
    <div className="min-h-screen bg-gray-50">

      <div className="container mx-auto px-4 py-6">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex items-center gap-2">
              <div className="h-3 w-16 rounded-full bg-gray-200 animate-pulse" />
              {i < 3 && <div className="h-3 w-3 rounded-full bg-gray-100 animate-pulse" />}
            </div>
          ))}
        </div>

        {/* Layout principal */}
        <div className="flex flex-col lg:flex-row gap-8">

          {/* Colonne gauche — images */}
          <div className="lg:w-1/2 space-y-3">
            <div className="aspect-square rounded-3xl bg-gray-200 animate-pulse shadow-sm" />
            <div className="flex gap-2">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="w-16 h-16 rounded-xl bg-gray-200 animate-pulse flex-shrink-0" />
              ))}
            </div>
          </div>

          {/* Colonne droite — infos */}
          <div className="lg:w-1/2 space-y-4 flex flex-col justify-start">
            {/* Badges */}
            <div className="flex gap-2">
              <div className="h-6 w-20 rounded-full bg-gray-200 animate-pulse" />
              <div className="h-6 w-16 rounded-full bg-gray-200 animate-pulse" />
            </div>
            {/* Nom */}
            <div className="h-8 w-3/4 rounded-xl bg-gray-200 animate-pulse" />
            <div className="h-5 w-1/2 rounded-xl bg-gray-200 animate-pulse" />
            {/* Prix */}
            <div className="h-12 w-1/3 rounded-xl bg-gray-200 animate-pulse" />
            {/* Description */}
            <div className="space-y-2 pt-2">
              <div className="h-4 w-full rounded-full bg-gray-200 animate-pulse" />
              <div className="h-4 w-5/6 rounded-full bg-gray-200 animate-pulse" />
              <div className="h-4 w-4/6 rounded-full bg-gray-200 animate-pulse" />
            </div>
            {/* Quantité + boutons */}
            <div className="flex gap-3 pt-4">
              <div className="h-12 w-28 rounded-xl bg-gray-200 animate-pulse" />
              <div className="h-12 flex-1 rounded-xl bg-gray-200 animate-pulse" />
              <div className="h-12 w-12 rounded-xl bg-gray-200 animate-pulse" />
            </div>
            {/* Infos livraison */}
            <div className="rounded-2xl bg-white p-4 space-y-3 shadow-sm">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse flex-shrink-0" />
                  <div className="h-4 w-48 rounded-full bg-gray-200 animate-pulse" />
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Produits similaires */}
        <div className="mt-12 space-y-4">
          <div className="h-6 w-44 rounded-full bg-gray-200 animate-pulse" />
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

      </div>
    </div>
  )
}
