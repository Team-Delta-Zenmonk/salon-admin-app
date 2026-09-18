import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date | null | undefined, format = "MMM D, YYYY"): string {
  if (!date) return "—";
  return dayjs(date).format(format);
}

export function formatDateTime(date: string | Date | null | undefined): string {
  if (!date) return "—";
  return dayjs(date).format("MMM D, YYYY h:mm A");
}

export function formatRelativeTime(date: string | Date | null | undefined): string {
  if (!date) return "—";
  return dayjs(date).fromNow();
}

export function getDaysRemaining(targetDate: string | Date | null | undefined): {
  days: number;
  isExpired: boolean;
  text: string;
} {
  if (!targetDate) {
    return { days: 0, isExpired: true, text: "No date" };
  }

  const now = new Date().getTime();
  const target = new Date(targetDate).getTime();
  const diffMs = target - now;

  if (diffMs < 0) {
    const elapsedDays = Math.floor(Math.abs(diffMs) / (1000 * 60 * 60 * 24));
    return {
      days: elapsedDays,
      isExpired: true,
      text: elapsedDays === 0 ? "Expired earlier today" : `Expired ${elapsedDays}d ago`,
    };
  }

  const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  if (days === 0) {
    return { days: 0, isExpired: false, text: "Expires today" };
  }
  return { days, isExpired: false, text: `${days}d remaining` };
}

export function formatCurrency(amount: number, currency = "INR"): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}
