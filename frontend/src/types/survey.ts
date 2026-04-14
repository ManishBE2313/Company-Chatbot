export type SurveyType = "ANONYMOUS" | "ATTRIBUTED";
export type SurveyQuestionType = "text" | "mcq" | "rating";
export type SurveyStatus =
  | "Draft"
  | "Upcoming"
  | "Active"
  | "Expired"
  | "Submitted";

export interface SurveyDepartmentRef {
  id: string;
  name: string;
}

export interface SurveyOption {
  id: string;
  text: string;
}

export interface SurveyQuestion {
  id: string;
  questionText: string;
  type: SurveyQuestionType;
  options?: SurveyOption[];
}

export interface SurveySummary {
  id: string;
  title: string;
  description?: string;
  surveyType: SurveyType;
  startAt: string;
  endAt: string;
  status: SurveyStatus;
  isForAllDepartments: boolean;
  departments?: SurveyDepartmentRef[];
  questions?: SurveyQuestion[];
  alreadySubmitted?: boolean;
}

export interface SurveyDraft {
  id: string;
  backendId?: string;
  title: string;
  description: string;
  surveyType: SurveyType;
  startAt: string;
  endAt: string;
  isForAllDepartments: boolean;
  departmentIds: string[];
  departments: SurveyDepartmentRef[];
  questions: SurveyQuestion[];
  status: "Draft";
}

export interface SurveyAdminFilters {
  status: "ALL" | SurveyStatus;
  type: "ALL" | SurveyType;
}

export interface SurveyAnswerInput {
  questionId: string;
  optionId?: string;
  text?: string;
  rating?: number;
}

export interface SurveyPublishPayload {
  title: string;
  surveyType: SurveyType;
  startAt: string;
  endAt: string;
  isForAllDepartments: boolean;
  departmentIds?: string[];
  questions: Array<{
    questionText: string;
    type: SurveyQuestionType;
    options?: Array<{ text: string }>;
  }>;
}

export function normalizeSurveyStatus(status?: string): SurveyStatus {
  switch (status?.toUpperCase()) {
    case "DRAFT":
      return "Draft";
    case "UPCOMING":
      return "Upcoming";
    case "ACTIVE":
      return "Active";
    case "EXPIRED":
      return "Expired";
    case "SUBMITTED":
      return "Submitted";
    default:
      return "Active";
  }
}

export function buildEmptySurveyDraft(): SurveyDraft {
  return {
    id: globalThis.crypto?.randomUUID?.() ?? `draft-${Date.now()}`,
    title: "",
    description: "",
    surveyType: "ANONYMOUS",
    startAt: "",
    endAt: "",
    isForAllDepartments: true,
    departmentIds: [],
    departments: [],
    questions: [
      {
        id: globalThis.crypto?.randomUUID?.() ?? `question-${Date.now()}`,
        questionText: "",
        type: "text",
        options: [],
      },
    ],
    status: "Draft",
  };
}

export function toSurveyPublishPayload(
  draft: SurveyDraft
): SurveyPublishPayload {
  return {
    title: draft.title.trim(),
    surveyType: draft.surveyType,
    startAt: draft.startAt,
    endAt: draft.endAt,
    isForAllDepartments: draft.isForAllDepartments,
    departmentIds: draft.isForAllDepartments ? undefined : draft.departmentIds,
    questions: draft.questions.map((question) => ({
      questionText: question.questionText.trim(),
      type: question.type,
      options:
        question.type === "mcq"
          ? (question.options ?? [])
              .map((option) => ({ text: option.text.trim() }))
              .filter((option) => option.text.length > 0)
          : undefined,
    })),
  };
}

export function getSurveyTrustCopy(type: SurveyType) {
  if (type === "ANONYMOUS") {
    return "This is a True Anonymous survey. Your identity is cryptographically stripped. Managers will only see aggregated data.";
  }

  return "This is a Confidential survey. Your department/tenure is used for grouping, but your manager cannot see individual answers.";
}
