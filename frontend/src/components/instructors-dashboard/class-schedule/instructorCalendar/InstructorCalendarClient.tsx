"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import jaLocale from "@fullcalendar/core/locales/ja";
import { useRouter } from "next/navigation";
import { useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import momentTimezonePlugin from "@fullcalendar/moment-timezone";
import type { CalendarApi, EventClickArg } from "@fullcalendar/core";
import {
  createRenderEventContent,
  getClassSlotTimesForCalendar,
  getDayCellColorHandler,
} from "@/lib/utils/calendarUtils";
import CalendarLegend from "@/components/features/calendarLegend/CalendarLegend";
import MessageBoardPanel from "@/components/features/messageBoardPanel/MessageBoardPanel";
import styles from "./InstructorCalendarClient.module.scss";
import { MessageTarget } from "@/types";

const InstructorCalendarClient = ({
  adminId,
  instructorId,
  userSessionType,
  instructorCalendarEvents,
  validRange,
  businessSchedule,
  colorsForEvents,
  messageBoardPosts = [],
}: InstructorCalendarClientProps) => {
  const { language } = useLanguage();
  const router = useRouter();
  const [calendarApi, setCalendarApi] = useState<CalendarApi | null>(null);
  const [currentTitle, setCurrentTitle] = useState("");
  const [currentView, setCurrentView] = useState("timeGridWeek");
  const [isTodayInRange, setIsTodayInRange] = useState(false);
  const visiblePosts = messageBoardPosts.filter(
    (post) =>
      post.target === MessageTarget.instructor ||
      post.target === MessageTarget.both,
  );

  const handleEventClick = (clickInfo: EventClickArg) => {
    if (clickInfo.event.title === "No booked class") return;

    const classId = clickInfo.event.extendedProps.classId;
    const redirectURL =
      userSessionType === "admin"
        ? `/admins/calendar/${instructorId}/class-schedule/${classId}`
        : `/instructors/class-schedule/${classId}`;

    router.push(redirectURL);
  };

  const renderInstructorEventContent = createRenderEventContent(
    "instructor",
    undefined,
    language,
  );

  const classSlotTimes = getClassSlotTimesForCalendar();

  const dayCellColors = getDayCellColorHandler(businessSchedule);

  const handleCalendarNav = (action: "prev" | "next" | "today") => {
    if (!calendarApi) return;
    if (action === "prev") calendarApi.prev();
    if (action === "next") calendarApi.next();
    if (action === "today") calendarApi.today();
  };

  const handleViewChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const nextView = event.target.value;
    setCurrentView(nextView);
    calendarApi?.changeView(nextView);
  };

  return (
    <div className={`${styles.calendarContainer} ${styles.withMobileToolbar}`}>
      <MessageBoardPanel
        posts={visiblePosts}
        storageKey="instructorClassScheduleMessageBoardOpenState"
        readMessageStorageKey={"readInstructorMessageNumber"}
      />
      <div className={styles.mobileToolbar}>
        <div className={styles.navGroup}>
          <button
            type="button"
            className={`${styles.navButton} fc-button fc-button-primary fc-prev-button`}
            onClick={() => handleCalendarNav("prev")}
            aria-label={language === "ja" ? "前へ" : "Previous"}
          >
            {"<"}
          </button>
          <button
            type="button"
            className={`${styles.navButton} fc-button fc-button-primary fc-next-button`}
            onClick={() => handleCalendarNav("next")}
            aria-label={language === "ja" ? "次へ" : "Next"}
          >
            {">"}
          </button>
          <button
            type="button"
            className={`${styles.todayButton} fc-button fc-button-primary fc-today-button${
              isTodayInRange ? " fc-button-disabled" : ""
            }`}
            onClick={() => handleCalendarNav("today")}
            disabled={isTodayInRange}
          >
            {language === "ja" ? "今日" : "today"}
          </button>
        </div>
        <div className={styles.mobileTitle}>{currentTitle}</div>
        <div className={styles.actionGroup}>
          <select
            className={styles.viewSelect}
            value={currentView}
            onChange={handleViewChange}
            aria-label={
              language === "ja"
                ? "カレンダーの表示を選択"
                : "Select calendar view"
            }
          >
            <option value="dayGridMonth">
              {language === "ja" ? "月" : "Month"}
            </option>
            <option value="timeGridWeek">
              {language === "ja" ? "週" : "Week"}
            </option>
            <option value="timeGridDay">
              {language === "ja" ? "日" : "Day"}
            </option>
          </select>
        </div>
      </div>
      <FullCalendar
        plugins={[
          dayGridPlugin,
          timeGridPlugin,
          interactionPlugin,
          momentTimezonePlugin,
        ]}
        initialView={"timeGridWeek"}
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,timeGridWeek,timeGridDay",
        }}
        events={instructorCalendarEvents}
        eventClick={handleEventClick}
        eventContent={renderInstructorEventContent}
        validRange={validRange}
        locales={[jaLocale]}
        locale={language}
        contentHeight="auto"
        dayMaxEvents={true}
        editable={false}
        selectable={false}
        eventDisplay="block"
        allDaySlot={false}
        {...(classSlotTimes && {
          slotMinTime: classSlotTimes.start,
          slotMaxTime: classSlotTimes.end,
        })}
        slotLabelFormat={{
          hour: "numeric",
          minute: "2-digit",
          hour12: false,
        }}
        dayCellDidMount={dayCellColors}
        datesSet={(arg) => {
          setCalendarApi(arg.view.calendar);
          setCurrentTitle(arg.view.title);
          setCurrentView(arg.view.type);
          const now = new Date();
          const isInRange =
            arg.view.currentStart <= now && now < arg.view.currentEnd;
          setIsTodayInRange(isInRange);
        }}
      />

      {colorsForEvents.length > 0 && (
        <CalendarLegend colorsForEvents={colorsForEvents} language={language} />
      )}
    </div>
  );
};

export default InstructorCalendarClient;
