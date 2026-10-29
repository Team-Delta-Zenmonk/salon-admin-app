import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import {
  listSalonsService,
  type ListSalonsThunkParams,
  type ListSalonsResponse,
} from "./list-salons.service";
import { listSalonsType } from "./list-salons.type";

export const listSalonsAction = createAsyncThunk<
  ListSalonsResponse,
  ListSalonsThunkParams | void,
  { rejectValue: string }
>(listSalonsType, async (params, thunkAPI) => {
  try {
    const { isAppend: _isAppend, ...apiParams } = params || {};
    const res = await listSalonsService(apiParams);
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
