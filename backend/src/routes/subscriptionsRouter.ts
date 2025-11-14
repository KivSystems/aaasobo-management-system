import express, { RequestHandler } from "express";
import { registerRoutes } from "../../src/middlewares/validationMiddleware";
import {
  deleteSubscriptionController,
  getSubscriptionByIdController,
  updateSubscriptionToAddClassController,
  updateSubscriptionToTerminateClassController,
} from "../../src/controllers/subscriptionsController";
import {
  DeleteSubscriptionResponse,
  SubscriptionIdParams,
  SubscriptionResponse,
  UpdateSubscriptionResponse,
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
      "500": {
        description: "Internal server error",
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
      "500": {
        description: "Internal server error",
        schema: ErrorResponse,
      },
    },
  },
} as const;

const updateSubscriptionToAddClass = {
  method: "patch" as const,
  handler: updateSubscriptionToAddClassController,
  paramsSchema: SubscriptionIdParams,
  openapi: {
    summary: "Update a subscription to add recurring classes",
    description: "Update a subscription to add recurring classes",
    responses: {
      "200": {
        description: "Subscription updated successfully",
        schema: UpdateSubscriptionResponse,
      },
      "404": {
        description: "Subscription not found",
        schema: ErrorResponse,
      },
      "400": {
        description: "Invalid subscription ID",
        schema: ErrorResponse,
      },
      "500": {
        description: "Internal server error",
        schema: ErrorResponse,
      },
    },
  },
};

const updateSubscriptionToTerminateClass = {
  method: "patch" as const,
  handler: updateSubscriptionToTerminateClassController,
  paramsSchema: SubscriptionIdParams,
  openapi: {
    summary: "Update a subscription to terminate recurring classes",
    description: "Update a subscription to terminate recurring classes",
    responses: {
      "200": {
        description: "Subscription updated successfully",
        schema: UpdateSubscriptionResponse,
      },
      "404": {
        description: "Subscription not found",
        schema: ErrorResponse,
      },
      "400": {
        description: "Invalid subscription ID",
        schema: ErrorResponse,
      },
      "500": {
        description: "Internal server error",
        schema: ErrorResponse,
      },
    },
  },
};

const routeConfigs: Record<string, readonly RouteConfig[]> = {
  "/:id": [
    getSubscriptionByIdConfig,
    deleteSubscription,
    updateSubscriptionToAddClass,
    updateSubscriptionToTerminateClass,
  ],
  "/:id/increase-recurring-class": [updateSubscriptionToAddClass],
  "/:id/decrease-recurring-class": [updateSubscriptionToTerminateClass],
};

registerRoutes(subscriptionsRouter, routeConfigs);

export const subscriptionsRouterConfig = routeConfigs;
