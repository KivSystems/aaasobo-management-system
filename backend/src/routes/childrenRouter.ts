import express from "express";
import {
  deleteChildController,
  getChildrenController,
  registerChildController,
  updateChildProfileController,
  getChildByIdController,
} from "../../src/controllers/childrenController";
import {
  type RequestWithId,
  parseId,
} from "../../src/middlewares/parseId.middleware";

export const childrenRouter = express.Router();

// http://localhost:4000/children

childrenRouter.get("/", getChildrenController);
childrenRouter.get("/:id", getChildByIdController);
childrenRouter.post("/", registerChildController);
childrenRouter.patch("/:id", parseId, (req, res) =>
  updateChildProfileController(req as RequestWithId, res),
);
childrenRouter.delete("/:id", parseId, (req, res) =>
  deleteChildController(req as RequestWithId, res),
);
