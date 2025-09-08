import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ReduxProvider } from "@/redux/provider";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AuthChecker from "@/components/auth/AuthChecker";
import DataLoader from "@/components/DataLoader";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: "IhamBaobab - Marketplace Africaine",
  description: "Votre marketplace de confiance pour vos achats en ligne au Niger et partout dans le monde",
  keywords: ["marketplace", "e-commerce", "Niger", "Bénin", "Mobile Money", "achats en ligne"],
  authors: [{ name: "IhamBaobab Team" }],
  
  // Open Graph pour les réseaux sociaux
  openGraph: {
    title: "IhamBaobab - Marketplace Africaine",
    description: "Votre marketplace de confiance pour vos achats en ligne au Niger et partout dans le monde",
    url: "/", // URL relative, sera combinée avec metadataBase
    siteName: "IhamBaobab",
    images: [
      {
        url: "/LogoText.png", // URL relative
        width: 1200,
        height: 630,
        alt: "IhamBaobab - Marketplace Africaine",
      },
    ],
    locale: "fr_FR",
    type: "website",
  },
  
  // Twitter Card
  twitter: {
    card: "summary_large_image",
    title: "IhamBaobab - Marketplace Africaine",
    description: "Votre marketplace de confiance pour vos achats en ligne",
    images: ["/LogoText.png"],
  },
  
  // Favicon et autres icônes
  icons: {
    icon: "/LogoText.png",
    shortcut: "/LogoText.png",
    apple: "/apple-touch-icon.png",
    other: {
      rel: "apple-touch-icon-precomposed",
      url: "/apple-touch-icon.png",
    },
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className="font-sans antialiased">
        <ReduxProvider>
          <AuthChecker>
            <DataLoader>
              {children}
            </DataLoader>
          </AuthChecker>
          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
          />
        </ReduxProvider>
      </body>
    </html>
  );
}
