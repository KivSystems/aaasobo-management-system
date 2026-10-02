"use client";

import FullCalendar from "@fullcalendar/react";
import jaLocale from "@fullcalendar/core/locales/ja";
import dayGridPlugin from "@fullcalendar/daygrid";
import momentTimezonePlugin from "@fullcalendar/moment-timezone";
import calendarStyles from "@/components/customers-dashboard/classes/customerCalensar/CustomerCalendar.module.scss";
import type {
  SchedulePreview,
  SchedulePreviewEvent,
} from "@shared/schemas/schedulePreview";
import styles from "./ScheduleChangeCalendar.module.scss";
import { createRenderEventContent } from "@/lib/utils/calendarUtils";

type Change = "removed" | "added" | "unchanged";
const signature = (e: SchedulePreviewEvent) =>
  JSON.stringify([
    e.dateTime,
    e.instructorId,
    [...e.childrenIds].sort((a, b) => a - b),
    e.status,
  ]);
const isCanceled = (e: SchedulePreviewEvent) => e.status.startsWith("canceled");

export default function ScheduleChangeCalendar({
  calendar,
  timeZone = "Asia/Tokyo",
  language = "ja",
}: {
  calendar: SchedulePreview;
  timeZone?: string;
  language?: LanguageType;
}) {
  const ja = language === "ja";
  const renderEventContent = createRenderEventContent(
    "customer",
    timeZone,
    language,
  );
  const remaining = [...calendar.after];
  const events: { event: SchedulePreviewEvent; change: Change }[] =
    calendar.before.map((event) => {
      const index = remaining.findIndex(
        (e) => signature(e) === signature(event),
      );
      if (index < 0) return { event, change: "removed" };
      remaining.splice(index, 1);
      return { event, change: "unchanged" };
    });
  events.push(
    ...remaining.map((event) => ({ event, change: "added" as const })),
  );
  events.sort((a, b) => a.event.dateTime.localeCompare(b.event.dateTime));
  const changed = events.filter((e) => e.change !== "unchanged");
  const initialDate = changed[0]?.event.dateTime ?? new Date().toISOString();
  const label = (change: Change, event: SchedulePreviewEvent) =>
    change === "removed"
      ? ja
        ? isCanceled(event)
          ? "削除予定"
          : "キャンセル予定"
        : "Remove"
      : change === "added"
        ? ja
          ? "追加予定"
          : "Add"
        : ja
          ? "変更なし"
          : "Unchanged";
  return (
    <section
      className={styles.preview}
      aria-label={ja ? "スケジュール変更プレビュー" : "Schedule change preview"}
    >
      <div className={styles.legend}>
        <span>
          <i className={styles.legendBox} aria-hidden="true" />
          {ja ? "継続" : "Kept"}
        </span>
        <span>
          <i className={styles.legendBox} aria-hidden="true">
            <span className={`${styles.changeBadge} ${styles.removed}`}>×</span>
          </i>
          {ja ? "キャンセル・削除予定" : "To be removed"} (
          {events.filter((e) => e.change === "removed").length})
        </span>
        <span>
          <i className={styles.legendBox} aria-hidden="true">
            <span className={`${styles.changeBadge} ${styles.added}`}>+</span>
          </i>
          {ja ? "追加予定" : "To be added"} ({remaining.length})
        </span>
        <span className={styles.timeZone}>{timeZone}</span>
      </div>
      <div className={calendarStyles.calendarShell}>
        <FullCalendar
          plugins={[dayGridPlugin, momentTimezonePlugin]}
          initialView="dayGridMonth"
          initialDate={initialDate}
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "",
          }}
          locale={ja ? jaLocale : "en"}
          buttonText={{ today: ja ? "今日" : "today" }}
          buttonHints={{
            prev: ja ? "前の月" : "Previous month",
            next: ja ? "次の月" : "Next month",
            today: ja ? "今日" : "Today",
          }}
          timeZone={timeZone}
          contentHeight="auto"
          fixedWeekCount={false}
          dayMaxEvents={false}
          editable={false}
          selectable={false}
          eventDisplay="block"
          dayCellContent={(arg) => arg.dayNumberText.replace(/[^0-9]/g, "")}
          events={events.map(({ event, change }) => ({
            id: `${change}:${event.id}`,
            start: event.dateTime,
            title: event.childrenNames.join(", "),
            classNames: [
              styles.calendarEvent,
              isCanceled(event) ? styles.canceled : "",
            ],
            extendedProps: {
              event,
              change,
              instructorIcon: event.instructorIcon,
              instructorNickname: event.instructorName,
              classStatus: event.status,
            },
          }))}
          eventContent={(info) => {
            const { event, change } = info.event.extendedProps as {
              event: SchedulePreviewEvent;
              change: Change;
            };
            return (
              <div
                className={styles.event}
                title={`${label(change, event)} / ${event.childrenNames.join("・")} / ${event.instructorName}`}
              >
                {change !== "unchanged" && (
                  <span
                    className={`${styles.changeBadge} ${styles[change]}`}
                    aria-label={label(change, event)}
                  >
                    {change === "removed" ? "×" : "+"}
                  </span>
                )}
                {renderEventContent(info)}
              </div>
            );
          }}
        />
      </div>
    </section>
  );
}
