import { axiosInstance } from "@/config/axios";
import type { AdminRole } from "@/common/enums/admin-role.enum";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AdminUser {
  uuid: string;
  name: string;
  email: string;
  role: AdminRole;
  is_active?: boolean;
}

export interface LoginResponse {
  token: string;
  admin: AdminUser;
}

export const loginAdminService = async (payload: LoginPayload): Promise<LoginResponse> => {
  const res = await axiosInstance.post<LoginResponse>("/admin/auth/login", payload);
  return res.data;
};
