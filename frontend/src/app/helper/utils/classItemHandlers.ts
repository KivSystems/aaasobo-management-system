import { Dispatch, SetStateAction } from "react";
import { hasTimePassed } from "./dateUtils";
import {
  updateAttendanceAction,
  updateClassStatusAction,
} from "@/app/actions/updateContent";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  errorAlert,
  warningAlert,
  confirmAlert,
} from "@/app/helper/utils/alertUtils";

export const handleChildChange = (
  event: React.ChangeEvent<HTMLInputElement>,
  changedChildId: number,
  setAttendedChildrenIdsToUpdate: Dispatch<SetStateAction<number[]>>,
) => {
  const isChecked = event.target.checked;

  if (isChecked) {
    setAttendedChildrenIdsToUpdate((prev) => [...prev, changedChildId]);
  } else {
    setAttendedChildrenIdsToUpdate((prev) =>
      prev.filter((n) => n !== changedChildId),
    );
  }
};

export const handleAttendanceUpdate = async ({
  classId,
  instructorId,
  adminId,
  classEndTime,
  initialAttendedChildrenIds,
  attendedChildrenIdsToUpdate,
  setIsUpdatingData,
  setIsEditingAttendance,
}: HandleAttendanceUpdateParams) => {
  if (!hasTimePassed(classEndTime)) {
    return warningAlert(
      "You can only edit attendance after the class has ended.",
    );
  }

  const removedIds = initialAttendedChildrenIds.filter(
    (id) => !attendedChildrenIdsToUpdate.includes(id),
  );
  const addedIds = attendedChildrenIdsToUpdate.filter(
    (id) => !initialAttendedChildrenIds.includes(id),
  );

  if (removedIds.length === 0 && addedIds.length === 0) {
    return errorAlert("No updates were made.");
  }

  setIsUpdatingData(true);

  const result = await updateAttendanceAction(
    classId,
    attendedChildrenIdsToUpdate,
    instructorId,
    adminId,
  );

  if (!result.success) {
    setIsUpdatingData(false);
    return errorAlert(result.message);
  }

  toast.success(result.message);

  setIsEditingAttendance(false);
  setIsUpdatingData(false);
};

export const handleClassStatusUpdate = async ({
  classId,
  selectedStatus,
  classEndTime,
  instructorId,
  adminId,
  setIsUpdatingData,
  setIsEditingStatus,
}: HandleClassStatusUpdateParams) => {
  if (!selectedStatus) {
    return errorAlert("No updates were made.");
  }

  if (selectedStatus === "completed" && !hasTimePassed(classEndTime)) {
    return warningAlert(
      "You can only complete a class after the class has ended.",
    );
  }

  if (adminId && selectedStatus) {
    const confirmed = await confirmAlert(
      "Are you sure you want to change the class status?",
    );
    if (!confirmed) return;
  }

  setIsUpdatingData(true);

  const result = await updateClassStatusAction(
    classId,
    selectedStatus,
    instructorId,
    adminId,
  );

  setIsUpdatingData(false);

  if (!result.success) return errorAlert(result.message);

  toast.success(result.message);

  if (setIsEditingStatus) setIsEditingStatus(false);
};
