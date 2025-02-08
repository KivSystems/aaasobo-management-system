"use client";

import { useInput } from "@/app/hooks/useInput";
import { useRouter } from "next/navigation";
import React, { FormEvent, useEffect, useState } from "react";
import { prefectures } from "@/app/helper/data/data";
import styles from "./page.module.scss";
import Image from "next/image";
import Link from "next/link";
import TextInput from "@/app/components/elements/textInput/TextInput";
import {
  EnvelopeIcon,
  HomeIcon,
  LockClosedIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";
import ActionButton from "@/app/components/elements/buttons/actionButton/ActionButton";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useSelect } from "@/app/hooks/useSelect";
import { registerCustomer } from "@/app/helper/api/customersApi";
import { customerRegisterSchema } from "@/app/schemas/customerRegisterSchema";
import zxcvbn from "zxcvbn";
import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/solid";

function Register() {
  const [name, onNameChange] = useInput();
  const [email, onEmailChange] = useInput();
  const [password, onPasswordChange] = useInput();
  const [passConfirmation, onPassConfirmationChange] = useInput();
  const [prefecture, setPrefecture, onPrefectureChange] = useSelect("");
  const [isAgreed, setIsAgreed] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [passwordStrength, setPasswordStrength] = useState<number>(0);
  const [passwordFeedback, setPasswordFeedback] = useState<string>("");

  const router = useRouter();

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

  const strengthLabels = ["Weak", "Good!", "Very Good!"];
  const strengthColors = ["#FF3E3E", "#A0D468", "#4CAF50"];
  const strengthWidths = ["20%", "60%", "100%"];
  const mappedStrength =
    passwordStrength < 3 ? 0 : passwordStrength === 3 ? 1 : 2;

  const registerHandler = async (e: FormEvent) => {
    e.preventDefault();

    // Validate form using Zod
    const validationResult = customerRegisterSchema.safeParse({
      name,
      email,
      password,
      passConfirmation,
      prefecture,
      isAgreed,
    });

    // If validation fails, extract error messages
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

    // Prevent submission if password is weak
    if (passwordStrength < 2) {
      setErrors({
        password:
          "Your password is too weak. Try using a longer passphrase or a password manager.",
      });

      // Refocus password field for browser suggestions
      document.getElementById("password")?.focus();
      return;
    }

    try {
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
      const redirectUrl = response.redirectUrl || "/customers/login";

      toast.success(successMessage);

      router.push(redirectUrl);
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
    <main>
      <div className={styles.outsideContainer}>
        <div className={styles.container}>
          <Image
            src={"/images/logo2.svg"}
            alt="logo"
            width={100}
            height={100}
            className={styles.logo}
            priority={true}
          />
          <h2>Create a free account</h2>
          <p className={styles.paragraph}>
            Already a member? <Link href="/customers/login">Log In</Link>
          </p>

          <form className={styles.form}>
            <p className={styles.required}>*Required</p>
            <TextInput
              label="Name"
              type="text"
              value={name}
              placeholder="e.g., John Doe"
              onChange={onNameChange}
              icon={<UserCircleIcon className={styles.icon} />}
              inputRequired={true}
              error={errors.name}
            />

            <TextInput
              label="Email"
              type="email"
              value={email}
              placeholder="e.g., example@aaasobo.com"
              onChange={onEmailChange}
              icon={<EnvelopeIcon className={styles.icon} />}
              inputRequired={true}
              error={errors.email}
            />

            <TextInput
              label="Password"
              type="password"
              value={password}
              placeholder="Create a password (8+ characters)"
              onChange={onPasswordChange}
              icon={<LockClosedIcon className={styles.icon} />}
              inputRequired={true}
              error={errors.password}
            />
            {/* Password Strength Section */}
            <p className={styles.strengthLabel}>
              Strength:{" "}
              <span>
                {password ? (
                  passwordStrength >= 3 ? (
                    <CheckCircleIcon
                      className={`${styles.strengthLabel__icon} ${styles["strengthLabel__icon--check"]}`}
                    />
                  ) : (
                    <XCircleIcon
                      className={`${styles.strengthLabel__icon} ${styles["strengthLabel__icon--x"]}`}
                    />
                  )
                ) : (
                  ""
                )}
              </span>
              <span>{password ? strengthLabels[mappedStrength] : ""}</span>
            </p>

            <div className={styles.strengthBarContainer}>
              <div
                className={styles.strengthBar}
                style={{
                  width: password ? strengthWidths[mappedStrength] : "0",
                  backgroundColor: password
                    ? strengthColors[mappedStrength]
                    : "transparent",
                }}
              />
            </div>

            <div className={styles.passwordFeedback}>
              {passwordFeedback ? <p>{passwordFeedback}</p> : ""}
            </div>

            <TextInput
              label="Password Confirmation"
              type="password"
              value={passConfirmation}
              placeholder="Re-enter your password"
              onChange={onPassConfirmationChange}
              icon={<LockClosedIcon className={styles.icon} />}
              inputRequired={true}
              error={errors.passConfirmation}
            />

            <label className={styles.label}>
              Prefecture of Residence
              <span className={styles.required}>*</span>
              <div className={styles.selectWrapper}>
                <HomeIcon className={styles.icon} />
                <select
                  className={styles.select}
                  value={prefecture}
                  onChange={onPrefectureChange}
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
                <p
                  className={`${styles.errorText} ${styles["errorText--prefecture"]}`}
                >
                  {errors.prefecture}
                </p>
              )}
            </label>

            <label className={styles.label}>
              Privacy Policy
              <span className={styles.required}>*</span>
              <p className={styles.privacyPolicy}>
                We will take a screenshot as a record that the class was
                conducted. Additionally, we may record the session for the
                purpose of improving the instructor&apos;s skills.
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
                onClick={registerHandler}
                className="bookBtn"
                type="submit"
              />
            </div>
            {errors.unexpectedError && (
              <p className={styles.errorText}>{errors.unexpectedError}</p>
            )}
          </form>
        </div>
      </div>
    </main>
  );
}

