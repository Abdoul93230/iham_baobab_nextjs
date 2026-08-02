export default function MembreEquipeLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">

        {/* Bouton retour */}
        <div className="h-9 w-28 rounded-full bg-gray-200 animate-pulse" />

        {/* Card profil */}
        <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
          {/* Photo */}
          <div className="aspect-[16/7] bg-gray-200 animate-pulse" />
          <div className="p-6 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <div className="h-7 w-48 rounded-full bg-gray-200 animate-pulse" />
                <div className="h-5 w-32 rounded-full bg-gray-200 animate-pulse" />
                <div className="h-5 w-24 rounded-full bg-gray-100 animate-pulse" />
              </div>
              {/* Socials */}
              <div className="flex gap-2">
                <div className="w-9 h-9 rounded-full bg-gray-200 animate-pulse" />
                <div className="w-9 h-9 rounded-full bg-gray-200 animate-pulse" />
                <div className="w-9 h-9 rounded-full bg-gray-200 animate-pulse" />
              </div>
            </div>

            <div className="border-t border-gray-100 pt-4 space-y-2">
              <div className="h-4 w-full rounded-full bg-gray-200 animate-pulse" />
              <div className="h-4 w-5/6 rounded-full bg-gray-200 animate-pulse" />
              <div className="h-4 w-4/6 rounded-full bg-gray-200 animate-pulse" />
            </div>

            {/* Contacts */}
            <div className="space-y-3 pt-2">
              {[1, 2].map(i => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
                  <div className="h-4 w-40 rounded-full bg-gray-200 animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
