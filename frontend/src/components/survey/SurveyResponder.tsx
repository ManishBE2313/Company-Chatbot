"use client";

import { Button } from "@/components/ui/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { SurveyAnswerInput, SurveySummary } from "@/types/survey";
import { QuestionRenderer } from "./QuestionRenderer";
import { SurveyTrustBanner } from "./SurveyTrustBanner";
import { SurveyTypeBadge } from "./SurveyTypeBadge";
import { ArrowLeft, CheckCircle2 } from "lucide-react";

interface SurveyResponderProps {
  survey: SurveySummary;
  answers: Record<string, SurveyAnswerInput>;
  canSubmit?: boolean;
  onAnswerChange: (answer: SurveyAnswerInput) => void;
  onSubmit: () => void;
  onBack: () => void;
  isSubmitting?: boolean;
}

export function SurveyResponder({
  survey,
  answers,
  canSubmit = false,
  onAnswerChange,
  onSubmit,
  onBack,
  isSubmitting = false,
}: SurveyResponderProps) {
  const questionCount = survey.questions?.length ?? 0;

  return (
    <div className="min-h-full bg-slate-50 px-6 py-8 lg:px-10">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex items-center justify-between gap-4">
          <Button variant="ghost" className="rounded-2xl" onClick={onBack}>
            <ArrowLeft size={14} className="mr-2" />
            Back to Surveys
          </Button>
          <SurveyTypeBadge surveyType={survey.surveyType} />
        </div>

        <Card className="rounded-[32px] border-slate-200 bg-white shadow-sm">
          <CardHeader className="space-y-5 border-b border-slate-100 pb-8">
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-500">
                Employee survey
              </p>
              <CardTitle className="text-3xl font-semibold tracking-tight text-slate-950">
                {survey.title}
              </CardTitle>
              <CardDescription className="max-w-3xl text-sm leading-6 text-slate-500">
                {survey.description || "Take a few minutes to share thoughtful, complete feedback on each question below."}
              </CardDescription>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Questions</p>
                <p className="mt-2 text-2xl font-semibold text-slate-950">{questionCount}</p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Window closes</p>
                <p className="mt-2 text-base font-semibold text-slate-950">
                  {new Date(survey.endAt).toLocaleDateString()}
                </p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Status</p>
                <p className="mt-2 text-base font-semibold text-slate-950">{survey.status}</p>
              </div>
            </div>

            <SurveyTrustBanner surveyType={survey.surveyType} />

            {survey.alreadySubmitted ? (
              <div className="flex items-start gap-3 rounded-[28px] border border-emerald-200 bg-emerald-50 px-5 py-4 text-emerald-800">
                <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold">Responses already recorded</p>
                  <p className="mt-1 text-sm leading-6">
                    This survey has already been submitted from your current session, so the answers are shown as read-only.
                  </p>
                </div>
              </div>
            ) : null}
          </CardHeader>

          <CardContent className="space-y-5 pt-8">
            {(survey.questions ?? []).map((question, index) => (
              <div key={question.id} className="rounded-[28px] border border-slate-200 bg-slate-50/70 p-6">
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                  Question {index + 1}
                </p>
                <QuestionRenderer
                  question={question}
                  value={answers[question.id]}
                  onChange={onAnswerChange}
                  disabled={survey.alreadySubmitted}
                />
              </div>
            ))}

            <div className="flex flex-col gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-slate-500">
                {survey.alreadySubmitted
                  ? "No further action is needed."
                  : "All questions are required before responses can be submitted."}
              </p>
              <Button
                className="h-11 rounded-2xl bg-sky-600 px-6 text-white hover:bg-sky-700"
                onClick={onSubmit}
                isLoading={isSubmitting}
                disabled={!canSubmit || survey.alreadySubmitted}
              >
                Submit Responses
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
