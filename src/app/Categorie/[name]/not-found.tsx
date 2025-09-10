import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Catégorie non trouvée - IhamBaobab',
  description: 'La catégorie demandée n\'existe pas. Découvrez nos autres catégories sur IhamBaobab.',
  robots: {
    index: false,
    follow: true,
  },
};

export default function CategoryNotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <h1 className="text-6xl font-bold text-gray-300 mb-4">404</h1>
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">
            Catégorie non trouvée
          </h2>
          <p className="text-gray-600 mb-8">
            Désolé, la catégorie que vous recherchez n&apos;existe pas ou n&apos;est plus disponible.
          </p>
        </div>

        <div className="space-y-4">
          <Link
            href="/Home"
            className="inline-block w-full bg-[#30A08B] text-white py-3 px-6 rounded-lg hover:bg-[#268070] transition-colors font-medium"
          >
            Retour à l'accueil
          </Link>
          
          <Link
            href="/categories"
            className="inline-block w-full border border-[#30A08B] text-[#30A08B] py-3 px-6 rounded-lg hover:bg-[#30A08B] hover:text-white transition-colors font-medium"
          >
            Voir toutes les catégories
          </Link>
        </div>

        <div className="mt-8 text-sm text-gray-500">
          <p>Suggestions :</p>
          <ul className="mt-2 space-y-1">
            <li>
              <Link href="/Categorie/électroniques" className="text-[#30A08B] hover:underline">
                Électroniques
              </Link>
            </li>
            <li>
              <Link href="/Categorie/vêtements" className="text-[#30A08B] hover:underline">
                Vêtements
              </Link>
            </li>
            <li>
              <Link href="/Categorie/chaussures" className="text-[#30A08B] hover:underline">
                Chaussures
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