export default Register;

// "use client";

// import { useRouter } from "next/navigation";
// import React, { useEffect } from "react";
// import { prefectures } from "@/app/helper/data/data";
// import styles from "./page.module.scss";
// import Image from "next/image";
// import Link from "next/link";
// import TextInput from "@/app/components/elements/textInput/TextInput";
// import {
//   EnvelopeIcon,
//   HomeIcon,
//   LockClosedIcon,
//   UserCircleIcon,
// } from "@heroicons/react/24/outline";
// import ActionButton from "@/app/components/elements/buttons/actionButton/ActionButton";
// import { toast } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import { useFormState } from "react-dom";
// import { customerRegisterHandler } from "@/app/actions/actions";

// export default function Register() {
//   const router = useRouter();
//   const [state, formAction, isPending] = useFormState(
//     customerRegisterHandler,
//     undefined,
//   );

//   // Handle success toast and redirect
//   useEffect(() => {
//     if (state?.redirectUrl && state?.successMessage) {
//       toast.success(state.successMessage);
//       router.push(state.redirectUrl);
//     }
//   }, [state, router]);

//   return (
//     <main className={styles.outsideContainer}>
//       <div className={styles.container}>
//         <Image
//           src={"/images/logo2.svg"}
//           alt="logo"
//           width={100}
//           height={100}
//           className={styles.logo}
//           priority={true}
//         />

//         <h2>Create a free account</h2>

//         <p className={styles.paragraph}>
//           Already a member? <Link href="/customers/login">Log In</Link>
//         </p>

//         <form className={styles.form} action={formAction}>
//           <p className={styles.required}>*Required</p>
//           <TextInput
//             id="name"
//             label="Name"
//             type="text"
//             placeholder="e.g., John Doe"
//             icon={<UserCircleIcon className={styles.icon} />}
//             inputRequired={true}
//             name="name"
//             error={state?.validationErrors?.name}
//           />

//           <TextInput
//             id="email"
//             label="Email"
//             type="email"
//             placeholder="e.g., example@aaasobo.com"
//             icon={<EnvelopeIcon className={styles.icon} />}
//             inputRequired={true}
//             name="email"
//             error={state?.validationErrors?.email || state?.emailConflict}
//           />

//           <TextInput
//             id="password"
//             label="Password"
//             type="password"
//             placeholder="Create a password (8+ characters)"
//             icon={<LockClosedIcon className={styles.icon} />}
//             inputRequired={true}
//             name="password"
//             minLength={8}
//             autoComplete="new-password"
//             error={state?.validationErrors?.password}
//           />

//           <TextInput
//             id="passConfirmation"
//             label="Password Confirmation"
//             type="password"
//             placeholder="Re-enter your password"
//             icon={<LockClosedIcon className={styles.icon} />}
//             inputRequired={true}
//             name="passConfirmation"
//             error={state?.validationErrors?.passConfirmation}
//           />

//           <label className={styles.label}>
//             Prefecture of Residence
//             <span className={styles.required}>*</span>
//             <div className={styles.selectWrapper}>
//               <HomeIcon className={styles.icon} />
//               <select
//                 id="prefecture"
//                 name="prefecture"
//                 className={styles.select}
//                 defaultValue=""
//                 required
//               >
//                 <option value="" disabled>
//                   Select your prefecture of residence
//                 </option>
//                 {prefectures.map((prefecture) => (
//                   <option key={prefecture} value={prefecture}>
//                     {prefecture}
//                   </option>
//                 ))}
//               </select>
//             </div>
//             {state?.validationErrors?.prefecture && (
//               <p
//                 className={`${styles.errorText} ${styles["errorText--prefecture"]}`}
//               >
//                 {state?.validationErrors?.prefecture}
//               </p>
//             )}
//           </label>

//           <label className={styles.label}>
//             Privacy Policy
//             <span className={styles.required}>*</span>
//             <p className={styles.privacyPolicy}>
//               We will take a screenshot as a record that the class was
//               conducted. Additionally, we may record the session for the purpose
//               of improving the instructor&apos;s skills.
//             </p>
//           </label>
//           <div className={styles.checkboxWrapper}>
//             <label className={styles.label}>
//               <input type="checkbox" name="isAgreed" value="true" required />I
//               agree.
//             </label>
//             {state?.validationErrors?.isAgreed && (
//               <p className={styles.errorText}>
//                 {state?.validationErrors?.isAgreed}
//               </p>
//             )}
//           </div>

//           <div className={styles.buttonWrapper}>
//             <ActionButton
//               btnText="Create Account"
//               className="bookBtn"
//               type="submit"
//               disabled={isPending}
//             />
//           </div>
//           {state?.error && <p className={styles.errorText}>{state?.error}</p>}
//         </form>
//       </div>
//     </main>
//   );
// }
