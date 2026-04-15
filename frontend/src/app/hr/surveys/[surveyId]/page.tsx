"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { SurveyAnalytics } from "@/components/survey/SurveyAnalytics";
import { showToast } from "@/components/ui/Toast";
import {
  clearActiveAnalytics,
  fetchSurveyAnalytics,
} from "@/lib/redux/features/survey/surveyAdminSlice";
import { useAppDispatch, useAppSelector } from "@/lib/redux/redux";

export default function HRSurveyAnalyticsPage({
  params,
}: {
  params: Promise<{ surveyId: string }>;
}) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const {
    activeSurvey,
    aggregatedData,
    analyticsStatus,
    error,
    individualResponses,
    minimumResponseThreshold,
    responseCount,
  } = useAppSelector((state) => state.surveyAdmin);
  const [surveyId, setSurveyId] = React.useState<string | null>(null);

  React.useEffect(() => {
    params.then((value) => setSurveyId(value.surveyId));
  }, [params]);

  React.useEffect(() => {
    if (!surveyId) {
      return;
    }

    void dispatch(fetchSurveyAnalytics(surveyId));

    return () => {
      dispatch(clearActiveAnalytics());
    };
  }, [dispatch, surveyId]);

  React.useEffect(() => {
    if (error) {
      showToast({
        mainText: "Analytics unavailable",
        text: error,
        type: "error",
      });
    }
  }, [error]);

  if (!activeSurvey || !aggregatedData || analyticsStatus === "loading") {
    return <div className="px-6 py-10 text-sm text-slate-500">Loading analytics...</div>;
  }

  return (
    <SurveyAnalytics
      survey={activeSurvey}
      aggregatedData={aggregatedData}
      individualResponses={individualResponses}
      responseCount={responseCount}
      minimumResponseThreshold={minimumResponseThreshold}
      onBack={() => router.push("/hr/surveys")}
    />
  );
}
