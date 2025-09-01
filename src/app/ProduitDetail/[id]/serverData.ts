import axios from "axios";

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

// Fonction pour récupérer toutes les données nécessaires côté serveur
export async function getServerPageData(productId: string): Promise<ServerPageData> {
  try {
    if (!BackendUrl) {
      throw new Error("Backend URL not configured");
    }

    // Récupération parallèle des données
    const [
      productsResponse,
      typesResponse,
      categoriesResponse,
      commentsResponse
    ] = await Promise.allSettled([
      axios.get(`${BackendUrl}/products`),
      axios.get(`${BackendUrl}/getAllType`),
      axios.get(`${BackendUrl}/getAllCategories`),
      axios.get(`${BackendUrl}/getAllCommenteProduitById/${productId}`)
    ]);

    // Extraction des données avec gestion d'erreurs
    const products = productsResponse.status === 'fulfilled' ? productsResponse.value.data.data : [];
    const types = typesResponse.status === 'fulfilled' ? typesResponse.value.data.data : [];
    const categories = categoriesResponse.status === 'fulfilled' ? categoriesResponse.value.data.data : [];
    const comments = commentsResponse.status === 'fulfilled' ? commentsResponse.value.data.data : [];

    // Trouver le produit spécifique
    const product = products.find((p: ProductData) => p._id === productId) || null;

    if (!product) {
      return {
        product: null,
        comments: [],
        category: null,
        type: null,
        similarProducts: [],
        allProducts: products
      };
    }

    // Trouver le type et la catégorie
    const type = types.find((t: TypeData) => t._id === product.ClefType) || null;
    const category = type ? categories.find((c: CategoryData) => c._id === type.clefCategories) : null;

    // Produits similaires (même type)
    const similarProducts = products
      .filter((p: ProductData) => p.ClefType === product.ClefType && p._id !== productId)
      .slice(0, 12);

    return {
      product,
      comments,
      category,
      type,
      similarProducts,
      allProducts: products.slice(0, 12) // Échantillon pour "autres produits"
    };

  } catch (error) {
    console.error('Error fetching server data:', error);
    return {
      product: null,
      comments: [],
      category: null,
      type: null,
      similarProducts: [],
      allProducts: []
    };
  }
}
