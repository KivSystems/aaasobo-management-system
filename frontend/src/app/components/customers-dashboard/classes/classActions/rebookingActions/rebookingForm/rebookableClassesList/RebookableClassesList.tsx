"use client";

import Table from "@/app/components/elements/table/Table";
import styles from "./RebookableClassesList.module.scss";
import { useLanguage } from "@/app/contexts/LanguageContext";
import InfoBanner from "@/app/components/elements/infoBanner/InfoBanner";
import { TODAYS_CLASS_REBOOKING_NOTICE } from "@/app/helper/messages/customerDashboard";
import RebookableClassList from "../../rebookableClassList/RebookableClassList";

export default function RebookableClassesList({
  customerId,
  rebookableClasses,
  setClassToRebook,
  setRebookingStep,
}: RebookableClassesListProps) {
  const { language } = useLanguage();

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
            ? ["振替可能クラス", "クラスコード", ""]
            : ["Rebookable Classes", "Class Code", ""]
        }
      >
        <RebookableClassList
          customerId={customerId}
          rebookableClasses={rebookableClasses}
          setClassToRebook={setClassToRebook}
          setRebookingStep={setRebookingStep}
          language={language}
        />
      </Table>

      <InfoBanner info={TODAYS_CLASS_REBOOKING_NOTICE[language]} />
    </div>
  );
}
