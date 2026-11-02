import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { extendSalonDurationService, type ExtendSalonDurationPayload, type ExtendSalonDurationResponse } from "./extend-salon-duration.service";

export const extendSalonDurationAction = createAsyncThunk<
  ExtendSalonDurationResponse & { uuid: string },
  { uuid: string; payload: ExtendSalonDurationPayload },
  { rejectValue: string }
>(
  "salons/extendDuration",
  async ({ uuid, payload }, thunkAPI) => {
    try {
      const res = await extendSalonDurationService(uuid, payload);
      // clear any stale action messages after a short period
      setTimeout(() => {
        thunkAPI.dispatch({ type: "salons/clearActionMessage" });
      }, 5000);
      return { ...res, uuid };
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        return thunkAPI.rejectWithValue(
          err.response?.data?.error ||
            err.response?.data?.message ||
            "Unable to extend salon subscription duration"
        );
      }
      return thunkAPI.rejectWithValue("An unexpected error occurred");
    }
  }
);
