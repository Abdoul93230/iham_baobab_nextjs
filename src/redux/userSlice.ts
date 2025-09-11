// import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
// import { AuthService } from "@/lib/auth";

// export interface User {
//   id: string;
//   name: string;
//   email?: string;
//   phoneNumber?: string;
//   avatar?: string;
//   isVerified?: boolean;
//   role?: string;
//   createdAt?: string;
// }

// interface UserState {
//   user: User | null;
//   isAuthenticated: boolean;
//   isLoading: boolean;
//   error: string | null;
//   acces: "oui" | "non";
// }

// const initialState: UserState = {
//   user: null,
//   isAuthenticated: false,
//   isLoading: false,
//   error: null,
//   acces: "non",
// };

// // Helpers pour localStorage
// const loadUserFromStorage = (): User | null => {
//   if (typeof window === "undefined") return null;
//   try {
//     console.log("🔍 Chargement utilisateur depuis localStorage...");
    
//     // Vérifier d'abord si l'utilisateur est authentifié
//     if (!AuthService.isAuthenticated()) {
//       console.log("❌ Token non valide ou expiré lors du chargement");
//       return null;
//     }
    
//     const userData = AuthService.getUserData();
//     if (userData) {
//       console.log("✅ Utilisateur chargé depuis localStorage:", userData.user?.name || userData.name);
//       return userData.user || userData;
//     }
    
//     console.log("ℹ️ Aucune donnée utilisateur trouvée");
//     return null;
//   } catch (error) {
//     console.error("❌ Erreur lors du chargement utilisateur:", error);
//     return null;
//   }
// };

// const saveUserToStorage = (userData: any) => {
//   if (typeof window === "undefined") return;
//   try {
//     // Sauvegarder le token si présent
//     if (userData.token) {
//       AuthService.saveToken(userData.token);
//     }
    
//     // Sauvegarder les données utilisateur
//     AuthService.saveUserData(userData);
//   } catch (error) {
//     console.error("Erreur lors de la sauvegarde utilisateur:", error);
//   }
// };

// const removeUserFromStorage = () => {
//   if (typeof window === "undefined") return;
//   try {
//     AuthService.logout();
//   } catch (error) {
//     console.error("Erreur lors de la suppression utilisateur:", error);
//   }
// };

// // Async thunks
// export const loginUser = createAsyncThunk(
//   "user/login",
//   async (
//     credentials: {
//       identifier?: string;
//       email?: string;
//       phoneNumber?: string;
//       password: string;
//       rememberMe?: boolean;
//       method?: string;
//     },
//     { rejectWithValue }
//   ) => {
//     try {
//       const response = await fetch("https://ihambackend.onrender.com/login", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         credentials: "include",
//         body: JSON.stringify({
//           identifier: credentials.identifier || null,
//           email: credentials.email || null,
//           phoneNumber: credentials.phoneNumber || null,
//           password: credentials.password,
//         }),
//       });

//       const data = await response.json();

//       if (!response.ok) {
//         return rejectWithValue(data.message || "Erreur de connexion");
//       }

//       // Sauvegarder dans localStorage
//       saveUserToStorage(data);

//       return data;
//     } catch (error: any) {
//       return rejectWithValue(
//         error.message || "Une erreur s'est produite lors de la connexion"
//       );
//     }
//   }
// );

// export const registerUser = createAsyncThunk(
//   "user/register",
//   async (
//     userData: {
//       name: string;
//       email?: string;
//       phoneNumber?: string;
//       password: string;
//       whatsapp?: boolean;
//     },
//     { rejectWithValue }
//   ) => {
//     try {
//       // Étape 1: Inscription
//       const registerResponse = await fetch("https://ihambackend.onrender.com/user", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(userData),
//       });

//       const registerData = await registerResponse.json();

//       if (!registerResponse.ok) {
//         return rejectWithValue(registerData.message || "Erreur d'inscription");
//       }

