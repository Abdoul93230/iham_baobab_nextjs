import { configureStore } from "@reduxjs/toolkit";
import productsReducer from "./productsSlice";
import likesReducer from "./likesSlice";
import panierReducer from "./panierSlice";
import userReducer from "./userSlice";

export const store = configureStore({
  reducer: {
    products: productsReducer,
    likes: likesReducer,
    panier: panierReducer,
    user: userReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
