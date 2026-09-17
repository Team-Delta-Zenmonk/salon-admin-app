import { axiosInstance } from "@/config/axios";
import type { SalonItem } from "../list-salons/list-salons.service";
import type { SubscriptionPlan, SubscriptionStatus } from "@/common/enums/subscription.enum";

export interface UpdateSalonPlanPayload {
  subscription_plan?: SubscriptionPlan;
  subscription_status?: SubscriptionStatus;
  duration_days?: number;
  extend_trial_days?: number;
  extend_subscription_days?: number;
}

export interface UpdateSalonPlanResponse {
  message: string;
  salon: Partial<SalonItem>;
}

export const updateSalonPlanService = async (
  uuid: string,
  payload: UpdateSalonPlanPayload
): Promise<UpdateSalonPlanResponse> => {
  const res = await axiosInstance.patch<UpdateSalonPlanResponse>(
    `/admin/salons/${uuid}/plan`,
    payload
  );
  return res.data;
};
