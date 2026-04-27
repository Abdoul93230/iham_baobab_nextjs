import { Metadata } from "next";
import { notFound } from "next/navigation";
import DetailHomme from "@/components/categoryPage/DetailHomme";
import HomeHeader from "@/components/home/HomeHeader";
import HomeFooter from "@/components/home/HomeFooter";

interface PageProps {
  params: Promise<{
    name: string;
  }>;
}

// Configuration pour générer des pages statiques pour les catégories populaires
export async function generateStaticParams() {
  // Liste des catégories populaires à pré-générer
  const popularCategories = [
    'électroniques',
    'vêtements',
    'chaussures',
    'accessoires',
    'maison',
    'beauté',
    'sport',
    'livres',
    'jouets',
    'automobile'
  ];

  return popularCategories.map((category) => ({
    name: encodeURIComponent(category),
  }));
}

// Fonction pour récupérer les données de la catégorie côté serveur
async function getCategoryData(categoryName: string) {
  const decodedName = decodeURIComponent(categoryName);
  
  try {
    // Récupérer les données depuis l'API
    const baseUrl = process.env.NEXT_PUBLIC_Backend_Url;
    
    // Step 1: get categories + types (light, cached 1h)
    const [categoriesRes, typesRes] = await Promise.all([
      fetch(`${baseUrl}/getAllCategories`, { next: { revalidate: 3600 } }),
      fetch(`${baseUrl}/getAllType`, { next: { revalidate: 3600 } }),
    ]);

    if (!categoriesRes.ok || !typesRes.ok) throw new Error('Failed to fetch data');

    const [categoriesData, typesData] = await Promise.all([
      categoriesRes.json(),
      typesRes.json(),
    ]);

    const category = categoriesData.data?.find(
      (cat: any) => cat.name.toLowerCase() === decodedName.toLowerCase()
    );
    if (!category) return null;

    const categoryTypes: any[] = typesData.data?.filter(
      (type: any) => type.clefCategories === category._id
    ) || [];

    // Step 2: fetch products for each type with server-side filtering (paginated)
    const typeIds = categoryTypes.map((t: any) => t._id);
    let categoryProducts: any[] = [];

    if (typeIds.length > 0) {
      // Fetch up to 60 products for the first type as representative sample for SSR/SEO
      const firstTypeRes = await fetch(
        `${baseUrl}/searchProductByType/${typeIds[0]}?limit=60`,
        { next: { revalidate: 1800 } }
      );
      if (firstTypeRes.ok) {
        const firstTypeData = await firstTypeRes.json();
        categoryProducts = firstTypeData.products ?? firstTypeData.data ?? [];
      }
    }

    return {
      category,
      types: categoryTypes,
      products: categoryProducts,
      totalProducts: categoryProducts.length
    };
  } catch (error) {
    console.error('Error fetching category data:', error);
    return null;
  }
}

// Fonction utilitaire pour construire l'URL de l'image
function getImageUrl(imageUrl: string | null | undefined) {
  if (!imageUrl) return '/LogoText.png';
  
  // Si l'image commence par http/https, c'est déjà une URL complète
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }
  
  // Sinon, construire l'URL avec le backend
  return `${process.env.NEXT_PUBLIC_Backend_Url}/uploads/${imageUrl}`;
}

// Fonction utilitaire pour construire les URLs complètes du site
function getFullUrl(path: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL;
  return `${baseUrl}${path}`;
}

