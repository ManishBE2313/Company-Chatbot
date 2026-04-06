"use client";

import * as React from "react";
import { Button } from "@/components/ui/Button";
import { AsanaSpinner } from "@/components/ui/AsanaSpinner";
import { useHRCurrentUser } from "@/hooks/useHRData";
import { getTimesheetsForReview, reviewTimesheet } from "@/services/hrApiClient";
import { TimesheetReviewItem, TimesheetReviewResponse } from "@/types/hr";

function formatMonthLabel(value: string) {
  const [year, month] = value.split("-");
  if (!year || !month) return value;
  return new Date(Number(year), Number(month) - 1, 1).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function StatusBadge({ status }: { status: TimesheetReviewItem["status"] }) {
  const tone =
    status === "approved"
      ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
      : status === "rejected"
      ? "bg-rose-50 text-rose-700 ring-rose-200"
      : "bg-amber-50 text-amber-700 ring-amber-200";

  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize ring-1 ring-inset ${tone}`}>
      {status}
    </span>
  );
}

export default function HRTimesheetReviewPage() {
  const { user, isLoading: isUserLoading } = useHRCurrentUser();
  const isPrivileged = user?.role === "admin" || user?.role === "superadmin";
  const [data, setData] = React.useState<TimesheetReviewResponse | null>(null);
  const [selectedMonth, setSelectedMonth] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [busyTimesheetId, setBusyTimesheetId] = React.useState<string | null>(null);

  const loadTimesheets = React.useCallback(async (claimMonth?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getTimesheetsForReview(claimMonth);
      setData(response);
      setSelectedMonth(response.selectedMonth);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Failed to load timesheets.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    if (!isUserLoading && isPrivileged) {
      void loadTimesheets();
    } else if (!isUserLoading) {
      setIsLoading(false);
    }
  }, [isPrivileged, isUserLoading, loadTimesheets]);

  const handleMonthChange = async (event: React.ChangeEvent<HTMLSelectElement>) => {
    const nextMonth = event.target.value;
    setSelectedMonth(nextMonth);
    await loadTimesheets(nextMonth);
  };

  const handleReview = async (timesheetId: string, status: "approved" | "rejected") => {
    try {
      setBusyTimesheetId(timesheetId);
      await reviewTimesheet(timesheetId, status);
      await loadTimesheets(selectedMonth);
    } catch (reviewError) {
      setError(reviewError instanceof Error ? reviewError.message : "Failed to review timesheet.");
    } finally {
      setBusyTimesheetId(null);
    }
  };

  if (isUserLoading || isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <AsanaSpinner size="lg" />
      </div>
    );
  }

  if (!isPrivileged) {
    return (
      <div className="mx-auto max-w-4xl px-8 py-10">
        <div className="rounded-2xl border border-rose-100 bg-rose-50 px-6 py-5 text-sm text-rose-700">
          Only admin or superadmin users can review employee timesheets.
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-8 py-8">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-[24px] font-bold text-slate-900">Timesheet Review</h1>
          <p className="mt-1 text-[14px] text-slate-500">
            Review submitted timesheets for active employees by claim month.
          </p>
        </div>

        <div className="w-full max-w-xs">
          <label className="mb-2 block text-[12px] font-semibold uppercase tracking-[0.18em] text-slate-400">
            Active Month
          </label>
          <select
            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 shadow-sm outline-none focus:border-slate-400"
            value={selectedMonth}
            onChange={handleMonthChange}
          >
            {(data?.availableMonths || []).map((month) => (
              <option key={month} value={month}>
                {formatMonthLabel(month)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error ? (
        <div className="mb-6 rounded-2xl border border-rose-100 bg-rose-50 px-5 py-4 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      {!data || data.timesheets.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-8 py-16 text-center">
          <p className="text-[15px] font-semibold text-slate-700">No timesheets found</p>
          <p className="mt-2 text-sm text-slate-500">
            There are no active employee timesheets for {selectedMonth ? formatMonthLabel(selectedMonth) : "the selected month"}.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {data.timesheets.map((timesheet) => {
            const isBusy = busyTimesheetId === timesheet.id;

            return (
              <div key={timesheet.id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="text-[18px] font-semibold text-slate-900">{timesheet.employeeName || "Unknown employee"}</h2>
                      <StatusBadge status={timesheet.status} />
                    </div>
                    <p className="mt-1 text-sm text-slate-500">{timesheet.employeeEmail}</p>
                    <p className="mt-1 text-sm text-slate-500">
                      {timesheet.designation || "No designation"} • Week ending {formatDate(timesheet.weekEnding)}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
                    <div className="rounded-2xl bg-slate-50 px-4 py-3">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Month</p>
                      <p className="mt-1 font-semibold text-slate-800">{formatMonthLabel(timesheet.claimMonth)}</p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 px-4 py-3">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Total</p>
                      <p className="mt-1 font-semibold text-slate-800">{timesheet.totalHours} hrs</p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 px-4 py-3">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Average</p>
                      <p className="mt-1 font-semibold text-slate-800">{timesheet.averageHours.toFixed(1)} hrs</p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 px-4 py-3">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Entries</p>
                      <p className="mt-1 font-semibold text-slate-800">{timesheet.entries.length} days</p>
                    </div>
                  </div>
                </div>

                <div className="mt-5 overflow-x-auto">
                  <table className="min-w-full border-separate border-spacing-y-2">
                    <thead>
                      <tr className="text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                        <th className="px-3 py-2">Day</th>
                        <th className="px-3 py-2">Hours</th>
                      </tr>
                    </thead>
                    <tbody>
                      {timesheet.entries.map((entry) => (
                        <tr key={entry.id} className="rounded-2xl bg-slate-50 text-sm text-slate-700">
                          <td className="rounded-l-2xl px-3 py-3 font-medium">{entry.dayName}</td>
                          <td className="rounded-r-2xl px-3 py-3">{entry.hours}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-5 flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="text-sm text-slate-500">
                    {timesheet.remarks ? `Employee remarks: ${timesheet.remarks}` : "No employee remarks provided."}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      isLoading={isBusy}
                      disabled={isBusy || timesheet.status === "rejected"}
                      onClick={() => handleReview(timesheet.id, "rejected")}
                      className="border-rose-200 text-rose-700 hover:bg-rose-50"
                    >
                      Reject
                    </Button>
                    <Button
                      size="sm"
                      isLoading={isBusy}
                      disabled={isBusy || timesheet.status === "approved"}
                      onClick={() => handleReview(timesheet.id, "approved")}
                      className="bg-emerald-600 text-white hover:bg-emerald-700"
                    >
                      Approve
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
