import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import {
  listSalonsService,
  type ListSalonsParams,
  type ListSalonsResponse,
} from "./list-salons.service";
import { listSalonsType } from "./list-salons.type";
import type { RootState } from "@/store/store";

export const listSalonsAction = createAsyncThunk<
  ListSalonsResponse,
  ListSalonsParams | void,
  { rejectValue: string; state: RootState }
>(listSalonsType, async (params, thunkAPI) => {
  try {
    const currentFilters = thunkAPI.getState().salons.filters;
    const mergedParams: ListSalonsParams = { ...currentFilters, ...(params || {}) };
    const res = await listSalonsService(mergedParams);
    return res;
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Unable to fetch salon tenants"
      );
    }
    return thunkAPI.rejectWithValue("An unexpected error occurred");
  }
});
