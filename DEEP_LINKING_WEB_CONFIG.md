# 🌐 Configuration Web - Deep Linking Ihambaobab

## Fichiers à créer/modifier dans le projet Web (Next.js)

### 1. Fichier: public/.well-known/apple-app-site-association

```json
{
  "applinks": {
    "apps": [],
    "details": [
      {
        "appID": "TEAM_ID.com.ihambaobab.mobile",
        "paths": [
          "/product/*",
          "/boutique/*",
          "/seller/*",
          "/category/*",
          "/search*"
        ]
      }
    ]
  },
  "webcredentials": {
    "apps": [
      "TEAM_ID.com.ihambaobab.mobile"
    ]
  }
}
```

**Note**: Remplacez `TEAM_ID` par votre Team ID Apple Developer

### 2. Fichier: public/.well-known/assetlinks.json

```json
[
  {
    "relation": ["delegate_permission/common.handle_all_urls"],
    "target": {
      "namespace": "android_app",
      "package_name": "com.ihambaobab.mobile",
      "sha256_cert_fingerprints": [
        "VOTRE_SHA256_CERT_FINGERPRINT_ICI"
      ]
    }
  }
]
```

**Comment obtenir le SHA256 fingerprint:**

```bash
# Pour le debug keystore:
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android

# Pour le release keystore:
keytool -list -v -keystore /path/to/your-release-key.keystore -alias your-key-alias
```

### 3. Fichier: middleware.ts (À la racine du projet Next.js)

```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const userAgent = request.headers.get('user-agent') || '';
  const { pathname, search } = request.nextUrl;

  // Détecter si c'est un appareil mobile
  const isMobile = /iPhone|iPad|iPod|Android/i.test(userAgent);

  // Routes qui peuvent être ouvertes dans l'app
  const appRoutes = [
    '/product/',
    '/boutique/',
    '/seller/',
    '/category/',
    '/search'
  ];

  const shouldRedirectToApp = appRoutes.some(route => pathname.startsWith(route));

  if (isMobile && shouldRedirectToApp) {
    // Créer le deep link vers l'app
    const appDeepLink = `ihambaobab:/${pathname}${search}`;
    const webFallback = `${pathname}${search}`;
    
    // Rediriger vers une page intermédiaire
    const redirectUrl = new URL('/app-redirect', request.url);
    redirectUrl.searchParams.set('app', appDeepLink);
    redirectUrl.searchParams.set('web', webFallback);
    
    return NextResponse.redirect(redirectUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/product/:path*',
    '/boutique/:path*',
    '/seller/:path*',
    '/category/:path*',
    '/search/:path*'
  ]
};
```

### 4. Fichier: app/app-redirect/page.tsx

```typescript
'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

export default function AppRedirect() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [countdown, setCountdown] = useState(3);

  const appUrl = searchParams.get('app');
  const webUrl = searchParams.get('web');

  useEffect(() => {
    if (!appUrl) {
      router.push('/');
      return;
    }

    // Essayer d'ouvrir l'app immédiatement
    window.location.href = appUrl;

    // Démarrer le compte à rebours
    const countdownInterval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          // Rediriger vers le web après 3 secondes
          window.location.href = webUrl || '/';
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(countdownInterval);
  }, [appUrl, webUrl, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#30A08B] to-[#B2905F] p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
        {/* Logo */}
        <div className="mb-6">
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-[#30A08B] to-[#B2905F] rounded-full flex items-center justify-center">
            <svg 
              className="w-10 h-10 text-white animate-pulse" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" 
              />
            </svg>
          </div>
        </div>

        {/* Titre */}
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Ouverture de l'application...
        </h2>

        {/* Description */}
        <p className="text-gray-600 mb-6">
          Nous tentons d'ouvrir cette page dans l'application Ihambaobab
        </p>

        {/* Loader animé */}
        <div className="flex justify-center mb-6">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#30A08B]"></div>
        </div>

        {/* Compte à rebours */}
        <div className="bg-gray-100 rounded-lg p-4 mb-6">
          <p className="text-sm text-gray-600 mb-2">
            Redirection vers le site web dans
          </p>
          <p className="text-4xl font-bold text-[#30A08B]">
            {countdown}
          </p>
        </div>

        {/* Boutons d'action */}
        <div className="space-y-3">
          <button
            onClick={() => window.location.href = appUrl || '/'}
            className="w-full bg-gradient-to-r from-[#30A08B] to-[#B2905F] text-white font-semibold py-3 px-6 rounded-lg hover:shadow-lg transition-all duration-300"
          >
            Réessayer d'ouvrir l'app
          </button>
          
          <button
            onClick={() => window.location.href = webUrl || '/'}
            className="w-full bg-white border-2 border-gray-300 text-gray-700 font-semibold py-3 px-6 rounded-lg hover:bg-gray-50 transition-all duration-300"
          >
            Continuer sur le site web
          </button>
        </div>

        {/* Info */}
        <p className="mt-6 text-xs text-gray-500">
          Vous n'avez pas l'application ? 
          <a href="/download" className="text-[#30A08B] font-semibold ml-1 hover:underline">
            Téléchargez-la ici
          </a>
        </p>
      </div>
    </div>
  );
}
```

