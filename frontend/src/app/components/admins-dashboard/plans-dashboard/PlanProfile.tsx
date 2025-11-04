"use client";

import styles from "./PlanProfile.module.scss";
import { toast } from "react-toastify";
import { useState, useEffect, useCallback } from "react";
import { useFormState } from "react-dom";
import { updatePlanAction } from "@/app/actions/updateContent";
import InputField from "../../elements/inputField/InputField";
import ActionButton from "../../elements/buttons/actionButton/ActionButton";
import {
  CalendarIcon,
  PencilIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";
import "react-toastify/dist/ReactToastify.css";
import Loading from "@/app/components/elements/loading/Loading";
import {
  CONTENT_UPDATE_SUCCESS_MESSAGE,
  CONTENT_DELETE_SUCCESS_MESSAGE,
} from "@/app/helper/messages/formValidation";
import { confirmAlert } from "@/app/helper/utils/alertUtils";
import { getLocalizedText } from "@/app/helper/utils/stringUtils";

function PlanProfile({
  plan,
  userSessionType,
}: {
  plan: Plan | string;
  userSessionType?: UserType;
}) {
  const [updateResultState, formAction] = useFormState(updatePlanAction, {});
  const [previousPlan, setPreviousPlan] = useState<Plan | null>(
    typeof plan !== "string"
      ? {
          ...plan,
          planNameEng: getLocalizedText(plan.name, "en"),
          planNameJpn: getLocalizedText(plan.name, "ja"),
        }
      : null,
  );
  const [latestPlan, setLatestPlan] = useState<Plan | null>(
    typeof plan !== "string"
      ? {
          ...plan,
          planNameEng: getLocalizedText(plan.name, "en"),
          planNameJpn: getLocalizedText(plan.name, "ja"),
        }
      : null,
  );
  const [isEditing, setIsEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<boolean | null>(null);
  // Handle form messages manually for UpdateFormState
  const [localMessages, setLocalMessages] = useState<Record<string, string>>(
    {},
  );

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleDeleteClick = async () => {
    const confirmed = await confirmAlert(
      "Are you sure you want to delete this plan?",
    );
    setConfirmDelete(confirmed);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: keyof Plan,
  ) => {
    if (latestPlan) {
      setLatestPlan({ ...latestPlan, [field]: e.target.value });
    }
  };

  const clearErrorMessage = useCallback((field: string) => {
    setLocalMessages((prev) => {
      if (field === "all") {
        return {};
      }
      const updatedMessages = { ...prev };
      delete updatedMessages[field];
      delete updatedMessages.errorMessage;
      return updatedMessages;
    });
  }, []);

  const handleCancelClick = () => {
    if (latestPlan) {
      setLatestPlan(previousPlan);
      setIsEditing(false);
      clearErrorMessage("planNameJpn");
      clearErrorMessage("planNameEng");
      clearErrorMessage("description");
    }
  };

  useEffect(() => {
    if (updateResultState !== undefined) {
      if ("plan" in updateResultState) {
        const result = updateResultState as { plan: Plan };

        if (result.plan.terminationAt) {
          // Deletion case
          toast.success(CONTENT_DELETE_SUCCESS_MESSAGE("plan"));
          setPreviousPlan(null);
          setLatestPlan(null);
        } else {
          // Update case
          toast.success(CONTENT_UPDATE_SUCCESS_MESSAGE("plan"));
          setIsEditing(false);
          setPreviousPlan({
            ...result.plan,
            planNameEng: getLocalizedText(result.plan.name, "en"),
            planNameJpn: getLocalizedText(result.plan.name, "ja"),
          });
          setLatestPlan({
            ...result.plan,
            planNameEng: getLocalizedText(result.plan.name, "en"),
            planNameJpn: getLocalizedText(result.plan.name, "ja"),
          });
        }

        // Clear updateResultState to avoid re-rendering
        updateResultState.plan = null;
        return;
      } else if ("skipProcessing" in updateResultState) {
        return;
      } else {
        const newMessages: Record<string, string> = {};
        if (updateResultState.planNameJpn)
          newMessages.planNameJpn = updateResultState.planNameJpn;
        if (updateResultState.planNameEng)
          newMessages.planNameEng = updateResultState.planNameEng;
        if (updateResultState.errorMessage)
          newMessages.errorMessage = updateResultState.errorMessage;
        setLocalMessages(newMessages);
        return;
      }
    }
  }, [updateResultState]);

  if (typeof plan === "string") {
    return <p>{plan}</p>;
  }

  if (!latestPlan) {
    return <p>Plan not found</p>;
  }

  return (
    <>
      <div className={styles.container}>
        {latestPlan ? (
          <form action={formAction} className={styles.profileCard}>
            <div className={styles.profileCard}>
              {/* Plan name */}
              <div className={styles.planName__nameSection}>
                {isEditing ? (
                  <div>
                    <p className={styles.planName__text}>
                      Plan Name (Japanese)
                    </p>
                    <InputField
                      name="planNameJpn"
                      value={latestPlan.planNameJpn}
                      onChange={(e) => handleInputChange(e, "planNameJpn")}
                      error={localMessages.planNameJpn}
                      className={`${styles.planName__inputField} ${isEditing ? styles.editable : ""}`}
                    />
                    <p className={styles.planName__text}>Plan Name (English)</p>
                    <InputField
                      name="planNameEng"
                      value={latestPlan.planNameEng}
                      onChange={(e) => handleInputChange(e, "planNameEng")}
                      error={localMessages.planNameEng}
                      className={`${styles.planName__inputField} ${isEditing ? styles.editable : ""}`}
                    />
                  </div>
                ) : (
                  <h3 className={styles.planName__name}>{latestPlan.name}</h3>
                )}
              </div>

              {/* Weekly class times */}
              <div className={styles.insideContainer}>
                <CalendarIcon className={styles.icon} />
                <div>
                  {isEditing ? (
                    <>
                      <p>
                        Weekly class times{" "}
                        <span className={styles.weeklyClassTimes__redText}>
                          (Uneditable)
                        </span>
                      </p>
                      <InputField
                        name="weeklyClassTimes"
                        type="number"
                        value={String(latestPlan.weeklyClassTimes)}
                        onChange={(e) =>
                          handleInputChange(e, "weeklyClassTimes")
                        }
                        className={`${styles.weeklyClassTimes__inputField} ${isEditing ? styles.editable : ""}`}
                        readOnly
                      />
                    </>
                  ) : (
                    <>
                      <p>Weekly class times</p>
                      <h4 className={styles.weeklyClassTimes__text}>
                        {latestPlan.weeklyClassTimes}
                      </h4>
                    </>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className={styles.insideContainer}>
                <PencilIcon className={styles.icon} />
                <div>
                  <p className={styles.planName__text}>Description</p>
                  {isEditing ? (
                    <InputField
                      name="description"
                      value={latestPlan.description}
                      onChange={(e) => handleInputChange(e, "description")}
                      error={localMessages.description}
                      className={`${styles.planDescription__inputField} ${isEditing ? styles.editable : ""}`}
                    />
                  ) : (
                    <h4 className={styles.planDescription__text}>
                      {latestPlan.description}
                    </h4>
                  )}
                </div>
              </div>

              {/* Hidden input field */}
              <input type="hidden" name="planId" value={latestPlan.id} />
              <input
                type="hidden"
                name="confirmDelete"
                value={confirmDelete ? confirmDelete.toString() : ""}
              />

              {/* Action buttons for only admin */}
              {userSessionType === "admin" ? (
                <>
                  {isEditing ? (
                    <div className={styles.buttons}>
                      <ActionButton
                        className="cancelEditingPlan"
                        btnText="Cancel"
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          handleCancelClick();
                        }}
                      />
                      <ActionButton
                        className="savePlan"
                        btnText="Save"
                        type="submit"
                        Icon={CheckIcon}
                      />
                    </div>
                  ) : (
                    <div className={styles.buttons}>
                      <div>
                        <ActionButton
                          className="deletePlan"
                          btnText="Delete"
                          type="submit"
                          onClick={handleDeleteClick}
                        />
                      </div>
                      <div>
                        <ActionButton
                          className="editPlan"
                          btnText="Edit"
                          type="button"
                          onClick={handleEditClick}
                        />
                      </div>
                    </div>
                  )}
                </>
              ) : null}
            </div>
          </form>
        ) : (
          <Loading />
        )}
      </div>
    </>
  );
}

export default PlanProfile;
