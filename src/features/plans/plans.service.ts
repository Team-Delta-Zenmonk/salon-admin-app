import { axiosInstance } from "@/config/axios";
import type { BackendPlan } from "../salons/list-salons/list-salons.service";

export interface UpdatePlanPayload {
  amount?: number;
  name?: string;
  description?: string;
  billing_cycle?: string;
  duration_days?: number;
  code?: string;
}

export interface CreatePlanPayload {
  name: string;
  amount: number;
  duration_days: number;
  billing_cycle?: string;
  description?: string;
  code?: string;
}

export const getSubscriptionPlansService = async (): Promise<BackendPlan[]> => {
  const res = await axiosInstance.get<{ plans: BackendPlan[] }>("/admin/plans");
  return res.data.plans;
};

export const updateSubscriptionPlanService = async (
  code: string,
  payload: UpdatePlanPayload
): Promise<BackendPlan> => {
  const res = await axiosInstance.patch<{ message: string; plan: BackendPlan }>(
    `/admin/plans/${code}`,
    payload
  );
  return res.data.plan;
};

export const createSubscriptionPlanService = async (
  payload: CreatePlanPayload
): Promise<BackendPlan> => {
  const res = await axiosInstance.post<{ message: string; plan: BackendPlan }>(
    "/admin/plans",
    payload
  );
  return res.data.plan;
};

export const deleteSubscriptionPlanService = async (code: string): Promise<string> => {
  const res = await axiosInstance.delete<{ message: string; code?: string }>(
    `/admin/plans/${code}`
  );
  return res.data.code || code;
};
