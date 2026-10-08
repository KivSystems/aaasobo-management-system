"use client";

import React, { ChangeEvent, useEffect, useState } from "react";
import Modal from "../elements/modal/Modal";
import styles from "./EditSubscriptionModal.module.scss";
import {
  AcademicCapIcon,
  ClipboardDocumentListIcon,
  PencilIcon,
} from "@heroicons/react/24/solid";
import { getAllPlans } from "@/lib/api/plansApi";
import RegularClassesTable from "../customers-dashboard/regular-classes/RegularClassesTable";
import {
  previewSubscriptionDecreaseAction,
  updateSelectTypeUrlAction,
  updateSubscriptionToAddClassAction,
  updateSubscriptionToTerminateClassAction,
} from "@/app/actions/updateContent";
import InputField from "../elements/inputField/InputField";

import type { SubscriptionDecreasePreview } from "@shared/schemas/subscriptions";
import { selectTypeUrlSchema } from "@/schemas/authSchema";
import SubscriptionDecreasePreviewPanel from "./SubscriptionDecreasePreviewPanel";

type EditSubscriptionModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  subscription: Subscription | null;
  userSessionType?: UserType;
  adminId?: number;
  customerId: number;
  customerTerminationAt: string | null | undefined;
  plan?: Plan;
  language: LanguageType;
};

