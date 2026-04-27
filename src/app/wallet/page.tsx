import type { Metadata } from "next";
import WalletMain from "@/components/wallet/WalletMain";

export const metadata: Metadata = {
  title: "Mon Wallet Baobab | IhamBaobab",
  description: "Gérez vos Baobab Points, suivez votre historique et utilisez vos récompenses.",
};

export default function WalletPage() {
  return <WalletMain />;
}
