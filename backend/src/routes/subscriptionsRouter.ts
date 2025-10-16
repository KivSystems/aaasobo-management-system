import express, { RequestHandler } from "express";
import { registerRoutes } from "../../src/middlewares/validationMiddleware";
import {
  deleteSubscriptionController,
  getSubscriptionByIdController,
} from "../../src/controllers/subscriptionsController";
import {
  DeleteSubscriptionResponse,
  SubscriptionIdParams,
  SubscriptionResponse,
} from "../../../shared/schemas/subscriptions";
import { ErrorResponse } from "../../../shared/schemas/common";
import { RouteConfig } from "../openapi/routerRegistry";
import { verifyAuthentication } from "../middlewares/auth.middleware";

export const subscriptionsRouter = express.Router();

// http://localhost:4000/subscriptions

const getSubscriptionByIdConfig = {
  method: "get" as const,
  handler: getSubscriptionByIdController,
  paramsSchema: SubscriptionIdParams,
  openapi: {
    summary: "Get subscription by ID",
    description: "Retrieve a single subscription by its ID",
    responses: {
      "200": {
        description: "Subscription retrieved successfully",
        schema: SubscriptionResponse,
      },
      "404": {
        description: "Subscription not found",
        schema: ErrorResponse,
      },
      "400": {
        description: "Invalid subscription ID",
        schema: ErrorResponse,
      },
    },
  },
};

const deleteSubscription = {
  method: "delete" as const,
  handler: deleteSubscriptionController,
  middleware: [verifyAuthentication] as RequestHandler[],
  paramsSchema: SubscriptionIdParams,
  openapi: {
    summary: "Delete a subscription",
    description:
      "Delete a subscription and the recurring classes corresponding to the subscription id",
    responses: {
      "200": {
        description: "Subscription deleted successfully",
        schema: DeleteSubscriptionResponse,
      },
      "404": {
        description: "Subscription not found",
        schema: ErrorResponse,
      },
      "400": {
        description: "Invalid subscription ID",
        schema: ErrorResponse,
      },
    },
  },
} as const;

const routeConfigs: Record<string, readonly RouteConfig[]> = {
  "/:id": [getSubscriptionByIdConfig, deleteSubscription],
};

registerRoutes(subscriptionsRouter, routeConfigs);

export const subscriptionsRouterConfig = routeConfigs;
