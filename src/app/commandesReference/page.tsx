"use client";

import { useState, useEffect } from "react";
import { NextSeo } from "next-seo";
import Head from "next/head";
import { useSearchParams, useRouter } from "next/navigation";
import useAuth from "@/hooks/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";
import HomeHeader from "@/components/home/HomeHeader";
import CommandeSuiviTransaction from "@/components/orders/CommandeSuiviTransaction";
import GuestOrderSuccess from "@/components/guest/GuestOrderSuccess";
import { trackingPath } from "@/lib/guestSession";
import { track } from "@/lib/analytics";

// Configuration SEO statique
const suiviCommandeTransactionSEOConfig = {
  title: "Confirmation de Paiement - IhamBaobab | Transaction Réussie",
  description: "Confirmation de votre paiement IhamBaobab. Consultez les détails de votre transaction et le statut de votre commande.",
  canonical: process.env.NEXT_PUBLIC_SITE_URL ? `${process.env.NEXT_PUBLIC_SITE_URL}/commandes` : "/commandes",
  openGraph: {
    title: "Confirmation de Paiement - IhamBaobab",
    description: "Votre paiement a été traité avec succès",
    type: "website",
    url: process.env.NEXT_PUBLIC_SITE_URL ? `${process.env.NEXT_PUBLIC_SITE_URL}/commandes` : "/commandes",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "Confirmation de paiement IhamBaobab",
      },
    ],
    site_name: "IhamBaobab",
    locale: "fr_FR",
  },
  additionalMetaTags: [
    {
      name: "keywords",
      content: "paiement réussi, confirmation transaction, commande validée, IhamBaobab, Niger",
    },
    {
      name: "author",
      content: "IhamBaobab",
    },
    {
      name: "robots",
      content: "noindex, nofollow", // Page privée
    },
  ],
};

