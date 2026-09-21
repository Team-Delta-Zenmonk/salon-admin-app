import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import {
  updateSalonStatusService,
  type UpdateSalonStatusPayload,
  type UpdateSalonStatusResponse,
} from "./update-salon-status.service";
import { updateSalonStatusType } from "./update-salon-status.type";

export const updateSalonStatusAction = createAsyncThunk<
  UpdateSalonStatusResponse & { uuid: string },
  { uuid: string; payload: UpdateSalonStatusPayload },
  { rejectValue: string }
>(updateSalonStatusType, async ({ uuid, payload }, thunkAPI) => {
  try {
    const res = await updateSalonStatusService(uuid, payload);
    setTimeout(() => {
      thunkAPI.dispatch({ type: "salons/clearActionMessage" });
    }, 5000);
    return { ...res, uuid };
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Unable to update salon status"
      );
    }
    return thunkAPI.rejectWithValue("An unexpected error occurred");
  }
});
