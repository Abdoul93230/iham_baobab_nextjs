"use client";

import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href: string;
  current?: boolean;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export default function Breadcrumb({ items, className = '' }: BreadcrumbProps) {
  return (
    <nav aria-label="Fil d'Ariane" className={`flex items-center space-x-2 text-sm ${className}`}>
      <Link 
        href="/Home" 
        className="flex items-center text-gray-500 hover:text-[#30A08B] transition-colors"
        aria-label="Retour à l'accueil"
      >
        <Home className="w-4 h-4" />
      </Link>
      
      {items.map((item, index) => (
        <div key={index} className="flex items-center space-x-2">
          <ChevronRight className="w-4 h-4 text-gray-400" />
          
          {item.current ? (
            <span 
              className="text-gray-900 font-medium"
              aria-current="page"
            >
              {item.label}
            </span>
          ) : (
            <Link 
              href={item.href}
              className="text-gray-500 hover:text-[#30A08B] transition-colors"
            >
              {item.label}
            </Link>
          )}
        </div>
      ))}
    </nav>
  );
}
