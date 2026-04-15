"use client";

import { Button } from "@/components/ui/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { SurveySummary } from "@/types/survey";
import { SurveyStatusBadge } from "./SurveyStatusBadge";
import { ArrowRight, CalendarDays, LockKeyhole, ShieldCheck } from "lucide-react";

interface EmployeeSurveyListProps {
  surveys: SurveySummary[];
  isLoading?: boolean;
  onOpenSurvey: (surveyId: string) => void;
}

export function EmployeeSurveyList({
  surveys,
  isLoading = false,
  onOpenSurvey,
}: EmployeeSurveyListProps) {
  return (
    <div className="space-y-6 px-6 py-8 lg:px-10">
      <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-500">Employee surveys</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">Share feedback with context, trust, and very little friction.</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-500">
          Active surveys show up here with transparent anonymity messaging so people know exactly how their responses will be handled.
        </p>
      </div>

      {isLoading ? (
        <Card className="rounded-[28px] border-slate-200 bg-white shadow-sm">
          <CardContent className="py-14 text-center text-sm text-slate-500">Loading your surveys...</CardContent>
        </Card>
      ) : surveys.length === 0 ? (
        <Card className="rounded-[28px] border-slate-200 bg-white shadow-sm">
          <CardContent className="py-14 text-center">
            <p className="text-base font-semibold text-slate-900">Nothing needs your input right now.</p>
            <p className="mt-2 text-sm text-slate-500">New surveys will appear here when HR schedules them for your audience.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-5 xl:grid-cols-2">
          {surveys.map((survey) => (
            <Card key={survey.id} className="rounded-[28px] border-slate-200 bg-white shadow-sm">
              <CardHeader className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <SurveyStatusBadge status={survey.status} />
                  <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                    {survey.surveyType === "ANONYMOUS" ? "True Anonymous" : "Confidential"}
                  </span>
                </div>
                <div>
                  <CardTitle className="text-xl text-slate-950">{survey.title}</CardTitle>
                  <CardDescription className="mt-2 text-sm leading-6 text-slate-500">
                    {survey.description || "A focused listening check-in from HR."}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
                    <div className="flex items-center gap-2 font-medium text-slate-700">
                      <CalendarDays size={14} />
                      Schedule
                    </div>
                    <p className="mt-2">{new Date(survey.startAt).toLocaleDateString()} to {new Date(survey.endAt).toLocaleDateString()}</p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
                    <div className="flex items-center gap-2 font-medium text-slate-700">
                      {survey.surveyType === "ANONYMOUS" ? <ShieldCheck size={14} /> : <LockKeyhole size={14} />}
                      Privacy model
                    </div>
                    <p className="mt-2">{survey.surveyType === "ANONYMOUS" ? "Identity stripped before reporting" : "Confidential and aggregated for managers"}</p>
                  </div>
                </div>

                <Button
                  className="h-11 w-full rounded-2xl bg-sky-600 text-white hover:bg-sky-700"
                  onClick={() => onOpenSurvey(survey.id)}
                  disabled={survey.status === "Submitted" || survey.status === "Expired"}
                >
                  {survey.status === "Submitted" ? "Already Submitted" : survey.status === "Expired" ? "Survey Closed" : "Open Survey"}
                  <ArrowRight size={14} className="ml-2" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