function EditSubscriptionModal({
  isOpen,
  onClose,
  onSuccess,
  subscription,
  userSessionType,
  adminId,
  customerId,
  customerTerminationAt,
  plan,
  language,
}: EditSubscriptionModalProps) {
  const [preview, setPreview] = useState<SubscriptionDecreasePreview | null>(
    null,
  );
  const [previewForSelection, setPreviewForSelection] = useState<string | null>(
    null,
  );
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState("");
  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [selectedRecurringIds, setSelectedRecurringIds] = useState<number[]>(
    [],
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const currentWeeklyTimes = subscription?.plan?.weeklyClassTimes ?? 0;
  const selectedWeeklyTimes = selectedPlan?.weeklyClassTimes ?? 0;
  const requiredTerminationCount =
    preview?.requiredTerminationCount ??
    Math.max(0, currentWeeklyTimes - selectedWeeklyTimes);
  const [selectTypeValue, setSelectTypeValue] = useState<string>("");
  const currentEnglishBG = subscription?.plan?.englishBackground;
  const [currentBGPlans, setCurrentBGPlans] = useState<Plan[]>([]);

  useEffect(() => {
    if (isOpen) {
      setPreview(null);
      setPreviewForSelection(null);
      setPreviewError("");
      setError("");
      setSelectedRecurringIds([]);
    }
  }, [isOpen, subscription?.id]);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const plansData = await getAllPlans();
        const initial =
          plansData.find((p) => p.id === subscription?.planId) ?? null;
        setPlans(plansData);
        setSelectedPlan(initial);
      } catch (e) {
        console.error("Failed to fetch plans:", e);
      }
    };
    fetchPlans();
  }, [subscription?.planId]);

  useEffect(() => {
    const filteredPlans = plans.filter(
      (p) => p.englishBackground === currentEnglishBG,
    );
    setCurrentBGPlans(filteredPlans);
  }, [plans, currentEnglishBG]);

  useEffect(() => {
    if (subscription) {
      setSelectTypeValue(subscription.selectType);
    }
    if (plan) {
      setSelectedPlan(plan);
    }
  }, [subscription, plan]);

  const handleSelectPlan = (e: ChangeEvent<HTMLSelectElement>) => {
    const selectedPlanId = Number(e.target.value);
    const plan = plans.find((p) => p.id === selectedPlanId);
    if (!plan) return;
    setSelectedPlan(plan);
    setSelectedRecurringIds([]);
  };

  const toggleRecurringSelection = (id: number) => {
    setSelectedRecurringIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const selectedRecurringIdsKey = [...selectedRecurringIds]
    .sort((a, b) => a - b)
    .join(",");

  useEffect(() => {
    if (
      !subscription ||
      !selectedPlan ||
      selectedWeeklyTimes >= currentWeeklyTimes
    ) {
      setPreview(null);
      setPreviewForSelection(null);
      setPreviewError("");
      setIsPreviewLoading(false);
      return;
    }

    const selectedIds = selectedRecurringIdsKey
      ? selectedRecurringIdsKey.split(",").map(Number)
      : [];
    const selectionKey = JSON.stringify([
      subscription.id,
      selectedPlan.id,
      selectedIds,
      selectTypeValue,
    ]);
    let isCurrentRequest = true;
    setPreviewForSelection(null);
    setPreviewError("");
    setIsPreviewLoading(true);

    previewSubscriptionDecreaseAction(subscription.id, {
      planId: selectedPlan.id,
      recurringClassIds: selectedIds,
      selectType: selectTypeValue,
    })
      .then((result) => {
        if (!isCurrentRequest) return;
        if ("errorMessage" in result) {
          setPreviewError(result.errorMessage);
          return;
        }
        setPreview(result);
        setPreviewForSelection(selectionKey);
      })
      .catch(() => {
        if (isCurrentRequest) {
          setPreviewError(
            "キャンセル対象を取得できませんでした。もう一度お試しください。",
          );
        }
      })
      .finally(() => {
        if (isCurrentRequest) setIsPreviewLoading(false);
      });

    return () => {
      isCurrentRequest = false;
    };
  }, [
    subscription,
    selectedPlan,
    selectedWeeklyTimes,
    currentWeeklyTimes,
    selectedRecurringIdsKey,
    selectedRecurringIds.length,
    selectTypeValue,
  ]);

  const resetAndClose = () => {
    if (loading) return;
    setPreview(null);
    setPreviewForSelection(null);
    setPreviewError("");
    setError("");
    setSelectedRecurringIds([]);
    setSelectedPlan(
      subscription
        ? (plans.find((item) => item.id === subscription.planId) ??
            plan ??
            null)
        : (plan ?? null),
    );
    setLoading(false);
    setSelectTypeValue(subscription?.selectType ?? "");
    onClose();
  };

  const handleSubmit = async () => {
    if (loading) return;
    if (!subscription) return;
    if (!subscription.plan.weeklyClassTimes) return;
    if (
      subscription?.planId === selectedPlan?.id &&
      subscription?.selectType === selectTypeValue
    ) {
      setError(
        "現在とは異なるプランを選択するか、セレクトタイプのURLを変更してください。",
      );
      setLoading(false);
      return;
    }

    if (!selectedPlan) {
      setError("プランを選択してください。");
      setLoading(false);
      return;
    }

    if (!selectTypeUrlSchema.safeParse(selectTypeValue).success) {
      setError("有効な http:// または https:// のURLを入力してください。");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      if (currentWeeklyTimes < selectedWeeklyTimes) {
        const updateData = {
          planId: selectedPlan?.id,
          times: selectedWeeklyTimes - currentWeeklyTimes,
          selectType: selectTypeValue,
        };

        const result = await updateSubscriptionToAddClassAction(
          subscription.id,
          updateData,
        );
        if (result && "errorMessage" in result)
          throw new Error(result.errorMessage);
      } else if (selectedWeeklyTimes < currentWeeklyTimes) {
        if (requiredTerminationCount !== selectedRecurringIds.length) {
          setError(
            "変更先のプランに合わせて、終了するレギュラークラスを必要な数だけ選択してください。",
          );
          setLoading(false);
          return;
        }

        const updateData = {
          planId: selectedPlan?.id,
          recurringClassIds: selectedRecurringIds,
          selectType: selectTypeValue,
        };

        const previewKey = JSON.stringify([
          subscription.id,
          selectedPlan.id,
          [...selectedRecurringIds].sort((a, b) => a - b),
          selectTypeValue,
        ]);
        if (previewError) throw new Error(previewError);
        if (
          isPreviewLoading ||
          !preview ||
          previewForSelection !== previewKey
        ) {
          setError(
            "キャンセル予定の振替クラスを取得しています。少しお待ちください。",
          );
          return;
        }
        const result = await updateSubscriptionToTerminateClassAction(
          subscription.id,
          { ...updateData, previewToken: preview.previewToken },
        );
        if (result && "errorMessage" in result) {
          setPreview(null);
          setPreviewForSelection(null);
          throw new Error(result.errorMessage);
        }
      } else if (currentWeeklyTimes === selectedWeeklyTimes) {
        const updateData = {
          selectType: selectTypeValue,
        };

        const result = await updateSelectTypeUrlAction(
          subscription.id,
          updateData,
        );
        if (result && "errorMessage" in result)
          throw new Error(result.errorMessage);
      } else {
        setError("エラーが発生しました。時間をおいて再度お試しください。");
      }
      setPreview(null);
      onSuccess?.();
      onClose();
    } catch (error: any) {
      console.error("Failed to update subscription:", error);
      setError(error.message || "プランの変更に失敗しました。");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;
  if (!subscription) return null;

  return (
    <Modal
      maxHeight="90vh"
      isOpen={isOpen}
      onClose={loading ? undefined : resetAndClose}
      overlayClosable={!loading}
    >
      <div className={styles.progressiveFlow}>
        <div className={styles.modalHeader}>
          <h2>プラン編集</h2>
        </div>

        <div className={styles.sectionsContainer}>
          {error && <div className={styles.error}>{error}</div>}

          {/* Select a new plan section */}
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <AcademicCapIcon className={styles.sectionIcon} />
              <h3>新しいプランを選択</h3>
            </div>
            <div className={styles.sectionContent}>
              <select
                className={styles.planInput}
                name="plan"
                value={selectedPlan?.id ?? subscription.planId}
                onChange={handleSelectPlan}
                required
              >
                {currentBGPlans &&
                  currentBGPlans.map((plan) => {
                    return (
                      <option key={plan.id} value={plan.id}>
                        {plan.name}
                      </option>
                    );
                  })}
              </select>
            </div>
          </div>

          {/* SelectType URL */}
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <PencilIcon className={styles.sectionIcon} />
              <h3>セレクトタイプのURLを変更</h3>
            </div>
            <div className={styles.sectionContent}>
              <InputField
                name="SelectType url"
                type="text"
                placeholder="https://dashboard.stripe.com/subscriptions/sub_1234567890abcdef"
                value={selectTypeValue}
                onChange={(e) => setSelectTypeValue(e.target.value)}
                className={styles.selectTypeInput}
              />
            </div>
          </div>

          {/* Select the regular classes Section */}
          {selectedPlan && selectedWeeklyTimes < currentWeeklyTimes ? (
            <>
              <div className={styles.section}>
                <div className={styles.sectionHeader}>
                  <ClipboardDocumentListIcon className={styles.sectionIcon} />
                  <h3>終了を希望するクラスを選択</h3>
                  <span className={styles.selectionProgress} aria-live="polite">
                    {selectedRecurringIds.length}/{requiredTerminationCount}{" "}
                    選択済み
                  </span>
                </div>
                <div className={styles.sectionContent}>
                  <span className={styles.selectedValue}>
                    <div className={styles.classesContent}>
                      {preview && requiredTerminationCount === 0 ? (
                        <p>
                          未設定の枠を減らすため、終了するクラスの選択は不要です。
                        </p>
                      ) : (
                        <RegularClassesTable
                          subscriptionId={subscription.id}
                          userSessionType={userSessionType}
                          adminId={adminId}
                          customerId={customerId}
                          customerTerminationAt={customerTerminationAt}
                          language={language}
                          isSelectable={true}
                          selectedRecurringIds={selectedRecurringIds}
                          onToggleRecurring={toggleRecurringSelection}
                        />
                      )}
                    </div>
                  </span>
                </div>
              </div>
              <SubscriptionDecreasePreviewPanel
                preview={preview}
                isLoading={isPreviewLoading}
                error={previewError}
              />
            </>
          ) : (
            <></>
          )}

          {/* Action Buttons */}
          <div className={styles.confirmationActions}>
            <button
              disabled={loading || isPreviewLoading}
              onClick={resetAndClose}
              className={styles.cancelButton}
            >
              キャンセル
            </button>
            <button
              disabled={loading || isPreviewLoading}
              onClick={handleSubmit}
              className={styles.confirmButton}
            >
              {loading ? "処理中..." : "変更を適用"}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

export default EditSubscriptionModal;
