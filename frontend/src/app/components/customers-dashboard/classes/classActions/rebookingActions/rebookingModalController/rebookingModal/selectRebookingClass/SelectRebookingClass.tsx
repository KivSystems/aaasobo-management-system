"use client";

import styles from "./SelectRebookingClass.module.scss";
import InfoBanner from "@/app/components/elements/infoBanner/InfoBanner";
import { TODAYS_CLASS_REBOOKING_NOTICE } from "@/app/helper/messages/customerDashboard";
import ActionButton from "@/app/components/elements/buttons/actionButton/ActionButton";
import RebookableClassList from "./rebookableClassList/RebookableClassList";
import Table from "@/app/components/elements/table/Table";

export default function SelectRebookingClass({
  rebookableClasses,
  setIsRebookingModalOpen,
  setRebookingStep,
  setClassToRebook,
  language,
}: SelectRebookingClassProps) {
  return (
    <div className={styles.modal}>
      <h3 className={styles.modal__title}>
        {language === "ja"
          ? "振替予約するクラスをお選びください"
          : "Please select the class to rebook."}
      </h3>

      <Table
        className="rebookableClassList"
        headItems={
          language === "ja"
            ? ["振替可能クラス", "クラスID", ""]
            : ["Rebookable Classes", "Class ID", ""]
        }
      >
        <RebookableClassList
          rebookableClasses={rebookableClasses}
          language={language}
          setRebookingStep={setRebookingStep}
          setClassToRebook={setClassToRebook}
        />
      </Table>

      <InfoBanner info={TODAYS_CLASS_REBOOKING_NOTICE[language]} />

      <div className={styles.modal__backBtn}>
        <ActionButton
          btnText={language === "ja" ? "戻る" : "Back"}
          className="back"
          onClick={() => setIsRebookingModalOpen(false)}
        />
      </div>
    </div>
  );
}
