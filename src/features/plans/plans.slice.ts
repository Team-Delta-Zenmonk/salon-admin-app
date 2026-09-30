import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { BackendPlan } from "../salons/list-salons/list-salons.service";
import {
  fetchSubscriptionPlans,
  updateSubscriptionPlan,
  createSubscriptionPlan,
  deleteSubscriptionPlan,
} from "./plans.action";

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

export {
  fetchSubscriptionPlans,
  updateSubscriptionPlan,
  createSubscriptionPlan,
  deleteSubscriptionPlan,
};

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
      })
      .addCase(createSubscriptionPlan.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(createSubscriptionPlan.fulfilled, (state, action: PayloadAction<BackendPlan>) => {
        state.isLoading = false;
        state.successMessage = `Plan '${action.payload.name}' created successfully!`;
        state.plans.push(action.payload);
      })
      .addCase(createSubscriptionPlan.rejected, (state, action) => {
        state.isLoading = false;
        state.error = (action.payload as string) || "Failed to create plan";
      })
      .addCase(deleteSubscriptionPlan.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(deleteSubscriptionPlan.fulfilled, (state, action: PayloadAction<string>) => {
        state.isLoading = false;
        state.successMessage = `Plan '${action.payload}' deleted successfully!`;
        state.plans = state.plans.filter((p) => p.id !== action.payload && p.code !== action.payload);
      })
      .addCase(deleteSubscriptionPlan.rejected, (state, action) => {
        state.isLoading = false;
        state.error = (action.payload as string) || "Failed to delete plan";
      });
  },
});

export const { clearPlansError, clearPlansSuccessMessage } = plansSlice.actions;
export default plansSlice.reducer;
