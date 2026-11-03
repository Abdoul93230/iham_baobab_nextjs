import { redirect } from "next/navigation";

// Le support Ihambaobab est une conversation de la messagerie (temps réel, photos, vocaux)
export default function SupportPage() {
  redirect("/Messagerie?seller=support");
}
