import * as React from "react";
import { cn } from "@/utils/classNames";

interface AsanaSpinnerProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  label?: string;
}

const sizeStyles = {
  sm: "h-4 w-4",
  md: "h-6 w-6",
  lg: "h-8 w-8",
};

export const AsanaSpinner: React.FC<AsanaSpinnerProps> = ({
  className,
  size = "md",
  label = "Loading",
}) => {
  return (
    <span
      className={cn("relative inline-flex items-center justify-center", sizeStyles[size], className)}
      role="status"
      aria-label={label}
    >
      <span className="absolute inset-0 rounded-full border-2 border-current/20" />
      <span className="absolute inset-0 rounded-full border-2 border-transparent border-t-current animate-spin" />
      <span className="sr-only">{label}</span>
    </span>
  );
};
