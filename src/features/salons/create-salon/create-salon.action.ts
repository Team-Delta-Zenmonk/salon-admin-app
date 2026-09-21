import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
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
    setTimeout(() => {
      thunkAPI.dispatch({ type: "salons/clearActionMessage" });
    }, 5000);
    return res;
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Unable to provision salon"
      );
    }
    return thunkAPI.rejectWithValue("An unexpected error occurred");
  }
});
