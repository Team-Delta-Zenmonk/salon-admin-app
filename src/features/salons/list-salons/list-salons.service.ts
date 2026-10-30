import { axiosInstance } from "@/config/axios";
import type { SubscriptionPlan, SubscriptionStatus } from "@/common/enums/subscription.enum";

export interface SalonItem {
  id: number;
  uuid: string;
  name: string;
  email: string;
  phone?: string | null;
  slug: string;
  is_active: boolean;
  is_onboarded?: boolean;
  registered_by?: string;
  subscription_status: SubscriptionStatus;
  subscription_plan: SubscriptionPlan;
  trial_ends_at?: string | null;
  subscription_expires_at?: string | null;
  created_at: string;
  updated_at: string;
}

export const DEFAULT_PAGE_LIMIT = 10;

export interface ListSalonsParams {
  page?: number;
  limit?: number;
  status?: string;
  plan?: string;
  is_active?: boolean | string;
  search?: string;
}

export interface ListSalonsThunkParams extends ListSalonsParams {
  isAppend?: boolean;
}

export interface ListSalonsResponse {
  salons: SalonItem[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages?: number;
  };
}

export interface BackendPlan {
  id: string | number;
  uuid: string;
  code?: string;
  db_id?: number;
  name: string;
  amount: number;
  formatted_price: string;
  currency: string;
  billing_cycle: string;
  description: string;
  duration_days: number;
  is_active: boolean;
  badge?: string;
}

export const listSalonsService = async (params: ListSalonsParams = {}): Promise<ListSalonsResponse> => {
  const res = await axiosInstance.get<ListSalonsResponse>("/admin/salons", { params });
  return res.data;
};

export const getSubscriptionPlansService = async (): Promise<BackendPlan[]> => {
  const res = await axiosInstance.get<{ plans: BackendPlan[] }>("/admin/plans");
  return res.data.plans;
};

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
