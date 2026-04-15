"use client";

import * as React from "react";
import { Button } from "@/components/ui/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import {
  SurveyAggregatedData,
  SurveyIndividualResponse,
  SurveySummary,
  SurveyTextComment,
} from "@/types/survey";
import { SurveyStatusBadge } from "./SurveyStatusBadge";
import { SurveyTypeBadge } from "./SurveyTypeBadge";
import { SurveyAnalyticsBarChart } from "./SurveyAnalyticsBarChart";
import {
  ArrowLeft,
  Lock,
  MessageSquareQuote,
  ShieldCheck,
  Users,
} from "lucide-react";

interface SurveyAnalyticsProps {
  survey: SurveySummary;
  aggregatedData: SurveyAggregatedData;
  individualResponses: SurveyIndividualResponse[];
  responseCount: number;
  minimumResponseThreshold: number;
  onBack: () => void;
}

function formatDate(value?: string | null) {
  if (!value) {
    return "Not available";
  }

  return new Date(value).toLocaleString();
}

function shuffleComments(comments: SurveyTextComment[]) {
  return [...comments]
    .map((comment) => ({
      comment,
      weight: comment.text
        .split("")
        .reduce((total, character) => total + character.charCodeAt(0), 0),
    }))
    .sort((left, right) => left.weight - right.weight)
    .map((item) => item.comment);
}

