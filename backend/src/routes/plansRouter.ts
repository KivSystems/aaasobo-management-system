import express from "express";
import {
  getAllPlansController,
  getPlanController,
} from "../../src/controllers/plansController";
import { registerRoutes } from "../middlewares/validationMiddleware";
import {
  PlanIdParams,
  PlanResponse,
  PlansListResponse,
} from "@shared/schemas/plans";
import { MessageErrorResponse } from "@shared/schemas/common";

export const plansRouter = express.Router();

// http://localhost:4000/plans

// Route configurations with Zod validation
const getAllPlansConfig = {
  method: "get" as const,
  handler: getAllPlansController,
  openapi: {
    summary: "Get all active plans",
    description: "Retrieves a list of all non-terminated plans",
    responses: {
      "200": {
        description: "List of active plans",
        schema: PlansListResponse,
      },
      "500": {
        description: "Internal server error",
        schema: MessageErrorResponse,
      },
    },
  },
} as const;

const getPlanConfig = {
  method: "get" as const,
  handler: getPlanController,
  paramsSchema: PlanIdParams,
  openapi: {
    summary: "Get plan by ID",
    description: "Retrieves a specific plan by its ID",
    responses: {
      "200": {
        description: "Plan information",
        schema: PlanResponse,
      },
      "400": { description: "Invalid plan ID", schema: MessageErrorResponse },
      "404": { description: "Plan not found", schema: MessageErrorResponse },
      "500": {
        description: "Internal server error",
        schema: MessageErrorResponse,
      },
    },
  },
} as const;

const routeConfigs = {
  "/": [getAllPlansConfig],
  "/:id": [getPlanConfig],
} as const;

registerRoutes(plansRouter, routeConfigs);

export { routeConfigs as plansRouterConfig };
