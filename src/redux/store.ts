import { configureStore } from "@reduxjs/toolkit";
import productsReducer from "./productsSlice";
import likesReducer from "./likesSlice";
import panierReducer from "./panierSlice";
import userReducer from "./userSlice";
import gamificationReducer from "./gamificationSlice";

export const store = configureStore({
  reducer: {
    products: productsReducer,
    likes: likesReducer,
    panier: panierReducer,
    user: userReducer,
    gamification: gamificationReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
