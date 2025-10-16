import { Response } from "express";
import { RequestWithParams } from "../middlewares/validationMiddleware";
import type { SubscriptionIdParams } from "../../../shared/schemas/subscriptions";
import {
  getSubscriptionById,
  terminateSubscription,
} from "../services/subscriptionsService";
import { prisma } from "../../prisma/prismaClient";
import {
  deleteRecurringClass,
  getRegularClassesBySubscriptionId,
  terminateRecurringClass,
} from "../services/recurringClassesService";

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

    const date = new Date();

    await prisma.$transaction(async (tx) => {
      for (const recurringClass of recurringClasses) {
        await terminateRecurringClass(tx, recurringClass.id, date);
      }

      const terminatedSubscription = await terminateSubscription(
        tx,
        req.params.id,
        date,
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
