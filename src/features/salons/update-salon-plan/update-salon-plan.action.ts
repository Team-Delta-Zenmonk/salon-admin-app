import { createAsyncThunk } from "@reduxjs/toolkit";
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
    return { ...res, uuid };
  } catch (err: any) {
    return thunkAPI.rejectWithValue(
      err?.response?.data?.error ||
      err?.response?.data?.message ||
      "Unable to update salon subscription plan"
    );
  }
});
