import { SurveyAnalyticsBucket } from "@/types/survey";

interface SurveyAnalyticsBarChartProps {
  title?: string;
  data: SurveyAnalyticsBucket[];
}

export function SurveyAnalyticsBarChart({ title, data }: SurveyAnalyticsBarChartProps) {
  return (
    <div className="space-y-3">
      {title ? <p className="text-sm font-semibold text-slate-900">{title}</p> : null}
      <div className="space-y-3">
        {data.map((item) => (
          <div key={`${item.optionId ?? item.label}`} className="space-y-1.5">
            <div className="flex items-center justify-between gap-3 text-sm text-slate-600">
              <span className="truncate">{item.label}</span>
              <span className="shrink-0 font-medium text-slate-900">
                {item.count} ({item.percentage.toFixed(0)}%)
              </span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-sky-500"
                style={{ width: `${Math.max(item.percentage, item.count > 0 ? 6 : 0)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
