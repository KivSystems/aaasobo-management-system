import { useEffect, useState } from "react";

export function useFormMessages<T extends FormResult>(
  formResult: T | undefined,
) {
  const [localMessages, setLocalMessages] = useState<T>({} as T);

  useEffect(() => {
    setLocalMessages(formResult ?? ({} as T));
  }, [formResult]);

  const clearErrorMessage = (field: string) => {
    setLocalMessages((prev) => {
      if (field === "all") {
        return {} as T;
      }

      if (!prev[field] && !prev.successMessage && !prev.errorMessage) {
        return prev;
      }

      const updatedMessages = { ...prev };
      delete updatedMessages[field];
      delete updatedMessages.successMessage;
      delete updatedMessages.errorMessage;

      return updatedMessages;
    });
  };

  return { localMessages, clearErrorMessage };
}
