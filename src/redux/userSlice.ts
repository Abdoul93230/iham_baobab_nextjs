import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UserState {
  acces: "oui" | "non";
  userData: any | null;
  isLoaded: boolean;
}

const initialState: UserState = {
  acces: "non",
  userData: null,
  isLoaded: false,
};

// Helpers pour localStorage
const loadFromLocalStorage = () => {
  if (typeof window === "undefined") return { acces: "non", userData: null };
  try {
    const userData = localStorage.getItem("userData");
    const userToken = localStorage.getItem("userToken");
    
    if (userData && userToken) {
      return {
        acces: "oui" as const,
        userData: JSON.parse(userData),
      };
    }
    return { acces: "non" as const, userData: null };
  } catch (error) {
    console.error("Erreur lors du chargement des données utilisateur:", error);
    return { acces: "non" as const, userData: null };
  }
};

const saveToLocalStorage = (userData: any, token?: string) => {
  if (typeof window === "undefined") return;
  try {
    if (userData && token) {
      localStorage.setItem("userData", JSON.stringify(userData));
      localStorage.setItem("userToken", token);
    } else {
      localStorage.removeItem("userData");
      localStorage.removeItem("userToken");
    }
  } catch (error) {
    console.error("Erreur lors de la sauvegarde des données utilisateur:", error);
  }
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    // Charger les données utilisateur depuis localStorage
    loadUser: (state) => {
      const userData = loadFromLocalStorage();
      state.acces = userData.acces as "oui" | "non";
      state.userData = userData.userData;
      state.isLoaded = true;
    },

    // Connexion utilisateur
    login: (state, action: PayloadAction<{ userData: any; token: string }>) => {
      const { userData, token } = action.payload;
      state.acces = "oui";
      state.userData = userData;
      saveToLocalStorage(userData, token);
    },

    // Déconnexion utilisateur
    logout: (state) => {
      state.acces = "non";
      state.userData = null;
      saveToLocalStorage(null);
    },

    // Mettre à jour les données utilisateur
    updateUser: (state, action: PayloadAction<any>) => {
      if (state.acces === "oui") {
        state.userData = { ...state.userData, ...action.payload };
        const token = typeof window !== "undefined" ? localStorage.getItem("userToken") : null;
        if (token) {
          saveToLocalStorage(state.userData, token);
        }
      }
    },

    // Définir l'accès directement (pour compatibilité)
    setAccess: (state, action: PayloadAction<"oui" | "non">) => {
      state.acces = action.payload;
      if (action.payload === "non") {
        state.userData = null;
        saveToLocalStorage(null);
      }
    },
  },
});

export const {
  loadUser,
  login,
  logout,
  updateUser,
  setAccess,
} = userSlice.actions;

// Selectors
export const selectUserAccess = (state: { user: UserState }) => state.user.acces;
export const selectUserData = (state: { user: UserState }) => state.user.userData;
export const selectUserIsLoaded = (state: { user: UserState }) => state.user.isLoaded;
export const selectIsAuthenticated = (state: { user: UserState }) => state.user.acces === "oui";

export default userSlice.reducer;