export function SurveyAnalytics({
  survey,
  aggregatedData,
  individualResponses,
  responseCount,
  minimumResponseThreshold,
  onBack,
}: SurveyAnalyticsProps) {
  const [activeView, setActiveView] = React.useState<"aggregated" | "individual">("aggregated");
  const [selectedResponseId, setSelectedResponseId] = React.useState<string | null>(
    individualResponses[0]?.responseId ?? null
  );
  const [showIdentity, setShowIdentity] = React.useState(false);

  React.useEffect(() => {
    setSelectedResponseId(individualResponses[0]?.responseId ?? null);
  }, [individualResponses]);

  const isAnonymous = survey.surveyType === "ANONYMOUS";
  const isThresholdBlocked = isAnonymous && responseCount < minimumResponseThreshold;

  const ratingQuestions = aggregatedData.questions.filter(
    (question) => question.type === "rating"
  );

  const averageRating =
    aggregatedData.averageRating ??
    (ratingQuestions.length > 0
      ? ratingQuestions.reduce(
          (total, question) => total + (question.averageRating ?? 0),
          0
        ) / ratingQuestions.length
      : null);

  const textComments = aggregatedData.questions.flatMap(
    (question) => question.comments
  );

  const orderedComments = React.useMemo(
    () => (isAnonymous ? shuffleComments(textComments) : textComments),
    [isAnonymous, textComments]
  );

  const selectedResponse =
    individualResponses.find((response) => response.responseId === selectedResponseId) ?? null;

  return (
    <div className="min-h-full bg-slate-50 px-6 py-8 lg:px-10">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex items-center justify-between gap-4">
          <Button variant="ghost" className="rounded-2xl" onClick={onBack}>
            <ArrowLeft size={14} className="mr-2" />
            Back to Survey Workspace
          </Button>
          <div className="flex flex-wrap items-center gap-2">
            <SurveyStatusBadge status={survey.status} />
            <SurveyTypeBadge surveyType={survey.surveyType} />
          </div>
        </div>

        <Card className="rounded-[32px] border-slate-200 bg-white shadow-sm">
          <CardHeader className="space-y-5 border-b border-slate-100 pb-8">
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-500">
                Survey analytics
              </p>
              <CardTitle className="text-3xl font-semibold tracking-tight text-slate-950">
                {survey.title}
              </CardTitle>
              <CardDescription className="max-w-3xl text-sm leading-6 text-slate-500">
                Review participation, trend lines, and respondent detail with the right visibility controls for the survey type.
              </CardDescription>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
              <div className="rounded-[28px] border border-slate-200 bg-slate-50 px-5 py-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Responses</p>
                <p className="mt-2 text-3xl font-semibold text-slate-950">{responseCount}</p>
              </div>
              <div className="rounded-[28px] border border-slate-200 bg-slate-50 px-5 py-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Average rating</p>
                <p className="mt-2 text-3xl font-semibold text-slate-950">
                  {averageRating ? averageRating.toFixed(1) : "-"}
                </p>
              </div>
              <div className="rounded-[28px] border border-slate-200 bg-slate-50 px-5 py-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Questions tracked</p>
                <p className="mt-2 text-3xl font-semibold text-slate-950">
                  {aggregatedData.questions.length}
                </p>
              </div>
              <div className="rounded-[28px] border border-slate-200 bg-slate-50 px-5 py-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Visibility rule</p>
                <p className="mt-2 text-base font-semibold text-slate-950">
                  {isAnonymous
                    ? `Aggregate only after ${minimumResponseThreshold}`
                    : "HR drill-down enabled"}
                </p>
              </div>
            </div>
          </CardHeader>
        </Card>

        {isThresholdBlocked ? (
          <Card className="rounded-[32px] border-amber-200 bg-amber-50 shadow-sm">
            <CardContent className="flex flex-col items-center justify-center gap-4 px-8 py-14 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-white text-amber-600 shadow-sm">
                <Lock size={22} />
              </div>
              <div className="space-y-2">
                <p className="text-2xl font-semibold text-slate-950">Results Hidden</p>
                <p className="max-w-2xl text-sm leading-6 text-slate-600">
                  To protect employee anonymity, data is not displayed until a minimum of {minimumResponseThreshold} responses are collected.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex rounded-2xl border border-slate-200 bg-white p-1 shadow-sm">
                <button
                  type="button"
                  onClick={() => setActiveView("aggregated")}
                  className={`rounded-xl px-4 py-2 text-sm font-medium ${
                    activeView === "aggregated"
                      ? "bg-slate-900 text-white"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  Aggregated View
                </button>
                {!isAnonymous ? (
                  <button
                    type="button"
                    onClick={() => setActiveView("individual")}
                    className={`rounded-xl px-4 py-2 text-sm font-medium ${
                      activeView === "individual"
                        ? "bg-slate-900 text-white"
                        : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    Individual Responses
                  </button>
                ) : null}
              </div>

              {!isAnonymous && (activeView === "individual" || orderedComments.length > 0) ? (
                <Button
                  variant="outline"
                  className="rounded-2xl border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  onClick={() => setShowIdentity((current) => !current)}
                >
                  {showIdentity ? "Hide identity" : "Reveal identity"}
                </Button>
              ) : null}
            </div>

            {activeView === "aggregated" ? (
              <div className="grid gap-6 xl:grid-cols-[minmax(0,1.8fr)_360px]">
                <div className="space-y-6">
                  {aggregatedData.questions.map((question) => (
                    <Card
                      key={question.questionId}
                      className="rounded-[28px] border-slate-200 bg-white shadow-sm"
                    >
                      <CardHeader>
                        <CardTitle className="text-lg text-slate-950">
                          {question.questionText}
                        </CardTitle>
                        <CardDescription className="text-slate-500">
                          {question.type === "mcq"
                            ? "Distribution across answer choices"
                            : question.type === "rating"
                            ? "Average score and response spread"
                            : "Open-text feedback themes"}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {question.type === "rating" ? (
                          <div className="rounded-[24px] border border-slate-200 bg-slate-50 px-5 py-4">
                            <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                              Average score
                            </p>
                            <p className="mt-2 text-3xl font-semibold text-slate-950">
                              {question.averageRating ? question.averageRating.toFixed(1) : "-"}
                            </p>
                          </div>
                        ) : null}

                        {question.distribution.length > 0 ? (
                          <SurveyAnalyticsBarChart data={question.distribution} />
                        ) : question.type !== "text" ? (
                          <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-6 text-sm text-slate-500">
                            Chart data will appear here when aggregate buckets are returned by the analytics API.
                          </div>
                        ) : null}

                        {question.type === "text" && question.comments.length > 0 ? (
                          <div className="grid gap-3 md:grid-cols-2">
                            {question.comments.slice(0, 4).map((comment) => (
                              <div
                                key={comment.answerId}
                                className="rounded-[24px] border border-slate-200 bg-slate-50 px-5 py-4"
                              >
                                <p className="text-sm leading-6 text-slate-700">
                                  &ldquo;{comment.text}&rdquo;
                                </p>
                                {!isAnonymous && showIdentity ? (
                                  <p className="mt-3 text-xs uppercase tracking-[0.16em] text-slate-400">
                                    {comment.employeeName || comment.department || "Respondent"}
                                  </p>
                                ) : null}
                              </div>
                            ))}
                          </div>
                        ) : null}
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="space-y-6">
                  <Card className="rounded-[28px] border-slate-200 bg-white shadow-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg text-slate-950">
                        <ShieldCheck size={18} className="text-sky-600" />
                        Visibility controls
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm leading-6 text-slate-600">
                      <p>
                        {isAnonymous
                          ? "Anonymous surveys intentionally suppress drill-down and person-level views. The dashboard remains aggregate-only even for HR."
                          : "Confidential surveys allow HR to review individual submissions while keeping responses out of direct manager visibility."}
                      </p>
                      {isAnonymous ? (
                        <p>
                          The k-anonymity lock remains active until the minimum response threshold is met.
                        </p>
                      ) : (
                        <p>
                          Identity reveal controls are limited to HR and can be toggled on only when needed.
                        </p>
                      )}
                    </CardContent>
                  </Card>

                  <Card className="rounded-[28px] border-slate-200 bg-white shadow-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg text-slate-950">
                        <MessageSquareQuote size={18} className="text-sky-600" />
                        Text comments
                      </CardTitle>
                      <CardDescription className="text-slate-500">
                        {isAnonymous
                          ? "Shown as a randomized quote wall to reduce identification risk."
                          : "HR can optionally reveal the respondent context for follow-up analysis."}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {orderedComments.length === 0 ? (
                        <p className="text-sm text-slate-500">
                          No open-text comments have been submitted yet.
                        </p>
                      ) : (
                        orderedComments.map((comment) => (
                          <div
                            key={comment.answerId}
                            className="rounded-[24px] border border-slate-200 bg-slate-50 px-5 py-4"
                          >
                            <p className="text-sm font-medium text-slate-900">
                              {comment.questionText}
                            </p>
                            <p className="mt-2 text-sm leading-6 text-slate-700">
                              &ldquo;{comment.text}&rdquo;
                            </p>
                            {!isAnonymous && showIdentity ? (
                              <p className="mt-3 text-xs uppercase tracking-[0.16em] text-slate-400">
                                {[comment.employeeName, comment.department, comment.tenure]
                                  .filter(Boolean)
                                  .join(" • ") || "Respondent"}
                              </p>
                            ) : null}
                          </div>
                        ))
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            ) : (
              <div className="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
                <Card className="rounded-[28px] border-slate-200 bg-white shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg text-slate-950">
                      <Users size={18} className="text-sky-600" />
                      Individual responses
                    </CardTitle>
                    <CardDescription className="text-slate-500">
                      Select a submission to review its full answer set.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {individualResponses.length === 0 ? (
                      <p className="text-sm text-slate-500">
                        No individual responses are available yet.
                      </p>
                    ) : (
                      individualResponses.map((response) => (
                        <button
                          key={response.responseId}
                          type="button"
                          onClick={() => setSelectedResponseId(response.responseId)}
                          className={`w-full rounded-[24px] border px-4 py-4 text-left transition-colors ${
                            selectedResponseId === response.responseId
                              ? "border-sky-500 bg-sky-50"
                              : "border-slate-200 bg-slate-50 hover:border-slate-300"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <p className="text-sm font-semibold text-slate-900">
                              {showIdentity
                                ? response.employeeName || response.department || "Respondent"
                                : `Submission ${response.responseId.slice(0, 8)}`}
                            </p>
                            <span className="text-xs uppercase tracking-[0.16em] text-slate-400">
                              {response.answers.length} answers
                            </span>
                          </div>
                          <p className="mt-2 text-sm text-slate-500">
                            {formatDate(response.submittedAt)}
                          </p>
                        </button>
                      ))
                    )}
                  </CardContent>
                </Card>

                <Card className="rounded-[28px] border-slate-200 bg-white shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg text-slate-950">Response detail</CardTitle>
                    <CardDescription className="text-slate-500">
                      {selectedResponse
                        ? `Submitted ${formatDate(selectedResponse.submittedAt)}`
                        : "Choose a response from the left to inspect the answers."}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    {selectedResponse ? (
                      <>
                        <div className="grid gap-3 md:grid-cols-3">
                          <div className="rounded-[24px] border border-slate-200 bg-slate-50 px-4 py-4">
                            <p className="text-xs uppercase tracking-[0.16em] text-slate-400">
                              Respondent
                            </p>
                            <p className="mt-2 text-sm font-semibold text-slate-900">
                              {showIdentity
                                ? selectedResponse.employeeName || selectedResponse.employeeId || "Hidden"
                                : "Hidden until revealed"}
                            </p>
                          </div>
                          <div className="rounded-[24px] border border-slate-200 bg-slate-50 px-4 py-4">
                            <p className="text-xs uppercase tracking-[0.16em] text-slate-400">
                              Department
                            </p>
                            <p className="mt-2 text-sm font-semibold text-slate-900">
                              {showIdentity
                                ? selectedResponse.department || "Not available"
                                : "Hidden"}
                            </p>
                          </div>
                          <div className="rounded-[24px] border border-slate-200 bg-slate-50 px-4 py-4">
                            <p className="text-xs uppercase tracking-[0.16em] text-slate-400">
                              Tenure
                            </p>
                            <p className="mt-2 text-sm font-semibold text-slate-900">
                              {showIdentity
                                ? selectedResponse.tenure || "Not available"
                                : "Hidden"}
                            </p>
                          </div>
                        </div>

                        <div className="space-y-4">
                          {selectedResponse.answers.map((answer) => (
                            <div
                              key={`${selectedResponse.responseId}-${answer.questionId}`}
                              className="rounded-[24px] border border-slate-200 bg-slate-50 px-5 py-4"
                            >
                              <p className="text-sm font-semibold text-slate-900">
                                {answer.questionText}
                              </p>
                              <p className="mt-2 text-sm leading-6 text-slate-700">
                                {typeof answer.rating === "number"
                                  ? `Rating: ${answer.rating} / 5`
                                  : answer.optionText || answer.text || "No answer captured"}
                              </p>
                            </div>
                          ))}
                        </div>
                      </>
                    ) : (
                      <p className="text-sm text-slate-500">No response selected.</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
