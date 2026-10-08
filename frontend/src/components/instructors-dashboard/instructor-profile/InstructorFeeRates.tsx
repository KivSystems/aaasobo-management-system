"use client";

import { localizeAdminMessage } from "@/lib/messages/adminMessages";
import { useCallback, useEffect, useState } from "react";
import { BanknotesIcon } from "@heroicons/react/24/outline";
import { toast } from "react-toastify";
import ActionButton from "../../elements/buttons/actionButton/ActionButton";
import {
  createInstructorFee,
  deleteLatestInstructorFee,
  getInstructorFees,
} from "@/lib/api/adminsApi";
import { getMyInstructorFees } from "@/lib/api/instructorsApi";
import { confirmAlert, errorAlert } from "@/lib/utils/alertUtils";
import type { InstructorFeeRate } from "@shared/schemas/admins";
import { useLanguage } from "@/contexts/LanguageContext";
import styles from "./InstructorProfile.module.scss";

const DEFAULT_CURRENCY = "JPY";

const formatExclusiveEndDate = (
  value: string | null,
  language: LanguageType,
) => {
  if (!value) {
    return language === "ja" ? "継続中" : "Onwards";
  }

  const date = new Date(`${value}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() - 1);
  return date.toISOString().slice(0, 10);
};

const formatMoney = (amount: number, currency: string) => {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toLocaleString("en-US")}`;
  }
};

const formatPeriod = (fee: InstructorFeeRate, language: LanguageType) =>
  `${fee.effectiveFrom} ${language === "ja" ? "〜" : "to"} ${formatExclusiveEndDate(fee.effectiveTo, language)}`;

const createFormState = (fee?: InstructorFeeRate | null) => ({
  currency: fee?.currency ?? DEFAULT_CURRENCY,
  effectiveFrom: "",
  trialFee: String(fee?.trialFee ?? 0),
  regularFee: String(fee?.regularFee ?? 0),
  cancelFee: String(fee?.cancelFee ?? 0),
  cancelWithoutNoticeFee: String(fee?.cancelWithoutNoticeFee ?? 0),
  monthlyCancelFee: String(fee?.monthlyCancelFee ?? 0),
});

function FeeRateCard({
  fee,
  isLatest = false,
  onDelete,
  isDeleteDisabled = false,
}: {
  fee: InstructorFeeRate;
  isLatest?: boolean;
  onDelete?: () => void;
  isDeleteDisabled?: boolean;
}) {
  const { language } = useLanguage();
  return (
    <article className={styles.feeCard}>
      <div className={styles.feeCardHeader}>
        <div>
          <strong>{formatPeriod(fee, language)}</strong>
        </div>
        <div className={styles.feeCardActions}>
          {isLatest && onDelete && (
            <ActionButton
              type="button"
              onClick={onDelete}
              btnText={language === "ja" ? "削除" : "Delete"}
              className="deleteBtn"
              disabled={isDeleteDisabled}
            />
          )}
        </div>
      </div>
      <dl className={styles.feeGrid}>
        <div>
          <dt>{language === "ja" ? "体験クラス" : "Trial"}</dt>
          <dd>{formatMoney(fee.trialFee, fee.currency)}</dd>
        </div>
        <div>
          <dt>{language === "ja" ? "通常クラス" : "Regular"}</dt>
          <dd>{formatMoney(fee.regularFee, fee.currency)}</dd>
        </div>
        <div>
          <dt>{language === "ja" ? "キャンセル" : "Cancel"}</dt>
          <dd>{formatMoney(fee.cancelFee, fee.currency)}</dd>
        </div>
        <div>
          <dt>
            {language === "ja" ? "無断キャンセル" : "Cancel Without Notice"}
          </dt>
          <dd>{formatMoney(fee.cancelWithoutNoticeFee, fee.currency)}</dd>
        </div>
        <div>
          <dt>{language === "ja" ? "月次キャンセル" : "Monthly Cancel"}</dt>
          <dd>{formatMoney(fee.monthlyCancelFee, fee.currency)}</dd>
        </div>
      </dl>
    </article>
  );
}

type InstructorFeeRatesProps =
  | { access: "admin"; instructorId: number }
  | { access: "instructor"; instructorId?: never };

