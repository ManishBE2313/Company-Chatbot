import { PRIMARY_ROLE_RANK } from "../constants/system";
import { UserRole } from "../../models/user";

export function normalizePrimaryRole(roleNames: string[]): UserRole {
  for (const role of PRIMARY_ROLE_RANK) {
    if (roleNames.includes(role)) {
      return role;
    }
  }

  return "user";
}

export function canAssignRoles(actingRole: UserRole, targetRoleNames: string[]) {
  if (actingRole === "superadmin") {
    return true;
  }

  if (actingRole !== "admin") {
    return false;
  }

  return !targetRoleNames.includes("admin") && !targetRoleNames.includes("superadmin");
}
