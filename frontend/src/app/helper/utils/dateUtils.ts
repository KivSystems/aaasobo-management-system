import { addMinutes, startOfDay, isAfter } from "date-fns";
import { format, toZonedTime } from "date-fns-tz";

// Function to format time for a given time zone(e.g., 19:00)
export const formatTime = (date: Date, timeZone: string) => {
  return new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone,
  }).format(date);
};

// Formats date and time (e.g., "Thu, January 11 at 09:30", "1月11日(木) 9:30")
export const formatDateTime = (date: Date, locale: string = "en-US") => {
  return new Intl.DateTimeFormat(locale, {
    weekday: "short",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: false,
  }).format(date);
};

// Formats year and date (e.g., "Thu, Jan 11, 2025", "2025年1月11日(木)")
export const formatYearDate = (date: Date, locale: string = "en-US") => {
  return new Intl.DateTimeFormat(locale, {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
};

// Formats year,date, and time (e.g., "Thu, January 11, 2025 at 09:30", "2025年1月11日(木) 9:30")
export const formatYearDateTime = (date: Date, locale: string = "en-US") => {
  return new Intl.DateTimeFormat(locale, {
    weekday: "short",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: false,
  }).format(date);
};

// Function to format day and date for a given time zone (e.g., Mon, July 23, 2024)
export const formatDayDate = (date: Date, timeZone: string) => {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "long",
    day: "2-digit",
    timeZone,
  }).format(date);
};

// Function to format time with added minutes (e.g., 19:25)
export const formatTimeWithAddedMinutes = (
  date: Date,
  minutesToAdd: number,
): string => {
  const updatedDate = addMinutes(date, minutesToAdd);
  return formatTime24Hour(updatedDate);
};

// Function to format the previous day for a given time zone (e.g., Jun 28, 2024)
export const formatPreviousDay = (date: Date, timeZone: string) => {
  // Calculate the previous day
  const previousDay = new Date(date);
  previousDay.setDate(previousDay.getDate() - 1);

  // Format the previous day
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    timeZone,
  }).format(previousDay);
};

export const isPastPreviousDayDeadline = (classDateUTC: string): boolean => {
  // Convert class date from UTC to Japan time
  const classDateInJapan = toZonedTime(classDateUTC, "Asia/Tokyo");

  // Get the start of the class day in Japan time (00:00:00)
  const classDayStart = startOfDay(classDateInJapan);

  // Get the current date in Japan time (00:00:00 today)
  const todayInJapan = startOfDay(toZonedTime(new Date(), "Asia/Tokyo"));

  // If class date is today or in the past, return true (deadline has passed)
  return !isAfter(classDayStart, todayInJapan);
};

// Function to check if the current date & time in a particular time zone is past the target class date & time
export const isPastClassDateTime = (
  classDateTime: string,
  timeZone: string,
): boolean => {
  try {
    const classDateTimeInZone = toZonedTime(classDateTime, timeZone);

    const currentDateTimeInZone = toZonedTime(new Date(), timeZone);

    return isAfter(currentDateTimeInZone, classDateTimeInZone);
  } catch (error) {
    console.error("Error in hasCurrentDateTimePassedTargetDateTime:", error);
    return false;
  }
};

// Function to calculate the end time of a class.
export function getEndTime(date: Date): Date {
  return new Date(date.getTime() + 25 * 60 * 1000);
}

// Function to return short form of the day of the week.
export function getWeekday(date: Date, timeZone: string) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    timeZone,
  }).format(date);
}

// Converts a date string to the format YYYY-MM-DD.
export const formatBirthdateToISO = (dateString?: string) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "";
  return date.toISOString().split("T")[0];
};

// Converts a date in YYYY-MM-DD format to ISO 8601 format (YYYY-MM-DDTHH:MM:SS.sssZ).
export const formatDateToISO = (dateString: string): string => {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    throw new Error("Invalid date format");
  }
  return date.toISOString();
};

// e.g., Monday, Tuesday ...
export const getDayOfWeek = (date: Date, locale: string = "en-US"): string => {
  const formatter = new Intl.DateTimeFormat(locale, { weekday: "long" });
  return formatter.format(date);
};

// e.g., "en-US": MAY, JAN ..., "ja-JP": 5, 6 ...
export const getShortMonth = (date: Date, locale: string = "en-US"): string => {
  if (locale === "ja-JP") {
    return String(date.getMonth() + 1);
  }

  const formatter = new Intl.DateTimeFormat(locale, { month: "short" });
  return formatter.format(date).toUpperCase();
};

// Formats a Date object into a short string according to the selected language(e.g., "Jun 29, 2024" "2024年6月29日") for the "en-US" locale.
export const formatShortDate = (
  date: Date,
  locale: string = "en-US",
  timeZone?: string,
) => {
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
    ...(timeZone && { timeZone }),
  }).format(date);
};

// Formats a Date object into a 24-hour time string without leading zeros (e.g., "9:00").
export const formatTime24Hour = (date: Date, timeZone?: string): string => {
  const options: Intl.DateTimeFormatOptions = {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: timeZone || undefined,
  };

  const formatted = new Intl.DateTimeFormat("en-US", options).format(date);
  return formatted.replace(/^0/, "");
};

export const nHoursLater = (n: number, dateTime: Date = new Date()): Date => {
  return new Date(dateTime.getTime() + n * 60 * 60 * 1000);
};

export const nHoursBefore = (n: number, dateTime: Date = new Date()): Date => {
  return new Date(dateTime.getTime() - n * 60 * 60 * 1000);
};

export const hasTimePassed = (targetTime: Date | string): boolean =>
  Date.now() > new Date(targetTime).getTime();

export const formatClassDetailFooter = (updatedDateTime: string) => {
  const updatedDate = new Date(updatedDateTime);
  return format(updatedDate, "yyyy-MM-dd-HH:mm");
};
