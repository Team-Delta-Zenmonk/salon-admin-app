import { axiosInstance } from "@/config/axios";
import type { ExtendSalonDurationPayload, ExtendSalonDurationResponse } from "./extend-salon-duration.type";

export const extendSalonDurationService = async (
  uuid: string,
  payload: ExtendSalonDurationPayload
): Promise<ExtendSalonDurationResponse> => {
  const res = await axiosInstance.patch<ExtendSalonDurationResponse>(
    `/admin/salons/${uuid}/plan`,
    payload
  );
  return res.data;
};

export type { ExtendSalonDurationPayload, ExtendSalonDurationResponse };
