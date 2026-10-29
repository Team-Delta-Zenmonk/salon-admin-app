import { createSlice } from "@reduxjs/toolkit";
import { listSalonsAction } from "./list-salons/list-salons.action";
import { createSalonAction } from "./create-salon/create-salon.action";
import { updateSalonStatusAction } from "./update-salon-status/update-salon-status.action";
import { updateSalonPlanAction } from "./update-salon-plan/update-salon-plan.action";
import type { SalonItem } from "./list-salons/list-salons.service";
import { DEFAULT_PAGE_LIMIT } from "./list-salons/list-salons.service";

export interface SalonsState {
  data: SalonItem[];
  total: number;
  totalTenants: number;
  page: number;
  limit: number;
  totalPages: number;
  hasMore: boolean;
  isLoading: boolean;
  error: string | null;
  actionMessage: string | null;
}

const initialState: SalonsState = {
  data: [],
  total: 0,
  totalTenants: 0,
  page: 1,
  limit: DEFAULT_PAGE_LIMIT,
  totalPages: 1,
  hasMore: false,
  isLoading: false,
  error: null,
  actionMessage: null,
};

export const salonsSlice = createSlice({
  name: "salons",
  initialState,
  reducers: {
    clearActionMessage(state) {
      state.actionMessage = null;
    },
    clearSalonsError(state) {
      state.error = null;
    },
    resetSalonsData(state) {
      state.data = [];
      state.total = 0;
      state.page = 1;
      state.totalPages = 1;
      state.hasMore = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(listSalonsAction.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(listSalonsAction.fulfilled, (state, action) => {
        const { payload } = action;
        state.isLoading = false;
        const isAppend = action.meta.arg?.isAppend === true;

        if (isAppend) {
          const existingIds = new Set(state.data.map((s) => s.uuid));
          const newSalons = payload.salons.filter((s) => !existingIds.has(s.uuid));
          state.data = [...state.data, ...newSalons];
        } else {
          state.data = payload.salons;
        }

        state.total = payload.pagination.total;
        state.page = payload.pagination.page;
        state.limit = payload.pagination.limit;
        state.totalPages = payload.pagination.totalPages;
        state.hasMore = payload.pagination.page < payload.pagination.totalPages;

        const arg = action.meta.arg;
        const isUnfiltered =
          !arg?.status &&
          arg?.is_active === undefined &&
          (!arg?.search || !arg.search.trim());

        if (isUnfiltered || state.totalTenants === 0) {
          state.totalTenants = payload.pagination.total;
        }
      })
      .addCase(listSalonsAction.rejected, (state, action) => {
        state.isLoading = false;
        state.error = (action.payload as string) || "Failed to load salons";
      });

    builder
      .addCase(createSalonAction.pending, (state) => {
        state.error = null;
      })
      .addCase(createSalonAction.fulfilled, (state, { payload }) => {
        const newSalon = payload.salon;

        state.totalTenants += 1;
        state.total += 1;
        state.actionMessage = `Salon "${newSalon.name}" successfully provisioned!`;

        const exists = state.data.some((s) => s.uuid === newSalon.uuid);
        if (!exists) {
          state.data = [newSalon, ...state.data];
        }
      })
      .addCase(createSalonAction.rejected, (state, action) => {
        state.error = (action.payload as string) || "Failed to create salon";
      });

    builder
      .addCase(updateSalonStatusAction.pending, (state) => {
        state.error = null;
      })
      .addCase(updateSalonStatusAction.fulfilled, (state, { payload }) => {
        state.actionMessage = payload.message || "Salon status updated";
        const index = state.data.findIndex((s) => s.uuid === payload.uuid);
        if (index !== -1) {
          state.data[index] = { ...state.data[index], ...payload.salon };
        }
      })
      .addCase(updateSalonStatusAction.rejected, (state, action) => {
        state.error = (action.payload as string) || "Failed to update salon status";
      });

    builder
      .addCase(updateSalonPlanAction.pending, (state) => {
        state.error = null;
      })
      .addCase(updateSalonPlanAction.fulfilled, (state, { payload }) => {
        state.actionMessage = payload.message || "Salon subscription plan updated";
        const index = state.data.findIndex((s) => s.uuid === payload.uuid);
        if (index !== -1) {
          state.data[index] = { ...state.data[index], ...payload.salon };
        }
      })
      .addCase(updateSalonPlanAction.rejected, (state, action) => {
        state.error = (action.payload as string) || "Failed to update salon plan";
      });
  },
});

export const { resetSalonsData, clearActionMessage, clearSalonsError } = salonsSlice.actions;
export default salonsSlice.reducer;
