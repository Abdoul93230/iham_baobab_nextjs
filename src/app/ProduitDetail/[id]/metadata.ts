import { Metadata } from "next";
import { getServerPageData, ProductData, CategoryData } from "./serverData";

// Fonction utilitaire pour nettoyer le HTML
function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').trim();
}

// Génération des métadonnées dynamiques pour le SEO
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const { product, category } = await getServerPageData(id);

  if (!product) {
    return {
      title: "Produit non trouvé | IHAM Baobab",
      description: "Le produit que vous recherchez n'existe pas ou n'est plus disponible.",
      robots: "noindex, nofollow"
    };
  }

  // Création d'une description SEO optimisée
  const cleanDescription = product.description ? stripHtml(product.description) : "";
  const seoDescription = `${product.name} - ${cleanDescription.slice(0, 150)}... Prix: ${product.prixPromo || product.prix} XOF. Livraison disponible en Afrique de l'Ouest.`;

  // Mots-clés SEO
  const keywords = [
    product.name,
    category?.name,
    'achat en ligne',
    'e-commerce',
    'Afrique de l\'Ouest',
    'livraison',
    'Niger',
    'IHAM Baobab'
  ].filter(Boolean).join(', ');

  // Titre SEO optimisé
  const title = `${product.name} | ${category?.name || 'Produits'} | IHAM Baobab`;

  // URL canonique
  const canonicalUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/ProduitDetail/${id}`;

  return {
    title,
    description: seoDescription,
    keywords,
    authors: [{ name: 'IHAM Baobab' }],
    category: category?.name,
    
    // Open Graph pour les réseaux sociaux
    openGraph: {
      title,
      description: seoDescription,
      url: canonicalUrl,
      siteName: 'IHAM Baobab',
      type: 'website',
      images: product.image1 ? [
        {
          url: product.image1,
          width: 800,
          height: 600,
          alt: product.name,
        }
      ] : [],
      locale: 'fr_FR',
    },

    // Twitter Cards
    twitter: {
      card: 'summary_large_image',
      title,
      description: seoDescription,
      images: product.image1 ? [product.image1] : [],
    },

    // Métadonnées produit
    other: {
      'product:price:amount': String(product.prixPromo || product.prix),
      'product:price:currency': 'XOF',
      'product:availability': product.quantite && product.quantite > 0 ? 'in stock' : 'out of stock',
      'product:brand': 'IHAM Baobab',
    },

    // SEO technique
    alternates: {
      canonical: canonicalUrl,
    },
    
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
  };
}
