"use client";

import * as React from "react";
import { SurveyBuilder } from "@/components/survey/SurveyBuilder";
import { SurveyDashboard } from "@/components/survey/SurveyDashboard";
import { showToast } from "@/components/ui/Toast";
import { clearSurveyDraft, createSurveyDraft, fetchAdminSurveys, publishSurvey, setSurveyAdminFilters, updateSurveyDraft } from "@/lib/redux/features/survey/surveyAdminSlice";
import { useAppDispatch, useAppSelector } from "@/lib/redux/redux";
import { getJobFormCatalog } from "@/services/hrApiClient";
import { SurveyDepartmentRef } from "@/types/survey";

export default function HRSurveysPage() {
  const dispatch = useAppDispatch();
  const { surveys, currentDraft, filters, fetchStatus, publishStatus, error } = useAppSelector((state) => state.surveyAdmin);
  const [departmentOptions, setDepartmentOptions] = React.useState<SurveyDepartmentRef[]>([]);

  React.useEffect(() => {
    void dispatch(fetchAdminSurveys());
  }, [dispatch, filters.status, filters.type]);

  React.useEffect(() => {
    getJobFormCatalog()
      .then((catalog) => {
        setDepartmentOptions(
          catalog.departments.map((department) => ({
            id: department.id,
            name: department.name,
          }))
        );
      })
      .catch((catalogError: Error) => {
        showToast({
          mainText: "Department list unavailable",
          text: catalogError.message,
          type: "warning",
        });
      });
  }, []);

  React.useEffect(() => {
    if (error) {
      showToast({
        mainText: "Survey workspace update failed",
        text: error,
        type: "error",
      });
    }
  }, [error]);

  const patchDraft = React.useCallback(
    (updates: Parameters<typeof updateSurveyDraft>[0]) => {
      void dispatch(updateSurveyDraft(updates));
    },
    [dispatch]
  );

  const handleCreateSurvey = React.useCallback(() => {
    void dispatch(createSurveyDraft());
  }, [dispatch]);

  const handleFiltersChange = React.useCallback(
    (updates: Partial<typeof filters>) => {
      dispatch(setSurveyAdminFilters(updates));
    },
    [dispatch]
  );

  const handleAddQuestion = React.useCallback(() => {
    if (!currentDraft) {
      return;
    }

    patchDraft({
      questions: [
        ...currentDraft.questions,
        {
          id: globalThis.crypto?.randomUUID?.() ?? `question-${Date.now()}`,
          questionText: "",
          type: "text",
          options: [],
        },
      ],
    });
  }, [currentDraft, patchDraft]);

  const handleRemoveQuestion = React.useCallback((questionId: string) => {
    if (!currentDraft) {
      return;
    }

    patchDraft({
      questions: currentDraft.questions.filter((question) => question.id !== questionId),
    });
  }, [currentDraft, patchDraft]);

  const handleQuestionChange = React.useCallback((questionId: string, updates: { questionText?: string; type?: "text" | "mcq" | "rating" }) => {
    if (!currentDraft) {
      return;
    }

    patchDraft({
      questions: currentDraft.questions.map((question) => {
        if (question.id !== questionId) {
          return question;
        }

        return {
          ...question,
          ...updates,
          options: updates.type === "mcq" ? question.options ?? [] : updates.type ? [] : question.options,
        };
      }),
    });
  }, [currentDraft, patchDraft]);

  const handleAddOption = React.useCallback((questionId: string) => {
    if (!currentDraft) {
      return;
    }

    patchDraft({
      questions: currentDraft.questions.map((question) =>
        question.id === questionId
          ? {
              ...question,
              options: [
                ...(question.options ?? []),
                {
                  id: globalThis.crypto?.randomUUID?.() ?? `option-${Date.now()}`,
                  text: "",
                },
              ],
            }
          : question
      ),
    });
  }, [currentDraft, patchDraft]);

  const handleOptionChange = React.useCallback((questionId: string, optionId: string, text: string) => {
    if (!currentDraft) {
      return;
    }

    patchDraft({
      questions: currentDraft.questions.map((question) =>
        question.id === questionId
          ? {
              ...question,
              options: (question.options ?? []).map((option) =>
                option.id === optionId ? { ...option, text } : option
              ),
            }
          : question
      ),
    });
  }, [currentDraft, patchDraft]);

  const handleRemoveOption = React.useCallback((questionId: string, optionId: string) => {
    if (!currentDraft) {
      return;
    }

    patchDraft({
      questions: currentDraft.questions.map((question) =>
        question.id === questionId
          ? {
              ...question,
              options: (question.options ?? []).filter((option) => option.id !== optionId),
            }
          : question
      ),
    });
  }, [currentDraft, patchDraft]);

  const handleAddDepartment = React.useCallback((departmentId: string) => {
    if (!currentDraft) {
      return;
    }

    const department = departmentOptions.find((item) => item.id === departmentId);

    if (!department) {
      return;
    }

    patchDraft({
      isForAllDepartments: false,
      departmentIds: [...currentDraft.departmentIds, department.id],
      departments: [...currentDraft.departments, department],
    });
  }, [currentDraft, departmentOptions, patchDraft]);

  const handleRemoveDepartment = React.useCallback((departmentId: string) => {
    if (!currentDraft) {
      return;
    }

    patchDraft({
      departmentIds: currentDraft.departmentIds.filter((id) => id !== departmentId),
      departments: currentDraft.departments.filter((department) => department.id !== departmentId),
    });
  }, [currentDraft, patchDraft]);

  const handleSaveDraft = React.useCallback(() => {
    showToast({
      mainText: "Draft saved in workspace",
      text: "This draft remains local to the current session until you publish it.",
      type: "success",
    });
  }, []);

  const handlePublish = React.useCallback(async () => {
    const confirmed = window.confirm("Publishing will send this survey to the backend and treat it as live. Continue?");

    if (!confirmed) {
      return;
    }

    try {
      await dispatch(publishSurvey()).unwrap();
      showToast({
        mainText: "Survey published",
        text: "The survey is now available in the admin dashboard.",
        type: "success",
      });
      void dispatch(fetchAdminSurveys());
    } catch (publishError) {
      showToast({
        mainText: "Publish failed",
        text: publishError instanceof Error ? publishError.message : "Unable to publish survey.",
        type: "error",
      });
    }
  }, [dispatch]);

  return (
    <div className="min-h-full bg-slate-50 px-6 py-8 lg:px-10">
      {currentDraft ? (
        <SurveyBuilder
          draft={currentDraft}
          departmentOptions={departmentOptions}
          onDraftChange={patchDraft}
          onQuestionChange={handleQuestionChange}
          onAddQuestion={handleAddQuestion}
          onRemoveQuestion={handleRemoveQuestion}
          onAddOption={handleAddOption}
          onOptionChange={handleOptionChange}
          onRemoveOption={handleRemoveOption}
          onAddDepartment={handleAddDepartment}
          onRemoveDepartment={handleRemoveDepartment}
          onSaveDraft={handleSaveDraft}
          onPublish={handlePublish}
          onCancel={() => dispatch(clearSurveyDraft())}
          isPublishing={publishStatus === "loading"}
        />
      ) : (
        <SurveyDashboard
          surveys={surveys}
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onCreateNewSurvey={handleCreateSurvey}
          isLoading={fetchStatus === "loading"}
        />
      )}
    </div>
  );
}
