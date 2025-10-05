import express from "express";
import { getEventController } from "../controllers/eventsController";
import { registerRoutes } from "../middlewares/validationMiddleware";
import { EventIdParams, EventResponse } from "../../../shared/schemas/events";
import { MessageErrorResponse } from "../../../shared/schemas/common";

export const eventsRouter = express.Router();

// http://localhost:4000/events

// Individual route configurations
const getEventConfig = {
  method: "get" as const,
  handler: getEventController,
  paramsSchema: EventIdParams,
  openapi: {
    summary: "Get event by ID",
    description: "Retrieve event information by ID",
    responses: {
      "200": {
        description: "Event information",
        schema: EventResponse,
      },
      "400": { description: "Invalid event ID", schema: MessageErrorResponse },
      "404": { description: "Event not found", schema: MessageErrorResponse },
      "500": {
        description: "Internal server error",
        schema: MessageErrorResponse,
      },
    },
  },
} as const;

// Route configurations for validation and OpenAPI
const routeConfigs = {
  "/:id": [getEventConfig],
} as const;

// Register all routes with validation
registerRoutes(eventsRouter, routeConfigs);

// Export route configs for OpenAPI registration
export { routeConfigs as eventsRouterConfig };