export default function InstructorFeeRates(props: InstructorFeeRatesProps) {
  const { access } = props;
  const instructorId =
    props.access === "admin" ? props.instructorId : undefined;
  const [fees, setFees] = useState<InstructorFeeRate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formState, setFormState] = useState(createFormState());
  const { language } = useLanguage();

  const applyFees = useCallback((nextFees: InstructorFeeRate[]) => {
    setFees(nextFees);
    setFormState(createFormState(nextFees[0] ?? null));
  }, []);

  const loadFees = useCallback(async () => {
    setIsLoading(true);
    const response =
      access === "admin"
        ? await getInstructorFees(instructorId!)
        : await getMyInstructorFees();
    if ("status" in response) {
      setIsLoading(false);
      await errorAlert(
        language === "ja"
          ? localizeAdminMessage(response.message)
          : response.message,
      );
      return;
    }

    applyFees(response.fees);
    setIsLoading(false);
  }, [access, applyFees, instructorId, language]);

  useEffect(() => {
    let isMounted = true;

    const request =
      access === "admin"
        ? getInstructorFees(instructorId!)
        : getMyInstructorFees();

    request.then(async (response) => {
      if (!isMounted) {
        return;
      }

      if ("status" in response) {
        setIsLoading(false);
        await errorAlert(
          language === "ja"
            ? localizeAdminMessage(response.message)
            : response.message,
        );
        return;
      }

      applyFees(response.fees);
      setIsLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, [access, applyFees, instructorId, language]);

  const activeFee = fees.find((fee) => fee.effectiveTo === null) ?? fees[0];
  const historicalFees = activeFee
    ? fees.filter((fee) => fee.id !== activeFee.id)
    : [];

  const handleFormChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleOpenForm = () => {
    setFormState(createFormState(activeFee ?? null));
    setIsFormOpen(true);
  };

  const handleCancelForm = () => {
    setFormState(createFormState(activeFee ?? null));
    setIsFormOpen(false);
  };

  const handleCreateFee = async () => {
    if (access !== "admin" || instructorId === undefined) {
      return;
    }

    const trialFee = Number(formState.trialFee);
    const regularFee = Number(formState.regularFee);
    const cancelFee = Number(formState.cancelFee);
    const cancelWithoutNoticeFee = Number(formState.cancelWithoutNoticeFee);
    const monthlyCancelFee = Number(formState.monthlyCancelFee);

    if (
      !formState.effectiveFrom ||
      [
        trialFee,
        regularFee,
        cancelFee,
        cancelWithoutNoticeFee,
        monthlyCancelFee,
      ].some((value) => !Number.isInteger(value) || value < 0)
    ) {
      await errorAlert(
        language === "ja"
          ? "適用開始日と、各報酬に0以上の整数を入力してください。"
          : "Enter an effective date and non-negative integer amounts for all fee fields.",
      );
      return;
    }

    setIsSubmitting(true);
    const response = await createInstructorFee(instructorId, {
      currency: formState.currency,
      effectiveFrom: formState.effectiveFrom,
      trialFee,
      regularFee,
      cancelFee,
      cancelWithoutNoticeFee,
      monthlyCancelFee,
    });
    setIsSubmitting(false);

    if ("status" in response) {
      await errorAlert(
        language === "ja"
          ? localizeAdminMessage(response.message)
          : response.message,
      );
      return;
    }

    toast.success(
      language === "ja" ? "給料レートを登録しました" : response.message,
    );
    setIsFormOpen(false);
    await loadFees();
  };

  const handleDeleteLatest = async () => {
    if (
      access !== "admin" ||
      instructorId === undefined ||
      !activeFee ||
      fees.length < 2
    ) {
      return;
    }

    const confirmed = await confirmAlert(
      language === "ja"
        ? `${formatPeriod(activeFee, language)}の最新の給料レートを削除しますか？給与計算の結果が変わる場合があります。`
        : `Delete the latest fee rate for ${formatPeriod(activeFee, language)}? This may change payroll results.`,
      language,
    );

    if (!confirmed) {
      return;
    }

    setIsSubmitting(true);
    const response = await deleteLatestInstructorFee(instructorId);
    setIsSubmitting(false);

    if ("status" in response) {
      await errorAlert(
        language === "ja"
          ? localizeAdminMessage(response.message)
          : response.message,
      );
      return;
    }

    toast.success(
      language === "ja" ? "給料レートを削除しました" : response.message,
    );
    await loadFees();
  };

  return (
    <div className={styles.insideContainer}>
      <BanknotesIcon className={styles.icon} />
      <div className={styles.userInfo}>
        <p>{language === "en" ? "Fee Rates" : "給料レート"}</p>
        <div className={styles.feeSection}>
          {isLoading ? (
            <p className={styles.feeMutedText}>
              {language === "ja"
                ? "給料レートを読み込み中..."
                : "Loading fee rates..."}
            </p>
          ) : activeFee ? (
            <FeeRateCard
              fee={activeFee}
              isLatest={access === "admin"}
              onDelete={access === "admin" ? handleDeleteLatest : undefined}
              isDeleteDisabled={isSubmitting || fees.length < 2}
            />
          ) : (
            <p className={styles.feeMutedText}>
              {language === "ja"
                ? "給料レートは未登録です。"
                : "No fee rates registered yet."}
            </p>
          )}

          {access === "admin" && isFormOpen && (
            <div className={styles.feeForm}>
              <h4 className={styles.feeFormTitle}>
                {language === "ja" ? "新しい給料レート" : "New fee rate"}
              </h4>
              <div className={styles.feeFormGrid}>
                <label>
                  {language === "ja" ? "通貨" : "Currency"}
                  <input
                    name="currency"
                    value={formState.currency}
                    onChange={handleFormChange}
                    maxLength={3}
                    placeholder="JPY"
                  />
                  <span className={styles.feeFieldHint}>
                    {language === "ja"
                      ? "JPYなど、3文字の通貨コードを入力してください。"
                      : 'Use a 3-letter currency code, for example "JPY".'}
                  </span>
                </label>
                <label>
                  {language === "ja" ? "適用開始日" : "Effective From"}
                  <input
                    type="date"
                    name="effectiveFrom"
                    value={formState.effectiveFrom}
                    onChange={handleFormChange}
                  />
                </label>
                <label>
                  {language === "ja" ? "体験クラスの報酬" : "Trial Fee"}
                  <input
                    type="number"
                    name="trialFee"
                    min="0"
                    step="1"
                    value={formState.trialFee}
                    onChange={handleFormChange}
                  />
                </label>
                <label>
                  {language === "ja" ? "通常クラスの報酬" : "Regular Fee"}
                  <input
                    type="number"
                    name="regularFee"
                    min="0"
                    step="1"
                    value={formState.regularFee}
                    onChange={handleFormChange}
                  />
                </label>
                <label>
                  {language === "ja" ? "キャンセル時の報酬" : "Cancel Fee"}
                  <input
                    type="number"
                    name="cancelFee"
                    min="0"
                    step="1"
                    value={formState.cancelFee}
                    onChange={handleFormChange}
                  />
                </label>
                <label>
                  {language === "ja"
                    ? "無断キャンセル時の報酬"
                    : "Cancel Without Notice Fee"}
                  <input
                    type="number"
                    name="cancelWithoutNoticeFee"
                    min="0"
                    step="1"
                    value={formState.cancelWithoutNoticeFee}
                    onChange={handleFormChange}
                  />
                </label>
                <label>
                  {language === "ja"
                    ? "月次キャンセルの報酬"
                    : "Monthly Cancel Fee"}
                  <input
                    type="number"
                    name="monthlyCancelFee"
                    min="0"
                    step="1"
                    value={formState.monthlyCancelFee}
                    onChange={handleFormChange}
                  />
                </label>
              </div>
            </div>
          )}

          {access === "admin" && (
            <div className={styles.feeActions}>
              {isFormOpen ? (
                <>
                  <ActionButton
                    type="button"
                    onClick={handleCancelForm}
                    btnText={language === "ja" ? "キャンセル" : "Cancel"}
                    className="cancelBtn"
                    disabled={isSubmitting}
                  />
                  <ActionButton
                    type="button"
                    onClick={handleCreateFee}
                    btnText={
                      isSubmitting
                        ? language === "ja"
                          ? "保存中..."
                          : "Saving..."
                        : language === "ja"
                          ? "保存"
                          : "Save"
                    }
                    className="saveBtn"
                    disabled={isSubmitting}
                  />
                </>
              ) : (
                <ActionButton
                  type="button"
                  onClick={handleOpenForm}
                  btnText={
                    language === "ja" ? "給料レートを変更" : "Change fee rate"
                  }
                  className="addBtn"
                  disabled={isSubmitting}
                />
              )}
            </div>
          )}

          <details className={styles.feeHistory}>
            <summary>{language === "ja" ? "変更履歴" : "Rate history"}</summary>
            <div className={styles.feeHistoryList}>
              {historicalFees.length > 0 ? (
                historicalFees.map((fee) => (
                  <FeeRateCard key={fee.id} fee={fee} />
                ))
              ) : (
                <p className={styles.feeMutedText}>
                  {language === "ja"
                    ? "過去の給料レートはありません。"
                    : "No past fee rates."}
                </p>
              )}
            </div>
          </details>
        </div>
      </div>
    </div>
  );
}
