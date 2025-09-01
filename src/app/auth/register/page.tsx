import Register from "@/components/auth/Register";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Inscription - IhamBaobab",
  description: "Créez votre compte IhamBaobab et rejoignez notre communauté de fournisseurs et clients.",
  keywords: ["inscription", "register", "IhamBaobab", "créer compte", "nouveau compte"],
};

export default function RegisterPage() {
  return <Register />;
}
