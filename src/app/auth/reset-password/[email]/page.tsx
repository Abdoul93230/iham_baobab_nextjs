import ResetPassword from "@/components/auth/ResetPassword";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Réinitialiser le mot de passe - IhamBaobab",
  description: "Entrez votre nouveau mot de passe pour retrouver l'accès à votre compte IhamBaobab.",
  keywords: ["réinitialiser mot de passe", "nouveau mot de passe", "IhamBaobab", "reset"],
};

export default function ResetPasswordPage() {
  return <ResetPassword />;
}
