import { axiosInstance } from "@/config/axios";
import type { SalonItem } from "../list-salons/list-salons.service";
import type { SubscriptionPlan } from "@/common/enums/subscription.enum";

export interface CreateSalonPayload {
  name: string;
  email: string;
  phone?: string;
  password: string;
  slug?: string;
  trial_days?: number;
  subscription_plan?: SubscriptionPlan;
}

export interface CreateSalonResponse {
  salon: SalonItem;
}

export const createSalonService = async (payload: CreateSalonPayload): Promise<CreateSalonResponse> => {
  const res = await axiosInstance.post<CreateSalonResponse>("/admin/salons", payload);
  return res.data;
};