### 5. Configuration next.config.js

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // ... autres configurations

  // Permettre le serving des fichiers .well-known
  async headers() {
    return [
      {
        source: '/.well-known/:path*',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/json',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
```

### 6. Métadonnées Open Graph pour les partages

#### Fichier: app/product/[id]/page.tsx

```typescript
import { Metadata } from 'next';
import { notFound } from 'next/navigation';

// Fonction pour récupérer le produit
async function getProduct(id: string) {
  const res = await fetch(`https://ihambackend.onrender.com/produits/${id}`, {
    cache: 'no-store'
  });
  
  if (!res.ok) {
    return null;
  }
  
  return res.json();
}

// Génération des métadonnées
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const product = await getProduct(params.id);
  
  if (!product) {
    return {
      title: 'Produit non trouvé - Ihambaobab',
    };
  }

  const price = product.prixPromo > 0 && product.prixPromo < product.prix 
    ? product.prixPromo 
    : product.prix;

  return {
    title: `${product.name} - ${product.marque} | Ihambaobab`,
    description: product.description || `Découvrez ${product.name} de ${product.marque} sur Ihambaobab`,
    
    // Open Graph
    openGraph: {
      title: product.name,
      description: `${product.marque} - ${price.toLocaleString()} CFA`,
      images: [
        {
          url: product.image1,
          width: 1200,
          height: 630,
          alt: product.name,
        }
      ],
      url: `https://ihambaobab.com/product/${product._id}`,
      type: 'product',
      siteName: 'Ihambaobab',
    },
    
    // Twitter Card
    twitter: {
      card: 'summary_large_image',
      title: product.name,
      description: `${product.marque} - ${price.toLocaleString()} CFA`,
      images: [product.image1],
    },
    
    // Métadonnées produit
    other: {
      'product:price:amount': price.toString(),
      'product:price:currency': 'XOF',
      'product:brand': product.marque,
      'product:availability': product.quantite > 0 ? 'in stock' : 'out of stock',
    },
  };
}

// Page du produit
export default async function ProductPage({ params }: { params: { id: string } }) {
  const product = await getProduct(params.id);
  
  if (!product) {
    notFound();
  }

  return (
    <div>
      {/* Votre contenu de page produit */}
    </div>
  );
}
```

## 🧪 Tests

### Tester les fichiers .well-known

```bash
# Vérifier que les fichiers sont accessibles
curl https://ihambaobab.com/.well-known/apple-app-site-association
curl https://ihambaobab.com/.well-known/assetlinks.json
```

### Vérifier l'association iOS

```bash
# Utiliser l'outil Apple AASA Validator
# https://branch.io/resources/aasa-validator/

# Ou via curl
curl -v https://ihambaobab.com/.well-known/apple-app-site-association
```

### Vérifier l'association Android

```bash
# Utiliser le Digital Asset Links Tester
# https://digitalassetlinks.googleapis.com/v1/statements:list?source.web.site=https://ihambaobab.com&relation=delegate_permission/common.handle_all_urls
```

## 📱 Tests sur les appareils

### iOS

```bash
# Via Safari sur iPhone
# Ouvrir: https://ihambaobab.com/product/123abc
# L'app devrait s'ouvrir automatiquement si installée
```

### Android

```bash
# Via Chrome sur Android
# Ouvrir: https://ihambaobab.com/product/123abc
# Choisir "Ouvrir avec l'app" si proposé
```

## ✅ Checklist de déploiement Web

- [ ] Créer `/public/.well-known/apple-app-site-association`
- [ ] Créer `/public/.well-known/assetlinks.json`
- [ ] Obtenir et ajouter le SHA256 fingerprint Android
- [ ] Obtenir et ajouter le Team ID iOS
- [ ] Créer le middleware.ts
- [ ] Créer la page app/app-redirect/page.tsx
- [ ] Configurer next.config.js pour les headers
- [ ] Ajouter les métadonnées Open Graph sur toutes les pages importantes
- [ ] Déployer sur production
- [ ] Tester les fichiers .well-known (doivent être accessibles publiquement)
- [ ] Tester l'ouverture depuis mobile avec app installée
- [ ] Tester l'ouverture depuis mobile sans app
- [ ] Vérifier les partages sur réseaux sociaux (preview correct)

## 🎯 Résultat attendu

1. **Utilisateur avec app**: Clic sur lien → Ouvre l'app → Navigation directe
2. **Utilisateur sans app**: Clic sur lien → Page intermédiaire → Site web après 3s
3. **Partage social**: Prévisualisation riche (image, titre, prix)
4. **SEO**: Métadonnées complètes pour meilleur référencement