//       // Étape 2: Connexion automatique après inscription
//       const loginResponse = await fetch("https://ihambackend.onrender.com/login", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         credentials: "include",
//         body: JSON.stringify({
//           email: userData.email || null,
//           phoneNumber: userData.phoneNumber || null,
//           password: userData.password,
//         }),
//       });

//       const loginData = await loginResponse.json();

//       if (!loginResponse.ok) {
//         return rejectWithValue(loginData.message || "Erreur de connexion automatique");
//       }

//       // Sauvegarder dans localStorage
//       saveUserToStorage(loginData);

//       // Envoyer email de notification
//       try {
//         const dateActuelle = new Date();
//         const dateInscription = dateActuelle.toLocaleDateString("fr-FR", {
//           year: "numeric",
//           month: "long",
//           day: "numeric",
//         });

//         const message = `<h1>Nouvel Utilisateur Inscrit sur IhamBaobab</h1>
//           <p>Cher(e) IhamBaobab,</p>
//           <p>Nous avons le plaisir de vous informer qu'un nouvel utilisateur s'est inscrit. Voici les détails :</p>
//           <ul>
//             <li>Nom : ${userData.name}</li>
//             <li>Contact : ${userData.email || userData.phoneNumber}</li>
//             <li>Date d'inscription : ${dateInscription}</li>
//           </ul>
//           <p>Cordialement,<br>L'équipe IhamBaobab</p>`;

//         await fetch("https://ihambackend.onrender.com/sendMail", {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify({
//             senderEmail: userData.email,
//             subject: "Nouveau utilisateur",
//             message: `<div>${message}</div>`,
//             titel: "<br/><br/><h3>Nouveau utilisateur sur IhamBaobab</h3>",
//           }),
//         });
//       } catch (emailError) {
//         console.error("Erreur lors de l'envoi de l'email:", emailError);
//       }

//       return loginData;
//     } catch (error: any) {
//       return rejectWithValue(
//         error.message || "Une erreur s'est produite lors de l'inscription"
//       );
//     }
//   }
// );

// export const forgotPassword = createAsyncThunk(
//   "user/forgotPassword",
//   async (email: string, { rejectWithValue }) => {
//     try {
//       const response = await fetch("https://ihambackend.onrender.com/forgotPassword", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ email }),
//       });

//       const data = await response.json();

//       if (!response.ok) {
//         return rejectWithValue(data.message || "Erreur lors de la réinitialisation");
//       }

//       return data.message;
//     } catch (error: any) {
//       return rejectWithValue(
//         error.message || "Une erreur s'est produite lors de la réinitialisation"
//       );
//     }
//   }
// );

// export const resetPassword = createAsyncThunk(
//   "user/resetPassword",
//   async (
//     resetData: {
//       email: string;
//       code: string;
//       newPassword: string;
//     },
//     { rejectWithValue }
//   ) => {
//     try {
//       const response = await fetch("https://ihambackend.onrender.com/reset_password", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(resetData),
//       });

//       const data = await response.json();

//       if (!response.ok) {
//         return rejectWithValue(data.message || "Erreur lors de la réinitialisation");
//       }

//       return data.message;
//     } catch (error: any) {
//       return rejectWithValue(
//         error.message || "Une erreur s'est produite lors de la réinitialisation"
//       );
//     }
//   }
// );

// // Vérifier l'authentification au démarrage
// export const checkAuth = createAsyncThunk(
//   "user/checkAuth",
//   async (_, { rejectWithValue }) => {
//     try {
//       console.log("🔍 Début de la vérification d'authentification...");
      
//       // Vérifier le token côté client
//       if (!AuthService.isAuthenticated()) {
//         console.log("❌ Token non valide ou expiré côté client");
//         return rejectWithValue("Token non valide ou expiré");
//       }

//       console.log("✅ Token valide côté client");

//       // Récupérer les données utilisateur
//       const userData = AuthService.getUserData();
//       if (!userData) {
//         console.log("❌ Données utilisateur non trouvées");
//         return rejectWithValue("Données utilisateur non trouvées");
//       }

//       console.log("✅ Données utilisateur trouvées:", userData.user?.name || userData.name);

