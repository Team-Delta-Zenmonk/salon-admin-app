import { combineReducers, configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/auth.slice";
import salonsReducer from "../features/salons/salons.slice";
import plansReducer from "../features/plans/plans.slice";

const rootReducer = combineReducers({
  auth: authReducer,
  salons: salonsReducer,
  plans: plansReducer,
});

export type RootState = ReturnType<typeof rootReducer>;

export const store = configureStore({
  reducer: rootReducer,
  devTools: import.meta.env.DEV,
});

export type AppStore = typeof store;
export type AppDispatch = typeof store.dispatch;

