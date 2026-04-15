import { SurveyType, getSurveyTypeLabel, getSurveyTypeTone } from "@/types/survey";
import { cn } from "@/utils/classNames";

export function SurveyTypeBadge({ surveyType, className }: { surveyType: SurveyType; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ring-1",
        getSurveyTypeTone(surveyType),
        className
      )}
    >
      {getSurveyTypeLabel(surveyType)}
    </span>
  );
}
