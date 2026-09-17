import { combineReducers, configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/auth.slice";
import salonsReducer from "../features/salons/salons.slice";

const rootReducer = combineReducers({
  auth: authReducer,
  salons: salonsReducer,
});

export type RootState = ReturnType<typeof rootReducer>;

export const store = configureStore({
  reducer: rootReducer,
  devTools: process.env.NODE_ENV !== "production",
});

export type AppStore = typeof store;
export type AppDispatch = typeof store.dispatch;

