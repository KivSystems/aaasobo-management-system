"use client";

import styles from "./PlanProfile.module.scss";
import { toast } from "react-toastify";
import { useState, useEffect } from "react";
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

function PlanProfile({
  plan,
  userSessionType,
}: {
  plan: Plan | string;
  userSessionType?: UserType;
}) {
  const [updateResultState, formAction] = useFormState(updatePlanAction, {});
  const [previousPlan, setPreviousPlan] = useState<Plan | null>(
    typeof plan !== "string" ? plan : null,
  );
  const [latestPlan, setLatestPlan] = useState<Plan | null>(
    typeof plan !== "string" ? plan : null,
  );
  const [isEditing, setIsEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<boolean | null>(null);

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleDeleteClick = () => {
    setConfirmDelete(
      window.confirm(`Are you sure you want to delete this plan?`),
    );
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: keyof Plan,
  ) => {
    if (latestPlan) {
      setLatestPlan({ ...latestPlan, [field]: e.target.value });
    }
  };

  const handleCancelClick = () => {
    if (latestPlan) {
      setLatestPlan(previousPlan);
      setIsEditing(false);
    }
  };

  useEffect(() => {
    if (updateResultState !== undefined) {
      if ("plan" in updateResultState) {
        const result = updateResultState as { plan: Plan };

        if (result.plan.terminationAt) {
          toast.success(CONTENT_DELETE_SUCCESS_MESSAGE("plan"));
          setPreviousPlan(null);
          setLatestPlan(null);
        } else {
          toast.success(CONTENT_UPDATE_SUCCESS_MESSAGE("plan"));
          setIsEditing(false);
          setPreviousPlan(result.plan);
          setLatestPlan(result.plan);
        }

        // Clear updateResultState to avoid re-rendering
        updateResultState.plan = null;
        return;
      } else if ("skipProcessing" in updateResultState) {
        return;
      } else {
        const result = updateResultState as { errorMessage: string };
        toast.error(result.errorMessage);
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
                <p className={styles.planName__text}>Plan</p>
                {isEditing ? (
                  <InputField
                    name="planName"
                    value={latestPlan.name}
                    onChange={(e) => handleInputChange(e, "name")}
                    className={`${styles.planName__inputField} ${isEditing ? styles.editable : ""}`}
                  />
                ) : (
                  <h3 className={styles.planName__name}>{latestPlan.name}</h3>
                )}
              </div>

              {/* Weekly class times */}
              <div className={styles.insideContainer}>
                <CalendarIcon className={styles.icon} />
                <div>
                  <p>Weekly class times</p>
                  {isEditing ? (
                    <InputField
                      name="weeklyClassTimes"
                      type="number"
                      value={String(latestPlan.weeklyClassTimes)}
                      onChange={(e) => handleInputChange(e, "weeklyClassTimes")}
                      className={`${styles.planName__inputField} ${isEditing ? styles.editable : ""}`}
                      readonly
                    />
                  ) : (
                    <h4 className={styles.weeklyClassTimes__text}>
                      {latestPlan.weeklyClassTimes}
                    </h4>
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
              <input type="hidden" name="id" value={latestPlan.id} />
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
