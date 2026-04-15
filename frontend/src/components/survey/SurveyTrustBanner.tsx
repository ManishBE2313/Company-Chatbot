import { cn } from "@/utils/classNames";
import { SurveyType, getSurveyTrustCopy } from "@/types/survey";
import { LockKeyhole, ShieldCheck } from "lucide-react";

interface SurveyTrustBannerProps {
  surveyType: SurveyType;
  className?: string;
}

export function SurveyTrustBanner({ surveyType, className }: SurveyTrustBannerProps) {
  const isAnonymous = surveyType === "ANONYMOUS";

  return (
    <div
      className={cn(
        "flex items-start gap-4 rounded-[28px] border p-5",
        isAnonymous
          ? "border-emerald-200 bg-emerald-50/80"
          : "border-sky-200 bg-sky-50/80",
        className
      )}
    >
      <div
        className={cn(
          "mt-0.5 flex h-11 w-11 items-center justify-center rounded-2xl bg-white shadow-sm",
          isAnonymous ? "text-emerald-600" : "text-sky-600"
        )}
      >
        {isAnonymous ? <ShieldCheck size={20} /> : <LockKeyhole size={20} />}
      </div>

      <div className="space-y-2">
        <p
          className={cn(
            "text-xs font-semibold uppercase tracking-[0.22em]",
            isAnonymous ? "text-emerald-700" : "text-sky-700"
          )}
        >
          {isAnonymous ? "True Anonymous" : "Confidential"}
        </p>
        <p className="text-sm leading-6 text-slate-700">{getSurveyTrustCopy(surveyType)}</p>
      </div>
    </div>
  );
}
