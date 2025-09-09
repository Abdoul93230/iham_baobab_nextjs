import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav className="bg-gray-50 px-4 py-3 border-b">
      <div className="container mx-auto">
        <ol className="flex items-center space-x-2 text-sm text-gray-600">
          <li>
            <Link 
              href="/" 
              className="flex items-center hover:text-primary transition-colors"
            >
              <Home className="h-4 w-4 mr-1" />
              Accueil
            </Link>
          </li>
          
          {items.map((item, index) => (
            <li key={index} className="flex items-center">
              <ChevronRight className="h-4 w-4 mx-2 text-gray-400" />
              {item.href && index < items.length - 1 ? (
                <Link 
                  href={item.href}
                  className="hover:text-primary transition-colors"
                >
                  {item.label}
                </Link>
              ) : (
                <span className={index === items.length - 1 ? 'text-gray-900 font-medium' : ''}>
                  {item.label}
                </span>
              )}
            </li>
          ))}
        </ol>
      </div>
    </nav>
  );
}
