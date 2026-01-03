// Service pour la gestion de l'authentification
export class AuthService {
  private static readonly TOKEN_KEY = 'userToken';
  private static readonly USER_KEY = 'userEcomme';

  // Sauvegarder le token
  static saveToken(token: string): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(this.TOKEN_KEY, token);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du token:', error);
    }
  }

  // Récupérer le token
  static getToken(): string | null {
    if (typeof window === 'undefined') return null;
    try {
      return localStorage.getItem(this.TOKEN_KEY);
    } catch (error) {
      console.error('Erreur lors de la récupération du token:', error);
      return null;
    }
  }

  // Supprimer le token
  static removeToken(): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(this.TOKEN_KEY);
    } catch (error) {
      console.error('Erreur lors de la suppression du token:', error);
    }
  }

  // Vérifier si le token est expiré
  static isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp < currentTime;
    } catch (error) {
      console.error('Erreur lors de la vérification du token:', error);
      return true;
    }
  }

  // Vérifier si l'utilisateur est authentifié
  static isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;
    
    if (this.isTokenExpired(token)) {
      this.removeToken();
      this.removeUserData();
      return false;
    }
    
    return true;
  }

  // Sauvegarder les données utilisateur
  static saveUserData(userData: any): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(this.USER_KEY, JSON.stringify(userData));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des données utilisateur:', error);
    }
  }

  // Récupérer les données utilisateur
  static getUserData(): any | null {
    if (typeof window === 'undefined') return null;
    try {
      const userData = localStorage.getItem(this.USER_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Erreur lors de la récupération des données utilisateur:', error);
      return null;
    }
  }

  // Supprimer les données utilisateur
  static removeUserData(): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(this.USER_KEY);
    } catch (error) {
      console.error('Erreur lors de la suppression des données utilisateur:', error);
    }
  }

  // Déconnexion complète
  static logout(): void {
    this.removeToken();
    this.removeUserData();
    localStorage.removeItem('orderTotal');
    localStorage.removeItem('pendingOrder');
    localStorage.removeItem('cartItems');
  }

  // Vérifier le token auprès du serveur
  static async verifyTokenWithServer(): Promise<boolean> {
    const token = this.getToken();
    if (!token) {
      console.log("❌ Aucun token à vérifier");
      return false;
    }

    try {
      console.log("🔍 Vérification du token auprès du serveur...");
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_Backend_Url}/verify`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (response.ok) {
        console.log("✅ Token validé par le serveur");
        return true;
      } else {
        console.log("❌ Token rejeté par le serveur, déconnexion...");
        this.logout();
        return false;
      }
    } catch (error) {
      console.error('❌ Erreur lors de la vérification du token:', error);
      // En cas d'erreur réseau, on garde l'utilisateur connecté s'il a un token valide localement
      if (!this.isTokenExpired(token)) {
        console.log("⚠️ Erreur réseau, mais token local valide - utilisateur reste connecté");
        return true;
      }
      return false;
    }
  }
}
