import express, { RequestHandler } from "express";
import {
  getAllPlansController,
  getPlanController,
} from "../../src/controllers/plansController";
import { registerRoutes } from "../middlewares/validationMiddleware";
import {
  PlanIdParams,
  PlanResponse,
  PlansListResponse,
} from "../../../shared/schemas/plans";
import { MessageErrorResponse } from "../../../shared/schemas/common";
import { verifyAuthentication } from "../middlewares/auth.middleware";
import { AUTH_ROLES } from "../helper/commonUtils";

export const plansRouter = express.Router();

// http://localhost:4000/plans

// Route configurations with Zod validation
const getAllPlansConfig = {
  method: "get" as const,
  middleware: [verifyAuthentication(AUTH_ROLES.AC)] as RequestHandler[],
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
  middleware: [verifyAuthentication(AUTH_ROLES.AC)] as RequestHandler[],
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
