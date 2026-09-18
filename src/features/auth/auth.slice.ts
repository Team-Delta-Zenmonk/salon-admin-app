import { createSlice } from "@reduxjs/toolkit";
import { loginAdminAction } from "./login/login.action";
import type { AdminUser } from "./login/login.service";
import { ADMIN_TOKEN_KEY, ADMIN_USER_KEY } from "@/config/axios";

export interface AuthState {
  admin: AdminUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

function getInitialAdmin(): AdminUser | null {
  try {
    const raw = localStorage.getItem(ADMIN_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

const initialToken = localStorage.getItem(ADMIN_TOKEN_KEY);
const initialAdmin = getInitialAdmin();

const initialState: AuthState = {
  admin: initialAdmin,
  token: initialToken,
  isAuthenticated: Boolean(initialToken && initialAdmin),
  isLoading: false,
  error: null,
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout(state) {
      state.admin = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      localStorage.removeItem(ADMIN_TOKEN_KEY);
      localStorage.removeItem(ADMIN_USER_KEY);
    },
    clearAuthError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginAdminAction.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginAdminAction.fulfilled, (state, { payload }) => {
        state.isLoading = false;
        state.admin = payload.admin;
        state.token = payload.token;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loginAdminAction.rejected, (state, action) => {
        state.isLoading = false;
        state.error = (action.payload as string) || "Authentication failed";
        state.isAuthenticated = false;
      });
  },
});

export const { logout, clearAuthError } = authSlice.actions;
export default authSlice.reducer;
