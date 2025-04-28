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

// Converts a UTC ISO date string to the specified time zone, calculates the end time by adding 25 minutes,
// and formats both start and end times as "YYYY-MM-DDTHH:MM:SS" for use in calendar events.
export function getClassStartAndEndTimes(isoDateStr: string, timeZone: string) {
  const utcDate = new Date(isoDateStr);
  const zonedStartDate = toZonedTime(utcDate, timeZone);

  const start = zonedStartDate;
  const end = addMinutes(start, 25);

  return {
    start: format(start, "yyyy-MM-dd'T'HH:mm:ssXXX"),
    end: format(end, "yyyy-MM-dd'T'HH:mm:ssXXX"),
  };
}

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
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: false,
  }).format(updatedDate);
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

// TODO: Remove this function once the deadline calculation for class rebooking is implemented.
export const formatFiveMonthsLaterEndOfMonth = (
  date: Date | string,
  timeZone: string,
) => {
  const futureDate = new Date(date);

  futureDate.setMonth(futureDate.getMonth() + 5);

  const endOfMonth = new Date(
    futureDate.getFullYear(),
    futureDate.getMonth() + 1,
    0,
  );

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    timeZone,
  }).format(endOfMonth);
};

// TODO: Remove this function once the deadline calculation for class rebooking is implemented.
const getEndOfNMonthsLaterInISO = (isoString: string, n: number): string => {
  const date = new Date(isoString);

  // Step 1: Get the current UTC year and month
  let year = date.getUTCFullYear();
  let month = date.getUTCMonth() + n;

  // Step 2: Adjust year and month if month overflows
  if (month > 11) {
    year += Math.floor(month / 12);
    month = month % 12;
  }

  // Step 3: Create a new Date object for the **first day of the next month**
  const firstOfNextMonth = new Date(Date.UTC(year, month + 1, 1));

  // Step 4: Subtract 1 ms to get the last moment of the previous month (end of the target month)
  const endOfMonth = new Date(firstOfNextMonth.getTime() - 1);

  // Step 5: Return as ISO string
  return endOfMonth.toISOString();
};

// TODO: Remove this function once the deadline calculation for class rebooking is implemented.
export const formatEndOfMonthFiveMonthsLater = (
  isoString: string,
  locale?: string,
): { date: string; time: string } => {
  // Step 1: Convert UTC → JST manually (+9 hours) e.g., "2025-04-12T09:00:00.000Z" => "2025-04-12T18:00:00.000Z"
  const utcDate = new Date(isoString);
  const jstDateISOString = new Date(
    utcDate.getTime() + 9 * 60 * 60 * 1000,
  ).toISOString();

  // Step 2: Get the last day and time of the month, five months later (still in Japan time) e.g., "2025-04-12T18:00:00.000Z" => "2025-09-30T23:59:59.999Z"
  const jstEndOfTargetMonthISOString = getEndOfNMonthsLaterInISO(
    jstDateISOString,
    5,
  );

  // Step 3: Convert JST → UTC manually (-9 hours) e.g., "2025-09-30T23:59:59.999Z" => "2025-09-30T14:59:59.999Z"
  const jstEndDate = new Date(jstEndOfTargetMonthISOString);
  const utcEndOfTargetMonthISOString = new Date(
    jstEndDate.getTime() - 9 * 60 * 60 * 1000,
  ).toISOString();

  // Step 4: Convert UTC ISO String to the user's local time
  const localTime = new Date(utcEndOfTargetMonthISOString);

  // Step 5: Format the date and time
  const date = formatShortDate(localTime, locale);
  const time = formatTime24Hour(localTime);

  return { date, time };
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

// Function to check if the current date & time in a particular time zone is past the target class end time
export const isPastClassEndTime = (
  classDateTime: string,
  timeZone: string,
): boolean => {
  try {
    // Convert class start time to zoned time
    const classDateTimeInZone = toZonedTime(classDateTime, timeZone);

    // Calculate the end time of the class
    const classEndTime = getEndTime(classDateTimeInZone);

    // Get the current date & time in the specified time zone
    const currentDateTimeInZone = toZonedTime(new Date(), timeZone);

    // Check if the current date & time is after the class end time
    return isAfter(currentDateTimeInZone, classEndTime);
  } catch (error) {
    console.error("Error in isPastClassEndTime:", error);
    return false;
  }
};

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
export const getDayOfWeek = (date: Date): string => {
  const formatter = new Intl.DateTimeFormat("en-US", { weekday: "long" });
  return formatter.format(date);
};

// e.g., JAN, FEB ...
export const getShortMonth = (date: Date): string => {
  const formatter = new Intl.DateTimeFormat("en-US", { month: "short" });
  return formatter.format(date).toUpperCase(); // Converts to uppercase
};

// Formats a Date object into a short string according to the selected language(e.g., "Jun 29, 2024" "2024年6月29日") for the "en-US" locale.
export const formatShortDate = (
  date: Date,
  locale: string = Intl.DateTimeFormat().resolvedOptions().locale,
) => {
  const day = date.getDate();
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(date.setDate(day)));
};

// Formats a Date object into a 24-hour time string without leading zeros (e.g., "9:00").
export const formatTime24Hour = (date: Date): string => {
  const hours = date.getHours();
  const minutes = date.getMinutes();

  return `${hours}:${minutes.toString().padStart(2, "0")}`;
};

export const getClassSlotTimesForCalendar = () => {
  // Step 1: Get the user's timezone offset from UTC in minutes
  const timezoneOffsetMinutes = new Date().getTimezoneOffset();

  // Step 2: Calculate class start and end times, which are UTC midnight and noon (in Japan time: start at 09:00 and end at 21:00)
  const utcClassesStartTime = new Date(Date.UTC(1970, 0, 1, 0, 0, 0)); // 00:00 UTC
  const utcClassesEndTime = new Date(Date.UTC(1970, 0, 1, 12, 0, 0)); // 12:00 UTC

  // Step 3: Adjust UTC times to the user's local time by subtracting the timezone offset
  const localClassesStartTime = new Date(
    utcClassesStartTime.getTime() - timezoneOffsetMinutes * 60 * 1000,
  );
  const localClassesEndTime = new Date(
    utcClassesEndTime.getTime() - timezoneOffsetMinutes * 60 * 1000,
  );

  // Step 4: Format times to "HH:mm:ss"
  const formatTime = (date: Date) => date.toISOString().substring(11, 19);
  const formattedLocalClassesStartTime = formatTime(localClassesStartTime);
  const formattedLocalClassesEndTime = formatTime(localClassesEndTime);

  // Step 5: Compare and set correct min and max times
  // In some time zones (e.g., Vancouver), the local class start time (17:00) is later than the end time (05:00).
  // In such cases, the min and max times need to be reversed.
  const slotMinTime =
    formattedLocalClassesStartTime < formattedLocalClassesEndTime
      ? formattedLocalClassesStartTime
      : formattedLocalClassesEndTime;
  const slotMaxTime =
    formattedLocalClassesEndTime > formattedLocalClassesStartTime
      ? formattedLocalClassesEndTime
      : formattedLocalClassesStartTime;

  return {
    slotMinTime,
    slotMaxTime,
  };
};