//       // Vérifier le token côté serveur (optionnel, en arrière-plan)
//       try {
//         const isValidOnServer = await AuthService.verifyTokenWithServer();
//         if (!isValidOnServer) {
//           console.log("❌ Token invalide côté serveur, déconnexion");
//           return rejectWithValue("Token invalide côté serveur");
//         }
//         console.log("✅ Token validé côté serveur");
//       } catch (serverError) {
//         console.warn("⚠️ Erreur de vérification serveur, mais on continue avec le token local");
//       }

//       return userData;
//     } catch (error: any) {
//       AuthService.logout();
//       return rejectWithValue(
//         error.message || "Erreur lors de la vérification de l'authentification"
//       );
//     }
//   }
// );

// const userSlice = createSlice({
//   name: "user",
//   initialState,
//   reducers: {
//     // Charger l'utilisateur depuis localStorage
//     loadUser: (state) => {
//       const user = loadUserFromStorage();
//       if (user) {
//         state.user = user;
//         state.isAuthenticated = true;
//         state.acces = "oui";
//       }
//     },

//     // Déconnexion
//     logout: (state) => {
//       state.user = null;
//       state.isAuthenticated = false;
//       state.acces = "non";
//       state.error = null;
//       removeUserFromStorage();
//     },

//     // Effacer les erreurs
//     clearError: (state) => {
//       state.error = null;
//     },

//     // Mettre à jour le profil utilisateur
//     updateUserProfile: (state, action: PayloadAction<Partial<User>>) => {
//       if (state.user) {
//         state.user = { ...state.user, ...action.payload };
//         // Mettre à jour localStorage
//         const currentData = loadUserFromStorage();
//         if (currentData) {
//           saveUserToStorage({ ...currentData, user: state.user });
//         }
//       }
//     },

//     // Setter pour acces (compatibilité)
//     setAcces: (state, action: PayloadAction<"oui" | "non">) => {
//       state.acces = action.payload;
//       if (action.payload === "non") {
//         state.user = null;
//         state.isAuthenticated = false;
//         removeUserFromStorage();
//       } else {
//         state.isAuthenticated = true;
//       }
//     },
//   },
//   extraReducers: (builder) => {
//     // Login
//     builder
//       .addCase(loginUser.pending, (state) => {
//         state.isLoading = true;
//         state.error = null;
//       })
//       .addCase(loginUser.fulfilled, (state, action) => {
//         state.isLoading = false;
//         state.user = action.payload.user || action.payload;
//         state.isAuthenticated = true;
//         state.acces = "oui";
//         state.error = null;
//       })
//       .addCase(loginUser.rejected, (state, action) => {
//         state.isLoading = false;
//         state.error = action.payload as string;
//         state.isAuthenticated = false;
//         state.acces = "non";
//       });

//     // Register
//     builder
//       .addCase(registerUser.pending, (state) => {
//         state.isLoading = true;
//         state.error = null;
//       })
//       .addCase(registerUser.fulfilled, (state, action) => {
//         state.isLoading = false;
//         state.user = action.payload.user || action.payload;
//         state.isAuthenticated = true;
//         state.acces = "oui";
//         state.error = null;
//       })
//       .addCase(registerUser.rejected, (state, action) => {
//         state.isLoading = false;
//         state.error = action.payload as string;
//         state.isAuthenticated = false;
//         state.acces = "non";
//       });

//     // Forgot Password
//     builder
//       .addCase(forgotPassword.pending, (state) => {
//         state.isLoading = true;
//         state.error = null;
//       })
//       .addCase(forgotPassword.fulfilled, (state) => {
//         state.isLoading = false;
//         state.error = null;
//       })
//       .addCase(forgotPassword.rejected, (state, action) => {
//         state.isLoading = false;
//         state.error = action.payload as string;
//       });

//     // Reset Password
//     builder
//       .addCase(resetPassword.pending, (state) => {
//         state.isLoading = true;
//         state.error = null;
//       })
//       .addCase(resetPassword.fulfilled, (state) => {
//         state.isLoading = false;
//         state.error = null;
//       })
//       .addCase(resetPassword.rejected, (state, action) => {
//         state.isLoading = false;
//         state.error = action.payload as string;
//       });

