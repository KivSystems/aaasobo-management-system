import { localizeAdminMessage } from "@/lib/messages/adminMessages";
import { Dispatch, SetStateAction } from "react";
import { hasTimePassed } from "./dateUtils";
import {
  updateAttendanceAction,
  updateClassStatusAction,
} from "@/app/actions/updateContent";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { errorAlert, warningAlert, confirmAlert } from "@/lib/utils/alertUtils";

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
      adminId
        ? "出席状況はクラス終了後に編集できます。"
        : "You can only edit attendance after the class has ended.",
    );
  }

  const removedIds = initialAttendedChildrenIds.filter(
    (id) => !attendedChildrenIdsToUpdate.includes(id),
  );
  const addedIds = attendedChildrenIdsToUpdate.filter(
    (id) => !initialAttendedChildrenIds.includes(id),
  );

  if (removedIds.length === 0 && addedIds.length === 0) {
    return errorAlert(adminId ? "変更がありません。" : "No updates were made.");
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
    return errorAlert(
      adminId ? localizeAdminMessage(result.message) : result.message,
    );
  }

  toast.success(adminId ? "更新しました" : result.message);

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
    return errorAlert(adminId ? "変更がありません。" : "No updates were made.");
  }

  if (selectedStatus === "completed" && !hasTimePassed(classEndTime)) {
    return warningAlert(
      adminId
        ? "クラス終了後に完了に変更できます。"
        : "You can only complete a class after the class has ended.",
    );
  }

  if (adminId && selectedStatus) {
    const confirmed = await confirmAlert("クラスの状態を変更しますか？", "ja");
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

  if (!result.success)
    return errorAlert(
      adminId ? localizeAdminMessage(result.message) : result.message,
    );

  toast.success(adminId ? "更新しました" : result.message);

  if (setIsEditingStatus) setIsEditingStatus(false);
};
