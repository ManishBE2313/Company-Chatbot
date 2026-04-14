"use client";

import { Button } from "@/components/ui/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { SurveyStatusBadge } from "./SurveyStatusBadge";
import { SurveyAdminFilters, SurveySummary } from "@/types/survey";
import { CalendarDays, ClipboardList, Filter } from "lucide-react";

interface SurveyDashboardProps {
  surveys: SurveySummary[];
  filters: SurveyAdminFilters;
  onFiltersChange: (filters: Partial<SurveyAdminFilters>) => void;
  onCreateNewSurvey: () => void;
  isLoading?: boolean;
}

export function SurveyDashboard({
  surveys,
  filters,
  onFiltersChange,
  onCreateNewSurvey,
  isLoading = false,
}: SurveyDashboardProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-500">Survey workspace</p>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950">Keep the survey program calm, clear, and trustworthy.</h1>
          <p className="max-w-3xl text-sm leading-6 text-slate-500">
            Draft surveys in Redux, publish the ready ones to the backend, and give HR a single place to monitor participation.
          </p>
        </div>

        <Button className="h-11 rounded-2xl bg-sky-600 px-5 text-white hover:bg-sky-700" onClick={onCreateNewSurvey}>
          Create New Survey
        </Button>
      </div>

      <Card className="rounded-[28px] border-slate-200 bg-white shadow-sm">
        <CardHeader className="flex flex-col gap-4 border-b border-slate-100 pb-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <CardTitle className="text-lg text-slate-950">Survey dashboard</CardTitle>
            <CardDescription className="text-slate-500">Filter active programs, monitor upcoming launches, and keep published surveys visible.</CardDescription>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <label className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
              <Filter size={14} />
              <select
                value={filters.status}
                onChange={(event) => onFiltersChange({ status: event.target.value as SurveyAdminFilters["status"] })}
                className="bg-transparent outline-none"
              >
                <option value="ALL">All statuses</option>
                <option value="Draft">Draft</option>
                <option value="Upcoming">Upcoming</option>
                <option value="Active">Active</option>
                <option value="Expired">Expired</option>
                <option value="Submitted">Submitted</option>
              </select>
            </label>

            <label className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
              <ClipboardList size={14} />
              <select
                value={filters.type}
                onChange={(event) => onFiltersChange({ type: event.target.value as SurveyAdminFilters["type"] })}
                className="bg-transparent outline-none"
              >
                <option value="ALL">All types</option>
                <option value="ANONYMOUS">Anonymous</option>
                <option value="ATTRIBUTED">Normal</option>
              </select>
            </label>
          </div>
        </CardHeader>

        <CardContent className="px-0">
          {isLoading ? (
            <div className="px-6 py-16 text-center text-sm text-slate-500">Loading surveys...</div>
          ) : surveys.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <p className="text-base font-semibold text-slate-800">No surveys match the current filters.</p>
              <p className="mt-2 text-sm text-slate-500">Create a new survey draft to get your next listening program moving.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {surveys.map((survey) => (
                <div key={survey.id} className="grid gap-4 px-6 py-5 lg:grid-cols-[minmax(0,1.6fr)_180px_180px_160px] lg:items-center">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="text-sm font-semibold text-slate-900">{survey.title}</h2>
                      <SurveyStatusBadge status={survey.status} />
                    </div>
                    <p className="text-sm text-slate-500">
                      {survey.surveyType === "ANONYMOUS" ? "True Anonymous" : "Normal Confidential"}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <CalendarDays size={14} className="text-slate-400" />
                    <span>{new Date(survey.startAt).toLocaleDateString()}</span>
                  </div>

                  <div className="text-sm text-slate-500">
                    {survey.isForAllDepartments
                      ? "All Company"
                      : survey.departments?.map((department) => department.name).join(", ") || "Selected departments"}
                  </div>

                  <div className="text-sm font-medium text-slate-600">
                    {survey.questions?.length ?? 0} questions
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