//     // Check Auth
//     builder
//       .addCase(checkAuth.pending, (state) => {
//         state.isLoading = true;
//         state.error = null;
//       })
//       .addCase(checkAuth.fulfilled, (state, action) => {
//         state.isLoading = false;
//         state.user = action.payload.user || action.payload;
//         state.isAuthenticated = true;
//         state.acces = "oui";
//         state.error = null;
//       })
//       .addCase(checkAuth.rejected, (state, action) => {
//         state.isLoading = false;
//         state.user = null;
//         state.isAuthenticated = false;
//         state.acces = "non";
//         // Ne pas afficher l'erreur d'authentification au démarrage
//         state.error = null;
//       });
//   },
// });

// export const { loadUser, logout, clearError, updateUserProfile, setAcces } = userSlice.actions;

// // Selectors
// export const selectUser = (state: { user: UserState }) => state.user.user;
// export const selectIsAuthenticated = (state: { user: UserState }) => state.user.isAuthenticated;
// export const selectUserLoading = (state: { user: UserState }) => state.user.isLoading;
// export const selectUserError = (state: { user: UserState }) => state.user.error;
// export const selectAcces = (state: { user: UserState }) => state.user.acces;

// export default userSlice.reducer;


import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { AuthService } from "@/lib/auth";

export interface User {
  id: string;
  name: string;
  email?: string;
  phoneNumber?: string;
  avatar?: string;
  isVerified?: boolean;
  role?: string;
  createdAt?: string;
}

interface UserState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  acces: "oui" | "non";
  authChecked: boolean; // Nouveau flag pour éviter les vérifications répétées
}

const initialState: UserState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  acces: "non",
  authChecked: false,
};

// Variable globale pour éviter les appels parallèles
let isCheckingAuth = false;

// Helpers pour localStorage
const loadUserFromStorage = (): User | null => {
  if (typeof window === "undefined") return null;
  try {
    console.log("🔍 Chargement utilisateur depuis localStorage...");
    
    if (!AuthService.isAuthenticated()) {
      console.log("❌ Token non valide ou expiré lors du chargement");
      return null;
    }
    
    const userData = AuthService.getUserData();
    if (userData) {
      console.log("✅ Utilisateur chargé depuis localStorage:", userData.user?.name || userData.name);
      return userData.user || userData;
    }
    
    console.log("ℹ️ Aucune donnée utilisateur trouvée");
    return null;
  } catch (error) {
    console.error("❌ Erreur lors du chargement utilisateur:", error);
    return null;
  }
};

const saveUserToStorage = (userData: any) => {
  if (typeof window === "undefined") return;
  try {
    if (userData.token) {
      AuthService.saveToken(userData.token);
    }
    AuthService.saveUserData(userData);
  } catch (error) {
    console.error("Erreur lors de la sauvegarde utilisateur:", error);
  }
};

const removeUserFromStorage = () => {
  if (typeof window === "undefined") return;
  try {
    AuthService.logout();
  } catch (error) {
    console.error("Erreur lors de la suppression utilisateur:", error);
  }
};

// Async thunks
export const loginUser = createAsyncThunk(
  "user/login",
  async (
    credentials: {
      identifier?: string;
      email?: string;
      phoneNumber?: string;
      password: string;
      rememberMe?: boolean;
      method?: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await fetch("https://ihambackend.onrender.com/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          identifier: credentials.identifier || null,
          email: credentials.email || null,
          phoneNumber: credentials.phoneNumber || null,
          password: credentials.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || "Erreur de connexion");
      }

      saveUserToStorage(data);
      return data;
    } catch (error: any) {
      return rejectWithValue(
        error.message || "Une erreur s'est produite lors de la connexion"
      );
    }
  }
);

