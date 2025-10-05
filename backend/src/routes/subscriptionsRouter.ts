import express from "express";
import { registerRoutes } from "../../src/middlewares/validationMiddleware";
import { getSubscriptionByIdController } from "../../src/controllers/subscriptionsController";
import {
  SubscriptionIdParams,
  SubscriptionResponse,
} from "../../../shared/schemas/subscriptions";
import { ErrorResponse } from "../../../shared/schemas/common";
import { RouteConfig } from "../openapi/routerRegistry";

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

const routeConfigs: Record<string, readonly RouteConfig[]> = {
  "/:id": [getSubscriptionByIdConfig],
};

registerRoutes(subscriptionsRouter, routeConfigs);

export const subscriptionsRouterConfig = routeConfigs;
