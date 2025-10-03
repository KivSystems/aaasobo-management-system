import { Response } from "express";
import { RequestWithParams } from "../middlewares/validationMiddleware";
import type { SubscriptionIdParams } from "@shared/schemas/subscriptions";
import { getSubscriptionById } from "../services/subscriptionsService";

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
