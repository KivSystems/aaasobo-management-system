import { Prisma } from "@prisma/client";
import {
  previewSubscriptionDecrease,
  applySubscriptionDecrease,
  SubscriptionDecreaseError,
} from "../services/subscriptionDecreaseService";
import { Response } from "express";
import {
  RequestWithParams,
  RequestWith,
} from "../middlewares/validationMiddleware";
import type {
  SubscriptionDecreasePreviewBody,
  SubscriptionDecreaseBody,
  SubscriptionIdParams,
} from "../../../shared/schemas/subscriptions";
import {
  getSubscriptionById,
  terminateSubscription,
  updatePlanIdOfSubscription,
  updateSelectTypeUrl,
} from "../services/subscriptionsService";
import { prisma } from "../../prisma/prismaClient";
import {
  createNewRecurringClass,
  getRegularClassesBySubscriptionId,
  terminateRecurringClass,
} from "../services/recurringClassesService";
import { getPlanById } from "../services/plansService";

export const getSubscriptionByIdController = async (
  req: RequestWithParams<SubscriptionIdParams>,
  res: Response,
) => {
  try {
    const subscription = await getSubscriptionById(req.params.id);

    if (!subscription) {
      return res.status(404).json({ error: "Subscription not found." });
    }

    res.json(subscription);
  } catch (error) {
    console.error("Error fetching subscription:", error);
    res.status(500).json({
      error:
        error instanceof Error
          ? error.message
          : "An unexpected error occurred.",
    });
  }
};

export const deleteSubscriptionController = async (
  req: RequestWithParams<SubscriptionIdParams>,
  res: Response,
) => {
  try {
    const recurringClasses = await getRegularClassesBySubscriptionId(
      req.params.id,
    );
    if (!recurringClasses) {
      return res.status(404).json({ error: "Recurring Class not found." });
    }

    const { cancellationDate } = req.body;
    const cancellationDateObj = new Date(cancellationDate);

    await prisma.$transaction(async (tx) => {
      for (const recurringClass of recurringClasses) {
        await terminateRecurringClass(
          tx,
          recurringClass.id,
          cancellationDateObj,
        );
      }

      const terminatedSubscription = await terminateSubscription(
        tx,
        req.params.id,
        cancellationDateObj,
      );

      res.status(200).json({
        message: "Subscription deleted successfully",
        id: terminatedSubscription.id,
      });
    });
  } catch (error) {
    console.error("Error deleting recurring class:", error);
    res.status(500).json({
      error:
        error instanceof Error
          ? error.message
          : "An unexpected error occurred.",
    });
  }
};

export const updateSubscriptionToAddClassController = async (
  req: RequestWithParams<SubscriptionIdParams>,
  res: Response,
) => {
  try {
    const subscription = await getSubscriptionById(req.params.id);
    if (!subscription) {
      return res.status(404).json({ error: "Subscription not found." });
    }
    const { updateSubscriptionData } = req.body;

    const planId = updateSubscriptionData.planId;
    const times = updateSubscriptionData.times;
    const selectType = updateSubscriptionData.selectType;

    // validate
    const plan = await getPlanById(planId);
    if (!plan) {
      return res.status(404).json({ error: "Plan not found." });
    }

    if (!selectType) {
      return res.status(404).json({ error: "SelectType URL not found." });
    }

    if (times !== plan.weeklyClassTimes - subscription.plan.weeklyClassTimes) {
      return res
        .status(400)
        .json({ error: "Number of weekly classes is invalid." });
    }

    await prisma.$transaction(async (tx) => {
      // Updata the plan id of the subscription.
      await updatePlanIdOfSubscription(tx, subscription.id, planId, selectType);

      // Add new recurring classes
      for (let i = 0; i < times; i++) {
        await createNewRecurringClass(tx, subscription.id);
      }

      res.status(200).json({
        message: "Subscription updated successfully",
        id: subscription.id,
      });
    });
  } catch (error) {
    console.error("Error updating subscription:", error);
    res.status(500).json({
      error:
        error instanceof Error
          ? error.message
          : "An unexpected error occurred.",
    });
  }
};

function handleDecreaseError(error: unknown, res: Response) {
  if (error instanceof SubscriptionDecreaseError)
    return res.status(error.status).json({ error: error.message });
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2034"
  )
    return res.status(409).json({
      error:
        "予約内容が変更されています。戻ってキャンセル対象を再確認してください。",
    });
  console.error("Failed to change subscription", error);
  return res
    .status(500)
    .json({ error: "プラン変更に失敗しました。もう一度お試しください。" });
}

export const previewSubscriptionDecreaseController = async (
  req: RequestWith<SubscriptionIdParams, SubscriptionDecreasePreviewBody>,
  res: Response,
) => {
  try {
    res.json(
      await previewSubscriptionDecrease(
        req.params.id,
        req.body.updateSubscriptionData,
      ),
    );
  } catch (error) {
    handleDecreaseError(error, res);
  }
};

export const updateSubscriptionToTerminateClassController = async (
  req: RequestWith<SubscriptionIdParams, SubscriptionDecreaseBody>,
  res: Response,
) => {
  try {
    const { previewToken, ...data } = req.body.updateSubscriptionData;
    await applySubscriptionDecrease(req.params.id, data, previewToken);
    res.json({
      message: "Subscription updated successfully",
      id: req.params.id,
    });
  } catch (error) {
    handleDecreaseError(error, res);
  }
};

export const updateSelectTypeUrlController = async (
  req: RequestWithParams<SubscriptionIdParams>,
  res: Response,
) => {
  try {
    const { updateSubscriptionData } = req.body;
    const selectType = updateSubscriptionData.selectType;

    // validate
    const subscription = await getSubscriptionById(req.params.id);
    if (!subscription) {
      return res.status(404).json({ error: "Subscription not found." });
    }

    if (!selectType) {
      return res.status(404).json({ error: "SelectType URL not found." });
    }

    await prisma.$transaction(async (tx) => {
      // Updata the SelectType url.
      await updateSelectTypeUrl(tx, subscription.id, selectType);
    });

    res.status(200).json({
      message: "Subscription updated successfully",
      id: subscription.id,
    });
  } catch (error) {
    console.error("Error updating subscription:", error);
    res.status(500).json({
      error:
        error instanceof Error
          ? error.message
          : "An unexpected error occurred.",
    });
  }
};
