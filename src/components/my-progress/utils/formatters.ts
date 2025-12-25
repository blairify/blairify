"use client";

export const formatTime = (minutes: number): string => {
  if (
    !minutes ||
    typeof minutes !== "number" ||
    !Number.isFinite(minutes) ||
    minutes < 0
  ) {
    return "0m";
  }
  const validMinutes = Math.min(Math.floor(minutes), 60000);
  const hours = Math.floor(validMinutes / 60);
  const mins = validMinutes % 60;
  if (hours > 0) {
    return `${hours}h ${mins}m`;
  }
  return `${mins}m`;
};

export const formatKebabCase = (value: string): string =>
  value
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

export const formatTitleCase = (value: string): string =>
  value
    ? value.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase())
    : "";

export const getScoreColor = (score: number): string => {
  if (score >= 80) return "text-emerald-600";
  if (score >= 60) return "text-blue-600";
  return "text-orange-600";
};
