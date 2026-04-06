import VerifyOTP from "@/components/auth/VerifyOTP";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Vérification OTP - IhamBaobab",
  description: "Vérifiez votre code OTP pour finaliser la connexion ou la réinitialisation de mot de passe.",
  keywords: ["otp", "verification", "auth", "IhamBaobab"],
};

export default function VerifyOtpPage() {
  return <VerifyOTP />;
}
