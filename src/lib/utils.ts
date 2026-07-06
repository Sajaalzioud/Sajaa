import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { differenceInMonths, format } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** "4y 7m" style chronological age used across pediatric documentation. */
export function formatAge(dob: Date | string, at: Date = new Date()): string {
  const months = differenceInMonths(at, new Date(dob));
  if (months < 0) return "—";
  const y = Math.floor(months / 12);
  const m = months % 12;
  if (y === 0) return `${m}m`;
  return m === 0 ? `${y}y` : `${y}y ${m}m`;
}

export function ageInMonths(dob: Date | string, at: Date = new Date()): number {
  return differenceInMonths(at, new Date(dob));
}

export function fullName(p: { firstName: string; lastName: string }) {
  return `${p.firstName} ${p.lastName}`;
}

export function initials(name: string) {
  return name
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function formatDate(d: Date | string | null | undefined) {
  return d ? format(new Date(d), "MMM d, yyyy") : "—";
}

export function formatDateTime(d: Date | string | null | undefined) {
  return d ? format(new Date(d), "MMM d, yyyy h:mm a") : "—";
}

export function formatTime(d: Date | string) {
  return format(new Date(d), "h:mm a");
}

export function formatCurrency(n: number | string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Number(n));
}

/** Human label for enum values: SOAP_NOTE -> "SOAP Note" (with overrides). */
const ENUM_LABEL_OVERRIDES: Record<string, string> = {
  SOAP_NOTE: "SOAP Note",
  ADLS: "ADLs",
  RE_EVALUATION: "Re-evaluation",
  MEDICAL_NECESSITY_LETTER: "Letter of Medical Necessity",
  NO_SHOW: "No-show",
};

export function enumLabel(value: string): string {
  if (ENUM_LABEL_OVERRIDES[value]) return ENUM_LABEL_OVERRIDES[value];
  return value
    .toLowerCase()
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}
