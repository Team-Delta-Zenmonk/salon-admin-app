import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import {
  getSubscriptionPlansService,
  updateSubscriptionPlanService,
  createSubscriptionPlanService,
  deleteSubscriptionPlanService,
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
  code: string;
  payload: UpdatePlanPayload;
}

export const updateSubscriptionPlan = createAsyncThunk<
  BackendPlan,
  UpdatePlanArgs,
  { rejectValue: string }
>("plans/updateSubscriptionPlan", async ({ code, payload }, thunkAPI) => {
  try {
    const updatedPlan = await updateSubscriptionPlanService(code, payload);
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

export const deleteSubscriptionPlan = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("plans/deleteSubscriptionPlan", async (code, thunkAPI) => {
  try {
    const deletedCode = await deleteSubscriptionPlanService(code);
    return deletedCode;
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Failed to delete subscription plan"
      );
    }
    return thunkAPI.rejectWithValue("Failed to delete subscription plan");
  }
});
