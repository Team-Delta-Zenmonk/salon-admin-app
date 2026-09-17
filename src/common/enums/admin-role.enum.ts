export const ADMIN_ROLE = {
  SUPER_ADMIN: "super_admin",
  SUPPORT: "support",
  ADMIN: "admin",
} as const;

export type AdminRole = (typeof ADMIN_ROLE)[keyof typeof ADMIN_ROLE];

export const AdminRoleOptions = [
  { label: "Super Admin", value: ADMIN_ROLE.SUPER_ADMIN },
  { label: "Admin", value: ADMIN_ROLE.ADMIN },
  { label: "Support", value: ADMIN_ROLE.SUPPORT },
];
