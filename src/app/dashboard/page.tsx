import Dashboard from "@/components/Dashboard";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tableau de bord - IhamBaobab",
  description: "Accédez à votre tableau de bord IhamBaobab pour gérer vos commandes, voir vos statistiques et plus encore.",
  keywords: ["dashboard", "tableau de bord", "IhamBaobab", "gestion compte"],
};

export default function DashboardPage() {
  return <Dashboard />;
}
