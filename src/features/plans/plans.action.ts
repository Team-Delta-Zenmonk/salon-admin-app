import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import {
  getSubscriptionPlansService,
  updateSubscriptionPlanService,
  createSubscriptionPlanService,
  deleteSubscriptionPlanService,
  toggleSubscriptionPlanStatusService,
  type UpdatePlanPayload,
  type CreatePlanPayload,
} from "./plans.service";
import type { BackendPlan } from "../salons/list-salons/list-salons.service";

export const fetchSubscriptionPlans = createAsyncThunk<
  BackendPlan[],
  void,
  { rejectValue: string }
>("plans/fetchSubscriptionPlans", async (_, thunkAPI) => {
  try {
    const plans = await getSubscriptionPlansService();
    return plans;
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Failed to fetch plans"
      );
    }
    return thunkAPI.rejectWithValue("Failed to fetch plans");
  }
});

export interface UpdatePlanArgs {
  uuid: string;
  payload: UpdatePlanPayload;
}

export const updateSubscriptionPlan = createAsyncThunk<
  BackendPlan,
  UpdatePlanArgs,
  { rejectValue: string }
>("plans/updateSubscriptionPlan", async ({ uuid, payload }, thunkAPI) => {
  try {
    const updatedPlan = await updateSubscriptionPlanService(uuid, payload);
    return updatedPlan;
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Failed to update plan pricing"
      );
    }
    return thunkAPI.rejectWithValue("Failed to update plan pricing");
  }
});

export const createSubscriptionPlan = createAsyncThunk<
  BackendPlan,
  CreatePlanPayload,
  { rejectValue: string }
>("plans/createSubscriptionPlan", async (payload, thunkAPI) => {
  try {
    const newPlan = await createSubscriptionPlanService(payload);
    return newPlan;
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Failed to create subscription plan"
      );
    }
    return thunkAPI.rejectWithValue("Failed to create subscription plan");
  }
});

export const toggleSubscriptionPlanStatus = createAsyncThunk<
  { uuid: string; is_active: boolean; message: string },
  string,
  { rejectValue: string }
>("plans/toggleSubscriptionPlanStatus", async (uuid, thunkAPI) => {
  try {
    const res = await toggleSubscriptionPlanStatusService(uuid);
    return {
      uuid: (res.plan.uuid as string) || uuid,
      is_active: Boolean(res.plan.is_active),
      message: res.message || "Plan status updated successfully",
    };
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Failed to toggle plan status"
      );
    }
    return thunkAPI.rejectWithValue("Failed to toggle plan status");
  }
});

export const deleteSubscriptionPlan = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("plans/deleteSubscriptionPlan", async (uuid, thunkAPI) => {
  try {
    const deletedUuid = await deleteSubscriptionPlanService(uuid);
    return deletedUuid;
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Failed to delete subscription plan"
      );
    }
    return thunkAPI.rejectWithValue("Failed to delete subscription plan");
  }
});
