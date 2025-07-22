import { useCallback, useEffect, useState } from "react";

export function useFormMessages<T extends FormResult>(formResult?: T) {
  const [localMessages, setLocalMessages] = useState<T>({} as T);

  useEffect(() => {
    if (formResult) {
      setLocalMessages(formResult);
    }
  }, [formResult]);

  const clearErrorMessage = useCallback((field: string) => {
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
  }, []);

  return { localMessages, setLocalMessages, clearErrorMessage };
}
