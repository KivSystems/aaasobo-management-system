"use client";

import RegularClassesTableWip from "@/app/components/customers-dashboard/regular-classes/RegularClassesTableWip";
import styles from "./CurrentSubscription.module.scss";

function CurrentSubscriptionWip({
  subscriptionsData,
  isAdminAuthenticated,
  adminId,
  customerId,
}: {
  subscriptionsData?: Subscriptions | null;
  isAdminAuthenticated?: boolean | null;
  adminId?: number;
  customerId: number;
}) {
  return (
    <div className={styles.outsideContainer}>
      {subscriptionsData && subscriptionsData.subscriptions.length > 0 ? (
        subscriptionsData.subscriptions.map((subscription, index) => {
          const { id, plan, startAt } = subscription;
          const startDate = new Date(startAt);

          return (
            <div key={id} className={styles.subscriptionSection}>
              <div className={styles.enhancedHeader}>
                <div className={styles.headerContent}>
                  <div className={styles.planInfo}>
                    <span className={styles.planName}>{plan.name} Plan</span>
                  </div>
                  <div className={styles.dateInfo}>
                    <span className={styles.dateText}>
                      {startDate.toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                      })}{" "}
                      - Present
                    </span>
                  </div>
                </div>
              </div>

              <div className={styles.classesContent}>
                <RegularClassesTableWip
                  subscriptionId={id}
                  isAdminAuthenticated={isAdminAuthenticated}
                  adminId={adminId}
                  customerId={customerId}
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
        <p>
          You don&apos;t have any subscription yet. Please make a payment on
          SelectType and let the staff know.
        </p>
      )}
    </div>
  );
}

export default CurrentSubscriptionWip;
