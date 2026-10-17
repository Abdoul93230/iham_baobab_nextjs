"use client";

import { Suspense } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import HomeHeader from "@/components/home/HomeHeader";
import StoreInbox from "@/components/messagerie/StoreInbox";

/** Messages : conversations avec les boutiques (temps réel) + accès au support */
export default function MessageriePage() {
  return (
    <ProtectedRoute requireAuth={true}>
      <div className="flex flex-col min-h-screen bg-gray-50">
        <header role="banner" className="hidden md:block flex-shrink-0">
          <HomeHeader chg={() => {}} />
        </header>
        <main role="main" className="flex-1 flex flex-col min-h-0">
          <Suspense fallback={null}>
            <StoreInbox />
          </Suspense>
        </main>
      </div>
    </ProtectedRoute>
  );
}
