import { type ImportExecuteResponse } from "@shared/schemas/admins";

const FRONTEND_ORIGIN =
  process.env.NEXT_PUBLIC_FRONTEND_ORIGIN || "http://localhost:3000";

const PROXY_URL = `${FRONTEND_ORIGIN}/api/proxy`;

const executeErrorMessage = "Failed to execute normalized import";
const incrementalErrorMessage = "Failed to execute incremental import";

const readImportResponse = async (response: Response, fallback: string) => {
  try {
    return await response.json();
  } catch {
    if (response.status === 504) {
      throw new Error(
        "The import request timed out. Check the current data before retrying; the import may have completed.",
      );
    }
    throw new Error(`${fallback} (HTTP ${response.status})`);
  }
};

export interface AdminImportExecuteError extends Error {
  details?: unknown;
}

export const executeNormalizedImport = async (
  file: File,
): Promise<ImportExecuteResponse> => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(PROXY_URL, {
    method: "POST",
    headers: {
      "backend-endpoint": "/admins/import/execute",
    },
    body: formData,
  });

  const data = await readImportResponse(response, executeErrorMessage);
  if (!response.ok) {
    const error = new Error(
      typeof data?.message === "string" ? data.message : executeErrorMessage,
    ) as AdminImportExecuteError;
    error.details = data;
    throw error;
  }

  return data as ImportExecuteResponse;
};

export const executeIncrementalAdminImport = async (
  target: "customers" | "instructors",
  file: File,
): Promise<ImportExecuteResponse> => {
  const formData = new FormData();
  formData.append("file", file);
  const response = await fetch(PROXY_URL, {
    method: "POST",
    headers: {
      "backend-endpoint": `/admins/import/incremental/${target}`,
    },
    body: formData,
  });
  const data = await readImportResponse(response, incrementalErrorMessage);
  if (!response.ok) {
    const error = new Error(
      typeof data?.message === "string"
        ? data.message
        : incrementalErrorMessage,
    ) as AdminImportExecuteError;
    error.details = data;
    throw error;
  }
  return data as ImportExecuteResponse;
};
