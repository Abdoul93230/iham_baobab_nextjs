import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";

const BackendUrl = process.env.NEXT_PUBLIC_Backend_Url;

// Types basés sur votre structure existante
export interface Variant {
  color: string;
  imageUrl: string;
  sizes?: string[];
  stock?: number;
}

export interface Product {
  _id: string;
  name: string;
  prix: number;
  prixPromo?: number;
  prixf?: number;
  image1?: string;
  image2?: string;
  image3?: string;
  description?: string;
  category?: string;
  typeName?: string;
  isPublished?: string;
  ClefType?: string;
  Clefcategories?: string;
  tailles?: string[];
  couleurs?: string[];
  quantite?: number;
  prixLivraison?: number;
  variants?: Variant[];
  shipping?: {
    weight?: number;
  };
  Clefournisseur?: {
    _id: string;
    name?: string;
  };
}

interface Category {
  _id: string;
  name: string;
  image?: string;
}

interface Type {
  _id: string;
  name: string;
  categoryId?: string;
  clefCategories?: string;
}

// Interface qui correspond exactement à votre structure originale
interface ProductsState {
  data: Product[];
  types: Type[];
  categories: Category[];
  products_Pubs: any[];
  products_Commentes: any[];
  loading?: boolean;
  error?: string | null;
}

const initialState: ProductsState = {
  data: [],
  types: [],
  categories: [],
  products_Pubs: [],
  products_Commentes: [],
  loading: false,
  error: null,
};

// Async thunks qui correspondent à vos actions originales
export const getProducts = createAsyncThunk(
  "products/getProducts",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${BackendUrl}/products`);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Error fetching products");
    }
  }
);

export const getCategories = createAsyncThunk(
  "products/getCategories",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${BackendUrl}/getAllCategories`);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Error fetching categories");
    }
  }
);

export const getTypes = createAsyncThunk(
  "products/getTypes",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${BackendUrl}/getAllType`);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Error fetching types");
    }
  }
);

export const getProducts_Pubs = createAsyncThunk(
  "products/getProducts_Pubs",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${BackendUrl}/productPubget`);
      return response.data?.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Error fetching product pubs");
    }
  }
);

export const getProducts_Commentes = createAsyncThunk(
  "products/getProducts_Commentes",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${BackendUrl}/getAllCommenteProduit`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Error fetching commented products");
    }
  }
);

// Slice qui correspond exactement à votre structure
export const getSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    setProducts: (state, action: PayloadAction<Product[]>) => {
      state.data = action.payload;
    },
    setTypes: (state, action: PayloadAction<Type[]>) => {
      state.types = action.payload;
    },
    setCategories: (state, action: PayloadAction<Category[]>) => {
      state.categories = action.payload;
    },
    setProducts_Pubs: (state, action: PayloadAction<any[]>) => {
      state.products_Pubs = action.payload;
    },
    setProducts_Commentes: (state, action: PayloadAction<any[]>) => {
      state.products_Commentes = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // getProducts
      .addCase(getProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(getProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // getCategories
      .addCase(getCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload;
      })
      .addCase(getCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // getTypes
      .addCase(getTypes.fulfilled, (state, action) => {
        state.types = action.payload;
      })
      // getProducts_Pubs
      .addCase(getProducts_Pubs.fulfilled, (state, action) => {
        state.products_Pubs = action.payload;
      })
      // getProducts_Commentes
      .addCase(getProducts_Commentes.fulfilled, (state, action) => {
        state.products_Commentes = action.payload;
      });
  },
});

export const {
  setProducts,
  setTypes,
  setCategories,
  setProducts_Pubs,
  setProducts_Commentes,
  clearError,
} = getSlice.actions;

export default getSlice.reducer;
