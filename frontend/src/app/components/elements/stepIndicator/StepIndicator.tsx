import styles from "./StepIndicator.module.scss";

const StepIndicator = ({
  currentStep,
  totalSteps,
  className,
}: {
  currentStep: number;
  totalSteps: number;
  className?: string;
}) => {
  const steps = Array.from({ length: totalSteps }, (_, i) => i + 1);

  return (
    <div
      className={`${styles.stepIndicator}  ${currentStep === 1 && styles.stepOne} ${className && styles[className]}`}
    >
      {steps.map((step, index) => (
        <div key={step} className={styles.stepContainer}>
          <div
            className={`${styles.stepCircle} ${
              step === currentStep
                ? styles["stepCircle--active"]
                : styles["stepCircle--inactive"]
            }`}
          >
            {step}
          </div>
          {index < totalSteps - 1 && (
            <div className={styles.stepLineWrapper}>
              <div className={styles.stepLine}></div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default StepIndicator;
