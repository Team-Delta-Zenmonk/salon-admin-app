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

export interface ListPlansParams {
  page?: number;
  limit?: number;
  is_active?: boolean;
}

export interface ListPlansResponse {
  plans: BackendPlan[];
  pagination: {
    total: number;
    page: number;
    limit: number;
  };
}

export const getSubscriptionPlansService = async (
  params?: ListPlansParams
): Promise<ListPlansResponse> => {
  const queryParams = new URLSearchParams();
  if (params?.page !== undefined) queryParams.append("page", params.page.toString());
  if (params?.limit !== undefined) queryParams.append("limit", params.limit.toString());
  if (params?.is_active !== undefined) queryParams.append("is_active", params.is_active.toString());

  const url = queryParams.toString() ? `/admin/plans?${queryParams.toString()}` : "/admin/plans";
  const res = await axiosInstance.get<{ plans: BackendPlan[]; pagination: { total: number; page: number; limit: number } }>(url);
  return res.data;
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
