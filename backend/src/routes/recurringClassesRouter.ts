import express from "express";
import {
  parseId,
  RequestWithId,
} from "../../src/middlewares/parseId.middleware";
import {
  createRegularClassController,
  getRegularClassByIdController,
  getRegularClassesBySubscriptionIdController,
  updateRegularClassController,
  getRecurringClassesByInstructorIdController,
} from "../../src/controllers/recurringClassesController";

export const recurringClassesRouter = express.Router();

// http://localhost:4000/recurring-classes

// Main endpoints (using new Instructor Schedule System)
recurringClassesRouter.get("/", getRegularClassesBySubscriptionIdController);
recurringClassesRouter.get("/:id", parseId, (req, res) =>
  getRegularClassByIdController(req as RequestWithId, res),
);
recurringClassesRouter.post("/", createRegularClassController);
recurringClassesRouter.put("/:id", parseId, (req, res) =>
  updateRegularClassController(req as RequestWithId, res),
);

// Additional endpoint for instructor queries
recurringClassesRouter.get(
  "/by-instructorId",
  getRecurringClassesByInstructorIdController,
);
