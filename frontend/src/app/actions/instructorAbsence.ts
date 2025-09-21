"use server";

import { getCookie } from "../../middleware";
import { revalidatePath } from "next/cache";
import {
  addInstructorAbsence,
  deleteInstructorAbsence,
} from "../helper/api/instructorsApi";
import { formatYearDateTime } from "../helper/utils/dateUtils";

export type AbsenceChange = {
  dateTime: string;
  action: "add" | "remove";
  originalType: "available" | "absence";
};

type BatchAbsenceResult = {
  success: boolean;
  successCount: { add: number; remove: number };
  errors: string[];
  message?: string;
};

export async function batchUpdateInstructorAbsences(
  instructorId: number,
  changes: AbsenceChange[],
): Promise<BatchAbsenceResult> {
  try {
    const cookie = await getCookie();
    const errors: string[] = [];
    const successCount = { add: 0, remove: 0 };

    // Process all pending changes
    for (const change of changes) {
      try {
        switch (change.action) {
          case "add": {
            await addInstructorAbsence(instructorId, change.dateTime, cookie);
            successCount.add++;
            break;
          }
          case "remove": {
            await deleteInstructorAbsence(
              instructorId,
              change.dateTime,
              cookie,
            );
            successCount.remove++;
            break;
          }
          default:
            errors.push(
              `Unknown action "${change.action}" for ${formatYearDateTime(new Date(change.dateTime))}`,
            );
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        const action = change.action === "add" ? "add" : "remove";
        errors.push(
          `Failed to ${action} absence for ${formatYearDateTime(new Date(change.dateTime))}: ${errorMessage}`,
        );
      }
    }

    // Revalidate the instructor schedule page to refresh data
    revalidatePath(`/admins/[adminId]/instructor-list/[instructorId]`, "page");

    const totalSuccesses = successCount.add + successCount.remove;
    const totalAttempts = changes.length;

    let message = "";
    if (errors.length === 0 && totalSuccesses > 0) {
      // All successful
      const successMessages = [];
      if (successCount.add > 0)
        successMessages.push(`${successCount.add} absences added`);
      if (successCount.remove > 0)
        successMessages.push(`${successCount.remove} absences removed`);
      message = `Success: ${successMessages.join(", ")}`;
    } else if (totalSuccesses > 0) {
      // Partial success
      const successMessages = [];
      if (successCount.add > 0)
        successMessages.push(`${successCount.add} absences added`);
      if (successCount.remove > 0)
        successMessages.push(`${successCount.remove} absences removed`);
      message = `Partial success: ${successMessages.join(", ")}. ${errors.length} failed.`;
    } else if (totalAttempts === 0) {
      // No changes to process
      message = "No changes were made.";
    } else {
      // All failed
      message = `All ${totalAttempts} changes failed.`;
    }

    return {
      success: errors.length === 0,
      successCount,
      errors,
      message,
    };
  } catch (error) {
    console.error("Batch absence update failed:", error);
    return {
      success: false,
      successCount: { add: 0, remove: 0 },
      errors: [
        `Failed to process changes: ${error instanceof Error ? error.message : String(error)}`,
      ],
      message: "Failed to process changes. Please try again.",
    };
  }
}
