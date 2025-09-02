import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface PanierArticle {
  _id: string;
  id: string;
  name: string;
  prix: number;
  prixPromo?: number;
  price?: number;
  images?: string[];
  image1?: string;
  imageUrl?: string;
  quantite: number;
  quantity?: number; // Alias pour compatibilité
  color?: string;
  couleur?: string;
  taille?: string;
  poids?: number;
  ClefType?: string;
  Clefournisseur?: {
    _id: string;
    storeName?: string;
    name?: string;
  };
  shipping?: {
    zones: Array<{
      name: string;
      price: number;
      transporteurName?: string;
      transporteurContact?: string;
    }>;
    weight: number;
    dimensions?: {
      length: number;
      width: number;
      height: number;
    };
  };
}

interface PanierState {
  articles: PanierArticle[];
  isLoaded: boolean;
}

const initialState: PanierState = {
  articles: [],
  isLoaded: false,
};

// Helpers pour localStorage
const loadFromLocalStorage = (): PanierArticle[] => {
  if (typeof window === "undefined") return [];
  try {
    const panier = localStorage.getItem("panier");
    return panier ? JSON.parse(panier) : [];
  } catch (error) {
    console.error("Erreur lors du chargement du panier:", error);
    return [];
  }
};

const saveToLocalStorage = (articles: PanierArticle[]) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("panier", JSON.stringify(articles));
  } catch (error) {
    console.error("Erreur lors de la sauvegarde du panier:", error);
  }
};

const panierSlice = createSlice({
  name: "panier",
  initialState,
  reducers: {
    // Charger le panier depuis localStorage
    loadPanier: (state) => {
      const articles = loadFromLocalStorage();
      // Normaliser les articles lors du chargement
      state.articles = articles.map((article: PanierArticle) => {
        // Pour les articles en localStorage, quantity représente la quantité dans le panier
        // et quantite peut représenter le stock du produit
        const panierQuantity = article.quantity || 1; // Quantité dans le panier
        
        return {
          ...article,
          quantite: panierQuantity, // Utiliser la quantité du panier
          quantity: panierQuantity  // Maintenir l'alias
        };
      });
      state.isLoaded = true;
    },

    // Ajouter un article au panier
    addToPanier: (state, action: PayloadAction<PanierArticle>) => {
      const article = action.payload;
      
      // S'assurer d'utiliser quantity si disponible, sinon quantite
      const quantiteToAdd = article.quantity || article.quantite || 1;
      
      const existingIndex = state.articles.findIndex(
        (item) =>
          item.id === article.id &&
          item.color === article.color &&
          item.taille === article.taille
      );

      if (existingIndex >= 0) {
        // Si l'article existe déjà, augmenter la quantité
        state.articles[existingIndex].quantite += quantiteToAdd;
      } else {
        // Normaliser l'article avant ajout
        const normalizedArticle = {
          ...article,
          quantite: quantiteToAdd, // Utiliser la quantité à ajouter
          quantity: quantiteToAdd  // Maintenir l'alias pour compatibilité
        };
        state.articles.push(normalizedArticle);
      }
      
      saveToLocalStorage(state.articles);
    },

    // Mettre à jour un article du panier
    updatePanier: (state, action: PayloadAction<PanierArticle>) => {
      const updatedArticle = action.payload;
      const index = state.articles.findIndex(
        (item) =>
          item.id === updatedArticle.id &&
          item.color === updatedArticle.color &&
          item.taille === updatedArticle.taille
      );

      if (index >= 0) {
        state.articles[index] = updatedArticle;
        saveToLocalStorage(state.articles);
      }
    },

    // Supprimer un article du panier
    deletePanier: (
      state,
      action: PayloadAction<{
        id: string;
        color?: string;
        taille?: string;
      }>
    ) => {
      const { id, color, taille } = action.payload;
      state.articles = state.articles.filter(
        (item) =>
          !(item.id === id && item.color === color && item.taille === taille)
      );
      saveToLocalStorage(state.articles);
    },

    // Vider le panier
    clearPanier: (state) => {
      state.articles = [];
      saveToLocalStorage(state.articles);
    },

    // Mettre à jour seulement la quantité
    updateQuantity: (
      state,
      action: PayloadAction<{
        id: string;
        color?: string;
        taille?: string;
        quantite: number;
      }>
    ) => {
      const { id, color, taille, quantite } = action.payload;
      const index = state.articles.findIndex(
        (item) =>
          item.id === id && item.color === color && item.taille === taille
      );

      if (index >= 0 && quantite > 0) {
        state.articles[index].quantite = quantite;
        saveToLocalStorage(state.articles);
      }
    },
  },
});

export const {
  loadPanier,
  addToPanier,
  updatePanier,
  deletePanier,
  clearPanier,
  updateQuantity,
} = panierSlice.actions;

// Selectors
export const selectPanierArticles = (state: { panier: PanierState }) =>
  state.panier.articles;

export const selectPanierCount = (state: { panier: PanierState }) =>
  state.panier.articles.reduce((total, article) => total + article.quantite, 0);

export const selectPanierTotal = (state: { panier: PanierState }) =>
  state.panier.articles.reduce(
    (total, article) => total + article.prix * article.quantite,
    0
  );

export const selectPanierIsLoaded = (state: { panier: PanierState }) =>
  state.panier.isLoaded;

export default panierSlice.reducer;