// Génération des métadonnées dynamiques pour le SEO
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { name } = await params;
  const categoryData = await getCategoryData(name);
  
  if (!categoryData) {
    return {
      title: 'Catégorie non trouvée - IhamBaobab',
      description: 'La catégorie demandée n\'existe pas sur notre marketplace.',
    };
  }

  const { category, products, totalProducts } = categoryData;
  const decodedName = decodeURIComponent(name);
  
  // Créer une description riche
  const description = `Découvrez ${totalProducts} produits dans la catégorie ${category.name} sur IhamBaobab. ${
    totalProducts > 0 
      ? `Large sélection de ${category.name.toLowerCase()} à prix compétitifs avec livraison rapide au Niger.` 
      : `Bientôt disponible dans notre marketplace.`
  }`;

  // Image de la catégorie (utilise l'image de la catégorie ou le logo par défaut)
  const categoryImage = getImageUrl(category.image);

  // Mots-clés basés sur la catégorie et les produits
  const keywords = [
    category.name,
    `${category.name} Niger`,
    `${category.name} Niamey`,
    `acheter ${category.name}`,
    `${category.name} en ligne`,
    'marketplace Niger',
    'IhamBaobab',
    'e-commerce Niger',
    'livraison Niger'
  ];

  return {
    title: `${category.name} (${totalProducts}) - IhamBaobab Marketplace`,
    description,
    keywords: keywords.join(', '),
    
    // Open Graph pour les réseaux sociaux
    openGraph: {
      title: `${category.name} - IhamBaobab`,
      description,
      url: `/Categorie/${name}`, // URL relative
      siteName: 'IhamBaobab',
      images: [
        {
          url: categoryImage,
          width: 1200,
          height: 630,
          alt: `Produits ${category.name} sur IhamBaobab`,
        },
      ],
      locale: 'fr_FR',
      type: 'website',
    },

    // Twitter Card
    twitter: {
      card: 'summary_large_image',
      title: `${category.name} - IhamBaobab`,
      description,
      images: [categoryImage],
    },

    // Données structurées pour les moteurs de recherche
    other: {
      'product:category': category.name,
      'product:availability': totalProducts > 0 ? 'in stock' : 'out of stock',
      'product:price_range': products.length > 0 ? `${Math.min(...products.map((p: any) => p.prix || 0))} - ${Math.max(...products.map((p: any) => p.prix || 0))} XOF` : '',
    },

    // Balises robots
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },

    // Canonical URL
    alternates: {
      canonical: `/Categorie/${name}`,
    }
  };
}

// Page principale (Server Component)
export default async function CategoryPage({ params }: PageProps) {
  const { name } = await params;
  const categoryData = await getCategoryData(name);
  
  // Si la catégorie n'existe pas, retourner 404
  if (!categoryData) {
    notFound();
  }

  const acces = true;

  return (
    <>
      {/* Données structurées JSON-LD pour le SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            "name": categoryData.category.name,
            "description": `Découvrez notre collection de ${categoryData.category.name.toLowerCase()} sur IhamBaobab`,
            "url": getFullUrl(`/Categorie/${name}`),
            "image": getImageUrl(categoryData.category.image),
            "isPartOf": {
              "@type": "WebSite",
              "name": "IhamBaobab",
              "url": getFullUrl('/')
            },
            "mainEntity": {
              "@type": "ItemList",
              "numberOfItems": categoryData.totalProducts,
              "itemListElement": categoryData.products.slice(0, 10).map((product: any, index: number) => ({
                "@type": "Product",
                "position": index + 1,
                "name": product.name,
                "description": product.description || `${product.name} disponible sur IhamBaobab`,
                "image": product.image1 || "/placeholder-product.jpg",
                "offers": {
                  "@type": "Offer",
                  "price": product.prix || 0,
                  "priceCurrency": "XOF",
                  "availability": product.quantite > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
                }
              }))
            },
            "breadcrumb": {
              "@type": "BreadcrumbList",
              "itemListElement": [
                {
                  "@type": "ListItem",
                  "position": 1,
                  "name": "Accueil",
                  "item": getFullUrl('/')
                },
                {
                  "@type": "ListItem",
                  "position": 2,
                  "name": "Catégories",
                  "item": getFullUrl('/categories')
                },
                {
                  "@type": "ListItem",
                  "position": 3,
                  "name": categoryData.category.name,
                  "item": getFullUrl(`/Categorie/${name}`)
                }
              ]
            }
          }),
        }}
      />
      
      <HomeHeader />
      <DetailHomme
        acces={acces}
        categoryParam={name}
      />
      <HomeFooter />
    </>
  );
}