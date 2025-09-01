import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    template: "%s | IhamBaobab",
    default: "Authentification - IhamBaobab",
  },
  description: "Authentification IhamBaobab - Connexion, inscription et gestion de compte pour notre plateforme de mise en relation et de livraison.",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="auth-layout">
      {children}
    </div>
  );
}
