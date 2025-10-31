"use client";

import React, { ChangeEvent, useEffect, useState } from "react";
import Modal from "../elements/modal/Modal";
import styles from "./EditSubscriptionModal.module.scss";
import {
  CalendarIcon,
  UserGroupIcon,
  AcademicCapIcon,
} from "@heroicons/react/24/solid";
import { getAllPlans } from "@/app/helper/api/plansApi";
import RegularClassesTable from "../customers-dashboard/regular-classes/RegularClassesTable";

type EditSubscriptionModalProps = {
  isOpen: boolean;
  onClose: () => void;
  subscription: Subscription | null;
  userSessionType?: UserType;
  adminId?: number;
  customerId: number;
  customerTerminationAt: string | null | undefined;
  language: LanguageType;
};

function EditSubscriptionModal({
  isOpen,
  onClose,
  subscription,
  userSessionType,
  adminId,
  customerId,
  customerTerminationAt,
  language,
}: EditSubscriptionModalProps) {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  //   const { localMessages, clearErrorMessage } =
  //     useFormMessages<LocalizedMessages>(profileUpdateResult);
  const [selectedRecurringIds, setSelectedRecurringIds] = useState<number[]>(
    [],
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const currentWeeklyTimes = subscription?.plan?.weeklyClassTimes ?? 0;
  const selectedWeeklyTimes = selectedPlan?.weeklyClassTimes ?? 0;

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const plansData = await getAllPlans();
        const initial =
          plansData.find((p) => p.id === subscription?.planId) ?? null;
        setPlans(plansData);
        setSelectedPlan(initial);
      } catch (e) {
        console.error("Failed to fetch plans:", e);
      }
    };
    fetchPlans();
  }, []);

  const handleSelectPlan = (e: ChangeEvent<HTMLSelectElement>) => {
    const selectedPlanId = Number(e.target.value);
    const plan = plans.find((p) => p.id === selectedPlanId);
    if (!plan) return;
    setSelectedPlan(plan);
  };

  const toggleRecurringSelection = (id: number) => {
    setSelectedRecurringIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const resetAndClose = () => {
    // setEditingInstructor(false);
    // setEditingChildren(false);
    // setModalStep("instructor");
    // setError("");
    onClose();
  };

  const handleSubmit = async () => {
    if (subscription?.planId === selectedPlan?.id) {
      setError("Select a different plan from the current one.");
      return;
    }

    if (selectedRecurringIds.length !== selectedWeeklyTimes) {
      setError(
        "Select the number of regular classes you want to terminate based on the plan you selected.",
      );
      return;
    }

    setLoading(true);
    setError("");

    // TODO: Add calling API
  };

  if (!isOpen) return null;
  if (!subscription) return null;

  return (
    <Modal isOpen={isOpen} onClose={resetAndClose} overlayClosable={true}>
      <div className={styles.progressiveFlow}>
        <div className={styles.modalHeader}>
          <h2>Edit a plan</h2>
        </div>

        <div className={styles.sectionsContainer}>
          {error && <div className={styles.error}>{error}</div>}

          {/* Select a new plan section */}
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <AcademicCapIcon className={styles.sectionIcon} />
              <h3>Select a new Plan</h3>
            </div>
            <div className={styles.sectionContent}>
              <select
                className={styles.dateInput}
                name="plan"
                defaultValue={subscription.planId}
                onChange={handleSelectPlan}
                required
              >
                {plans.map((plan) => {
                  return (
                    <option key={plan.id} value={plan.id}>
                      {plan.name}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          {/* Select the regular classes Section */}
          {selectedPlan && selectedWeeklyTimes < currentWeeklyTimes ? (
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <AcademicCapIcon className={styles.sectionIcon} />
                <h3>Select the ones you want to terminate</h3>
              </div>
              <div className={styles.sectionContent}>
                <span className={styles.selectedValue}>
                  <div className={styles.classesContent}>
                    <RegularClassesTable
                      subscriptionId={subscription.id}
                      userSessionType={userSessionType}
                      adminId={adminId}
                      customerId={customerId}
                      customerTerminationAt={customerTerminationAt}
                      language={language}
                      isSelectable={true}
                      selectedRecurringIds={selectedRecurringIds}
                      onToggleRecurring={toggleRecurringSelection}
                    />
                  </div>
                </span>
              </div>
            </div>
          ) : (
            <></>
          )}

          {/* Action Buttons */}
          <div className={styles.confirmationActions}>
            <button onClick={resetAndClose} className={styles.cancelButton}>
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className={styles.confirmButton}
              // disabled={loading || selectedChildrenIds.length === 0}
            >
              {loading ? "Applying..." : "Apply Changes"}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

export default EditSubscriptionModal;
