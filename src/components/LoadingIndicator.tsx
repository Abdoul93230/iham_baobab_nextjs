"use client";

import React from "react";

interface LoadingIndicatorProps {
  loading: boolean;
  text?: string;
  children: React.ReactNode;
}

const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({ 
  loading, 
  text = "Chargement...", 
  children 
}) => {
  if (!loading) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#30A08B] mx-auto mb-4"></div>
        <p className="text-gray-600 text-lg">{text}</p>
      </div>
    </div>
  );
};

export default LoadingIndicator;