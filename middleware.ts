import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Routes qui nécessitent une authentification
const protectedRoutes = [
  "/dashboard",
  "/profile",
  "/orders",
  "/cart",
  "/checkout",
  "/account",
];

// Routes d'authentification (accessibles seulement si non connecté)
const authRoutes = [
  "/auth/login",
  "/auth/register",
  "/auth/forgot-password",
  "/auth/reset-password",
];

// Routes publiques (toujours accessibles)
const publicRoutes = [
  "/",
  "/about",
  "/contact",
  "/products",
  "/categories",
  "/search",
  "/privacy",
  "/terms",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Vérifier si l'utilisateur est connecté via le token dans les cookies
  const token = request.cookies.get("authToken")?.value;
  const isAuthenticated = !!token;

  // Si c'est une route d'API, laisser passer
  if (pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  // Si c'est une route publique, laisser passer
  if (publicRoutes.some(route => pathname === route || pathname.startsWith(route + "/"))) {
    return NextResponse.next();
  }

  // Si c'est une route d'authentification
  if (authRoutes.some(route => pathname.startsWith(route))) {
    // Si l'utilisateur est déjà connecté, rediriger vers le dashboard
    if (isAuthenticated) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    // Sinon, laisser accéder à la page d'authentification
    return NextResponse.next();
  }

  // Si c'est une route protégée
  if (protectedRoutes.some(route => pathname.startsWith(route))) {
    // Si l'utilisateur n'est pas connecté, rediriger vers la page de connexion
    if (!isAuthenticated) {
      const loginUrl = new URL("/auth/login", request.url);
      // Ajouter l'URL de redirection après connexion
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
    // Sinon, laisser accéder à la page protégée
    return NextResponse.next();
  }

  // Pour toutes les autres routes, laisser passer
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public/).*)",
  ],
};
