"use client";

import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { 
  loadPanier, 
  addToPanier, 
  deletePanier, 
  updateQuantity,
  selectPanierArticles, 
  selectPanierCount 
} from '@/redux/panierSlice';

export default function TestPanierPage() {
  const dispatch = useAppDispatch();
  const articles = useAppSelector(selectPanierArticles);
  const count = useAppSelector(selectPanierCount);

  useEffect(() => {
    console.log("=== DEBUG PANIER ===");
    console.log("Articles:", articles);
    console.log("Count:", count);
    console.log("LocalStorage:", localStorage.getItem("panier"));
  }, [articles, count]);

  const testAddProduct = () => {
    const testProduct = {
      _id: "test-123",
      id: "test-123",
      name: "Test Product",
      prix: 1000,
      quantite: 10, // Stock
      quantity: 2,  // Quantité à ajouter
      imageUrl: "https://via.placeholder.com/300",
      color: "red",
      taille: "M"
    };

    console.log("Adding product:", testProduct);
    dispatch(addToPanier(testProduct));
  };

  const testUpdateQuantity = () => {
    if (articles.length > 0) {
      const firstArticle = articles[0];
      console.log("Updating quantity for:", firstArticle);
      dispatch(updateQuantity({
        id: firstArticle._id || firstArticle.id,
        color: firstArticle.color,
        taille: firstArticle.taille,
        quantite: 5
      }));
    }
  };

  const testDeleteProduct = () => {
    if (articles.length > 0) {
      const firstArticle = articles[0];
      console.log("Deleting product:", firstArticle);
      dispatch(deletePanier({
        id: firstArticle._id || firstArticle.id,
        color: firstArticle.color,
        taille: firstArticle.taille
      }));
    }
  };

  const loadFromStorage = () => {
    console.log("Loading from localStorage...");
    dispatch(loadPanier());
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Test Panier Redux</h1>
      
      <div className="mb-4">
        <p><strong>Nombre d'articles:</strong> {count}</p>
        <p><strong>Articles:</strong> {articles.length}</p>
      </div>

      <div className="space-y-2 mb-4">
        <button 
          onClick={testAddProduct}
          className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
        >
          Ajouter Produit Test
        </button>
        
        <button 
          onClick={testUpdateQuantity}
          className="bg-green-500 text-white px-4 py-2 rounded mr-2"
        >
          Modifier Quantité
        </button>
        
        <button 
          onClick={testDeleteProduct}
          className="bg-red-500 text-white px-4 py-2 rounded mr-2"
        >
          Supprimer Produit
        </button>
        
        <button 
          onClick={loadFromStorage}
          className="bg-gray-500 text-white px-4 py-2 rounded"
        >
          Recharger depuis localStorage
        </button>
      </div>

      <div className="border p-4 rounded">
        <h2 className="font-bold mb-2">Articles dans le panier:</h2>
        {articles.length === 0 ? (
          <p>Aucun article</p>
        ) : (
          articles.map((article, index) => (
            <div key={index} className="border-b py-2">
              <p><strong>ID:</strong> {article._id || article.id}</p>
              <p><strong>Nom:</strong> {article.name}</p>
              <p><strong>Quantité:</strong> {article.quantite}</p>
              <p><strong>Quantity (alias):</strong> {article.quantity}</p>
              <p><strong>Color:</strong> {article.color}</p>
              <p><strong>Taille:</strong> {article.taille}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
