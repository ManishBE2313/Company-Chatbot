"use client";

import { Button } from "@/components/ui/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { SurveyAdminFilters, SurveySummary } from "@/types/survey";
import { SurveyStatusBadge } from "./SurveyStatusBadge";
import { SurveyTypeBadge } from "./SurveyTypeBadge";
import { Activity, BarChart3, ClipboardList, Filter, Users } from "lucide-react";

interface SurveyDashboardProps {
  surveys: SurveySummary[];
  filters: SurveyAdminFilters;
  onFiltersChange: (filters: Partial<SurveyAdminFilters>) => void;
  onCreateNewSurvey: () => void;
  onOpenAnalytics: (surveyId: string) => void;
  isLoading?: boolean;
}

export function SurveyDashboard({
  surveys,
  filters,
  onFiltersChange,
  onCreateNewSurvey,
  onOpenAnalytics,
  isLoading = false,
}: SurveyDashboardProps) {
  const activeCount = surveys.filter((survey) => survey.status === "Active").length;
  const anonymousCount = surveys.filter((survey) => survey.surveyType === "ANONYMOUS").length;
  const upcomingCount = surveys.filter((survey) => survey.status === "Upcoming").length;

  return (
    <div className="space-y-6">
      <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm lg:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-500">Survey workspace</p>
            <h1 className="max-w-3xl text-3xl font-semibold tracking-tight text-slate-950">
              Keep listening programs calm, trustworthy, and measurable.
            </h1>
            <p className="max-w-3xl text-sm leading-6 text-slate-500">
              Launch HR surveys with clear confidentiality framing, then move straight into response health and analytics without leaving the module.
            </p>
          </div>

          <Button className="h-11 rounded-2xl bg-sky-600 px-5 text-white hover:bg-sky-700" onClick={onCreateNewSurvey}>
            Create New Survey
          </Button>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-[28px] border border-slate-200 bg-slate-50 px-5 py-4">
            <div className="flex items-center gap-3 text-slate-500">
              <Activity size={16} />
              <span className="text-xs uppercase tracking-[0.18em]">Active now</span>
            </div>
            <p className="mt-3 text-3xl font-semibold text-slate-950">{activeCount}</p>
          </div>
          <div className="rounded-[28px] border border-slate-200 bg-slate-50 px-5 py-4">
            <div className="flex items-center gap-3 text-slate-500">
              <Users size={16} />
              <span className="text-xs uppercase tracking-[0.18em]">Anonymous programs</span>
            </div>
            <p className="mt-3 text-3xl font-semibold text-slate-950">{anonymousCount}</p>
          </div>
          <div className="rounded-[28px] border border-slate-200 bg-slate-50 px-5 py-4">
            <div className="flex items-center gap-3 text-slate-500">
              <BarChart3 size={16} />
              <span className="text-xs uppercase tracking-[0.18em]">Upcoming launches</span>
            </div>
            <p className="mt-3 text-3xl font-semibold text-slate-950">{upcomingCount}</p>
          </div>
        </div>
      </div>

      <Card className="rounded-[28px] border-slate-200 bg-white shadow-sm">
        <CardHeader className="flex flex-col gap-4 border-b border-slate-100 pb-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <CardTitle className="text-lg text-slate-950">Program dashboard</CardTitle>
            <CardDescription className="text-slate-500">
              Filter survey programs, spot what is live, and jump directly into analytics for each rollout.
            </CardDescription>
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
                <option value="ATTRIBUTED">Confidential</option>
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
                <div key={survey.id} className="grid gap-5 px-6 py-5 lg:grid-cols-[minmax(0,1.8fr)_220px_220px_180px] lg:items-center">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <SurveyStatusBadge status={survey.status} />
                      <SurveyTypeBadge surveyType={survey.surveyType} />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-950">{survey.title}</h3>
                      <p className="mt-1 text-sm leading-6 text-slate-500">
                        {survey.description || "Survey details and analytics are available from this workspace."}
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Launch window</p>
                    <p className="mt-2 text-sm font-medium text-slate-700">
                      {new Date(survey.startAt).toLocaleDateString()} to {new Date(survey.endAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Audience</p>
                    <p className="mt-2 text-sm font-medium text-slate-700">
                      {survey.isForAllDepartments
                        ? "All departments"
                        : `${survey.departments?.length ?? 0} departments`}
                    </p>
                  </div>

                  <div className="flex justify-start lg:justify-end">
                    <Button
                      variant="outline"
                      className="rounded-2xl border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                      onClick={() => onOpenAnalytics(survey.id)}
                    >
                      Open Analytics
                    </Button>
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
