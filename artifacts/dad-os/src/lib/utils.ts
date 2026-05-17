import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getInitials(name: string) {
  if (!name) return "";
  const parts = name.split(' ').filter(Boolean);
  if (parts.length === 0) return "";
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function formatAge(years: number, months: number) {
  if (years === undefined || months === undefined) return "";
  if (years === 0 && months === 0) return "Newborn";
  const y = years > 0 ? `${years} yr${years !== 1 ? 's' : ''}` : '';
  const m = months > 0 ? `${months} mo${months !== 1 ? 's' : ''}` : '';
  if (y && m) return `${y}, ${m}`;
  return y || m;
}

export function formatDate(dateStr: string | null | undefined) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}
