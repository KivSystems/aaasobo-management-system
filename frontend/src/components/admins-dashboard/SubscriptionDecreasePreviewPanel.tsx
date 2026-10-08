import type { SubscriptionDecreasePreview } from "@shared/schemas/subscriptions";
import ScheduleChangeCalendar from "@/components/features/schedulePreview/ScheduleChangeCalendar";
import styles from "./EditSubscriptionModal.module.scss";

export default function SubscriptionDecreasePreviewPanel({
  preview,
  isLoading,
  error,
}: {
  preview: SubscriptionDecreasePreview | null;
  isLoading: boolean;
  error: string;
}) {
  return (
    <div className={styles.section}>
      <div className={styles.sectionContent}>
        {error ? (
          <p className={styles.previewError} role="alert">
            {error}
          </p>
        ) : (
          <div aria-busy={isLoading}>
            {isLoading && !preview && (
              <p className={styles.emptyPreview} role="status">
                予定を読み込んでいます…
              </p>
            )}
            {preview && <ScheduleChangeCalendar calendar={preview.calendar} />}
          </div>
        )}
      </div>
    </div>
  );
}
