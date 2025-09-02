/**
 * Utilitaires pour la synchronisation du panier à travers l'application
 */

import { store } from '@/redux/store';
import { loadPanier, addToPanier, updateQuantity, deletePanier, type PanierArticle } from '@/redux/panierSlice';

/**
 * Ajouter un article au panier (utilisable depuis n'importe où)
 */
export const ajouterAuPanier = (article: PanierArticle) => {
  store.dispatch(addToPanier(article));
  console.log('Article ajouté au panier:', article.name);
};

/**
 * Supprimer un article du panier
 */
export const supprimerDuPanier = (id: string, color?: string, taille?: string) => {
  store.dispatch(deletePanier({ id, color, taille }));
  console.log('Article supprimé du panier:', id);
};

/**
 * Mettre à jour la quantité d'un article
 */
export const modifierQuantite = (id: string, quantite: number, color?: string, taille?: string) => {
  store.dispatch(updateQuantity({ id, quantite, color, taille }));
  console.log('Quantité modifiée:', id, quantite);
};

/**
 * Recharger le panier depuis localStorage
 */
export const rechargerPanier = () => {
  store.dispatch(loadPanier());
  console.log('Panier rechargé depuis localStorage');
};

/**
 * Obtenir le nombre d'articles dans le panier
 */
export const obtenirNombreArticles = (): number => {
  const state = store.getState();
  return state.panier.articles.reduce((total, article) => total + (article.quantite || 0), 0);
};

/**
 * Obtenir le total du panier
 */
export const obtenirTotalPanier = (): number => {
  const state = store.getState();
  return state.panier.articles.reduce(
    (total, article) => total + (article.prix || 0) * (article.quantite || 0),
    0
  );
};

/**
 * Vérifier si un article est dans le panier
 */
export const articleDansPanier = (id: string, color?: string, taille?: string): boolean => {
  const state = store.getState();
  return state.panier.articles.some(
    article => 
      (article._id === id || article.id === id) && 
      (article.color || article.couleur) === color && 
      article.taille === taille
  );
};
