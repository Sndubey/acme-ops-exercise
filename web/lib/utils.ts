import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const numberFormat = new Intl.NumberFormat("en-GB");

export function formatNumber(value: number | string | null | undefined): string {
  if (value === null || value === undefined) return "--";
  const n = typeof value === "string" ? Number(value) : value;
  return Number.isFinite(n) ? numberFormat.format(n) : "--";
}

/**
 * All timestamps render in UTC. The console is used by operators in several
 * offices and a shared frame of reference beats a local one when two people are
 * reading the same activity log to each other.
 */
const dateFormat = new Intl.DateTimeFormat("en-GB", {
  timeZone: "UTC",
  day: "2-digit",
  month: "short",
  year: "numeric",
});

const dateTimeFormat = new Intl.DateTimeFormat("en-GB", {
  timeZone: "UTC",
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

export function formatDate(value: Date | string | null | undefined): string {
  if (!value) return "--";
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? "--" : dateFormat.format(date);
}

export function formatDateTime(value: Date | string | null | undefined): string {
  if (!value) return "--";
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? "--" : dateTimeFormat.format(date);
}

export function formatRelative(value: Date | string | null | undefined): string {
  if (!value) return "never";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "never";

  const seconds = Math.round((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";

  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.round(hours / 24);
  if (days < 30) return `${days}d ago`;

  const months = Math.round(days / 30);
  if (months < 12) return `${months}mo ago`;

  return `${Math.round(months / 12)}y ago`;
}

/** ISO date (YYYY-MM-DD) in UTC, for prefilling date inputs. */
export function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** Search params arrive as string | string[] | undefined. Take the first one. */
export function firstParam(value: string | string[] | undefined): string | undefined {
  const raw = Array.isArray(value) ? value[0] : value;
  return raw?.trim() || undefined;
}

/** Builds a query string, dropping empty values. */
export function queryString(params: Record<string, string | number | undefined>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") search.set(key, String(value));
  }
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}
