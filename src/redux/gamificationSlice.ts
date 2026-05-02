import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { AuthService } from "@/lib/auth";

const API = process.env.NEXT_PUBLIC_Backend_Url;

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Wallet {
  balance: number;
  totalEarned: number;
  totalSpent: number;
  balanceFcfa: number;
  level: "Graine" | "Arbre" | "Grand Baobab";
  checkinStreak: number;
  lastCheckinDate: string | null;
  referralCode: string;
  totalValidatedReferrals: number;
}

export interface PointsTransaction {
  _id: string;
  type: string;
  delta: number;
  balanceBefore: number;
  balanceAfter: number;
  reason: string;
  expiresAt: string | null;
  createdAt: string;
}

export interface PublicGamificationConfig {
  enabled: boolean;
  redemption: {
    maxPercentPerOrder: number;
    maxPercentReferralPoints: number;
    pointsToFcfaRate: number;
  };
  earning: {
    fcfaPerPoint: number;
    pointsExpireMonths: number;
  };
  levels: Array<{ name: string; minPoints: number; maxPoints: number | null }>;
  modules: {
    DAILY_CHECKIN: { pointsPerDay: number; bonus7d: number; bonus30d: number } | null;
    REVIEW_POINTS: { textOnly: number; withPhoto: number } | null;
    POINTS_PURCHASE: { ratePerThousand: number } | null;
    FIRST_ORDER_BONUS: { points: number } | null;
    REFERRAL: { pointsParrain: number; pointsFilleul: number; expiryDays: number } | null;
  } | null;
  activeEvents: Array<{
    name: string;
    description: string;
    multiplier: number;
    endDate: string;
    applicableTypes: string[];
  }> | null;
}

export interface RedeemPreview {
  balance: number;
  usablePoints: number;
  usableFcfa: number;
  maxPercent: number;
}

interface GamificationState {
  wallet: Wallet | null;
  transactions: PointsTransaction[];
  transactionTotal: number;
  transactionPage: number;
  config: PublicGamificationConfig | null;
  redeemPreview: RedeemPreview | null;
  isLoadingWallet: boolean;
  isLoadingTransactions: boolean;
  isLoadingCheckin: boolean;
  isLoadingRedeem: boolean;
  checkinResult: { streak: number; pointsEarned: number } | null;
  error: string | null;
}

