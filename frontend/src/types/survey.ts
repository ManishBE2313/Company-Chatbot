export type SurveyType = "ANONYMOUS" | "ATTRIBUTED";
export type SurveyQuestionType = "text" | "mcq" | "rating";
export type SurveyStatus =
  | "Draft"
  | "Upcoming"
  | "Active"
  | "Expired"
  | "Submitted";

export const SURVEY_K_ANONYMITY_THRESHOLD = 5;

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

export interface SurveyAnalyticsBucket {
  optionId?: string;
  label: string;
  count: number;
  percentage: number;
}

export interface SurveyTextComment {
  answerId: string;
  questionId: string;
  questionText: string;
  text: string;
  responseId?: string;
  employeeId?: string | null;
  employeeName?: string | null;
  department?: string | null;
  tenure?: string | null;
  submittedAt?: string | null;
}

export interface SurveyQuestionAnalytics {
  questionId: string;
  questionText: string;
  type: SurveyQuestionType;
  responseCount: number;
  averageRating?: number | null;
  distribution: SurveyAnalyticsBucket[];
  comments: SurveyTextComment[];
}

export interface SurveyAggregatedData {
  averageRating: number | null;
  questions: SurveyQuestionAnalytics[];
}

export interface SurveyIndividualResponseAnswer {
  questionId: string;
  questionText: string;
  type: SurveyQuestionType;
  optionId?: string;
  optionText?: string;
  text?: string;
  rating?: number;
}

export interface SurveyIndividualResponse {
  responseId: string;
  employeeId?: string | null;
  employeeName?: string | null;
  department?: string | null;
  tenure?: string | null;
  submittedAt?: string | null;
  answers: SurveyIndividualResponseAnswer[];
}

export interface SurveyAnalyticsData {
  survey: SurveySummary;
  aggregatedData: SurveyAggregatedData;
  individualResponses: SurveyIndividualResponse[];
  responseCount: number;
  minimumResponseThreshold: number;
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

export function getSurveyTypeLabel(type: SurveyType) {
  return type === "ANONYMOUS" ? "Anonymous" : "Confidential";
}

export function getSurveyTypeTone(type: SurveyType) {
  return type === "ANONYMOUS"
    ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
    : "bg-sky-50 text-sky-700 ring-sky-200";
}

export function getSurveyTrustCopy(type: SurveyType) {
  if (type === "ANONYMOUS") {
    return "This is a True Anonymous survey. Your session uses a secure token. Your identity is cryptographically stripped. Managers will only see aggregated data once the minimum response threshold is met.";
  }

  return "This is a Confidential survey. Your department and tenure are attached to your response for organizational tracking, but your direct manager cannot see your individual answers.";
}

export function sanitizeSurveyAnswer(
  answer: SurveyAnswerInput
): SurveyAnswerInput {
  const questionId = answer.questionId;

  if (answer.optionId) {
    return {
      questionId,
      optionId: answer.optionId,
    };
  }

  if (typeof answer.rating === "number") {
    return {
      questionId,
      rating: answer.rating,
    };
  }

  return {
    questionId,
    text: answer.text?.trim() ?? "",
  };
}

export function isSurveyAnswerComplete(
  question: SurveyQuestion,
  answer?: SurveyAnswerInput
) {
  if (!answer) {
    return false;
  }

  if (question.type === "mcq") {
    return Boolean(answer.optionId);
  }

  if (question.type === "rating") {
    return typeof answer.rating === "number" && answer.rating >= 1 && answer.rating <= 5;
  }

  return Boolean(answer.text?.trim());
}
