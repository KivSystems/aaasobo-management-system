"use client";

import RegularClassesTable from "@/app/components/customers-dashboard/regular-classes/RegularClassesTable";
import styles from "./CurrentSubscription.module.scss";
import {
  PLAN_LABEL,
  PRESENT_LABEL,
  NO_SUBSCRIPTION_MESSAGE,
} from "@/app/helper/messages/customerDashboard";

function CurrentSubscription({
  subscriptionsData,
  userSessionType,
  adminId,
  customerId,
  language,
}: {
  subscriptionsData?: Subscriptions | null;
  userSessionType?: UserType;
  adminId?: number;
  customerId: number;
  language: LanguageType;
}) {
  return (
    <div className={styles.outsideContainer}>
      {subscriptionsData && subscriptionsData.subscriptions.length > 0 ? (
        subscriptionsData.subscriptions.map((subscription, index) => {
          const { id, plan, startAt, customerTerminationAt } = subscription;
          const startDate = new Date(startAt);

          return (
            <div key={id} className={styles.subscriptionSection}>
              <div className={styles.enhancedHeader}>
                <div className={styles.headerContent}>
                  <div className={styles.planInfo}>
                    <span className={styles.planName}>
                      {plan.name} {PLAN_LABEL[language]}
                    </span>
                  </div>
                  <div className={styles.dateInfo}>
                    <span className={styles.dateText}>
                      {language === "ja"
                        ? startDate.toLocaleDateString("ja-JP", {
                            year: "numeric",
                            month: "long",
                          })
                        : startDate.toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                          })}{" "}
                      - {PRESENT_LABEL[language]}
                    </span>
                  </div>
                </div>
              </div>
              <div className={styles.classesContent}>
                <RegularClassesTable
                  subscriptionId={id}
                  userSessionType={userSessionType}
                  adminId={adminId}
                  customerId={customerId}
                  customerTerminationAt={customerTerminationAt}
                  language={language}
                />
              </div>

              {/* Add spacing between multiple subscriptions */}
              {index < subscriptionsData.subscriptions.length - 1 && (
                <div className={styles.subscriptionDivider}></div>
              )}
            </div>
          );
        })
      ) : (
        <p>{NO_SUBSCRIPTION_MESSAGE[language]}</p>
      )}
    </div>
  );
}

export default CurrentSubscription;
