import { FormEvent, useEffect, useState } from "react";
import { useInput } from "@/app/hooks/useInput";
import { useSelect } from "@/app/hooks/useSelect";
import { prefectures } from "@/app/helper/data/data";
import { registerCustomer } from "@/app/helper/api/customersApi";
import zxcvbn from "zxcvbn";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import styles from "./RegisterForm.module.scss";
import {
  EnvelopeIcon,
  HomeIcon,
  LockClosedIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";
import { customerRegisterSchema } from "@/app/schemas/customerAuthSchema";
import ActionButton from "../../elements/buttons/actionButton/ActionButton";
import TextInput from "../../elements/textInput/TextInput";
import PasswordStrengthMeter from "../../elements/passwordStrengthMeter/PasswordStrengthMeter";

const RegisterForm = ({
  userType,
  onSuccessRedirect,
}: {
  userType: UserType;
  onSuccessRedirect: (url: string) => void;
}) => {
  const [name, onNameChange] = useInput();
  const [email, onEmailChange] = useInput();
  const [password, onPasswordChange] = useInput();
  const [passConfirmation, onPassConfirmationChange] = useInput();
  const [prefecture, setPrefecture, onPrefectureChange] = useSelect("");
  const [isAgreed, setIsAgreed] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [passwordStrength, setPasswordStrength] = useState<number>(0);
  const [passwordFeedback, setPasswordFeedback] = useState<string>("");
  const [showPassword, setShowPassword] = useState(false);

  // Real-time password strength check
  useEffect(() => {
    if (password) {
      setErrors((prev) => ({ ...prev, password: "" }));
      const result = zxcvbn(password);
      setPasswordStrength(result.score);
      setPasswordFeedback(result.feedback.suggestions.join(" "));
    } else {
      setPasswordStrength(0);
      setPasswordFeedback("");
    }
  }, [password]);

  const registerHandler = async (e: FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validate form using Zod
    // TODO: If this component is used for different user types, the appropriate schema must be used for each.
    const validationResult = customerRegisterSchema.safeParse({
      name,
      email,
      password,
      passConfirmation,
      prefecture,
      isAgreed,
    });

    if (!validationResult.success) {
      const validationErrors: Record<string, string> = {};
      validationResult.error.errors.forEach((err) => {
        if (err.path[0]) {
          validationErrors[err.path[0]] = err.message;
        }
      });
      setErrors(validationErrors);
      return;
    }

    if (passwordStrength < 3) {
      setErrors({
        password:
          "Your password is too weak. Try using a longer passphrase or a password manager.",
      });
      document.getElementById("password")?.focus();
      return;
    }

    try {
      // TODO: If this component handles different user types, the appropriate API function must be called for each.
      const response = await registerCustomer({
        name,
        email,
        password,
        prefecture,
      });

      if (response.status === 409) {
        setErrors({ email: response.message });
        return;
      }

      const successMessage = response.message || "Registration successful!";
      const redirectUrl = response.redirectUrl || `/${userType}s/login`;

      toast.success(successMessage);
      onSuccessRedirect(redirectUrl);
    } catch (error) {
      setErrors({
        unexpectedError:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred.",
      });
    }
  };

  return (
    <form className={styles.form} onSubmit={registerHandler}>
      <p className={styles.required}>*Required</p>
      <TextInput
        label="Name"
        type="text"
        value={name}
        placeholder="e.g., John Doe"
        onChange={onNameChange}
        icon={<UserCircleIcon className={styles.icon} />}
        inputRequired
        error={errors.name}
      />
      <TextInput
        label="Email"
        type="email"
        value={email}
        placeholder="e.g., example@aaasobo.com"
        onChange={onEmailChange}
        icon={<EnvelopeIcon className={styles.icon} />}
        inputRequired
        error={errors.email}
      />
      <TextInput
        id="password"
        label="Password"
        type="password"
        value={password}
        placeholder="Create a password (8+ characters)"
        onChange={onPasswordChange}
        icon={<LockClosedIcon className={styles.icon} />}
        inputRequired
        minLength={8}
        error={errors.password}
        showPassword={showPassword}
        onTogglePasswordVisibility={() => setShowPassword((prev) => !prev)}
      />
      <PasswordStrengthMeter
        password={password}
        passwordStrength={passwordStrength}
        passwordFeedback={passwordFeedback}
      />
      <TextInput
        label="Password Confirmation"
        type="password"
        value={passConfirmation}
        placeholder="Re-enter your password"
        onChange={onPassConfirmationChange}
        icon={<LockClosedIcon className={styles.icon} />}
        inputRequired
        error={errors.passConfirmation}
        showPassword={showPassword}
        onTogglePasswordVisibility={() => setShowPassword((prev) => !prev)}
      />

      {/* TODO: If this component supports multiple user types, render the appropriate UI for each. */}
      <label className={styles.label}>
        Prefecture of Residence <span className={styles.required}>*</span>
        <div className={styles.selectWrapper}>
          <HomeIcon className={styles.icon} />
          <select
            className={styles.select}
            value={prefecture}
            onChange={onPrefectureChange}
            required
            style={{ color: prefecture ? "black" : "gray" }}
          >
            <option value="" disabled>
              Select your prefecture of residence
            </option>
            {prefectures.map((prefecture) => (
              <option key={prefecture} value={prefecture}>
                {prefecture}
              </option>
            ))}
          </select>
        </div>
        {errors.prefecture && (
          <p className={styles.errorText}>{errors.prefecture}</p>
        )}
      </label>

      <label className={styles.label}>
        Privacy Policy
        <span className={styles.required}>*</span>
        <p className={styles.privacyPolicy}>
          We will take a screenshot as a record that the class was conducted.
          Additionally, we may record the session for the purpose of improving
          the instructor&apos;s skills.
        </p>
      </label>
      <div className={styles.checkboxWrapper}>
        <label className={styles.label}>
          <input
            type="checkbox"
            checked={isAgreed}
            onChange={() => setIsAgreed(!isAgreed)}
            required
          />
          I agree.
        </label>
        {errors.isAgreed && (
          <p className={styles.errorText}>{errors.isAgreed}</p>
        )}
      </div>

      <div className={styles.buttonWrapper}>
        <ActionButton
          btnText="Create Account"
          className="bookBtn"
          type="submit"
        />
      </div>
      {errors.unexpectedError && (
        <p className={styles.errorText}>{errors.unexpectedError}</p>
      )}
    </form>
  );
};

export default RegisterForm;
