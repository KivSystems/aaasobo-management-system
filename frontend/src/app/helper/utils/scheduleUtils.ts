export type Weekday = "Sun" | "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat";

export const WEEKDAYS: Weekday[] = [
  "Sun",
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
];

export const weekdayToDay = (weekday: number): Weekday => WEEKDAYS[weekday];

export class BusinessTime {
  public static getDisabledTimes = (day: Weekday) => {
    switch (day) {
      case "Sun":
        return BusinessTime.sundayDisabledTimes;
      case "Sat":
        return BusinessTime.saturdayDisabledTimes;
      default:
        return BusinessTime.weekdayDisabledTimes;
    }
  };

  private static createSlots = (hours: string[]) => {
    const minutes = ["00", "30"];
    return hours
      .map((hour) => minutes.map((minute) => `${hour}:${minute}`))
      .flat();
  };

  public static readonly times = BusinessTime.createSlots([
    "09",
    "10",
    "11",
    "12",
    "13",
    "14",
    "15",
    "16",
    "17",
    "18",
    "19",
    "20",
  ]);

  private static readonly weekdayDisabledTimes = BusinessTime.createSlots([
    "09",
    "10",
    "11",
    "12",
    "13",
    "14",
    "15",
  ]);

  private static readonly saturdayDisabledTimes = BusinessTime.createSlots([
    "12",
    "13",
    "14",
    "15",
    "16",
    "17",
    "18",
    "19",
    "20",
  ]);

  private static readonly sundayDisabledTimes = BusinessTime.times;
}

export const utcToJstTime = (utcDateString: string): string => {
  const utcDate = new Date(utcDateString);
  const jstDate = new Date(utcDate.getTime() + 9 * 60 * 60 * 1000);
  return jstDate.toISOString().substring(11, 16);
};

export const jstTimeToUtc = (jstTime: string): string => {
  const timeWithSeconds = jstTime.length === 5 ? `${jstTime}:00` : jstTime;
  const jstDate = new Date(`1970-01-01T${timeWithSeconds}+09:00`);
  return jstDate.toISOString();
};

export const slotToKey = (weekday: number, startTime: string): string =>
  `${weekday}-${startTime}`;

export const keyToSlot = (
  key: string,
): { weekday: number; startTime: string } => {
  const [weekday, startTime] = key.split("-");
  return { weekday: parseInt(weekday), startTime };
};
