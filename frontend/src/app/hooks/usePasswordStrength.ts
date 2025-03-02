import { useEffect, useState } from "react";
import zxcvbn from "zxcvbn";

export function usePasswordStrength(password: string) {
  const [passwordStrength, setPasswordStrength] = useState<number>(0);
  const [passwordFeedback, setPasswordFeedback] = useState<string>("");

  useEffect(() => {
    if (password) {
      const result = zxcvbn(password);
      setPasswordStrength(result.score);
      setPasswordFeedback(result.feedback.suggestions.join(" "));
    } else {
      setPasswordStrength(0);
      setPasswordFeedback("");
    }
  }, [password]);

  return { passwordStrength, passwordFeedback };
}
