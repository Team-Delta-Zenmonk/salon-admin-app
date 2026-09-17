import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  listSalonsService,
  type ListSalonsParams,
  type ListSalonsResponse,
} from "./list-salons.service";
import { listSalonsType } from "./list-salons.type";

export const listSalonsAction = createAsyncThunk<
  ListSalonsResponse,
  ListSalonsParams | void,
  { rejectValue: string }
>(listSalonsType, async (params, thunkAPI) => {
  try {
    const res = await listSalonsService(params || {});
    return res;
  } catch (err: any) {
    return thunkAPI.rejectWithValue(
      err?.response?.data?.error ||
      err?.response?.data?.message ||
      "Unable to fetch salon tenants"
    );
  }
});