export const registerUser = createAsyncThunk(
  "user/register",
  async (
    userData: {
      name: string;
      email?: string;
      phoneNumber?: string;
      password: string;
      whatsapp?: boolean;
    },
    { rejectWithValue }
  ) => {
    try {
      // Étape 1: Inscription
      const registerResponse = await fetch("https://ihambackend.onrender.com/user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      const registerData = await registerResponse.json();

      if (!registerResponse.ok) {
        return rejectWithValue(registerData.message || "Erreur d'inscription");
      }

      // Étape 2: Connexion automatique après inscription
      const loginResponse = await fetch("https://ihambackend.onrender.com/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          email: userData.email || null,
          phoneNumber: userData.phoneNumber || null,
          password: userData.password,
        }),
      });

      const loginData = await loginResponse.json();

      if (!loginResponse.ok) {
        return rejectWithValue(loginData.message || "Erreur de connexion automatique");
      }

      saveUserToStorage(loginData);

      // Envoyer email de notification (en arrière-plan)
      try {
        const dateActuelle = new Date();
        const dateInscription = dateActuelle.toLocaleDateString("fr-FR", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });

        const message = `<h1>Nouvel Utilisateur Inscrit sur IhamBaobab</h1>
          <p>Cher(e) IhamBaobab,</p>
          <p>Nous avons le plaisir de vous informer qu'un nouvel utilisateur s'est inscrit. Voici les détails :</p>
          <ul>
            <li>Nom : ${userData.name}</li>
            <li>Contact : ${userData.email || userData.phoneNumber}</li>
            <li>Date d'inscription : ${dateInscription}</li>
          </ul>
          <p>Cordialement,<br>L'équipe IhamBaobab</p>`;

        fetch("https://ihambackend.onrender.com/sendMail", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            senderEmail: userData.email,
            subject: "Nouveau utilisateur",
            message: `<div>${message}</div>`,
            titel: "<br/><br/><h3>Nouveau utilisateur sur IhamBaobab</h3>",
          }),
        }).catch(console.error); // Ignorer les erreurs d'email
      } catch (emailError) {
        console.error("Erreur lors de l'envoi de l'email:", emailError);
      }

      return loginData;
    } catch (error: any) {
      return rejectWithValue(
        error.message || "Une erreur s'est produite lors de l'inscription"
      );
    }
  }
);

export const forgotPassword = createAsyncThunk(
  "user/forgotPassword",
  async (email: string, { rejectWithValue }) => {
    try {
      const response = await fetch("https://ihambackend.onrender.com/forgotPassword", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || "Erreur lors de la réinitialisation");
      }

      return data.message;
    } catch (error: any) {
      return rejectWithValue(
        error.message || "Une erreur s'est produite lors de la réinitialisation"
      );
    }
  }
);

export const resetPassword = createAsyncThunk(
  "user/resetPassword",
  async (
    resetData: {
      email: string;
      code: string;
      newPassword: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await fetch("https://ihambackend.onrender.com/reset_password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(resetData),
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || "Erreur lors de la réinitialisation");
      }

      return data.message;
    } catch (error: any) {
      return rejectWithValue(
        error.message || "Une erreur s'est produite lors de la réinitialisation"
      );
    }
  }
);

