// src/utils/classNames.ts
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges Tailwind CSS classes safely without style conflicts.
 * It takes an array of class names, resolves any conditional logic using clsx,
 * and then intelligently overrides conflicting classes using tailwind-merge.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}