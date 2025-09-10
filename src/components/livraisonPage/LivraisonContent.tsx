"use client";

import React from "react";
import Link from "next/link";
import LivraisonPage from "./LivraisonPage";
import HomeHeader from "../home/HomeHeader";

// Composant de fil d'Ariane pour le SEO
const Breadcrumb = () => (
  <nav aria-label="Fil d'Ariane" className="mb-4">
    <ol className="flex items-center space-x-2 text-sm text-gray-600">
      <li>
        <Link 
          href="/" 
          className="hover:text-[#B17236] transition-colors"
          aria-label="Retour à l'accueil"
        >
          Accueil
        </Link>
      </li>
      {/* <li aria-hidden="true" className="text-gray-400">/</li> */}
      {/* <li>
        <a 
          href="/compte" 
          className="hover:text-[#B17236] transition-colors"
          aria-label="Aller à mon compte"
        >
          Mon Compte
        </a>
      </li> */}
      <li aria-hidden="true" className="text-gray-400">/</li>
      <li aria-current="page" className="text-[#B17236] font-medium">
        Adresse de Livraison
      </li>
    </ol>
  </nav>
);

function LivraisonContent() {
  return (
    <>
      {/* En-tête principal de la page */}
      <header>
        <HomeHeader />
      </header>

      {/* Contenu principal avec structure sémantique */}
      <main role="main" aria-label="Gestion de l'adresse de livraison">
        <div className="container mx-auto p-4">
          <Breadcrumb />
          
          {/* Titre principal pour le SEO */}
          <div className="sr-only">
            <h1>Gestion de votre adresse de livraison IhamBaobab</h1>
            <p>
              Modifiez vos informations de livraison, ajoutez votre région, 
              quartier et instructions spéciales pour assurer une livraison 
              réussie de vos commandes.
            </p>
          </div>
          
          <LivraisonPage />
        </div>
      </main>
    </>
  );
}

export default LivraisonContent;