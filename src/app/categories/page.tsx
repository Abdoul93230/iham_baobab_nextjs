import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import {
  ShoppingBag, Smartphone, Zap, Home, Sparkles, UtensilsCrossed,
  Sprout, HardHat, Sun, Dumbbell, Palette, Gem, BookOpen, Baby,
  GraduationCap, Car, Wrench, Briefcase, RefreshCw, Shirt, Scissors,
  Package, ChevronRight, Tag
} from "lucide-react";

export const revalidate = 1800; // 30 min

export const metadata: Metadata = {
  title: "Toutes les Catégories - IhamBaobab Marketplace",
  description:
    "Découvrez toutes les catégories disponibles sur IhamBaobab — Mode, Électronique, Alimentation, Agriculture et bien plus encore.",
  keywords:
    "catégories, produits, marketplace Niger, électroniques, vêtements, agriculture, IhamBaobab",
  openGraph: {
    title: "Toutes les Catégories - IhamBaobab",
    description:
      "Explorez notre large gamme de catégories sur la marketplace #1 du Niger",
    url: "/categories",
  },
};

// ─── Icône par nom de catégorie ───────────────────────────────────────────────
const CATEGORY_ICONS: Record<string, React.ElementType> = {
  "Mode & Vêtements":               Shirt,
  "Textile & Tissus":               Scissors,
  "Téléphones & Tablettes":         Smartphone,
  "Électronique & Informatique":    Zap,
  "Électroménager":                 Zap,
  "Maison & Décoration":            Home,
  "Beauté & Santé":                 Sparkles,
  "Alimentation & Boissons":        UtensilsCrossed,
  "Agriculture & Élevage":          Sprout,
  "Construction & Matériaux":       HardHat,
  "Énergie & Solaire":              Sun,
  "Sports & Loisirs":               Dumbbell,
  "Artisanat & Art":                Palette,
  "Bijoux & Accessoires":           Gem,
  "Livres & Médias":                BookOpen,
  "Enfants & Bébés":                Baby,
  "Fournitures Scolaires & Bureau": GraduationCap,
  "Automobile & Moto":              Car,
  "Jardin & Bricolage":             Wrench,
  "Services":                       Briefcase,
  "Occasion & Reconditionné":       RefreshCw,
  // Anciennes catégories
  "electronique":                   Smartphone,
  "beaute":                         Sparkles,
  "homme":                          Shirt,
  "cuisine & ustensiles":           UtensilsCrossed,
  "électroménager":                 Zap,
};

// ─── Couleur d'accent par catégorie ──────────────────────────────────────────
const CATEGORY_COLORS: Record<string, string> = {
  "Mode & Vêtements":               "from-pink-500 to-rose-400",
  "Textile & Tissus":               "from-purple-500 to-violet-400",
  "Téléphones & Tablettes":         "from-blue-500 to-cyan-400",
  "Électronique & Informatique":    "from-indigo-500 to-blue-400",
  "Électroménager":                 "from-sky-500 to-blue-400",
  "Maison & Décoration":            "from-amber-500 to-yellow-400",
  "Beauté & Santé":                 "from-pink-400 to-fuchsia-400",
  "Alimentation & Boissons":        "from-green-500 to-emerald-400",
  "Agriculture & Élevage":          "from-lime-600 to-green-500",
  "Construction & Matériaux":       "from-orange-600 to-amber-500",
  "Énergie & Solaire":              "from-yellow-500 to-orange-400",
  "Sports & Loisirs":               "from-red-500 to-orange-400",
  "Artisanat & Art":                "from-teal-500 to-cyan-400",
  "Bijoux & Accessoires":           "from-yellow-400 to-amber-300",
  "Livres & Médias":                "from-violet-500 to-purple-400",
  "Enfants & Bébés":                "from-pink-400 to-rose-300",
  "Fournitures Scolaires & Bureau": "from-blue-400 to-indigo-300",
  "Automobile & Moto":              "from-gray-600 to-zinc-500",
  "Jardin & Bricolage":             "from-emerald-600 to-teal-500",
  "Services":                       "from-[#30A08B] to-teal-400",
  "Occasion & Reconditionné":       "from-stone-500 to-gray-400",
};

const DEFAULT_GRADIENT = "from-[#30A08B] to-[#B2905F]";

function getGradient(name: string) {
  return CATEGORY_COLORS[name] || DEFAULT_GRADIENT;
}

function getCategoryIcon(name: string) {
  return CATEGORY_ICONS[name] || ShoppingBag;
}

function isPlaceholder(url?: string) {
  if (!url) return true;
  return url.includes("placehold.co") || url.includes("placeholder");
}