export default function CommandesTransaction() {
  const [isClient, setIsClient] = useState(false);
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // Récupération des paramètres de requête
  const transactionId = searchParams.get('transactionId');
  const status = searchParams.get('status');
  const amount = searchParams.get('amount');

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;
    if (status !== "succeeded") return; // échec ou abandon : le panier reste pour réessayer
    // Achat payé en ligne : mesuré une seule fois par référence
    try {
      const k = `ihamTracked:${transactionId}`;
      if (transactionId && !sessionStorage.getItem(k)) {
        sessionStorage.setItem(k, "1");
        track("purchase", { orderRef: transactionId, value: Number(amount) || undefined });
      }
    } catch { /* rien */ }

    [
      "panier",
      "orderTotal",
      "orderSubtotal",
      "orderShippingCost",
      "paymentInfo",
      "pendingOrder",
      "orderShippingZone",
      "orderCodeP",
      "paymentInitiated",
    ].forEach((key) => localStorage.removeItem(key));
  }, [isClient, status]);

  // Fonction vide pour compatibilité
  const handleCartChange = () => {
    // Géré par Redux ou context
  };

  // SEO dynamique
  const dynamicSEO = {
    ...suiviCommandeTransactionSEOConfig,
    title: status === 'succeeded' 
      ? `Paiement Réussi - Transaction ${transactionId?.slice(0, 7)} - IhamBaobab`
      : status === 'failed'
      ? `Échec du Paiement - Transaction ${transactionId?.slice(0, 7)} - IhamBaobab`
      : suiviCommandeTransactionSEOConfig.title,
    canonical: process.env.NEXT_PUBLIC_SITE_URL 
      ? `${process.env.NEXT_PUBLIC_SITE_URL}/commandes?transactionId=${transactionId}&status=${status}&amount=${amount}` 
      : `/commandes?transactionId=${transactionId}&status=${status}&amount=${amount}`,
  };

  if (!isClient) {
    return (
      <>
        <NextSeo {...suiviCommandeTransactionSEOConfig} />
        <Head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        </Head>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#30A08B] mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement des détails de la transaction...</p>
          </div>
        </div>
      </>
    );
  }

  // Vérification des paramètres requis
  if (!transactionId || !status) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.502 0L4.313 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-800 mb-2">Paramètres de transaction manquants</h1>
          <p className="text-gray-600 mb-4">Les informations de transaction sont incomplètes.</p>
          <button
            onClick={() => router.push('/')}
            className="bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700 transition-colors"
          >
            Retour à l'accueil
          </button>
        </div>
      </div>
    );
  }

  // Commande passée sans compte : on lui montre son suivi au lieu de lui demander de se connecter
  let guestOrder: { reference: string; trackingToken: string } | null = null;
  try {
    const g = JSON.parse(localStorage.getItem("lastGuestOrder") || "null");
    if (!user && g?.reference === transactionId && g?.trackingToken) guestOrder = g;
  } catch { /* rien */ }

  if (guestOrder) {
    const paid = status === "succeeded";
    const pending = status === "pending";
    return (
      <>
        <NextSeo {...suiviCommandeTransactionSEOConfig} />
        <HomeHeader />
        <main className="min-h-[70vh] bg-gray-50 px-4 py-10">
          <div className="max-w-md mx-auto space-y-4">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-center">
              <h1 className="text-xl font-bold text-gray-900">
                {paid ? "Paiement confirmé" : pending ? "Paiement en cours de confirmation" : "Paiement non abouti"}
              </h1>
              <p className="text-sm text-gray-600 mt-2">
                {paid
                  ? "Merci ! La boutique prépare votre commande."
                  : pending
                  ? "iPay n'a pas encore confirmé. Votre commande se met à jour toute seule sur son lien de suivi."
                  : "Rien n'a été débité. Votre panier est conservé : vous pouvez réessayer ou choisir le paiement à la livraison."}
              </p>
              <p className="text-xs text-gray-500 mt-3">Référence <span className="font-mono font-semibold text-gray-800">{guestOrder.reference}</span></p>
              {!paid && !pending ? (
                <button onClick={() => router.push("/Panier")} className="mt-4 w-full bg-[#30A08B] text-white font-semibold rounded-xl py-3 hover:opacity-90">
                  Reprendre ma commande
                </button>
              ) : null}
              {pending ? (
                <button onClick={() => router.push(trackingPath(guestOrder!.reference, guestOrder!.trackingToken))} className="mt-4 w-full bg-[#30A08B] text-white font-semibold rounded-xl py-3 hover:opacity-90">
                  Suivre ma commande
                </button>
              ) : null}
            </div>
            {paid ? <GuestOrderSuccess reference={guestOrder.reference} trackingToken={guestOrder.trackingToken} /> : null}
          </div>
        </main>
      </>
    );
  }

  return (
    <ProtectedRoute requireAuth={true}>
      {/* SEO Configuration */}
      <NextSeo {...dynamicSEO} />

      {/* Head additionnels */}
      <Head>
        <meta name="theme-color" content="#30A08B" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        
        {/* Schema.org pour les données structurées */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebPage",
              "name": "Confirmation de Paiement",
              "description": "Page de confirmation de paiement et suivi de commande IhamBaobab",
              "url": process.env.NEXT_PUBLIC_SITE_URL 
                ? `${process.env.NEXT_PUBLIC_SITE_URL}/commandes?transactionId=${transactionId}&status=${status}&amount=${amount}` 
                : `/commandes?transactionId=${transactionId}&status=${status}&amount=${amount}`,
              "inLanguage": "fr-FR",
              "breadcrumb": {
                "@type": "BreadcrumbList",
                "itemListElement": [
                  {
                    "@type": "ListItem",
                    "position": 1,
                    "name": "Accueil",
                    "item": process.env.NEXT_PUBLIC_SITE_URL
                  },
                  {
                    "@type": "ListItem",
                    "position": 2,
                    "name": "Confirmation de Paiement"
                  }
                ]
              }
            }),
          }}
        />
      </Head>

      {/* Contenu principal */}
      <div itemScope itemType="https://schema.org/WebPage">
        <header role="banner">
          <HomeHeader/>
        </header>

        <main 
          role="main" 
          aria-label="Contenu principal de la confirmation de paiement"
          itemProp="mainContentOfPage"
        >
          <CommandeSuiviTransaction 
            transactionId={transactionId}
            status={status === "cancelled" ? "failed" : status}
            amount={amount ? parseFloat(amount) : undefined}
          />
        </main>
      </div>
    </ProtectedRoute>
  );
}