import axios from "axios";
import { cache } from "react";

const BackendUrl = process.env.NEXT_PUBLIC_Backend_Url;

// Types pour le SSR
export interface ProductData {
  _id: string;
  name: string;
  prix: number;
  prixPromo?: number;
  prixf?: number;
  image1?: string;
  image2?: string;
  image3?: string;
  description?: string;
  category?: string;
  typeName?: string;
  isPublished?: string;
  ClefType?: string;
  Clefcategories?: string;
  tailles?: string[];
  couleurs?: string[];
  quantite?: number;
  prixLivraison?: number;
  variants?: Array<{
    color: string;
    imageUrl: string;
    sizes?: string[];
    stock?: number;
  }>;
  shipping?: {
    weight?: number;
  };
  Clefournisseur?: {
    _id: string;
    name?: string;
  };
}

export interface CategoryData {
  _id: string;
  name: string;
  image?: string;
}

export interface TypeData {
  _id: string;
  name: string;
  categoryId?: string;
  clefCategories?: string;
}

export interface CommentData {
  _id: string;
  description: string;
  etoil: number;
  userName: string;
  createdAt: string;
}

export interface ServerPageData {
  product: ProductData | null;
  comments: CommentData[];
  category: CategoryData | null;
  type: TypeData | null;
  similarProducts: ProductData[];
  allProducts: ProductData[];
}

const EMPTY: ServerPageData = { product: null, comments: [], category: null, type: null, similarProducts: [], allProducts: [] };
const pick = (r: PromiseSettledResult<any>) => (r.status === "fulfilled" ? r.value?.data?.data : null);

/**
 * Données de la fiche produit, côté serveur. Le produit est chargé directement par son identifiant
 * (avant : on cherchait dans la 1re page du catalogue, donc la plupart des articles étaient « introuvables »).
 * Mis en cache pour la requête : la page et ses métadonnées ne font qu'un seul appel.
 */
export const getServerPageData = cache(async (productId: string): Promise<ServerPageData> => {
  try {
    if (!BackendUrl) throw new Error("Backend URL not configured");
    if (!/^[a-f0-9]{24}$/i.test(productId)) return EMPTY;

    const [productRes, typesRes, categoriesRes, commentsRes] = await Promise.allSettled([
      axios.get(`${BackendUrl}/ProductClient/${productId}`, { timeout: 8000 }),
      axios.get(`${BackendUrl}/getAllType`, { timeout: 8000 }),
      axios.get(`${BackendUrl}/getAllCategories`, { timeout: 8000 }),
      axios.get(`${BackendUrl}/getAllCommenteProduitById/${productId}`, { timeout: 8000 }),
    ]);
    const product: ProductData | null = pick(productRes) || null;
    if (!product || (product.isPublished && product.isPublished !== "Published")) return EMPTY;

    const types: TypeData[] = pick(typesRes) || [];
    const categories: CategoryData[] = pick(categoriesRes) || [];
    const comments: CommentData[] = pick(commentsRes) || [];
    const type = types.find((t) => t._id === product.ClefType) || null;
    const category = type ? categories.find((c) => c._id === type.clefCategories) || null : null;

    // Articles du même type, et quelques autres : deux petites listes au lieu du catalogue entier
    const [similarRes, othersRes] = await Promise.allSettled([
      product.ClefType ? axios.get(`${BackendUrl}/searchProductByType/${product.ClefType}`, { params: { limit: 13 }, timeout: 8000 }) : Promise.reject(),
      axios.get(`${BackendUrl}/ProductsClients`, { params: { limit: 12 }, timeout: 8000 }),
    ]);
    const similarProducts: ProductData[] = (pick(similarRes) || []).filter((p: ProductData) => p._id !== productId).slice(0, 12);
    const allProducts: ProductData[] = (pick(othersRes) || []).filter((p: ProductData) => p._id !== productId);

    return { product, comments, category, type, similarProducts, allProducts };
  } catch (error) {
    console.error("Error fetching server data:", error);
    return EMPTY;
  }
});
