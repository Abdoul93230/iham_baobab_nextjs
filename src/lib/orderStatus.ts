/**
 * Libellés de statut lisibles par le client.
 * statusLivraison vaut « en cours » dès la création de la commande : on ne l'affiche jamais tel quel,
 * seul etatTraitement (mis à jour par l'équipe) fait avancer la livraison.
 * `live` = statut du paiement reçu en direct (succeeded / failed) sur la page de retour de paiement.
 */
type OrderLike = { etatTraitement?: string; statusLivraison?: string; statusPayment?: string } | null | undefined;

const PAY_WAITING = ["en_attente", "en attente", "en cours", "pending"];
const PAY_FAILED = ["échec", "echec", "failed"];
const DELIVERED = ["livraison reçu", "livré", "livrée", "traité"];

const low = (v?: string) => String(v || "").toLowerCase();

function payState(o: OrderLike, live?: string | null): "failed" | "waiting" | "ok" {
  if (live === "failed") return "failed";
  if (live === "succeeded") return "ok";
  const pay = low(o?.statusPayment);
  if (PAY_FAILED.includes(pay)) return "failed";
  if (PAY_WAITING.includes(pay)) return "waiting";
  return "ok";
}

const isCancelled = (o: OrderLike) => low(o?.etatTraitement).includes("annul") || low(o?.statusLivraison).includes("annul");

/** Avancement de la livraison seule */
export function deliveryLabel(o: OrderLike): string {
  const etat = low(o?.etatTraitement);
  if (isCancelled(o)) return "Annulée";
  if (DELIVERED.includes(etat) || ["livré", "livrée"].includes(low(o?.statusLivraison))) return "Livrée";
  if (etat === "en cours de livraison") return "En cours de livraison";
  if (etat === "reçu par le livreur") return "Remise au livreur";
  return "Pas encore expédiée";
}

/** Statut global de la commande (une seule phrase) */
export function orderStatusLabel(o: OrderLike, live?: string | null): string {
  if (isCancelled(o)) return "Annulée";
  const delivery = deliveryLabel(o);
  if (delivery !== "Pas encore expédiée") return delivery;
  const pay = payState(o, live);
  if (pay === "failed") return "Paiement non abouti";
  if (pay === "waiting") return "En attente du paiement";
  return "En préparation";
}

/** Libellé du paiement */
export function paymentLabel(o: OrderLike, live?: string | null): string {
  const pay = low(o?.statusPayment);
  if (pay === "payé à la livraison") return "Paiement à la livraison";
  if (pay === "payé par téléphone") return "Paiement assisté";
  const state = payState(o, live);
  if (state === "failed") return "Paiement non abouti";
  if (state === "waiting") return "En attente du paiement";
  return "Payé";
}
