import QuickAuth from "@/components/auth/QuickAuth";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Connexion - IhamBaobab",
  description: "Connectez-vous à votre compte IhamBaobab pour accéder à nos services de mise en relation et de livraison.",
  keywords: ["connexion", "login", "IhamBaobab", "authentification"],
};

export default function LoginPage() {
  return <QuickAuth initialMode="login" />;
}
