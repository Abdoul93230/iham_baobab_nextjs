export default function WalletLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">

        {/* Solde principal */}
        <div className="rounded-3xl bg-gradient-to-br from-[#30A08B] to-teal-600 p-6 space-y-4">
          <div className="h-4 w-32 rounded-full bg-white/20 animate-pulse" />
          <div className="h-12 w-48 rounded-xl bg-white/20 animate-pulse" />
          <div className="flex gap-3 mt-4">
            <div className="h-10 flex-1 rounded-full bg-white/20 animate-pulse" />
            <div className="h-10 flex-1 rounded-full bg-white/20 animate-pulse" />
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-2xl p-4 shadow-sm space-y-2">
              <div className="h-4 w-3/4 rounded-full bg-gray-200 animate-pulse" />
              <div className="h-6 w-1/2 rounded-full bg-gray-200 animate-pulse" />
            </div>
          ))}
        </div>

        {/* Historique transactions */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <div className="h-5 w-40 rounded-full bg-gray-200 animate-pulse" />
          </div>
          <div className="divide-y divide-gray-50">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-4">
                <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-3/4 rounded-full bg-gray-200 animate-pulse" />
                  <div className="h-3 w-1/2 rounded-full bg-gray-100 animate-pulse" />
                </div>
                <div className="h-5 w-16 rounded-full bg-gray-200 animate-pulse" />
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
