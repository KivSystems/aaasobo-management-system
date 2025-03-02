import { useEffect, useState } from "react";

export function useFormMessages(
  registerResultState: Record<string, string> | undefined,
) {
  const [localMessages, setLocalMessages] = useState<Record<string, string>>(
    {},
  );

  useEffect(() => {
    setLocalMessages(registerResultState ?? {});
  }, [registerResultState]);

  const clearErrorMessage = (field: string) => {
    if (localMessages[field]) {
      setLocalMessages((prev) => ({ ...prev, [field]: "" }));
    }
  };

  return { localMessages, clearErrorMessage };
}
