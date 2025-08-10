import express from "express";
import {
  createRegularClassController,
  getRegularClassesBySubscriptionIdController,
  updateRegularClassController,
} from "../controllers/wipRecurringClassesController";
import { parseId, RequestWithId } from "../middlewares/parseId.middleware";

export const wipRecurringClassesRouter = express.Router();

wipRecurringClassesRouter.get("/", getRegularClassesBySubscriptionIdController);
wipRecurringClassesRouter.post("/", createRegularClassController);
wipRecurringClassesRouter.put("/:id", parseId, (req, res) =>
  updateRegularClassController(req as RequestWithId, res),
);
