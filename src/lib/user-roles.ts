export const USER_ROLE = {
  ADMIN: "admin",
  USER: "user",
  AFFILIATE: "affiliate",
} as const;

export type UserRole = (typeof USER_ROLE)[keyof typeof USER_ROLE];

export function isAffiliateRole(role: string | null | undefined): boolean {
  return role === USER_ROLE.AFFILIATE;
}

export function getDashboardPathForRole(role: string | null | undefined): string {
  if (role === USER_ROLE.ADMIN) return "/admin/dashboard";
  if (role === USER_ROLE.AFFILIATE) return "/affiliate/dashboard";
  return "/app";
}
