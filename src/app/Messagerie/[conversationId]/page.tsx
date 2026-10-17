import { redirect } from "next/navigation";

/** Lien direct vers une conversation (notifications, app mobile) */
export default async function ConversationRedirect({ params }: { params: Promise<{ conversationId: string }> }) {
  const { conversationId } = await params;
  redirect(`/Messagerie?c=${encodeURIComponent(conversationId)}`);
}
