"use client";

import { Button } from "@/components/ui/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { SurveyAnswerInput, SurveySummary, getSurveyTrustCopy } from "@/types/survey";
import { QuestionRenderer } from "./QuestionRenderer";
import { ArrowLeft, LockKeyhole, ShieldCheck } from "lucide-react";

interface SurveyResponderProps {
  survey: SurveySummary;
  answers: Record<string, SurveyAnswerInput>;
  onAnswerChange: (answer: SurveyAnswerInput) => void;
  onSubmit: () => void;
  onBack: () => void;
  isSubmitting?: boolean;
}

export function SurveyResponder({
  survey,
  answers,
  onAnswerChange,
  onSubmit,
  onBack,
  isSubmitting = false,
}: SurveyResponderProps) {
  const canSubmit = (survey.questions ?? []).every((question) => {
    const answer = answers[question.id];

    if (!answer) {
      return false;
    }

    if (question.type === "text") {
      return Boolean(answer.text?.trim());
    }

    if (question.type === "mcq") {
      return Boolean(answer.optionId);
    }

    return typeof answer.rating === "number";
  });

  return (
    <div className="px-6 py-8 lg:px-10">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex items-center justify-between gap-3">
          <Button variant="ghost" className="rounded-2xl" onClick={onBack}>
            <ArrowLeft size={14} className="mr-2" />
            Back to Surveys
          </Button>
        </div>

        <Card className="rounded-[32px] border-slate-200 bg-white shadow-sm">
          <CardHeader className="space-y-4 border-b border-slate-100 pb-6">
            <div className="flex items-start gap-3 rounded-3xl border border-sky-100 bg-sky-50 p-5">
              <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-sky-600 shadow-sm">
                {survey.surveyType === "ANONYMOUS" ? <ShieldCheck size={18} /> : <LockKeyhole size={18} />}
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-600">
                  {survey.surveyType === "ANONYMOUS" ? "True Anonymous" : "Confidential"}
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-700">{getSurveyTrustCopy(survey.surveyType)}</p>
              </div>
            </div>

            <div>
              <CardTitle className="text-2xl text-slate-950">{survey.title}</CardTitle>
              <CardDescription className="mt-2 text-sm leading-6 text-slate-500">
                {survey.description || "Take a few minutes to answer each question carefully."}
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-5 pt-6">
            {(survey.questions ?? []).map((question, index) => (
              <div key={question.id} className="rounded-[28px] border border-slate-100 bg-slate-50/60 p-5">
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Question {index + 1}</p>
                <QuestionRenderer
                  question={question}
                  value={answers[question.id]}
                  onChange={onAnswerChange}
                  disabled={survey.alreadySubmitted}
                />
              </div>
            ))}

            <div className="flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-slate-500">
                {survey.alreadySubmitted
                  ? "This survey has already been submitted from your account or anonymous session."
                  : "Managers will only see aggregated reporting, never individual answer cards."}
              </p>
              <Button
                className="rounded-2xl bg-sky-600 px-5 text-white hover:bg-sky-700"
                isLoading={isSubmitting}
                disabled={!canSubmit || survey.alreadySubmitted}
                onClick={onSubmit}
              >
                {survey.alreadySubmitted ? "Already Submitted" : "Submit Survey"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