const initialState: GamificationState = {
  wallet: null,
  transactions: [],
  transactionTotal: 0,
  transactionPage: 1,
  config: null,
  redeemPreview: null,
  isLoadingWallet: false,
  isLoadingTransactions: false,
  isLoadingCheckin: false,
  isLoadingRedeem: false,
  checkinResult: null,
  error: null,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${AuthService.getToken()}`,
});

// ─── Thunks ───────────────────────────────────────────────────────────────────

export const fetchWallet = createAsyncThunk(
  "gamification/fetchWallet",
  async (userId: string, { rejectWithValue }) => {
    try {
      const res = await fetch(`${API}/api/gamification/wallet/${userId}`, {
        headers: authHeaders(),
      });
      const data = await res.json();
      if (!res.ok) return rejectWithValue(data.message);
      return data.wallet as Wallet;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const fetchTransactions = createAsyncThunk(
  "gamification/fetchTransactions",
  async (
    { userId, page = 1, limit = 20 }: { userId: string; page?: number; limit?: number },
    { rejectWithValue }
  ) => {
    try {
      const res = await fetch(
        `${API}/api/gamification/transactions/${userId}?page=${page}&limit=${limit}`,
        { headers: authHeaders() }
      );
      const data = await res.json();
      if (!res.ok) return rejectWithValue(data.message);
      return { transactions: data.transactions, total: data.total, page };
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const fetchPublicConfig = createAsyncThunk(
  "gamification/fetchPublicConfig",
  async (_, { rejectWithValue }) => {
    try {
      const res = await fetch(`${API}/api/gamification/config/public`);
      const data = await res.json();
      if (!res.ok) return rejectWithValue(data.message);
      return data as { enabled: boolean; redemption: any; earning: any; levels: any[] };
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const fetchRedeemPreview = createAsyncThunk(
  "gamification/fetchRedeemPreview",
  async (
    { userId, orderAmountFcfa }: { userId: string; orderAmountFcfa: number },
    { rejectWithValue }
  ) => {
    try {
      const res = await fetch(
        `${API}/api/gamification/redeem-preview?userId=${userId}&orderAmountFcfa=${orderAmountFcfa}`,
        { headers: authHeaders() }
      );
      const data = await res.json();
      if (!res.ok) return rejectWithValue(data.message);
      return data as RedeemPreview;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const dailyCheckin = createAsyncThunk(
  "gamification/dailyCheckin",
  async (userId: string, { rejectWithValue }) => {
    try {
      const res = await fetch(`${API}/api/gamification/checkin`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ userId }),
      });
      const data = await res.json();
      if (!res.ok) return rejectWithValue(data.message);
      return data;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const redeemPoints = createAsyncThunk(
  "gamification/redeemPoints",
  async (
    payload: {
      userId: string;
      pointsToRedeem: number;
      orderId: string;
      orderAmountFcfa: number;
    },
    { rejectWithValue }
  ) => {
    try {
      const res = await fetch(`${API}/api/gamification/redeem`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) return rejectWithValue(data.message);
      return data;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

// ─── Slice ────────────────────────────────────────────────────────────────────

const gamificationSlice = createSlice({
  name: "gamification",
  initialState,
  reducers: {
    clearError: (state) => { state.error = null; },
    clearCheckinResult: (state) => { state.checkinResult = null; },
    clearRedeemPreview: (state) => { state.redeemPreview = null; },
  },
  extraReducers: (builder) => {
    // fetchWallet
    builder
      .addCase(fetchWallet.pending, (state) => { state.isLoadingWallet = true; state.error = null; })
      .addCase(fetchWallet.fulfilled, (state, action) => {
        state.isLoadingWallet = false;
        state.wallet = action.payload;
      })
      .addCase(fetchWallet.rejected, (state, action) => {
        state.isLoadingWallet = false;
        state.error = action.payload as string;
      });

    // fetchTransactions
    builder
      .addCase(fetchTransactions.pending, (state) => { state.isLoadingTransactions = true; })
      .addCase(fetchTransactions.fulfilled, (state, action) => {
        state.isLoadingTransactions = false;
        state.transactions = action.payload.transactions;
        state.transactionTotal = action.payload.total;
        state.transactionPage = action.payload.page;
      })
      .addCase(fetchTransactions.rejected, (state, action) => {
        state.isLoadingTransactions = false;
        state.error = action.payload as string;
      });

    // fetchPublicConfig
    builder
      .addCase(fetchPublicConfig.fulfilled, (state, action) => {
        state.config = action.payload as PublicGamificationConfig;
      });

    // fetchRedeemPreview
    builder
      .addCase(fetchRedeemPreview.fulfilled, (state, action) => {
        state.redeemPreview = action.payload;
      });

    // dailyCheckin
    builder
      .addCase(dailyCheckin.pending, (state) => { state.isLoadingCheckin = true; state.error = null; })
      .addCase(dailyCheckin.fulfilled, (state, action) => {
        state.isLoadingCheckin = false;
        const bonusDelta = action.payload.bonus?.transaction?.[0]?.delta || 0;
        const checkinDelta = action.payload.checkin?.transaction?.delta || 0;
        state.checkinResult = {
          streak: action.payload.streak,
          pointsEarned: checkinDelta + bonusDelta,
        };
        if (state.wallet) {
          state.wallet.balance += checkinDelta + bonusDelta;
          state.wallet.checkinStreak = action.payload.streak;
          // Met à jour lastCheckinDate pour désactiver le bouton immédiatement
          state.wallet.lastCheckinDate = new Date().toISOString();
        }
        // Prepend la nouvelle transaction checkin dans l'historique
        const newTxn = action.payload.checkin?.transaction;
        if (newTxn) {
          state.transactions = [newTxn, ...state.transactions];
        }
        const bonusTxn = action.payload.bonus?.transaction?.[0];
        if (bonusTxn) {
          state.transactions = [bonusTxn, ...state.transactions];
        }
      })
      .addCase(dailyCheckin.rejected, (state, action) => {
        state.isLoadingCheckin = false;
        state.error = action.payload as string;
      });

    // redeemPoints
    builder
      .addCase(redeemPoints.pending, (state) => { state.isLoadingRedeem = true; state.error = null; })
      .addCase(redeemPoints.fulfilled, (state, action) => {
        state.isLoadingRedeem = false;
        if (state.wallet) {
          state.wallet = action.payload.wallet
            ? { ...state.wallet, balance: action.payload.wallet.balance }
            : state.wallet;
        }
      })
      .addCase(redeemPoints.rejected, (state, action) => {
        state.isLoadingRedeem = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearCheckinResult, clearRedeemPreview } = gamificationSlice.actions;

// Selectors
export const selectWallet = (s: { gamification: GamificationState }) => s.gamification.wallet;
export const selectGamificationConfig = (s: { gamification: GamificationState }) => s.gamification.config;
export const selectTransactions = (s: { gamification: GamificationState }) => s.gamification.transactions;
export const selectCheckinResult = (s: { gamification: GamificationState }) => s.gamification.checkinResult;
export const selectRedeemPreview = (s: { gamification: GamificationState }) => s.gamification.redeemPreview;
export const selectActiveEvents = (s: { gamification: GamificationState }) => s.gamification.config?.activeEvents ?? [];

export default gamificationSlice.reducer;
