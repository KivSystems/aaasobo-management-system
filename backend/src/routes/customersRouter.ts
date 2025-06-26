import express from "express";
import {
  getSubscriptionsByIdController,
  registerCustomerController,
  updateCustomerProfileController,
  registerSubscriptionController,
  getUpcomingClassesController,
  getCustomerByIdController,
  getClassesController,
  getRebookableClassesController,
  verifyCustomerEmailController,
  checkEmailConflictsController,
} from "../../src/controllers/customersController";
import {
  type RequestWithId,
  parseId,
} from "../../src/middlewares/parseId.middleware";

export const customersRouter = express.Router();

// http://localhost:4000/customers

customersRouter.post("/register", registerCustomerController);
customersRouter.post("/check-email-conflicts", checkEmailConflictsController);
customersRouter.patch("/verify-email", verifyCustomerEmailController);

customersRouter.get("/:id/subscriptions", getSubscriptionsByIdController);
customersRouter.get("/:id/customer", parseId, (req, res) =>
  getCustomerByIdController(req as RequestWithId, res),
);
customersRouter.get("/:id/rebookable-classes", parseId, (req, res) =>
  getRebookableClassesController(req as RequestWithId, res),
);
customersRouter.get("/:id/upcoming-classes", parseId, (req, res) =>
  getUpcomingClassesController(req as RequestWithId, res),
);
customersRouter.get("/:id/classes", parseId, (req, res) =>
  getClassesController(req as RequestWithId, res),
);

customersRouter.patch("/:id", updateCustomerProfileController);

customersRouter.post("/:id/subscription", registerSubscriptionController);
