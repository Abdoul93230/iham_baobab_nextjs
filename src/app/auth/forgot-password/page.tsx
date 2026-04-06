import QuickAuth from "@/components/auth/QuickAuth";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mot de passe oublié - IhamBaobab",
  description: "Récupérez l'accès à votre compte IhamBaobab en réinitialisant votre mot de passe.",
  keywords: ["mot de passe oublié", "reset password", "IhamBaobab", "récupération compte"],
};

export default function ForgotPasswordPage() {
  return <QuickAuth initialMode="reset" />;
}
