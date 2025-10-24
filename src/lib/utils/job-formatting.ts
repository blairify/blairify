import type { JobListing } from "@/lib/services/landing-page-data";

/**
 * Formats salary range from database values to display string
 */
export function formatSalary(job: JobListing): string {
  // Check if amounts are valid numbers and not NaN
  const minAmount =
    job.minAmount && !Number.isNaN(job.minAmount) ? job.minAmount : null;
  const maxAmount =
    job.maxAmount && !Number.isNaN(job.maxAmount) ? job.maxAmount : null;

  if (!minAmount && !maxAmount) {
    return "Salary not specified";
  }

  const currency = job.currency || "USD";
  const currencySymbol = getCurrencySymbol(currency);

  if (minAmount && maxAmount) {
    return `${currencySymbol}${formatAmount(minAmount)} - ${currencySymbol}${formatAmount(maxAmount)}`;
  } else if (minAmount) {
    return `${currencySymbol}${formatAmount(minAmount)}+`;
  } else if (maxAmount) {
    return `Up to ${currencySymbol}${formatAmount(maxAmount)}`;
  }

  return "Salary not specified";
}

/**
 * Formats amount to readable string (e.g., 120000 -> "120k")
 */
function formatAmount(amount: number): string {
  // Return empty string if amount is NaN or invalid
  if (Number.isNaN(amount) || !Number.isFinite(amount)) {
    return "0";
  }

  if (amount >= 1000000) {
    return `${(amount / 1000000).toFixed(1)}M`;
  } else if (amount >= 1000) {
    return `${Math.round(amount / 1000)}k`;
  }
  return amount.toString();
}

/**
 * Gets currency symbol from currency code
 */
function getCurrencySymbol(currency: string): string {
  const symbols: Record<string, string> = {
    USD: "$",
    EUR: "€",
    GBP: "£",
    PLN: "zł",
    CAD: "C$",
    AUD: "A$",
  };
  return symbols[currency] || "$";
}

/**
 * Formats date posted to relative time string
 */
export function formatDatePosted(datePosted: string): string {
  const now = new Date();
  const posted = new Date(datePosted);

  // Check if the date is valid
  if (Number.isNaN(posted.getTime())) {
    return "Date not available";
  }

  const diffInMs = now.getTime() - posted.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  // Handle negative dates (future dates)
  if (diffInDays < 0) {
    return "Recently posted";
  }

  if (diffInDays === 0) {
    return "Today";
  } else if (diffInDays === 1) {
    return "1 day ago";
  } else if (diffInDays < 7) {
    return `${diffInDays} days ago`;
  } else if (diffInDays < 30) {
    const weeks = Math.floor(diffInDays / 7);
    return weeks === 1 ? "1 week ago" : `${weeks} weeks ago`;
  } else {
    const months = Math.floor(diffInDays / 30);
    return months === 1 ? "1 month ago" : `${months} months ago`;
  }
}

/**
 * Formats location, handling remote jobs
 */
export function formatLocation(
  location: string | null,
  isRemote?: boolean,
): string {
  if (isRemote) {
    return location ? `${location} (Remote)` : "Remote";
  }
  return location || "Location not specified";
}

/**
 * Formats job type for display
 */
export function formatJobType(jobType: string | null): string {
  if (!jobType) return "Not specified";

  // Capitalize first letter of each word
  return jobType
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join("-");
}
