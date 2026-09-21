import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import {
  getSubscriptionPlansService,
  updateSubscriptionPlanService,
  type BackendPlan,
  type UpdatePlanPayload,
} from "../salons/list-salons/list-salons.service";

export interface PlansState {
  plans: BackendPlan[];
  isLoading: boolean;
  error: string | null;
  successMessage: string | null;
}

const initialState: PlansState = {
  plans: [],
  isLoading: false,
  error: null,
  successMessage: null,
};

export const fetchSubscriptionPlans = createAsyncThunk<BackendPlan[], void, { rejectValue: string }>(
  "plans/fetchSubscriptionPlans",
  async (_, thunkAPI) => {
    try {
      const plans = await getSubscriptionPlansService();
      return plans;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || "Failed to fetch plans");
    }
  }
);

export interface UpdatePlanArgs {
  code: string;
  payload: UpdatePlanPayload;
}

export const updateSubscriptionPlan = createAsyncThunk<
  BackendPlan,
  UpdatePlanArgs,
  { rejectValue: string }
>(
  "plans/updateSubscriptionPlan",
  async ({ code, payload }, thunkAPI) => {
    try {
      const updatedPlan = await updateSubscriptionPlanService(code, payload);
      return updatedPlan;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Failed to update plan pricing"
      );
    }
  }
);

export const plansSlice = createSlice({
  name: "plans",
  initialState,
  reducers: {
    clearPlansError(state) {
      state.error = null;
    },
    clearPlansSuccessMessage(state) {
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSubscriptionPlans.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSubscriptionPlans.fulfilled, (state, action: PayloadAction<BackendPlan[]>) => {
        state.isLoading = false;
        state.plans = action.payload;
      })
      .addCase(fetchSubscriptionPlans.rejected, (state, action) => {
        state.isLoading = false;
        state.error = (action.payload as string) || "Failed to fetch plans";
      })
      .addCase(updateSubscriptionPlan.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(updateSubscriptionPlan.fulfilled, (state, action: PayloadAction<BackendPlan>) => {
        state.isLoading = false;
        state.successMessage = `Plan pricing for '${action.payload.name}' updated successfully!`;
        const index = state.plans.findIndex((p) => p.id === action.payload.id);
        if (index !== -1) {
          state.plans[index] = action.payload;
        } else {
          state.plans.push(action.payload);
        }
      })
      .addCase(updateSubscriptionPlan.rejected, (state, action) => {
        state.isLoading = false;
        state.error = (action.payload as string) || "Failed to update plan pricing";
      });
  },
});

export const { clearPlansError, clearPlansSuccessMessage } = plansSlice.actions;
export default plansSlice.reducer;
