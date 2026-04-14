"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { EmployeeSurveyList } from "@/components/survey/EmployeeSurveyList";
import { showToast } from "@/components/ui/Toast";
import { fetchEmployeeSurveys } from "@/lib/redux/features/survey/surveyEmployeeSlice";
import { useAppDispatch, useAppSelector } from "@/lib/redux/redux";

export default function EmployeeSurveysPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { mySurveys, listStatus, error } = useAppSelector((state) => state.surveyEmployee);
  const [employeeId, setEmployeeId] = React.useState("");

  React.useEffect(() => {
    params.then((value) => setEmployeeId(value.id));
  }, [params]);

  React.useEffect(() => {
    void dispatch(fetchEmployeeSurveys());
  }, [dispatch]);

  React.useEffect(() => {
    if (error) {
      showToast({
        mainText: "Could not load surveys",
        text: error,
        type: "error",
      });
    }
  }, [error]);

  return (
    <EmployeeSurveyList
      surveys={mySurveys}
      isLoading={listStatus === "loading"}
      onOpenSurvey={(surveyId) => router.push(`/employee/${employeeId}/surveys/${surveyId}`)}
    />
  );
}
