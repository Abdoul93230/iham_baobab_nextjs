import { MetadataRoute } from "next";

// Régénéré au plus une fois par heure
export const revalidate = 3600;

const STATIC_PAGES: Array<[string, number, MetadataRoute.Sitemap[number]["changeFrequency"]]> = [
  ["", 1, "daily"],
  ["/categories", 0.8, "weekly"],
  ["/promotion", 0.8, "daily"],
  ["/nouveaux", 0.8, "daily"],
  ["/pres-de-chez-moi", 0.6, "weekly"],
  ["/faq", 0.5, "monthly"],
  ["/centre-aide", 0.5, "monthly"],
  ["/livraison", 0.5, "monthly"],
  ["/about", 0.4, "monthly"],
  ["/contact", 0.4, "monthly"],
  ["/become-seller", 0.5, "monthly"],
  ["/informations-legales", 0.2, "yearly"],
  ["/confidentialite", 0.2, "yearly"],
];

async function getJson(url: string) {
  const r = await fetch(url, { next: { revalidate: 3600 } });
  if (!r.ok) throw new Error(`${url} : ${r.status}`);
  return r.json();
}

/** Plan du site : pages principales, catégories, tous les articles visibles et toutes les boutiques */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.ihambaobab.com").replace(/\/$/, "");
  const api = process.env.NEXT_PUBLIC_Backend_Url;
  const now = new Date();

  const pages: MetadataRoute.Sitemap = STATIC_PAGES.map(([path, priority, changeFrequency]) => ({
    url: `${baseUrl}${path}`, lastModified: now, changeFrequency, priority,
  }));

  const [categories, data] = await Promise.allSettled([getJson(`${api}/getAllCategories`), getJson(`${api}/sitemapData`)]);

  if (categories.status === "fulfilled") {
    for (const c of categories.value?.data || []) {
      if (!c?.name || c.name === "all") continue;
      pages.push({ url: `${baseUrl}/Categorie/${encodeURIComponent(c.name)}`, lastModified: now, changeFrequency: "daily", priority: 0.7 });
    }
  }

  if (data.status === "fulfilled") {
    for (const s of data.value?.stores || []) {
      pages.push({
        url: `${baseUrl}/boutique/${encodeURIComponent(s.storeName)}`,
        lastModified: s.updatedAt ? new Date(s.updatedAt) : now, changeFrequency: "weekly", priority: 0.6,
      });
    }
    for (const p of data.value?.products || []) {
      pages.push({
        url: `${baseUrl}/ProduitDetail/${p.id}`,
        lastModified: p.updatedAt ? new Date(p.updatedAt) : now, changeFrequency: "weekly", priority: 0.7,
      });
    }
  } else {
    console.error("Sitemap : liste des articles indisponible", data.reason);
  }

  return pages;
}
