import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://ihambaobab.com';
  
  try {
    // Récupérer toutes les catégories depuis l'API
    const categoriesRes = await fetch(`${process.env.NEXT_PUBLIC_Backend_Url}/getAllCategories`, {
      next: { revalidate: 3600 }
    });
    
    if (!categoriesRes.ok) {
      throw new Error('Failed to fetch categories');
    }
    
    const categoriesData = await categoriesRes.json();
    const categories = categoriesData.data || [];
    
    // Générer les URLs pour chaque catégorie
    const categoryUrls: MetadataRoute.Sitemap = categories
      .filter((category: any) => category.name !== 'all') // Exclure la catégorie "all"
      .map((category: any) => ({
        url: `${baseUrl}/Categorie/${encodeURIComponent(category.name)}`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.8,
      }));

    // Ajouter les pages principales
    const mainPages: MetadataRoute.Sitemap = [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1,
      },
      {
        url: `${baseUrl}/Home`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.9,
      },
      {
        url: `${baseUrl}/categories`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
      },
    ];

    return [...mainPages, ...categoryUrls];
  } catch (error) {
    console.error('Error generating sitemap:', error);
    
    // Fallback avec les catégories populaires
    return [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1,
      },
      {
        url: `${baseUrl}/Categorie/électroniques`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.8,
      },
      {
        url: `${baseUrl}/Categorie/vêtements`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.8,
      },
      {
        url: `${baseUrl}/Categorie/chaussures`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.8,
      },
    ];
  }
}
