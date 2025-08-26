export type Day = "Sun" | "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat";

export const days: Day[] = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
export const JAPAN_TIME_DIFF = 9;

export type Month =
  | "January"
  | "February"
  | "March"
  | "April"
  | "May"
  | "June"
  | "July"
  | "August"
  | "September"
  | "October"
  | "November"
  | "December";

export const months: Month[] = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

// Get the first Date of the month after `months` months from `date`.
export function getFirstDateInMonths(date: Date, months: number): Date {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth();
  const d = new Date(Date.UTC(year, month + months, 1));
  return d;
}

// Generate the data between `start` and `end` dates including `end`.
export function createDatesBetween(start: Date, end: Date): Date[] {
  const dates = [];
  while (start < end) {
    dates.push(new Date(start));
    start.setUTCDate(start.getUTCDate() + 7);
  }
  return dates;
}

// Return the number of the week day (e.g., Sun: 0, Mon: 1...)
export const getDayNumber = (day: Day): number => {
  return days.indexOf(day);
};

// Calculate the first date of `day` and `time` after `from`.
// e.g., from: "2024-08-01", day: "Mon", time: "09:00" => "2024-08-05T00:00:00Z"
export function calculateFirstDate(from: Date, day: Day, time: string): Date {
  const date = new Date(from);

  // The following calculation for setDate works only for after 09:00 in Japanese time.
  // Japanese time is UTC+9. Thus, after 09:00, date.getUTCDay() returns the same day as in Japan.
  date.setDate(
    date.getDate() + ((getDayNumber(day) - date.getUTCDay() + 7) % 7),
  );

  const [hour, minute] = time.split(":");
  // TODO: Consider the affected part.
  date.setUTCHours(parseInt(hour));
  date.setUTCMinutes(parseInt(minute));
  return date;
}

export const getMonthNumber = (month: Month): number => {
  return months.indexOf(month);
};

// Function to format time (e.g., 19:00)
export const formatTime = (date: Date) => {
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  return new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone,
  }).format(date);
};

// Function to format UTC time (e.g., 19:00)
export const formatUTCTime = (date: Date) => {
  return new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "UTC",
  }).format(date);
};

// Convert local day and time to UTC day and time (e.g., {day: Fri, time: 07:30 } )
export function convertDayTimeToUTC(day: Day, time: string) {
  const [hour, minute] = time.split(":");

  // Get current date
  const now = new Date();
  const utcTodayIndex = now.getDay();
  const localDayIndex = days.indexOf(day);

  // Calculate the date difference between today and the local day
  let dayDifference = localDayIndex - utcTodayIndex;
  if (dayDifference < 0) dayDifference += 7; // Adjust the week if needed

  // Adjust the date based on the day difference and set the time.
  const adjustedDate = new Date();
  adjustedDate.setDate(now.getDate() + dayDifference);
  adjustedDate.setHours(Number(hour), Number(minute), 0, 0);

  // Convert to UTC
  const utcDayIndex = adjustedDate.getUTCDay();
  const utcTime = `${adjustedDate.getUTCHours().toString().padStart(2, "0")}:${adjustedDate.getUTCMinutes().toString().padStart(2, "0")}`;

  return {
    utcDay: days[utcDayIndex],
    utcTime,
  };
}

// Convert a date string to ISO format with UTC time zone.
// e.g., "01/05/2025" "2025-01-05" => "2025-01-05T00:00:00.000Z"
export function convertToISOString(dateStr: string): string {
  let year: number, month: number, day: number;

  // 1. YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    [year, month, day] = dateStr.split("-").map(Number);
  }
  // 2. MM/DD/YYYY
  else if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) {
    [month, day, year] = dateStr.split("/").map(Number);
  }
  // 3. Other formats -> Throw an error
  else {
    throw new Error(`Unsupported date format: ${dateStr}`);
  }

  return new Date(Date.UTC(year, month - 1, day)).toISOString();
}

export const nHoursLater = (n: number, dateTime: Date = new Date()) => {
  return new Date(dateTime.getTime() + n * 60 * 60 * 1000);
};

export const nHoursBefore = (n: number, dateTime: Date = new Date()): Date => {
  return new Date(dateTime.getTime() - n * 60 * 60 * 1000);
};

export const nDaysLater = (n: number, dateTime: Date = new Date()) => {
  return nHoursLater(n * 24, dateTime);
};

export function isSameLocalDate(
  utcDateTime: Date | string,
  timeZone: string,
): boolean {
  const localToday = new Date().toLocaleDateString("en-CA", { timeZone });
  const localTarget = new Date(utcDateTime).toLocaleDateString("en-CA", {
    timeZone,
  });

  return localToday === localTarget;
}

// Formats a UTC date into a localized year, date and time string based on the specified locale and time zone.: e.g., "Thu, January 11 at 09:30", "1月11日(木) 9:30"
export const formatYearDateTime = (
  utcDate: Date | string,
  locale: string = "ja-JP",
  timeZone: string = "Asia/Tokyo",
): string => {
  const date = new Date(utcDate);

  return new Intl.DateTimeFormat(locale, {
    timeZone,
    weekday: "short",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: false,
  }).format(date);
};

// Get the first date of the year that is a designated day.

export const getFirstDesignatedDayOfYear = (year: number, day: Day): Date => {
  // Create a date object for January 1st of the specified year based on UTC
  const date = new Date(Date.UTC(year, 0, 1));

  // Set the date to the first occurrence of the specified day in that year
  while (date.getDay() !== getDayNumber(day)) {
    date.setDate(date.getDate() + 1);
  }

  return date;
};

/**
 * Returns the start and end of the day in JST (00:00:00–23:59:59.999) as UTC Date objects.
 * @param dateTime A UTC datetime (Date object or ISO string)
 * @returns An object containing startOfDay and endOfDay in UTC
 */
export function getJstDayRange(dateTime: string | Date): {
  startOfDay: Date;
  endOfDay: Date;
} {
  const targetDate = new Date(dateTime);

  // Convert to JST by adding 9 hours
  const jstTime = targetDate.getTime() + 9 * 60 * 60 * 1000;
  const jstDate = new Date(jstTime);

  // Extract JST year, month, and day using UTC getters
  const year = jstDate.getUTCFullYear();
  const month = String(jstDate.getUTCMonth() + 1).padStart(2, "0");
  const day = String(jstDate.getUTCDate()).padStart(2, "0");
  const dateOnly = `${year}-${month}-${day}`; // e.g. "2025-07-30"

  // Create start of JST day in UTC (JST 00:00 → UTC 15:00 on previous day)
  const startOfDay = new Date(`${dateOnly}T00:00:00.000Z`);
  startOfDay.setUTCHours(startOfDay.getUTCHours() - 9);

  // Create end of JST day in UTC (JST 23:59:59 → UTC 14:59:59)
  const endOfDay = new Date(`${dateOnly}T23:59:59.999Z`);
  endOfDay.setUTCHours(endOfDay.getUTCHours() - 9);

  return { startOfDay, endOfDay };
}
