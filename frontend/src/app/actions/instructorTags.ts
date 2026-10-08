"use server";

import { localizeAdminMessage } from "@/lib/messages/adminMessages";

import {
  createInstructorTag,
  deleteInstructorTag,
  saveInstructorTags,
} from "@/lib/api/instructorsApi";
import { getCookie } from "@/proxy";
import { revalidateInstructorList } from "./revalidate";
import type { TagCatalogResponse } from "@shared/schemas/instructors";

export type InstructorTagUpdateState = {
  successMessage?: string;
  errorMessage?: string;
  tag?: TagCatalogResponse["tags"][number];
  selectedTagIds?: number[];
  deletedTagId?: number;
};

export async function createInstructorTagAction(
  label: string,
): Promise<InstructorTagUpdateState> {
  try {
    const cookie = await getCookie();
    const tag = await createInstructorTag(label, cookie);
    revalidateInstructorList();
    return {
      successMessage: "タグを作成しました。",
      tag,
    };
  } catch (error) {
    return {
      errorMessage:
        error instanceof Error
          ? localizeAdminMessage(error.message)
          : "タグの作成に失敗しました。",
    };
  }
}

export async function deleteInstructorTagAction(
  tagId: number,
): Promise<InstructorTagUpdateState> {
  try {
    const cookie = await getCookie();
    await deleteInstructorTag(tagId, cookie);
    revalidateInstructorList();
    return {
      successMessage: "タグを削除しました。",
      deletedTagId: tagId,
    };
  } catch {
    return {
      errorMessage: "タグの削除に失敗しました。",
    };
  }
}

export async function saveInstructorTagsAction(
  instructorId: number,
  tagIds: number[],
): Promise<InstructorTagUpdateState> {
  try {
    const cookie = await getCookie();
    await saveInstructorTags(instructorId, { tagIds }, cookie);
    revalidateInstructorList();
    return {
      successMessage: "タグを保存しました。",
      selectedTagIds: tagIds,
    };
  } catch {
    return {
      errorMessage: "タグの保存に失敗しました。",
    };
  }
}
