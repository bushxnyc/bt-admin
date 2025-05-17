import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatExactDateTime = (dateString: string): string => {
  if (!dateString) return "Unknown";

  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "Invalid date";

  // Format to: "May 17, 2025, 3:45:21 PM EDT"
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    timeZoneName: "short",
    timeZone: "America/New_York", // Eastern Time
  }).format(date);
};

export // Convert UTC date string to "time since" format in EST
const formatTimeAgo = (utcDateString: string | null | undefined): string => {
  if (!utcDateString) return "Never";

  // Parse the UTC date string
  const date = new Date(utcDateString);

  // Check if the date is valid
  if (isNaN(date.getTime())) return "Invalid date";

  // Convert to EST (UTC-5, not accounting for DST)
  // For proper timezone handling in production, consider using libraries like date-fns-tz or Luxon
  const now = new Date();

  // Calculate difference in seconds
  const diffSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  // Convert to appropriate time units
  if (diffSeconds < 60) {
    return `${diffSeconds} second${diffSeconds !== 1 ? "s" : ""} ago`;
  }

  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) {
    return `${diffMinutes} minute${diffMinutes !== 1 ? "s" : ""} ago`;
  }

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`;
  }

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 30) {
    return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`;
  }

  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths < 12) {
    return `${diffMonths} month${diffMonths !== 1 ? "s" : ""} ago`;
  }

  const diffYears = Math.floor(diffMonths / 12);
  return `${diffYears} year${diffYears !== 1 ? "s" : ""} ago`;
};
