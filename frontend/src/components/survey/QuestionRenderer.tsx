"use client";

import { Button } from "@/components/ui/Button";
import { TextArea } from "@/components/ui/TextArea";
import { cn } from "@/utils/classNames";
import { SurveyAnswerInput, SurveyQuestion } from "@/types/survey";

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
    <div className={cn("space-y-3", className)}>
      <div className="space-y-1">
        <h3 className="text-sm font-semibold text-slate-900">{question.questionText || "Untitled question"}</h3>
        <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{question.type}</p>
      </div>

      {question.type === "text" ? (
        <TextArea
          value={value?.text ?? ""}
          onChange={(event) => update({ text: event.target.value })}
          disabled={disabled}
          placeholder="Write your response..."
          className="min-h-[120px]"
        />
      ) : null}

      {question.type === "mcq" ? (
        <div className="space-y-2">
          {(question.options ?? []).map((option) => {
            const isSelected = value?.optionId === option.id;

            return (
              <button
                key={option.id}
                type="button"
                disabled={disabled}
                onClick={() => update({ optionId: option.id })}
                className={cn(
                  "flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left text-sm transition-colors",
                  isSelected
                    ? "border-sky-500 bg-sky-50 text-sky-700"
                    : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50",
                  disabled ? "cursor-not-allowed opacity-70" : "cursor-pointer"
                )}
              >
                <span>{option.text || "Untitled option"}</span>
                <span
                  className={cn(
                    "h-4 w-4 rounded-full border",
                    isSelected ? "border-sky-500 bg-sky-500" : "border-slate-300"
                  )}
                />
              </button>
            );
          })}
        </div>
      ) : null}

      {question.type === "rating" ? (
        <div className="flex flex-wrap gap-2">
          {[1, 2, 3, 4, 5].map((rating) => {
            const isActive = value?.rating === rating;

            return (
              <Button
                key={rating}
                type="button"
                variant={isActive ? "primary" : "outline"}
                disabled={disabled}
                className={cn(
                  "h-11 min-w-11 rounded-2xl px-4",
                  !isActive && "border-slate-200 text-slate-600"
                )}
                onClick={() => update({ rating })}
              >
                {rating}
              </Button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
