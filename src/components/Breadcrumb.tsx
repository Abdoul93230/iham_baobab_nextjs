"use client";

import React from "react";
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href?: string;
  current?: boolean;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center space-x-1 text-sm text-gray-500">
      {/* Home icon */}
      <Link
        href="/"
        className="flex items-center hover:text-[#30A08B] transition-colors"
        aria-label="Accueil"
      >
        <Home className="w-4 h-4" />
      </Link>
      
      {items.map((item, index) => (
        <React.Fragment key={index}>
          <ChevronRight className="w-4 h-4 text-gray-400" />
          
          {item.current || !item.href ? (
            <span
              className={`font-medium ${
                item.current ? "text-[#30A08B]" : "text-gray-500"
              }`}
              aria-current={item.current ? "page" : undefined}
            >
              {item.label}
            </span>
          ) : (
            <Link
              href={item.href}
              className="hover:text-[#30A08B] transition-colors"
            >
              {item.label}
            </Link>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}
