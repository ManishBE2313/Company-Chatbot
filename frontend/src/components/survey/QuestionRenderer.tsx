"use client";

import { Button } from "@/components/ui/Button";
import { TextArea } from "@/components/ui/TextArea";
import { cn } from "@/utils/classNames";
import { SurveyAnswerInput, SurveyQuestion } from "@/types/survey";

const RATING_LABELS: Record<number, string> = {
  1: "Very poor",
  2: "Needs work",
  3: "Okay",
  4: "Strong",
  5: "Excellent",
};

type QuestionAnswerPatch = Omit<SurveyAnswerInput, "questionId">;

interface QuestionRendererProps {
  question: SurveyQuestion;
  value?: SurveyAnswerInput;
  onChange?: (answer: SurveyAnswerInput) => void;
  disabled?: boolean;
  className?: string;
}

export function QuestionRenderer({
  question,
  value,
  onChange,
  disabled = false,
  className,
}: QuestionRendererProps) {
  const update = (answer: QuestionAnswerPatch) => {
    if (disabled || !onChange) {
      return;
    }

    onChange({
      questionId: question.id,
      ...answer,
    });
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div className="space-y-1.5">
        <h3 className="text-base font-semibold leading-6 text-slate-950">
          {question.questionText || "Untitled question"}
        </h3>
        <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
          {question.type === "mcq"
            ? "Single choice"
            : question.type === "rating"
            ? "Rating scale"
            : "Open response"}
        </p>
      </div>

      {question.type === "text" ? (
        <TextArea
          value={value?.text ?? ""}
          onChange={(event) => update({ text: event.target.value })}
          disabled={disabled}
          placeholder="Write your response..."
          className="min-h-[140px] rounded-2xl border-slate-200 bg-white"
        />
      ) : null}

      {question.type === "mcq" ? (
        <div className="space-y-2.5">
          {(question.options ?? []).map((option) => {
            const isSelected = value?.optionId === option.id;

            return (
              <button
                key={option.id}
                type="button"
                disabled={disabled}
                onClick={() => update({ optionId: option.id })}
                className={cn(
                  "flex w-full items-center justify-between rounded-2xl border px-4 py-3.5 text-left text-sm transition-colors",
                  isSelected
                    ? "border-sky-500 bg-sky-50 text-sky-700"
                    : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50",
                  disabled ? "cursor-not-allowed opacity-70" : "cursor-pointer"
                )}
              >
                <span className="pr-4 leading-6">{option.text || "Untitled option"}</span>
                <span
                  className={cn(
                    "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors",
                    isSelected ? "border-sky-500 bg-sky-500" : "border-slate-300 bg-white"
                  )}
                >
                  <span className={cn("h-2 w-2 rounded-full bg-white", !isSelected && "hidden")} />
                </span>
              </button>
            );
          })}
        </div>
      ) : null}

      {question.type === "rating" ? (
        <div className="space-y-3">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-5">
            {[1, 2, 3, 4, 5].map((rating) => {
              const isActive = value?.rating === rating;

              return (
                <Button
                  key={rating}
                  type="button"
                  variant={isActive ? "primary" : "outline"}
                  disabled={disabled}
                  className={cn(
                    "h-auto min-h-14 flex-col rounded-2xl px-4 py-3 text-left",
                    isActive
                      ? "bg-sky-600 text-white hover:bg-sky-700"
                      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  )}
                  onClick={() => update({ rating })}
                >
                  <span className="text-base font-semibold">{rating}</span>
                  <span className={cn("text-[11px] uppercase tracking-[0.18em]", isActive ? "text-sky-100" : "text-slate-400")}>
                    {RATING_LABELS[rating]}
                  </span>
                </Button>
              );
            })}
          </div>
          <div className="flex justify-between px-1 text-xs text-slate-400">
            <span>Low</span>
            <span>High</span>
          </div>
        </div>
      ) : null}
    </div>
  );
}
