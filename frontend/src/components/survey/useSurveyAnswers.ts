"use client";

import * as React from "react";
import { SurveyAnswerInput, SurveySummary, isSurveyAnswerComplete, sanitizeSurveyAnswer } from "@/types/survey";

export function useSurveyAnswers(survey?: SurveySummary | null) {
  const [answers, setAnswers] = React.useState<Record<string, SurveyAnswerInput>>({});

  React.useEffect(() => {
    setAnswers({});
  }, [survey?.id]);

  const setAnswer = React.useCallback((answer: SurveyAnswerInput) => {
    const nextAnswer = sanitizeSurveyAnswer(answer);

    setAnswers((current) => ({
      ...current,
      [nextAnswer.questionId]: nextAnswer,
    }));
  }, []);

  const answerList = React.useMemo(() => {
    const questions = survey?.questions ?? [];

    return questions
      .map((question) => answers[question.id])
      .filter((answer): answer is SurveyAnswerInput => Boolean(answer))
      .map((answer) => sanitizeSurveyAnswer(answer));
  }, [answers, survey?.questions]);

  const canSubmit = React.useMemo(() => {
    const questions = survey?.questions ?? [];

    if (questions.length === 0) {
      return false;
    }

    return questions.every((question) =>
      isSurveyAnswerComplete(question, answers[question.id])
    );
  }, [answers, survey?.questions]);

  return {
    answers,
    answerList,
    canSubmit,
    setAnswer,
    resetAnswers: () => setAnswers({}),
  };
}
