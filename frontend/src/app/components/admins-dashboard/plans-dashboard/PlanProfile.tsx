"use client";

import styles from "./PlanProfile.module.scss";
import { useState, useEffect } from "react";
import { useFormState } from "react-dom";
// TODO: Uncomment the import when the updateData action is implemented
// import { updateData } from "@/app/actions/updateData";
import InputField from "../../elements/inputField/InputField";
import ActionButton from "../../elements/buttons/actionButton/ActionButton";
import {
  CalendarIcon,
  PencilIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Loading from "@/app/components/elements/loading/Loading";

function PlanProfile({
  plan,
  userSessionType,
}: {
  plan: Plan | string;
  userSessionType?: UserType;
}) {
  // TODO: Uncomment the import when the updatePlanAction action is implemented
  // const [updateResultState, formAction] = useFormState(updatePlanAction, {});
  const [previousPlan, setPreviousPlan] = useState<Plan | null>(
    typeof plan !== "string" ? plan : null,
  );
  const [latestPlan, setLatestPlan] = useState<Plan | null>(
    typeof plan !== "string" ? plan : null,
  );
  const [isEditing, setIsEditing] = useState(false);

  const handleEditClick = () => {
    setIsEditing(true);
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

  // TODO: Uncomment the useEffect when the updateResultState is available
  // useEffect(() => {
  //   if (updateResultState !== undefined) {
  //     if ("plan" in updateResultState) {
  //       const result = updateResultState as { plan: Plan };
  //       toast.success("Profile updated successfully!");
  //       setIsEditing(false);
  //       setPreviousPlan(result.plan);
  //       setLatestPlan(result.plan);
  //     } else {
  //       const result = updateResultState as { errorMessage: string };
  //       toast.error(result.errorMessage);
  //     }
  //   }
  // }, [updateResultState]);

  if (typeof plan === "string") {
    return <p>{plan}</p>;
  }

  return (
    <>
      <div className={styles.container}>
        {latestPlan ? (
          // TODO: Uncomment the formAction when the updatePlanAction action is implemented
          // <form action={formAction} className={styles.profileCard}>
          <div className={styles.profileCard}>
            {/* Plan name */}
            <div className={styles.planName__nameSection}>
              <p className={styles.planName__text}>Plan</p>
              {isEditing ? (
                <InputField
                  name="name"
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
                  />
                ) : (
                  <h4>{latestPlan.weeklyClassTimes}</h4>
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
                  <h4>{latestPlan.description}</h4>
                )}
              </div>
            </div>

            {/* Hidden input field */}
            <input type="hidden" name="id" value={latestPlan.id} />

            {/* Action buttons for only admin */}
            {userSessionType === "admin" ? (
              <>
                {isEditing ? (
                  <div className={styles.buttons}>
                    <ActionButton
                      className="cancelEditingInstructor"
                      btnText="Cancel"
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        handleCancelClick();
                      }}
                    />

                    <ActionButton
                      className="saveInstructor"
                      btnText="Save"
                      type="submit"
                      Icon={CheckIcon}
                    />
                  </div>
                ) : (
                  <div className={styles.buttons}>
                    <ActionButton
                      className="editInstructor"
                      btnText="Edit"
                      onClick={handleEditClick}
                    />
                  </div>
                )}
              </>
            ) : null}
          </div>
        ) : (
          <Loading />
        )}
      </div>
    </>
  );
}

export default PlanProfile;
