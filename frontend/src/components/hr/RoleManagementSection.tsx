"use client";

import * as React from "react";
import { AsanaSpinner } from "@/components/ui/AsanaSpinner";
import { Button } from "@/components/ui/Button";
import { getAssignableRoles, getEmployeesForRoleManagement, updateEmployeeRoles } from "@/services/hrApiClient";
import { EmployeeListItem, RoleOption, UserRole } from "@/types/hr";
import { ShieldCheck, UserCog } from "lucide-react";

interface RoleManagementSectionProps {
  currentUserEmail: string;
  currentUserRole: UserRole;
}

function canEditAdminRoles(currentUserRole: UserRole) {
  return currentUserRole === "superadmin";
}

export default function RoleManagementSection({ currentUserEmail, currentUserRole }: RoleManagementSectionProps) {
  const [employees, setEmployees] = React.useState<EmployeeListItem[]>([]);
  const [roles, setRoles] = React.useState<RoleOption[]>([]);
  const [drafts, setDrafts] = React.useState<Record<string, string[]>>({});
  const [isLoading, setIsLoading] = React.useState(true);
  const [savingEmployeeId, setSavingEmployeeId] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [employeeData, roleData] = await Promise.all([
        getEmployeesForRoleManagement(currentUserEmail),
        getAssignableRoles(currentUserEmail),
      ]);

      setEmployees(employeeData);
      setRoles(roleData);
      setDrafts(
        Object.fromEntries(
          employeeData.map((employee) => [employee.id, employee.roles.length > 0 ? employee.roles : ["employee"]])
        )
      );
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : "Failed to load role management data.");
    } finally {
      setIsLoading(false);
    }
  }, [currentUserEmail]);

  React.useEffect(() => {
    void load();
  }, [load]);

  const toggleRole = (employeeId: string, roleName: string) => {
    setDrafts((current) => {
      const currentRoles = current[employeeId] || [];
      const exists = currentRoles.includes(roleName);
      const nextRoles = exists
        ? currentRoles.filter((role) => role !== roleName)
        : [...currentRoles, roleName];

      return {
        ...current,
        [employeeId]: nextRoles.length > 0 ? nextRoles : ["employee"],
      };
    });
  };

  const saveRoles = async (employeeId: string) => {
    const selectedRoles = drafts[employeeId] || ["employee"];
    setSavingEmployeeId(employeeId);
    setError(null);

    try {
      await updateEmployeeRoles(currentUserEmail, employeeId, selectedRoles);
      await load();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Failed to update employee roles.");
    } finally {
      setSavingEmployeeId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center rounded-3xl border border-slate-200 bg-white px-6 py-10 text-slate-400 shadow-sm">
        <AsanaSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-indigo-500">Access Control</p>
          <h2 className="mt-2 text-[18px] font-semibold text-slate-800">Role Management</h2>
          <p className="mt-1 text-[13px] text-slate-400">
            Admin and superadmin can manage business roles. Only superadmin can grant admin or superadmin access.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-2xl bg-slate-50 px-4 py-2 text-[12px] font-semibold text-slate-600">
          <UserCog size={14} />
          {currentUserRole === "superadmin" ? "Superadmin access" : "Admin access"}
        </div>
      </div>

      {error && <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-700">{error}</div>}

      <div className="space-y-4">
        {employees.map((employee) => {
          const selectedRoles = drafts[employee.id] || employee.roles || ["employee"];
          const isPrivilegedTarget = selectedRoles.includes("admin") || selectedRoles.includes("superadmin") || employee.roles.includes("admin") || employee.roles.includes("superadmin");
          const saveDisabled = !canEditAdminRoles(currentUserRole) && isPrivilegedTarget;

          return (
            <div key={employee.id} className="rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-[15px] font-semibold text-slate-800">
                      {employee.firstName} {employee.lastName ?? ""}
                    </h3>
                    <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-[11px] font-semibold text-indigo-700">
                      Primary: {employee.role}
                    </span>
                    {employee.department?.name && (
                      <span className="rounded-full bg-slate-200 px-2.5 py-1 text-[11px] font-medium text-slate-600">
                        {employee.department.name}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-[13px] text-slate-500">{employee.email}</p>
                </div>

                <div className="inline-flex items-center gap-2 rounded-2xl bg-white px-3 py-2 text-[12px] text-slate-500">
                  <ShieldCheck size={14} className="text-indigo-500" />
                  Status: {employee.status}
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {roles.map((role) => {
                  const selected = selectedRoles.includes(role.name);
                  const disabled = !canEditAdminRoles(currentUserRole) && (role.name === "admin" || role.name === "superadmin");

                  return (
                    <button
                      key={role.id}
                      type="button"
                      onClick={() => !disabled && toggleRole(employee.id, role.name)}
                      className={selected
                        ? disabled
                          ? "rounded-full border border-indigo-200 bg-indigo-100 px-3 py-1.5 text-[12px] font-semibold text-indigo-500 opacity-70"
                          : "rounded-full border border-indigo-200 bg-indigo-100 px-3 py-1.5 text-[12px] font-semibold text-indigo-700"
                        : disabled
                        ? "rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[12px] text-slate-300"
                        : "rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[12px] text-slate-600 transition-colors hover:border-indigo-200 hover:text-indigo-700"}
                      disabled={disabled}
                    >
                      {role.name}
                    </button>
                  );
                })}
              </div>

              <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-[12px] text-slate-400">
                  {saveDisabled
                    ? "Only superadmin can change admin or superadmin access."
                    : "Changes update both multi-role assignments and the employee's primary access role."}
                </p>
                <Button
                  size="sm"
                  className="bg-indigo-600 text-white hover:bg-indigo-700"
                  onClick={() => void saveRoles(employee.id)}
                  isLoading={savingEmployeeId === employee.id}
                  disabled={saveDisabled}
                >
                  Save Roles
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
