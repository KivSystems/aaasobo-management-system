import express from "express";
import {
  createRegularClassController,
  getRegularClassByIdController,
  getRegularClassesBySubscriptionIdController,
  updateRegularClassController,
} from "../controllers/wipRecurringClassesController";
import { parseId, RequestWithId } from "../middlewares/parseId.middleware";

export const wipRecurringClassesRouter = express.Router();

wipRecurringClassesRouter.get("/", getRegularClassesBySubscriptionIdController);
wipRecurringClassesRouter.get("/:id", parseId, (req, res) =>
  getRegularClassByIdController(req as RequestWithId, res),
);
wipRecurringClassesRouter.post("/", createRegularClassController);
wipRecurringClassesRouter.put("/:id", parseId, (req, res) =>
  updateRegularClassController(req as RequestWithId, res),
);
