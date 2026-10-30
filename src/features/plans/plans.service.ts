import { axiosInstance } from "@/config/axios";
import type { BackendPlan } from "../salons/list-salons/list-salons.service";

export interface UpdatePlanPayload {
  amount?: number;
  name?: string;
  description?: string | null;
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
  badge?: string;
}

export const getSubscriptionPlansService = async (): Promise<BackendPlan[]> => {
  const res = await axiosInstance.get<{ plans: BackendPlan[] } | BackendPlan[]>("/admin/plans");
  if (Array.isArray(res.data)) {
    return res.data;
  }
  return res.data?.plans || [];
};

export const updateSubscriptionPlanService = async (
  uuid: string,
  payload: UpdatePlanPayload
): Promise<BackendPlan> => {
  const res = await axiosInstance.patch<{ message: string; plan: BackendPlan }>(
    `/admin/plans/${uuid}`,
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

export const toggleSubscriptionPlanStatusService = async (
  uuid: string
): Promise<{ message: string; plan: Partial<BackendPlan> }> => {
  const res = await axiosInstance.patch<{ message: string; plan: Partial<BackendPlan> }>(
    `/admin/plans/${uuid}/status`
  );
  return res.data;
};

export const deleteSubscriptionPlanService = async (uuid: string): Promise<string> => {
  const res = await axiosInstance.delete<{ message: string; uuid?: string }>(
    `/admin/plans/${uuid}`
  );
  return res.data.uuid || uuid;
};
