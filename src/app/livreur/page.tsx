import type { Metadata } from "next";
import CourierApp from "@/components/courier/CourierApp";

export const metadata: Metadata = {
  title: "Espace livreur · Ihambaobab",
  robots: { index: false, follow: false },
};

/** Page des livreurs : retrait chez la boutique et livraison au client, par codes */
export default function LivreurPage() {
  return <CourierApp />;
}
