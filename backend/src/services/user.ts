import Errors from "../errors";
import { CatalogRepository, UserRepository } from "../repositories/user";
import { UserRole } from "../../models/user";
import { canAssignRoles, normalizePrimaryRole } from "../utils/roleManagement";

export interface SyncUserLoginPayload {
  email: string;
  firstName?: string | null;
  lastName?: string | null;
}

export interface SyncUserFromAuthPayload {
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  role?: UserRole | null;
}

export class UserService {
  public static async syncUserLogin(payload: SyncUserLoginPayload) {
    return UserRepository.upsertUser(payload);
  }

  public static async syncUserFromCentralAuth(payload: SyncUserFromAuthPayload) {
    const result = await UserRepository.syncFromAuthClaims({
      email: payload.email,
      firstName: payload.firstName,
      lastName: payload.lastName,
      role: payload.role || "user",
      preserveExistingRole: true,
    });

    const assignedRoles = await UserRepository.findAssignedRoleNames(result.user.id);
    const roleNames = assignedRoles.length
      ? assignedRoles
      : [result.user.role === "user" ? "employee" : result.user.role, "employee"];

    await UserRepository.ensureRoleAssignments(result.user.id, roleNames);
    const refreshedRoleNames = await UserRepository.findAssignedRoleNames(result.user.id);

    if (!refreshedRoleNames.length && result.user.role === "user") {
      result.user.role = "user";
      await result.user.save();
    } else if (refreshedRoleNames.length) {
      result.user.role = normalizePrimaryRole(refreshedRoleNames);
      await result.user.save();
    }

    return {
      user: result.user,
      roles: await UserRepository.findAssignedRoleNames(result.user.id),
      created: result.created,
    };
  }

  public static async getUserRoleByEmail(email: string): Promise<UserRole> {
    return UserRepository.findRoleByEmail(email);
  }

  public static async getEligibleInterviewers() {
    const interviewers = await UserRepository.findEligibleInterviewers();
    return interviewers || [];
  }

  public static async listEmployeesWithRoles() {
    const employees = await UserRepository.listEmployeesWithRoles() as any[];

    return employees.map((employee) => ({
      id: employee.id,
      firstName: employee.firstName,
      lastName: employee.lastName,
      email: employee.email,
      role: employee.role,
      status: employee.status,
      department: employee.department
        ? {
            id: employee.department.id,
            name: employee.department.name,
          }
        : null,
      roles: (employee.roleAssignments || [])
        .map((assignment: any) => assignment.role?.name)
        .filter(Boolean),
    }));
  }

  public static async listAssignableRoles() {
    const roles = await UserRepository.listAssignableRoles() as any[];

    return roles.map((role) => ({
      id: role.id,
      name: role.name,
      description: role.description,
    }));
  }

  public static async updateEmployeeRoles(
    targetUserId: string,
    roleNames: string[],
    actingUserEmail: string
  ) {
    const actingUser = await UserRepository.findByEmail(actingUserEmail);
    if (!actingUser) {
      throw new Errors.BadRequestError("Acting user not found.");
    }

    if (!canAssignRoles(actingUser.role as UserRole, roleNames)) {
      throw new Errors.UnauthorizedError("You are not allowed to assign the requested roles.");
    }

    const targetUser = await UserRepository.findById(targetUserId);
    if (!targetUser) {
      throw new Errors.BadRequestError("Employee not found.");
    }

    const uniqueRoleNames = Array.from(new Set(roleNames));
    const roles = await UserRepository.findRolesByNames(uniqueRoleNames) as any[];

    if (roles.length !== uniqueRoleNames.length) {
      throw new Errors.BadRequestError("One or more roles are invalid.");
    }

    await UserRepository.replaceRoles(targetUserId, roles.map((role) => role.id));

    const normalizedRole = normalizePrimaryRole(uniqueRoleNames);
    targetUser.role = normalizedRole;
    await targetUser.save();

    const assignedRoles = await UserRepository.findAssignedRoleNames(targetUserId);

    return {
      id: targetUser.id,
      email: targetUser.email,
      role: targetUser.role,
      roles: assignedRoles,
    };
  }
}

export class CatalogService {
  public static async getJobCreationCatalog() {
    return CatalogRepository.getJobCreationCatalog();
  }
}