// ─── Fetch ────────────────────────────────────────────────────────────────────
interface Category {
  _id: string;
  name: string;
  image?: string;
  productCount: number;
}

async function getCategoriesWithProducts(): Promise<Category[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_Backend_Url;
    const res = await fetch(`${baseUrl}/getCategoriesWithProducts`, {
      next: { revalidate: 1800 },
    });
    if (!res.ok) throw new Error("fetch failed");
    const data = await res.json();
    return data.data || [];
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default async function CategoriesPage() {
  const categories = await getCategoriesWithProducts();
  const totalProducts = categories.reduce((s, c) => s + c.productCount, 0);

  return (
    <>
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: "Catégories de Produits",
            description: "Toutes les catégories disponibles sur IhamBaobab",
            url: `${process.env.NEXT_PUBLIC_SITE_URL}/categories`,
            mainEntity: {
              "@type": "ItemList",
              numberOfItems: categories.length,
              itemListElement: categories.map((c, i) => ({
                "@type": "Thing",
                position: i + 1,
                name: c.name,
                url: `${process.env.NEXT_PUBLIC_SITE_URL}/Categorie/${encodeURIComponent(c.name)}`,
              })),
            },
          }),
        }}
      />

      <div className="min-h-screen bg-gray-50">

        {/* ── Hero ── */}
        <div className="bg-gradient-to-br from-[#0d2137] via-[#0f2d40] to-[#0a1e2e] text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
            <div className="text-center">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-sm font-medium text-[#4fc4ad] mb-5">
                <Tag className="w-3.5 h-3.5" />
                {categories.length} catégories disponibles
              </span>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 tracking-tight">
                Trouvez ce que<br />
                <span className="text-[#30A08B]">vous cherchez</span>
              </h1>
              <p className="text-white/60 text-base sm:text-lg max-w-xl mx-auto">
                {totalProducts.toLocaleString("fr-FR")} produits répartis dans {categories.length} catégories,
                proposés par des vendeurs vérifiés.
              </p>
            </div>
          </div>
        </div>

        {/* ── Grid ── */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {categories.length === 0 ? (
            <div className="text-center py-20">
              <Package className="w-14 h-14 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">Aucune catégorie disponible pour l'instant.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {categories.map((category) => {
                const Icon = getCategoryIcon(category.name);
                const gradient = getGradient(category.name);
                const hasRealImage = !isPlaceholder(category.image);

                return (
                  <Link
                    key={category._id}
                    href={`/Categorie/${encodeURIComponent(category.name)}`}
                    className="group relative flex flex-col bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg border border-gray-100 hover:border-[#30A08B]/30 transition-all duration-300 hover:-translate-y-0.5"
                  >
                    {/* Image ou gradient avec icône */}
                    <div className="relative h-32 sm:h-36 overflow-hidden">
                      {hasRealImage ? (
                        <Image
                          src={category.image!}
                          alt={category.name}
                          fill
                          sizes="(max-width:640px) 50vw, (max-width:1024px) 33vw, 20vw"
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className={`w-full h-full bg-gradient-to-br ${gradient} flex items-center justify-center`}>
                          <Icon className="w-10 h-10 text-white/90" />
                        </div>
                      )}
                      {/* Overlay gradient en bas pour lisibilité */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>

                    {/* Contenu */}
                    <div className="flex flex-col flex-1 p-3 gap-1">
                      <h3 className="text-xs sm:text-sm font-semibold text-gray-900 group-hover:text-[#30A08B] transition-colors leading-tight line-clamp-2">
                        {category.name}
                      </h3>
                      <div className="flex items-center justify-between mt-auto pt-1">
                        <span className="text-xs text-gray-400">
                          {category.productCount.toLocaleString("fr-FR")} produit{category.productCount > 1 ? "s" : ""}
                        </span>
                        <ChevronRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-[#30A08B] group-hover:translate-x-0.5 transition-all" />
                      </div>
                    </div>

                    {/* Barre d'accent en bas au hover */}
                    <div className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r ${gradient} scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left`} />
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* ── CTA ── */}
        {categories.length > 0 && (
          <div className="bg-gradient-to-r from-[#30A08B] to-[#267a6b] text-white mt-4">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
              <h2 className="text-xl sm:text-2xl font-bold mb-2">
                Vous ne trouvez pas ce que vous cherchez ?
              </h2>
              <p className="text-white/75 mb-6 text-sm">
                Utilisez la recherche ou parcourez tous les produits disponibles.
              </p>
              <Link
                href="/"
                className="inline-flex items-center gap-2 bg-white text-[#30A08B] font-semibold px-7 py-2.5 rounded-xl hover:bg-gray-50 transition-colors text-sm"
              >
                <ShoppingBag className="w-4 h-4" />
                Voir tous les produits
              </Link>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
