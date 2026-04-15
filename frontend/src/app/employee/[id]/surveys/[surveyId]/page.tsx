"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { SurveyResponder } from "@/components/survey/SurveyResponder";
import { showToast } from "@/components/ui/Toast";
import {
  clearActiveSurvey,
  fetchSurveyDetails,
  submitSurveyResponse,
} from "@/lib/redux/features/survey/surveyEmployeeSlice";
import { useAppDispatch, useAppSelector } from "@/lib/redux/redux";
import { useSurveyAnswers } from "@/components/survey/useSurveyAnswers";

export default function EmployeeSurveyDetailPage({
  params,
}: {
  params: Promise<{ id: string; surveyId: string }>;
}) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { activeSurvey, detailStatus, submitStatus, error } = useAppSelector((state) => state.surveyEmployee);
  const [routeParams, setRouteParams] = React.useState<{ id: string; surveyId: string } | null>(null);
  const { answers, answerList, canSubmit, setAnswer } = useSurveyAnswers(activeSurvey);

  React.useEffect(() => {
    params.then((value) => setRouteParams(value));
  }, [params]);

  React.useEffect(() => {
    if (!routeParams?.surveyId) {
      return;
    }

    void dispatch(fetchSurveyDetails(routeParams.surveyId));

    return () => {
      dispatch(clearActiveSurvey());
    };
  }, [dispatch, routeParams?.surveyId]);

  React.useEffect(() => {
    if (error) {
      showToast({
        mainText: "Survey unavailable",
        text: error,
        type: "error",
      });
    }
  }, [error]);

  const handleSubmit = React.useCallback(async () => {
    if (!routeParams?.surveyId || !activeSurvey) {
      return;
    }

    try {
      await dispatch(
        submitSurveyResponse({
          surveyId: routeParams.surveyId,
          answers: answerList,
        })
      ).unwrap();

      showToast({
        mainText: "Survey submitted",
        text: "Thank you for sharing your feedback.",
        type: "success",
      });

      router.push(`/employee/${routeParams.id}/surveys`);
    } catch (submitError) {
      showToast({
        mainText: "Submission failed",
        text: submitError instanceof Error ? submitError.message : "Unable to submit your survey.",
        type: "error",
      });
    }
  }, [activeSurvey, answerList, dispatch, routeParams, router]);

  if (!activeSurvey || detailStatus === "loading" || !routeParams) {
    return <div className="px-6 py-10 text-sm text-slate-500">Loading survey...</div>;
  }

  return (
    <SurveyResponder
      survey={activeSurvey}
      answers={answers}
      canSubmit={canSubmit}
      onAnswerChange={setAnswer}
      onSubmit={handleSubmit}
      onBack={() => router.push(`/employee/${routeParams.id}/surveys`)}
      isSubmitting={submitStatus === "loading"}
    />
  );
}
