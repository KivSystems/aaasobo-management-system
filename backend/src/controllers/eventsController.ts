import { Response } from "express";
import { getEventById } from "../services/eventsService";
import { RequestWithParams } from "../middlewares/validationMiddleware";
import type { EventIdParams } from "@shared/schemas/events";

function setErrorResponse(res: Response, error: unknown) {
  return res
    .status(500)
    .json({ message: error instanceof Error ? error.message : `${error}` });
}

// Get event by ID
export const getEventController = async (
  req: RequestWithParams<EventIdParams>,
  res: Response,
) => {
  const id = req.params.id;
  try {
    const event = await getEventById(id);
    if (!event) {
      return res.status(404).json({ message: "Event not found." });
    }
    return res.status(200).json({
      event: {
        id: event.id,
        name: event.name,
        color: event.color,
      },
    });
  } catch (error) {
    return setErrorResponse(res, error);
  }
};
