import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import {
  updateSalonPlanService,
  type UpdateSalonPlanPayload,
  type UpdateSalonPlanResponse,
} from "./update-salon-plan.service";
import { updateSalonPlanType } from "./update-salon-plan.type";

export const updateSalonPlanAction = createAsyncThunk<
  UpdateSalonPlanResponse & { uuid: string },
  { uuid: string; payload: UpdateSalonPlanPayload },
  { rejectValue: string }
>(updateSalonPlanType, async ({ uuid, payload }, thunkAPI) => {
  try {
    const res = await updateSalonPlanService(uuid, payload);
    setTimeout(() => {
      thunkAPI.dispatch({ type: "salons/clearActionMessage" });
    }, 5000);
    return { ...res, uuid };
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Unable to update salon subscription plan"
      );
    }
    return thunkAPI.rejectWithValue("An unexpected error occurred");
  }
});