// Vérifier l'authentification au démarrage - VERSION OPTIMISÉE
export const checkAuth = createAsyncThunk(
  "user/checkAuth",
  async (_, { rejectWithValue, getState }) => {
    // Éviter les appels parallèles
    if (isCheckingAuth) {
      console.log("⏳ Vérification d'auth déjà en cours, abandon...");
      return rejectWithValue("Vérification déjà en cours");
    }

    const state = getState() as { user: UserState };
    
    // Si déjà vérifié et authentifié, pas besoin de re-vérifier
    if (state.user.authChecked && state.user.isAuthenticated) {
      console.log("✅ Auth déjà vérifiée, réutilisation des données existantes");
      return state.user.user;
    }

    isCheckingAuth = true;

    try {
      console.log("🔍 Début de la vérification d'authentification...");
      
      if (!AuthService.isAuthenticated()) {
        console.log("❌ Token non valide ou expiré côté client");
        return rejectWithValue("Token non valide ou expiré");
      }

      console.log("✅ Token valide côté client");

      const userData = AuthService.getUserData();
      if (!userData) {
        console.log("❌ Données utilisateur non trouvées");
        return rejectWithValue("Données utilisateur non trouvées");
      }

      console.log("✅ Données utilisateur trouvées:", userData.user?.name || userData.name);

      // Vérification serveur en arrière-plan (optionnelle et non bloquante)
      AuthService.verifyTokenWithServer()
        .then((isValid) => {
          if (!isValid) {
            console.log("⚠️ Token invalide côté serveur, mais on continue");
          } else {
            console.log("✅ Token validé côté serveur");
          }
        })
        .catch((error) => {
          console.warn("⚠️ Erreur de vérification serveur:", error);
        });

      return userData;
    } catch (error: any) {
      AuthService.logout();
      return rejectWithValue(
        error.message || "Erreur lors de la vérification de l'authentification"
      );
    } finally {
      isCheckingAuth = false;
    }
  }
);

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    // Charger l'utilisateur depuis localStorage
    loadUser: (state) => {
      const user = loadUserFromStorage();
      if (user) {
        state.user = user;
        state.isAuthenticated = true;
        state.acces = "oui";
        state.authChecked = true;
      }
    },

    // Déconnexion
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.acces = "non";
      state.error = null;
      state.authChecked = false;
      isCheckingAuth = false; // Reset du flag global
      removeUserFromStorage();
    },

    // Effacer les erreurs
    clearError: (state) => {
      state.error = null;
    },

    // Mettre à jour le profil utilisateur
    updateUserProfile: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        const currentData = loadUserFromStorage();
        if (currentData) {
          saveUserToStorage({ ...currentData, user: state.user });
        }
      }
    },

    // Setter pour acces (compatibilité)
    setAcces: (state, action: PayloadAction<"oui" | "non">) => {
      state.acces = action.payload;
      if (action.payload === "non") {
        state.user = null;
        state.isAuthenticated = false;
        state.authChecked = false;
        removeUserFromStorage();
      } else {
        state.isAuthenticated = true;
        state.authChecked = true;
      }
    },

    // Nouveau : marquer comme vérifié
    setAuthChecked: (state, action: PayloadAction<boolean>) => {
      state.authChecked = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user || action.payload;
        state.isAuthenticated = true;
        state.acces = "oui";
        state.error = null;
        state.authChecked = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
        state.acces = "non";
        state.authChecked = true;
      });

    // Register
    builder
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user || action.payload;
        state.isAuthenticated = true;
        state.acces = "oui";
        state.error = null;
        state.authChecked = true;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
        state.acces = "non";
        state.authChecked = true;
      });

    // Forgot Password
    builder
      .addCase(forgotPassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(forgotPassword.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Reset Password
    builder
      .addCase(resetPassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Check Auth - VERSION OPTIMISÉE
    builder
      .addCase(checkAuth.pending, (state) => {
        // Ne pas mettre en loading si déjà vérifié
        if (!state.authChecked) {
          state.isLoading = true;
        }
        state.error = null;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user || action.payload;
        state.isAuthenticated = true;
        state.acces = "oui";
        state.error = null;
        state.authChecked = true;
      })
      .addCase(checkAuth.rejected, (state, action) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.acces = "non";
        state.error = null; // Ne pas afficher l'erreur au démarrage
        state.authChecked = true;
      });
  },
});

export const { 
  loadUser, 
  logout, 
  clearError, 
  updateUserProfile, 
  setAcces, 
  setAuthChecked 
} = userSlice.actions;

// Selectors
export const selectUser = (state: { user: UserState }) => state.user.user;
export const selectIsAuthenticated = (state: { user: UserState }) => state.user.isAuthenticated;
export const selectUserLoading = (state: { user: UserState }) => state.user.isLoading;
export const selectUserError = (state: { user: UserState }) => state.user.error;
export const selectAcces = (state: { user: UserState }) => state.user.acces;
export const selectAuthChecked = (state: { user: UserState }) => state.user.authChecked;

export default userSlice.reducer;