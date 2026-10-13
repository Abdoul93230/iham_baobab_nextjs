import React from "react";
import { Metadata } from "next";
import HomeHeader from "@/components/home/HomeHeader";
import HomeFooter from "@/components/home/HomeFooter";
import FindMyOrders from "@/components/guest/FindMyOrders";

export const metadata: Metadata = {
  title: "Retrouver mes commandes | IhamBaobab",
  description: "Suivez vos commandes passées sans compte avec votre numéro de téléphone.",
  robots: { index: false, follow: false },
};

export default function SuiviPage() {
  return (
    <>
      <HomeHeader />
      <main className="min-h-screen bg-gray-50">
        <FindMyOrders />
      </main>
      <HomeFooter />
    </>
  );
}
