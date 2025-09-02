"use client";

import React from 'react';
import { ShoppingCart } from 'lucide-react';
import { usePanierSync } from '@/hooks/usePanierSync';
import { Badge } from '@/components/ui/badge';

interface PanierIndicatorProps {
  onClick?: () => void;
  className?: string;
  showBadge?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Composant d'indicateur du panier réutilisable
 * Se synchronise automatiquement avec Redux
 */
export const PanierIndicator: React.FC<PanierIndicatorProps> = ({
  onClick,
  className = '',
  showBadge = true,
  size = 'md'
}) => {
  const { panierCount } = usePanierSync();

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const badgeClasses = {
    sm: 'text-xs h-4 min-w-4',
    md: 'text-xs h-5 min-w-5',
    lg: 'text-sm h-6 min-w-6'
  };

  return (
    <div 
      className={`relative cursor-pointer ${className}`}
      onClick={onClick}
    >
      <ShoppingCart className={sizeClasses[size]} />
      {showBadge && panierCount > 0 && (
        <Badge 
          variant="destructive" 
          className={`absolute -top-2 -right-2 flex items-center justify-center ${badgeClasses[size]}`}
        >
          {panierCount > 99 ? '99+' : panierCount}
        </Badge>
      )}
    </div>
  );
};
