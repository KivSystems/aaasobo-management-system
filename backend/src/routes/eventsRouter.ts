import express from "express";
import { getEventController } from "../controllers/eventsController";

export const eventsRouter = express.Router();

// http://localhost:4000/events

eventsRouter.get("/:id", getEventController);
