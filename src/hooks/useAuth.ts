import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { 
  loginUser, 
  registerUser, 
  forgotPassword, 
  resetPassword, 
  logout, 
  clearError,
  checkAuth,
  selectUser,
  selectIsAuthenticated,
  selectUserLoading,
  selectUserError
} from "@/redux/userSlice";

export interface LoginData {
  identifier: string; // email ou téléphone
  password: string;
  method: "email" | "phone";
}

export interface RegisterData {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
  whatsappOptIn?: boolean;
}

export interface ForgotPasswordData {
  email: string;
}

export interface ResetPasswordData {
  email: string;
  code: string;
  newPassword: string;
}

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const user = useAppSelector(selectUser);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isLoading = useAppSelector(selectUserLoading);
  const error = useAppSelector(selectUserError);

  const [initialized, setInitialized] = useState(false);

  // Initialiser l'état d'authentification au chargement
  useEffect(() => {
    const initializeAuth = async () => {
      console.log("🔍 Initialisation de l'authentification dans useAuth...");
      
      // Vérifier l'authentification avec notre nouveau système
      try {
        await dispatch(checkAuth());
        console.log("✅ Vérification d'auth terminée");
      } catch (error) {
        console.log("❌ Erreur lors de la vérification d'auth:", error);
      } finally {
        setInitialized(true);
      }
    };

    initializeAuth();
  }, [dispatch]);

  // Fonction de connexion
  const login = async (loginData: LoginData) => {
    try {
      console.log("🔐 Tentative de connexion avec:", loginData.method);
      
      // Préparer les données pour le dispatch
      const credentials: any = {
        identifier: loginData.identifier,
        password: loginData.password,
        method: loginData.method,
      };

      if (loginData.method === "email") {
        credentials.email = loginData.identifier;
      } else {
        credentials.phoneNumber = loginData.identifier;
      }

      const result = await dispatch(loginUser(credentials));
      
      if (loginUser.fulfilled.match(result)) {
        console.log("✅ Connexion réussie");
        
        // Gérer la redirection avec returnUrl
        const returnUrl = searchParams.get("returnUrl");
        const redirect = returnUrl || searchParams.get("redirect") || "/dashboard";
        
        console.log("🔄 Redirection vers:", redirect);
        router.push(redirect);
        
        return { success: true, data: result.payload };
      } else {
        console.log("❌ Échec de connexion:", result.payload);
        return { success: false, error: result.payload || "Erreur de connexion" };
      }
    } catch (error) {
      console.error("❌ Erreur réseau lors de la connexion:", error);
      return { success: false, error: "Erreur réseau" };
    }
  };

  // Fonction d'inscription
  const register = async (registerData: RegisterData) => {
    try {
      console.log("📝 Tentative d'inscription pour:", registerData.email);
      
      if (registerData.password !== registerData.confirmPassword) {
        return { success: false, error: "Les mots de passe ne correspondent pas" };
      }

      if (!registerData.acceptTerms) {
        return { success: false, error: "Vous devez accepter les conditions d'utilisation" };
      }

      const userData = {
        name: registerData.name,
        email: registerData.email,
        phoneNumber: registerData.phone,
        password: registerData.password,
        whatsapp: registerData.whatsappOptIn,
      };

      const result = await dispatch(registerUser(userData));
      
      if (registerUser.fulfilled.match(result)) {
        console.log("✅ Inscription réussie - connexion automatique");
        
        // Redirection après inscription réussie
        const returnUrl = searchParams.get("returnUrl");
        const redirect = returnUrl || "/dashboard";
        
        console.log("🔄 Redirection vers:", redirect);
        router.push(redirect);
        
        return { success: true, data: result.payload };
      } else {
        console.log("❌ Échec d'inscription:", result.payload);
        return { success: false, error: result.payload || "Erreur d'inscription" };
      }
    } catch (error) {
      console.error("❌ Erreur réseau lors de l'inscription:", error);
      return { success: false, error: "Erreur réseau" };
    }
  };

  // Fonction mot de passe oublié
  const sendForgotPassword = async (data: ForgotPasswordData) => {
    try {
      const result = await dispatch(forgotPassword(data.email));
      
      if (forgotPassword.fulfilled.match(result)) {
        return { success: true, data: result.payload };
      } else {
        return { success: false, error: result.payload || "Erreur lors de l'envoi" };
      }
    } catch (error) {
      return { success: false, error: "Erreur réseau" };
    }
  };

  // Fonction de réinitialisation de mot de passe
  const resetUserPassword = async (data: ResetPasswordData) => {
    try {
      const result = await dispatch(resetPassword(data));
      
      if (resetPassword.fulfilled.match(result)) {
        return { success: true, data: result.payload };
      } else {
        return { success: false, error: result.payload || "Erreur de réinitialisation" };
      }
    } catch (error) {
      return { success: false, error: "Erreur réseau" };
    }
  };

  // Fonction de déconnexion
  const signOut = () => {
    console.log("🚪 Déconnexion en cours...");
    dispatch(logout());
    router.push("/");
  };

  // Fonction pour effacer les erreurs
  const clearAuthError = () => {
    dispatch(clearError());
  };

  // Vérifier si l'utilisateur a un rôle spécifique
  const hasRole = (role: string) => {
    return user?.role === role;
  };

  // Vérifier si l'utilisateur a une permission spécifique
  const hasPermission = (permission: string) => {
    // Temporairement retourner false, à implémenter selon le système de permissions
    return false;
  };

  // Fonction pour rafraîchir les données utilisateur
  const refreshUser = async () => {
    // Idéalement, faire un appel API pour récupérer les données à jour
    // const result = await dispatch(refreshUserData());
    // return result;
  };

  return {
    // État
    user,
    isAuthenticated,
    loading: isLoading,
    error,
    initialized,
    
    // Actions
    login,
    register,
    sendForgotPassword,
    resetUserPassword,
    signOut,
    clearAuthError,
    refreshUser,
    
    // Utilitaires
    hasRole,
    hasPermission,
  };
};

export default useAuth;
