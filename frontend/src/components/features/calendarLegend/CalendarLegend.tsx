import React from "react";
import styles from "./CalendarLegend.module.scss";
import { getLocalizedText } from "@/lib/utils/stringUtils";

export default function CalendarLegend({
  colorsForEvents,
  language,
}: {
  colorsForEvents: { event: string; color: string }[]; // [{event: "通常授業日 / Regular Class Day", color::"#FFFFFF"}, {} ...]
  language: LanguageType;
}) {
  return (
    <div className={styles.legendContainer}>
      {colorsForEvents.map((item, index) => (
        <div key={index} className={styles.legendItem}>
          <span
            className={styles.colorSquare}
            style={{ backgroundColor: item.color }}
          />
          <span className={styles.label}>
            {getLocalizedText(item.event, language)}
          </span>
        </div>
      ))}
    </div>
  );
}
