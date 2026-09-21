import { axiosInstance } from "@/config/axios";
import type { SalonItem } from "../list-salons/list-salons.service";
import type { SubscriptionPlan, DiscountType } from "@/common/enums/subscription.enum";

export interface DiscountDetails {
  type: DiscountType;
  value: number;
}

export interface CreateSalonPayload {
  name: string;
  email: string;
  phone?: string;
  password: string;
  slug?: string;
  trial_days?: number;
  subscription_plan?: SubscriptionPlan;
  amount?: number;
  discount_details?: DiscountDetails | null;
}

export interface CreateSalonResponse {
  salon: SalonItem;
}

export const createSalonService = async (payload: CreateSalonPayload): Promise<CreateSalonResponse> => {
  const res = await axiosInstance.post<CreateSalonResponse>("/admin/salons/onboard", payload);
  return res.data;
};
