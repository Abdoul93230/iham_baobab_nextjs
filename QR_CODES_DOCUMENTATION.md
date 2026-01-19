# 📱 Fonctionnalité QR Codes - IhamBaobab

## 🎯 Vue d'ensemble

Cette fonctionnalité permet de générer des QR codes pour :
- **Chaque produit** : Redirige vers la page détail du produit
- **Chaque boutique** : Redirige vers le profil du vendeur

## 🚀 Composants créés

### 1. **QRCodeGenerator** (`/src/components/QRCodeGenerator.tsx`)
Composant réutilisable qui affiche un bouton "QR Code" et ouvre une modal avec :
- Le QR code généré
- Logo IhamBaobab intégré au centre
- Bouton de téléchargement (PNG)
- Bouton de partage (natif ou copie URL)
- URL de redirection affichée

**Props :**
```typescript
{
  url: string;          // URL de redirection
  title: string;        // Titre affiché dans la modal
  description?: string; // Description (optionnelle)
  size?: number;        // Taille du QR code (default: 256)
}
```

**Exemple d'utilisation :**
```tsx
<QRCodeGenerator
  url={`${process.env.NEXT_PUBLIC_SITE_URL}/ProduitDetail/${productId}`}
  title="Mon Produit"
  description="Scannez pour voir ce produit"
  size={200}
/>
```

### 2. **QRCodeBatch** (`/src/components/QRCodeBatch.tsx`)
Composant pour générer plusieurs QR codes en une seule fois :
- Affichage en grille responsive
- Téléchargement individuel ou groupé
- Impression optimisée
- Filtres par type (produit/boutique)

**Props :**
```typescript
{
  items: Array<{
    id: string;
    name: string;
    url: string;
    type: "produit" | "boutique";
  }>;
  size?: number;
}
```

### 3. **Page QR Codes** (`/app/qr-codes/page.tsx`)
Page dédiée pour que les vendeurs génèrent leurs QR codes en masse.

## 📍 Intégrations actuelles

### ✅ Page Détail Produit
**Fichier :** `/src/components/ProduitDetail/ProduitDetailMain.tsx`

Le QR code apparaît à côté du bouton "Partager" :
```tsx
<QRCodeGenerator
  url={`${process.env.NEXT_PUBLIC_SITE_URL}/ProduitDetail/${productId}`}
  title={productName}
  description="Scannez pour voir ce produit"
/>
```

### ✅ Profil Vendeur
**Fichier :** `/src/components/sellerProfile/SellerProfile.tsx`

Le QR code apparaît dans les actions du profil vendeur :
```tsx
<QRCodeGenerator
  url={`${process.env.NEXT_PUBLIC_SITE_URL}/Profile_boutiquier/${sellerId}`}
  title={storeName}
  description="Scannez pour voir cette boutique"
/>
```

## 🎨 Fonctionnalités

### Pour les Produits
1. **Modal QR Code** : Clic sur bouton → Modal s'ouvre
2. **Logo intégré** : Logo IhamBaobab au centre du QR code
3. **Téléchargement** : Format PNG, nom automatique
4. **Partage** : API native ou copie dans presse-papiers
5. **Responsive** : S'adapte mobile/desktop

### Pour les Boutiques
- Même fonctionnalités que les produits
- URL vers le profil complet du vendeur
- Permet aux clients de découvrir toute la boutique

### Génération en Masse
1. **Page dédiée** : `/qr-codes`
2. **Grille responsive** : 1-4 colonnes selon écran
3. **Impression optimisée** : CSS print-friendly
4. **Téléchargement** : Individuel ou groupé (ZIP à implémenter)
5. **Filtres** : Par type (produit/boutique)

## 🔧 Configuration requise

### Variables d'environnement (`.env`)
```bash
NEXT_PUBLIC_SITE_URL=https://ihambaobab.com
```

### Dépendances installées
```json
{
  "qrcode.react": "^latest"
}
```

## 📱 Cas d'usage

### 1. E-commerce physique
- Imprimer les QR codes sur les étiquettes produits
- Clients scannent pour voir plus d'infos en ligne
- Redirection vers page produit avec détails complets

### 2. Marketing
- QR codes sur flyers/affiches
- Redirection vers boutique du vendeur
- Suivi des scans (à implémenter analytics)

### 3. Marketplace
- Vendeurs téléchargent leurs QR codes
- Impression sur packaging
- Fidélisation client

## 🚀 Prochaines améliorations possibles

### 1. Analytics de Scan
```typescript
// Backend : Tracker les scans
POST /api/qr-scans
{
  qrCodeId: string,
  scannedAt: Date,
  location?: { lat, lng },
  device?: string
}
```

### 2. QR Codes personnalisés
- Couleurs personnalisables
- Logo vendeur au lieu de logo IhamBaobab
- Formes différentes (carrés arrondis, cercles)

### 3. Téléchargement ZIP
```typescript
// Utiliser JSZip pour créer un ZIP
import JSZip from "jszip";

const downloadAllAsZip = async () => {
  const zip = new JSZip();
  // Ajouter tous les QR codes
  items.forEach(item => {
    const canvas = document.getElementById(`qr-${item.id}`);
    const dataUrl = canvas.toDataURL();
    zip.file(`${item.name}.png`, dataUrl.split(',')[1], {base64: true});
  });
  
  const blob = await zip.generateAsync({type: "blob"});
  // Télécharger le ZIP
};
```

### 4. QR Codes dynamiques
- URL courte avec redirection
- Permet de changer la destination sans regénérer le QR
- Utile pour campagnes marketing

### 5. Styles de QR Codes
- Gradient colors
- Embedded images/logos custom
- Rounded corners
- Dots au lieu de carrés

## 💡 Conseils d'utilisation

### Pour les vendeurs
1. Générez vos QR codes depuis `/qr-codes`
2. Téléchargez en PNG haute qualité
3. Imprimez sur papier autocollant
4. Collez sur vos produits/packaging
5. Testez le scan avant distribution

### Pour l'impression
- **Papier** : Blanc, qualité 80g minimum
- **Couleur** : Oui (pour le logo)
- **Taille minimale** : 3x3 cm pour scan facile
- **Contraste** : Fond clair, QR sombre
- **Protection** : Plastification recommandée

## 🔒 Sécurité

- ✅ URLs générées côté client (pas de données sensibles)
- ✅ Validation des URLs avant génération
- ✅ Pas de tracking par défaut (respect vie privée)
- ✅ QR codes statiques (pas d'intermédiaire)

## 📊 Structure des URLs

### Produits
```
https://ihambaobab.com/ProduitDetail/[productId]
```

### Boutiques
```
https://ihambaobab.com/Profile_boutiquier/[sellerId]
```

## 🎯 Résultat attendu

Quand un utilisateur scanne le QR code :
1. Appareil photo s'ouvre
2. Scan du QR code
3. Notification avec lien
4. Clic → Redirection vers la page
5. Page chargée avec toutes les données

## 🌟 Avantages

- **🚀 Rapide** : Génération instantanée côté client
- **💰 Gratuit** : Pas de service externe payant
- **🔒 Sécurisé** : Données hébergées sur votre domaine
- **📱 Mobile-first** : Optimisé pour smartphones
- **♻️ Réutilisable** : QR codes permanents
- **🎨 Personnalisable** : Logo intégré, couleurs

## 📞 Support

Pour toute question ou amélioration :
- Créer une issue sur le repo
- Contacter l'équipe dev IhamBaobab

---

**Créé avec ❤️ pour IhamBaobab**
