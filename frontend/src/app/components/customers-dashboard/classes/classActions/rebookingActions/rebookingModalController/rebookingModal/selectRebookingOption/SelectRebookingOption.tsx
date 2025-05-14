"use client";

import ActionButton from "@/app/components/elements/buttons/actionButton/ActionButton";
import { useState } from "react";
import styles from "./SelectRebookingOption.module.scss";
import RedirectButton from "@/app/components/elements/buttons/redirectButton/RedirectButton";

export default function SelectRebookingOption({
  isAdminAuthenticated,
  customerId,
  setRebookingStep,
  classToRebook,
  language,
}: SelectRebookingOptionProps) {
  const [rebookingOption, setRebookingOption] = useState<
    "instructor" | "dateTime" | null
  >(null);
  const redirectUrl = isAdminAuthenticated
    ? `/admins/customer-list/${customerId}/classes/book`
    : `/customers/${customerId}/classes/book`;

  return (
    <div className={styles.modal}>
      <div className={styles.buttons}>
        <button>
          {language === "ja"
            ? "インストラクターから予約"
            : "Book with Instructor"}{" "}
        </button>
        <button>
          {language === "ja" ? "日時から予約" : "Book by Date & Time"}{" "}
        </button>
      </div>

      <h3>
        {language === "ja"
          ? `振替予約するクラス: ID ${classToRebook}`
          : `Class to Rebook: ID ${classToRebook}`}
      </h3>
      <button onClick={() => setRebookingStep("confirmRebooking")}>
        {language === "ja" ? "振替予約" : "Rebook Class"}{" "}
      </button>
      <RedirectButton
        className="bookBtn"
        linkURL={redirectUrl}
        btnText={language === "ja" ? "予約ページ" : "Booking Page"}
      />

      <div className={styles.modal__backBtn}>
        <ActionButton
          btnText={language === "ja" ? "戻る" : "Back"}
          className="back"
          onClick={() => setRebookingStep("selectClass")}
        />
      </div>
    </div>
  );
}
