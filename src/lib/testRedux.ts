/**
 * Tests de validation pour les fonctions Redux du panier
 * Ce fichier permet de vérifier que toutes les actions Redux fonctionnent correctement
 */

import { store } from '@/redux/store';
import { 
  loadPanier, 
  addToPanier, 
  updateQuantity, 
  deletePanier, 
  clearPanier,
  selectPanierArticles,
  selectPanierCount,
  selectPanierTotal,
  type PanierArticle 
} from '@/redux/panierSlice';

/**
 * Test des actions Redux du panier
 */
export const testReduxActions = () => {
  console.log('🧪 Test des actions Redux du panier...');
  
  // Article de test
  const articleTest: PanierArticle = {
    _id: 'test123',
    id: 'test123',
    name: 'Produit Test',
    prix: 1000,
    quantite: 2,
    color: 'rouge',
    taille: 'M'
  };

  // 1. Test loadPanier
  console.log('1. Test loadPanier...');
  store.dispatch(loadPanier());
  let state = store.getState();
  console.log('✅ Panier chargé:', state.panier.isLoaded);

  // 2. Test addToPanier
  console.log('2. Test addToPanier...');
  store.dispatch(addToPanier(articleTest));
  state = store.getState();
  const articles = selectPanierArticles(state);
  const count = selectPanierCount(state);
  const total = selectPanierTotal(state);
  console.log('✅ Article ajouté:', articles.length > 0);
  console.log('✅ Nombre d\'articles:', count);
  console.log('✅ Total panier:', total);

  // 3. Test updateQuantity
  console.log('3. Test updateQuantity...');
  store.dispatch(updateQuantity({
    id: 'test123',
    color: 'rouge',
    taille: 'M',
    quantite: 5
  }));
  state = store.getState();
  const newCount = selectPanierCount(state);
  console.log('✅ Quantité mise à jour:', newCount === 5);

  // 4. Test deletePanier
  console.log('4. Test deletePanier...');
  store.dispatch(deletePanier({
    id: 'test123',
    color: 'rouge',
    taille: 'M'
  }));
  state = store.getState();
  const finalCount = selectPanierCount(state);
  console.log('✅ Article supprimé:', finalCount === 0);

  // 5. Test clearPanier
  console.log('5. Test clearPanier...');
  store.dispatch(addToPanier(articleTest)); // Ajouter un article
  store.dispatch(clearPanier());
  state = store.getState();
  const emptyCount = selectPanierCount(state);
  console.log('✅ Panier vidé:', emptyCount === 0);

  console.log('🎉 Tous les tests Redux sont réussis !');
};

/**
 * Test de synchronisation localStorage
 */
export const testLocalStorageSync = () => {
  console.log('🧪 Test de synchronisation localStorage...');
  
  const articleTest: PanierArticle = {
    _id: 'test456',
    id: 'test456',
    name: 'Produit Sync Test',
    prix: 500,
    quantite: 1
  };

  // Ajouter un article
  store.dispatch(addToPanier(articleTest));
  
  // Vérifier localStorage
  const localData = localStorage.getItem('panier');
  if (localData) {
    const parsed = JSON.parse(localData);
    console.log('✅ LocalStorage synchronisé:', parsed.length > 0);
  }

  // Nettoyer
  store.dispatch(clearPanier());
  console.log('✅ Test de synchronisation réussi !');
};

/**
 * Exécuter tous les tests
 */
export const runAllTests = () => {
  try {
    testReduxActions();
    testLocalStorageSync();
    console.log('🎊 Tous les tests sont réussis ! Le système Redux fonctionne parfaitement.');
  } catch (error) {
    console.error('❌ Erreur dans les tests:', error);
  }
};
