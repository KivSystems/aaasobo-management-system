import { useMemo } from "react";
import zxcvbn from "zxcvbn";

export function usePasswordStrength(password: string) {
  const result = useMemo(() => {
    if (!password) return null;
    return zxcvbn(password);
  }, [password]);

  return {
    passwordStrength: result ? result.score : null,
    passwordFeedback: result ? result.feedback.suggestions.join(" ") : "",
  };
}
