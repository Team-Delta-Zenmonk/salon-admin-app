import { createAsyncThunk } from "@reduxjs/toolkit";
import { loginAdminService, type LoginPayload, type LoginResponse } from "./login.service";
import { loginAdminType } from "./login.type";
import { ADMIN_TOKEN_KEY, ADMIN_USER_KEY } from "@/config/axios";

export const loginAdminAction = createAsyncThunk<LoginResponse, LoginPayload, { rejectValue: string }>(
  loginAdminType,
  async (payload, thunkAPI) => {
    try {
      const res = await loginAdminService(payload);
      localStorage.setItem(ADMIN_TOKEN_KEY, res.token);
      localStorage.setItem(ADMIN_USER_KEY, JSON.stringify(res.admin));
      return res;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        "Unable to sign in. Please verify your credentials."
      );
    }
  }
);
