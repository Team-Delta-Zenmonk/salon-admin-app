import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { BackendPlan } from "../salons/list-salons/list-salons.service";
import type { ListPlansResponse } from "./plans.service";
import {
  fetchSubscriptionPlans,
  updateSubscriptionPlan,
  createSubscriptionPlan,
  deleteSubscriptionPlan,
  toggleSubscriptionPlanStatus,
} from "./plans.action";

export interface PlansState {
  plans: BackendPlan[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
  isLoading: boolean;
  isInitialLoading: boolean;
  togglingPlanUuid: string | null;
  error: string | null;
  successMessage: string | null;
}

const initialState: PlansState = {
  plans: [],
  total: 0,
  page: 1,
  limit: 10,
  hasMore: false,
  isLoading: false,
  isInitialLoading: true,
  togglingPlanUuid: null,
  error: null,
  successMessage: null,
};

export {
  fetchSubscriptionPlans,
  updateSubscriptionPlan,
  createSubscriptionPlan,
  deleteSubscriptionPlan,
  toggleSubscriptionPlanStatus,
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
    clearPlans(state) {
      state.plans = [];
      state.total = 0;
      state.page = 1;
      state.hasMore = false;
      state.isLoading = false;
      state.isInitialLoading = true;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSubscriptionPlans.pending, (state, { meta }) => {
        state.isLoading = true;
        state.error = null;
        const page = meta.arg?.page ?? 1;
        if (page === 1) {
          state.isInitialLoading = true;
        }
      })
      .addCase(fetchSubscriptionPlans.fulfilled, (state, action: PayloadAction<ListPlansResponse>) => {
        state.isLoading = false;
        state.isInitialLoading = false;
        const { plans, pagination } = action.payload;

        if (pagination.page === 1) {
          state.plans = plans;
        } else {
          const existingUuids = new Set(state.plans.map((p) => p.uuid));
          const newPlans = (plans || []).filter((p) => !existingUuids.has(p.uuid));
          state.plans = [...state.plans, ...newPlans];
        }

        state.total = pagination.total;
        state.page = pagination.page;
        state.limit = pagination.limit;
        state.hasMore = plans?.length === pagination.limit && state.plans.length < pagination.total;
      })
      .addCase(fetchSubscriptionPlans.rejected, (state, action) => {
        state.isLoading = false;
        state.isInitialLoading = false;
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
        const index = state.plans.findIndex(
          (p) => p.uuid === action.payload.uuid || (action.payload.id && p.id === action.payload.id)
        );
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
      .addCase(toggleSubscriptionPlanStatus.pending, (state, action) => {
        state.togglingPlanUuid = action.meta.arg;
        state.error = null;
      })
      .addCase(toggleSubscriptionPlanStatus.fulfilled, (state, action) => {
        state.togglingPlanUuid = null;
        const index = state.plans.findIndex((p) => p.uuid === action.payload.uuid);
        if (index !== -1) {
          state.plans[index].is_active = action.payload.is_active;
        }
        state.successMessage = action.payload.message;
      })
      .addCase(toggleSubscriptionPlanStatus.rejected, (state, action) => {
        state.togglingPlanUuid = null;
        state.error = (action.payload as string) || "Failed to toggle plan status";
      })
      .addCase(deleteSubscriptionPlan.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(deleteSubscriptionPlan.fulfilled, (state, action: PayloadAction<string>) => {
        state.isLoading = false;
        state.successMessage = "Plan deleted successfully!";
        state.plans = state.plans.filter(
          (p) => p.uuid !== action.payload && p.code !== action.payload && p.id !== action.payload
        );
      })
      .addCase(deleteSubscriptionPlan.rejected, (state, action) => {
        state.isLoading = false;
        state.error = (action.payload as string) || "Failed to delete plan";
      });
  },
});

export const { clearPlansError, clearPlansSuccessMessage, clearPlans } = plansSlice.actions;
export default plansSlice.reducer;
