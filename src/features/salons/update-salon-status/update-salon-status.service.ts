import { axiosInstance } from "@/config/axios";
import type { SalonItem } from "../list-salons/list-salons.service";

export interface UpdateSalonStatusPayload {
  is_active?: boolean;
  subscription_status?: string;
}

export interface UpdateSalonStatusResponse {
  message: string;
  salon: Partial<SalonItem>;
}

export const updateSalonStatusService = async (
  uuid: string,
  payload: UpdateSalonStatusPayload
): Promise<UpdateSalonStatusResponse> => {
  const res = await axiosInstance.patch<UpdateSalonStatusResponse>(
    `/admin/salons/${uuid}/status`,
    payload
  );
  return res.data;
};
