"use client";

import RegularClassesTable from "@/app/components/customers-dashboard/regular-classes/RegularClassesTable";
import styles from "./CurrentSubscription.module.scss";
import {
  PLAN_LABEL,
  PRESENT_LABEL,
  NO_SUBSCRIPTION_MESSAGE,
} from "@/app/helper/messages/customerDashboard";
import ActionButton from "../../elements/buttons/actionButton/ActionButton";
import { deleteSubscriptionAction } from "@/app/actions/deleteContent";
import { useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function CurrentSubscription({
  subscriptionsData,
  userSessionType,
  adminId,
  customerId,
  language,
  onSubscriptionDeleted,
}: {
  subscriptionsData?: Subscriptions | null;
  userSessionType?: UserType;
  adminId?: number;
  customerId: number;
  language: LanguageType;
  onSubscriptionDeleted: () => void;
}) {
  const [deleteResultState, setDeleteResultState] = useState<DeleteFormState>(
    {},
  );
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleDeleteSubscription = async (id: number) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this subscription?",
    );
    if (!confirmed) return;

    // prevent duplicate clicks
    if (deletingId !== null) return;

    try {
      setDeletingId(id);
      const result = await deleteSubscriptionAction(id);
      setDeleteResultState(result);

      const success = !!(result && !result.errorMessage);

      if (success) {
        toast.success("Subscription deleted successfully.");
        onSubscriptionDeleted();
      } else {
        toast.error("Failed to delete subscription.");
        console.error("Failed to delete subscription:", result);
      }
    } catch (error) {
      console.error("Error deleting subscription:", error);
    } finally {
      setDeletingId(null);
    }
  };

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
                  <div className={styles.planDateInfo}>
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
                  <div className={styles.buttons}>
                    {userSessionType === "admin" ? (
                      <ActionButton
                        onClick={() => handleDeleteSubscription(id)}
                        btnText={deletingId === id ? "DELETING..." : "DELETE"}
                        className="deleteBtn"
                        disabled={deletingId === id}
                      />
                    ) : (
                      <></>
                    )}
                  </div>
                </div>
              </div>
              <div className={styles.classesContent}>
                <RegularClassesTable
                  subscriptionId={id}
                  userSessionType={userSessionType}
                  adminId={adminId}
                  customerId={customerId}
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
