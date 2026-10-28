import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { listSalonsAction } from "./list-salons/list-salons.action";
import { createSalonAction } from "./create-salon/create-salon.action";
import { updateSalonStatusAction } from "./update-salon-status/update-salon-status.action";
import { updateSalonPlanAction } from "./update-salon-plan/update-salon-plan.action";
import type { SalonItem, ListSalonsParams } from "./list-salons/list-salons.service";

export interface SalonsState {
  data: SalonItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasMore: boolean;
  filters: ListSalonsParams;
  isLoading: boolean;
  isLoadingMore: boolean;
  error: string | null;
  actionMessage: string | null;
}

const initialState: SalonsState = {
  data: [],
  total: 0,
  page: 1,
  limit: 10,
  totalPages: 1,
  hasMore: false,
  filters: {
    page: 1,
    limit: 10,
    status: undefined,
    is_active: undefined,
    search: undefined,
  },
  isLoading: false,
  isLoadingMore: false,
  error: null,
  actionMessage: null,
};

export const salonsSlice = createSlice({
  name: "salons",
  initialState,
  reducers: {
    setFilters(state, action: PayloadAction<Partial<ListSalonsParams>>) {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetFilters(state) {
      state.filters = { page: 1, limit: 10, status: undefined, is_active: undefined, search: undefined };
      state.data = [];
      state.total = 0;
      state.page = 1;
      state.totalPages = 1;
      state.hasMore = false;
    },
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
      .addCase(listSalonsAction.pending, (state, action) => {
        const page = action.meta.arg?.page ?? state.filters.page ?? 1;
        state.filters = { ...state.filters, ...(action.meta.arg || {}) };
        if (page > 1) {
          state.isLoadingMore = true;
        } else {
          state.isLoading = true;
        }
        state.error = null;
      })
      .addCase(listSalonsAction.fulfilled, (state, { payload }) => {
        state.isLoading = false;
        state.isLoadingMore = false;
        const page = payload.pagination.page;
        if (page === 1) {
          state.data = payload.salons;
        } else {
          const existingIds = new Set(state.data.map((s) => s.uuid));
          const newSalons = payload.salons.filter((s) => !existingIds.has(s.uuid));
          state.data = [...state.data, ...newSalons];
        }
        state.total = payload.pagination.total;
        state.page = payload.pagination.page;
        state.limit = payload.pagination.limit;
        state.totalPages = payload.pagination.totalPages;
        state.hasMore = payload.pagination.page < payload.pagination.totalPages;
      })
      .addCase(listSalonsAction.rejected, (state, action) => {
        state.isLoading = false;
        state.isLoadingMore = false;
        state.error = (action.payload as string) || "Failed to load salons";
      });

    builder
      .addCase(createSalonAction.pending, (state) => {
        state.error = null;
      })
      .addCase(createSalonAction.fulfilled, (state, { payload }) => {
        state.actionMessage = `Salon "${payload.salon.name}" successfully provisioned!`;
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

export const { setFilters, resetFilters, resetSalonsData, clearActionMessage, clearSalonsError } = salonsSlice.actions;
export default salonsSlice.reducer;
