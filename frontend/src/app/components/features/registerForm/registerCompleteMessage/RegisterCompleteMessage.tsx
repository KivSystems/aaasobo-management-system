import { CheckCircleIcon } from "@heroicons/react/24/solid";
import styles from "./RegisterCompleteMessage.module.scss"; // Reuse your styles

const RegisterCompleteMessage = ({
  language,
  emailToShow,
}: {
  language: LanguageType;
  emailToShow: string;
}) => {
  return (
    <div className={styles.complete}>
      <CheckCircleIcon className={styles.complete__icon} />
      <h1>
        {language === "ja"
          ? "アカウントの登録が完了しました！"
          : "Your account registration is complete!"}
      </h1>
      <p>
        {language === "ja"
          ? `ご登録いただいた ${emailToShow} 宛に、確認用のメールをお送りしました。`
          : `We've sent a confirmation email to ${emailToShow}.`}
      </p>
      <p>
        {language === "ja"
          ? "メール内のボタンをクリックして、アカウントを有効にしてください。"
          : "Please click the button in the email to activate your account."}
      </p>
    </div>
  );
};

export default RegisterCompleteMessage;
