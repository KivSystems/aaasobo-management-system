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
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  d.setUTCDate(1);
  d.setUTCHours(0, 0, 0);
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

export const nHoursLater = (n: number, dateTime: Date = new Date()) => {
  return new Date(dateTime.getTime() + n * 60 * 60 * 1000);
};

export const nHoursBefore = (n: number, dateTime: Date = new Date()): Date => {
  return new Date(dateTime.getTime() - n * 60 * 60 * 1000);
};
