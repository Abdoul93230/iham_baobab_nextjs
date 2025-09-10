import Link from 'next/link'
 
export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h2 className="text-2xl font-bold mb-4">Boutique non trouvée</h2>
      <p className="text-gray-600 mb-6 text-center">
        La boutique que vous recherchez n&apos;existe pas ou a été supprimée.
      </p>
      <Link
        href="/boutique"
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        Retourner aux boutiques
      </Link>
    </div>
  )
}