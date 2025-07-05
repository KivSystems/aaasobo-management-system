import { useCallback } from "react";

export function useFormFieldSetter<T extends object>(
  setFormData: React.Dispatch<React.SetStateAction<T>>,
) {
  return useCallback(
    <K extends keyof T>(field: K, value: T[K]) => {
      setFormData((prev) => {
        if (prev[field] === value) return prev;
        return {
          ...prev,
          [field]: value,
        };
      });
    },
    [setFormData],
  );
}
