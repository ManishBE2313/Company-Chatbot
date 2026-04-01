export const DEFAULT_ORGANIZATION_ID = "00000000-0000-0000-0000-000000000001";
export const DEFAULT_ORGANIZATION_NAME = "Novixer";

export const PRIMARY_ROLE_RANK = [
  "superadmin",
  "admin",
  "interviewer",
  "user",
] as const;

export const ASSIGNABLE_ROLE_NAMES = [
  "superadmin",
  "admin",
  "interviewer",
  "hm",
  "hrbp",
  "finance",
  "executive",
  "rmg",
  "employee",
] as const;

export type AssignableRoleName = (typeof ASSIGNABLE_ROLE_NAMES)[number];
