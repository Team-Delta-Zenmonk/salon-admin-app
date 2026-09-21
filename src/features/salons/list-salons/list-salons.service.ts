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

export interface ListSalonsParams {
  page?: number;
  limit?: number;
  status?: string;
  is_active?: boolean | string;
  search?: string;
}

export interface ListSalonsResponse {
  salons: SalonItem[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface BackendPlan {
  id: SubscriptionPlan;
  name: string;
  amount: number;
  formatted_price: string;
  currency: string;
  billing_cycle: string;
  badge?: string;
  description: string;
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
  description?: string;
  badge?: string;
  billing_cycle?: string;
}

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
