import { useEffect, useState } from "react";

export function useFormMessages(
  formResult: Record<string, string> | undefined,
) {
  const [localMessages, setLocalMessages] = useState<Record<string, string>>(
    {},
  );

  useEffect(() => {
    setLocalMessages(formResult ?? {});
  }, [formResult]);

  const clearErrorMessage = (field: string) => {
    setLocalMessages((prev) => {
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
