import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  createSalonService,
  type CreateSalonPayload,
  type CreateSalonResponse,
} from "./create-salon.service";
import { createSalonType } from "./create-salon.type";

export const createSalonAction = createAsyncThunk<
  CreateSalonResponse,
  CreateSalonPayload,
  { rejectValue: string }
>(createSalonType, async (payload, thunkAPI) => {
  try {
    const res = await createSalonService(payload);
    return res;
  } catch (err: any) {
    return thunkAPI.rejectWithValue(
      err?.response?.data?.error ||
      err?.response?.data?.message ||
      "Unable to provision salon"
    );
  }
});
