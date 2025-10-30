import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getClientIp(headerValue: string | null): string {
  if (!headerValue) return "unknown";
  const [first] = headerValue.split(",").map((segment) => segment.trim());
  return first || "unknown";
}

export function isTruthy<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}
