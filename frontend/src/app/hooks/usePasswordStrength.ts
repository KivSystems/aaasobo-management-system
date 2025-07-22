import { useEffect, useState } from "react";
import zxcvbn from "zxcvbn";

export function usePasswordStrength(password: string) {
  const [passwordStrength, setPasswordStrength] = useState<number | null>(null);
  const [passwordFeedback, setPasswordFeedback] = useState<string>("");

  useEffect(() => {
    if (password) {
      const result = zxcvbn(password);
      setPasswordStrength(result.score);
      setPasswordFeedback(result.feedback.suggestions.join(" "));
    } else {
      setPasswordStrength(null);
      setPasswordFeedback("");
    }
  }, [password]);

  return { passwordStrength, passwordFeedback };
}
