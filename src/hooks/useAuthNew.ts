import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { 
  loginUser, 
  registerUser, 
  forgotPassword, 
  resetPassword, 
  logout, 
  clearError,
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
  
  const user = useAppSelector(selectUser);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const loading = useAppSelector(selectUserLoading);
  const error = useAppSelector(selectUserError);

  // Actions d'authentification
  const login = useCallback(async (data: LoginData) => {
    const credentials: any = {
      identifier: data.identifier,
      password: data.password,
      method: data.method,
    };

    if (data.method === "email") {
      credentials.email = data.identifier;
    } else {
      credentials.phoneNumber = data.identifier;
    }

    const result = await dispatch(loginUser(credentials));
    return result;
  }, [dispatch]);

  const register = useCallback(async (data: RegisterData) => {
    if (data.password !== data.confirmPassword) {
      throw new Error("Les mots de passe ne correspondent pas");
    }

    if (!data.acceptTerms) {
      throw new Error("Vous devez accepter les conditions d'utilisation");
    }

    const userData = {
      name: data.name,
      email: data.email,
      phoneNumber: data.phone,
      password: data.password,
      whatsapp: data.whatsappOptIn,
    };

    const result = await dispatch(registerUser(userData));
    return result;
  }, [dispatch]);

  const sendForgotPassword = useCallback(async (data: ForgotPasswordData) => {
    const result = await dispatch(forgotPassword(data.email));
    return result;
  }, [dispatch]);

  const resetUserPassword = useCallback(async (data: ResetPasswordData) => {
    const result = await dispatch(resetPassword(data));
    return result;
  }, [dispatch]);

  const signOut = useCallback(() => {
    dispatch(logout());
    router.push("/");
  }, [dispatch, router]);

  const clearAuthError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  // Vérifier si l'utilisateur a un rôle spécifique
  const hasRole = useCallback((role: string) => {
    return user?.role === role;
  }, [user]);

  // État d'initialisation (toujours vrai avec notre nouveau système)
  const initialized = true;

  return {
    // État
    user,
    isAuthenticated,
    loading,
    error,
    initialized,
    
    // Actions
    login,
    register,
    sendForgotPassword,
    resetUserPassword,
    signOut,
    clearAuthError,
    
    // Utilitaires
    hasRole,
  };
};

export default useAuth;
