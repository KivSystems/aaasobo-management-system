import { useCallback, useMemo, useState } from "react";

export function useFormMessages<T extends FormResult>(formResult?: T) {
  const [clearedFields, setClearedFields] = useState<Set<string>>(new Set());

  const localMessages = useMemo(() => {
    const base = (formResult ?? {}) as T;
    if (clearedFields.size === 0) {
      return base;
    }
    if (clearedFields.has("all")) {
      return {} as T;
    }

    const updated = { ...base };
    clearedFields.forEach((field) => {
      delete updated[field];
      delete updated.errorMessage;
    });

    return updated;
  }, [formResult, clearedFields]);

  const clearErrorMessage = useCallback((field: string) => {
    setClearedFields((prev) => {
      if (field === "all") {
        return new Set(["all"]);
      }
      const next = new Set(prev);
      next.delete("all");
      next.add(field);
      return next;
    });
  }, []);

  const resetMessages = useCallback(() => {
    setClearedFields(new Set());
  }, []);

  return { localMessages, clearErrorMessage, resetMessages };
}
